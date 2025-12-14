import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetalleRifa.css';

function DetalleRifa() {
  const { id } = useParams();
  const [rifa, setRifa] = useState(null);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [cantidadNumeros, setCantidadNumeros] = useState(1);

  useEffect(() => {
    // Mock data - simular llamada a API
    const rifaMock = {
      id: parseInt(id),
      titulo: "iPhone 15 Pro Max",
      descripcion: "El último modelo de iPhone con 256GB de almacenamiento, cámara profesional y pantalla Super Retina XDR",
      imagen: "https://via.placeholder.com/600x400?text=iPhone+15+Pro+Max",
      precioNumero: 5,
      numerosDisponibles: 850,
      totalNumeros: 1000,
      fechaSorteo: "2025-12-15T20:00:00",
      categoria: "tecnologia",
      loteriaBase: "Lotería Nacional de España",
      organizador: "RifaParaTodos Official",
      premios: [
        { posicion: "1er Premio", descripcion: "iPhone 15 Pro Max 256GB", grado: "1er Premio Lotería" },
        { posicion: "2do Premio", descripcion: "AirPods Pro", grado: "2do Premio Lotería" },
        { posicion: "3er Premio", descripcion: "$100 en efectivo", grado: "3er Premio Lotería" }
      ],
      caracteristicas: [
        "Nuevo y sellado",
        "Garantía oficial de 1 año",
        "Color a elegir por el ganador",
        "Entrega inmediata"
      ],
      numerosVendidos: [5, 12, 23, 45, 67, 89, 100, 123, 145, 167] // Ejemplo de números ya vendidos
    };

    setRifa(rifaMock);
  }, [id]);

  const handleSeleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  const handleSeleccionarAleatorio = () => {
    const numerosAleatorios = [];
    while (numerosAleatorios.length < cantidadNumeros) {
      const numero = Math.floor(Math.random() * rifa.totalNumeros) + 1;
      if (!rifa.numerosVendidos.includes(numero) && !numerosAleatorios.includes(numero)) {
        numerosAleatorios.push(numero);
      }
    }
    setNumerosSeleccionados(numerosAleatorios);
  };

  const handleComprar = () => {
    alert(`¡Compra exitosa! Números seleccionados: ${numerosSeleccionados.join(', ')}`);
  };

  if (!rifa) {
    return <div className="loading">Cargando rifa...</div>;
  }

  const total = numerosSeleccionados.length * rifa.precioNumero;

  return (
    <div className="detalle-rifa">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link> / <Link to="/rifas">Rifas</Link> / {rifa.titulo}
      </div>

      <div className="rifa-container">
        {/* Columna Izquierda - Imagen y Detalles */}
        <div className="rifa-principal">
          <img src={rifa.imagen} alt={rifa.titulo} className="rifa-imagen-grande" />
          
          <div className="card">
            <h1>{rifa.titulo}</h1>
            <p className="descripcion">{rifa.descripcion}</p>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="icono">💰</span>
                <div>
                  <div className="info-label">Precio por número</div>
                  <div className="info-valor">${rifa.precioNumero}</div>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icono">🎫</span>
                <div>
                  <div className="info-label">Números disponibles</div>
                  <div className="info-valor">{rifa.numerosDisponibles}/{rifa.totalNumeros}</div>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icono">📅</span>
                <div>
                  <div className="info-label">Fecha del sorteo</div>
                  <div className="info-valor">{new Date(rifa.fechaSorteo).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icono">🎰</span>
                <div>
                  <div className="info-label">Lotería base</div>
                  <div className="info-valor">{rifa.loteriaBase}</div>
                </div>
              </div>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${((rifa.totalNumeros - rifa.numerosDisponibles) / rifa.totalNumeros) * 100}%`}}
              ></div>
            </div>
            <span className="progress-text">
              {Math.round(((rifa.totalNumeros - rifa.numerosDisponibles) / rifa.totalNumeros) * 100)}% vendido
            </span>
          </div>

          {/* Premios */}
          <div className="card">
            <h2>🏆 Premios</h2>
            <div className="premios-lista">
              {rifa.premios.map((premio, index) => (
                <div key={index} className="premio-item">
                  <div className="premio-posicion">{premio.posicion}</div>
                  <div className="premio-info">
                    <div className="premio-descripcion">{premio.descripcion}</div>
                    <div className="premio-grado">Basado en: {premio.grado}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Características */}
          <div className="card">
            <h2>✨ Características</h2>
            <ul className="caracteristicas-lista">
              {rifa.caracteristicas.map((caract, index) => (
                <li key={index}>{caract}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Columna Derecha - Selección de Números */}
        <div className="rifa-sidebar">
          <div className="card sticky">
            <h2>Selecciona tus números</h2>
            
            <div className="seleccion-rapida">
              <label className="form-label">Selección rápida</label>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={cantidadNumeros}
                  onChange={(e) => setCantidadNumeros(parseInt(e.target.value) || 1)}
                  className="form-control"
                />
                <button 
                  className="btn btn-secondary"
                  onClick={handleSeleccionarAleatorio}
                >
                  Aleatorio
                </button>
              </div>
            </div>

            <div className="numeros-seleccionados">
              <h3>Números seleccionados ({numerosSeleccionados.length})</h3>
              <div className="numeros-badges">
                {numerosSeleccionados.length === 0 ? (
                  <p className="texto-ayuda">Selecciona números manualmente o usa la selección rápida</p>
                ) : (
                  numerosSeleccionados.sort((a, b) => a - b).map(num => (
                    <span key={num} className="numero-badge">
                      {num}
                      <button 
                        className="remove-btn"
                        onClick={() => handleSeleccionarNumero(num)}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="resumen-compra">
              <div className="resumen-item">
                <span>Números:</span>
                <span>{numerosSeleccionados.length}</span>
              </div>
              <div className="resumen-item">
                <span>Precio unitario:</span>
                <span>${rifa.precioNumero}</span>
              </div>
              <div className="resumen-total">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>

            <button 
              className="btn btn-success btn-block"
              disabled={numerosSeleccionados.length === 0}
              onClick={handleComprar}
            >
              Comprar Números
            </button>

            <div className="advertencia">
              <small>
                ⚠️ Los números seleccionados se reservarán por 15 minutos para completar el pago
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Números */}
      <div className="card">
        <h2>📊 Seleccionar números manualmente</h2>
        <div className="numeros-grid">
          {Array.from({ length: 100 }, (_, i) => i + 1).map(numero => {
            const vendido = rifa.numerosVendidos.includes(numero);
            const seleccionado = numerosSeleccionados.includes(numero);
            
            return (
              <button
                key={numero}
                className={`numero-btn ${vendido ? 'vendido' : ''} ${seleccionado ? 'seleccionado' : ''}`}
                disabled={vendido}
                onClick={() => handleSeleccionarNumero(numero)}
              >
                {numero}
              </button>
            );
          })}
        </div>
        <p className="texto-ayuda centro">Mostrando primeros 100 números de {rifa.totalNumeros} totales</p>
      </div>
    </div>
  );
}

export default DetalleRifa;
