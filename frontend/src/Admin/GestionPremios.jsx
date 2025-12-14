import { useState, useEffect } from 'react';
import './GestionPremios.css';

/**
 * Componente para gestionar premios (CRUD completo)
 * Vista consolidada: Muestra tipo de rifa con todos sus premios en columnas
 * Formato de tabla: tipo | saldo (apuesta) | premio1 | premio2 | ... | premio10 | área
 * 
 * IMPORTANTE:
 * - Saldo = Valor de la apuesta que paga el usuario (rango: $0.25 a $20.00)
 * - Premio 1-10 = Valor del premio que se gana si acierta ese nivel
 * 
 * MODALIDADES:
 * - Premios Numéricos: Valores monetarios de premios
 * - Premios en Texto: Descripciones de premios (ej: "iPhone 15 Pro Max")
 */
const GestionPremios = () => {
  // Estado para la pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState('numericos');
  
  // Estado para almacenar los premios consolidados
  const [premios, setPremios] = useState([]);
  const [premiosTexto, setPremiosTexto] = useState([]);
  
  // Estado para tipos de rifa y áreas (para los formularios)
  const [tiposRifa, setTiposRifa] = useState([]);
  const [areas, setAreas] = useState([]);
  
  // Estado para el formulario de edición
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    id_tipo_rifa: '',
    saldo: '',
    premio_01: '',
    premio_02: '',
    premio_03: '',
    premio_04: '',
    premio_05: '',
    premio_06: '',
    premio_07: '',
    premio_08: '',
    premio_09: '',
    premio_10: '',
    id_area: '',
    digitos: ''
  });
  
  // Estado para loading y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para filtros
  const [filtros, setFiltros] = useState({
    tipo: '',
    area: '',
    digitos: '',
    saldoMin: '',
    saldoMax: ''
  });

  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // Estado para carga de Excel
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [cargandoExcel, setCargandoExcel] = useState(false);
  const [resultadoCarga, setResultadoCarga] = useState(null);

  /**
   * Cargar datos iniciales al montar el componente
   * Obtiene: vista consolidada de premios, tipos de rifa y áreas
   */
  useEffect(() => {
    cargarDatos();
  }, []);

  /**
   * Función para cargar todos los datos necesarios desde el backend
   * - Vista consolidada de premios (GET /api/opciones-premios/vista-consolidada)
   * - Tipos de rifa (GET /api/tipos-rifa)
   * - Áreas (GET /api/areas)
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Hacer las peticiones en paralelo
      const requests = [
        fetch('/api/opciones-premios/vista-consolidada'),
        fetch('/api/tipos-rifa'),
        fetch('/api/areas')
      ];

      // Si la pestaña de texto está activa, también cargar premios texto
      if (pestanaActiva === 'texto') {
        requests.push(fetch('/api/premios-texto/vista-consolidada'));
      }

      const responses = await Promise.all(requests);

      // Verificar que todas las peticiones fueron exitosas
      if (responses.some(res => !res.ok)) {
        throw new Error('Error al cargar los datos del servidor');
      }

      // Parsear las respuestas JSON
      const [premiosData, tiposData, areasData, premiosTextoData] = await Promise.all(
        responses.map(res => res.json())
      );

      // Actualizar los estados con los datos obtenidos
      setPremios(premiosData.data || []);
      setTiposRifa(tiposData.data || []);
      setAreas(areasData.data || []);
      if (premiosTextoData) {
        setPremiosTexto(premiosTextoData.data || []);
      }

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el clic en el botón "Editar"
   * Carga los datos de la fila seleccionada en el formulario
   * @param {Object} premio - Objeto con los datos del premio a editar
   */
  const handleEditar = (premio) => {
    // Crear clave única para identificar esta configuración específica
    const claveEdicion = `${premio.id_tipo_rifa}-${premio.saldo}-${premio.digitos}-${premio.id_area}`;
    setEditando(claveEdicion);
    setFormData({
      id_tipo_rifa: premio.id_tipo_rifa,
      saldo: premio.saldo || '',
      premio_01: premio.premio_01 || '',
      premio_02: premio.premio_02 || '',
      premio_03: premio.premio_03 || '',
      premio_04: premio.premio_04 || '',
      premio_05: premio.premio_05 || '',
      premio_06: premio.premio_06 || '',
      premio_07: premio.premio_07 || '',
      premio_08: premio.premio_08 || '',
      premio_09: premio.premio_09 || '',
      premio_10: premio.premio_10 || '',
      id_area: premio.id_area || '',
      digitos: premio.digitos || ''
    });
  };

  /**
   * Maneja los cambios en los inputs del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Guarda los cambios realizados en el formulario
   * Crea o actualiza los 10 premios del tipo de rifa seleccionado
   * Proceso:
   * 1. Si es modo nuevo, hace POST para crear cada premio
   * 2. Si es modo edición, hace PUT para actualizar cada premio
   */
  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);

      console.log('💾 Guardando premios - Modo:', editando === 'nuevo' ? 'CREAR' : 'ACTUALIZAR');
      console.log('💾 Tipo de premio:', pestanaActiva);
      console.log('💾 FormData:', formData);

      // Validar campos requeridos
      if (!formData.id_tipo_rifa || !formData.id_area || !formData.saldo || !formData.digitos) {
        setError('Por favor completa todos los campos obligatorios (Tipo, Área, Apuesta, Dígitos)');
        setGuardando(false);
        return;
      }

      const promesas = [];
      const apiBase = pestanaActiva === 'numericos' ? '/api/opciones-premios' : '/api/premios-texto';
      
      for (let nivel = 1; nivel <= 10; nivel++) {
        const nombreCampo = `premio_${nivel.toString().padStart(2, '0')}`;
        const valorPremio = formData[nombreCampo];

        // Solo guardar si tiene valor
        if (valorPremio && (pestanaActiva === 'texto' || parseFloat(valorPremio) > 0)) {
          // Preparar datos para enviar
          const premioData = pestanaActiva === 'numericos' ? {
            id_tipo_rifa: parseInt(formData.id_tipo_rifa),
            valor_premio: parseFloat(valorPremio),
            nivel_premio: nivel,
            saldo_ganado: formData.saldo,
            id_area: parseInt(formData.id_area),
            digitos: parseInt(formData.digitos)
          } : {
            id_tipo_rifa: parseInt(formData.id_tipo_rifa),
            descripcion_premio: valorPremio,
            nivel_premio: nivel,
            saldo_ganado: formData.saldo,
            id_area: parseInt(formData.id_area),
            digitos: parseInt(formData.digitos)
          };

          console.log(`📤 Premio nivel ${nivel}:`, premioData);

          if (editando === 'nuevo') {
            // POST para crear nuevo premio
            const promesa = fetch(apiBase, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(premioData)
            }).then(res => {
              console.log(`✅ Respuesta nivel ${nivel}:`, res.status);
              return res;
            });
            promesas.push(promesa);
          } else {
            // PUT para actualizar premio existente
            const updateData = pestanaActiva === 'numericos' ? {
              valor_premio: parseFloat(valorPremio),
              saldo_ganado: formData.saldo,
              id_area: parseInt(formData.id_area),
              digitos: parseInt(formData.digitos)
            } : {
              descripcion_premio: valorPremio,
              saldo_ganado: formData.saldo,
              id_area: parseInt(formData.id_area),
              digitos: parseInt(formData.digitos)
            };

            const promesa = fetch(
              `${apiBase}/tipo/${formData.id_tipo_rifa}/nivel/${nivel}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
              }
            ).then(res => {
              console.log(`✅ Respuesta nivel ${nivel}:`, res.status);
              return res;
            });
            promesas.push(promesa);
          }
        }
      }

      if (promesas.length === 0) {
        setError('Debes ingresar al menos un valor de premio');
        setGuardando(false);
        return;
      }

      // Esperar a que todas las operaciones terminen
      const resultados = await Promise.all(promesas);
      
      // Verificar si todas fueron exitosas
      const errores = resultados.filter(res => !res.ok);
      if (errores.length > 0) {
        console.error('❌ Algunos premios no se guardaron correctamente');
        setError(`Se guardaron ${resultados.length - errores.length} de ${resultados.length} premios`);
      } else {
        console.log('✅ Todos los premios guardados correctamente');
      }

      // Recargar los datos para mostrar los cambios
      await cargarDatos();

      // Limpiar el formulario
      setEditando(null);
      setFormData({
        id_tipo_rifa: '',
        saldo: '',
        premio_01: '',
        premio_02: '',
        premio_03: '',
        premio_04: '',
        premio_05: '',
        premio_06: '',
        premio_07: '',
        premio_08: '',
        premio_09: '',
        premio_10: '',
        id_area: '',
        digitos: ''
      });

      if (errores.length === 0) {
        alert(editando === 'nuevo' ? 'Premios creados correctamente' : 'Premios actualizados correctamente');
      }

    } catch (err) {
      console.error('❌ Error guardando premios:', err);
      setError('Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Cancela la edición y limpia el formulario
   */
  const handleCancelar = () => {
    setEditando(null);
    setFormData({
      id_tipo_rifa: '',
      saldo: '',
      premio_01: '',
      premio_02: '',
      premio_03: '',
      premio_04: '',
      premio_05: '',
      premio_06: '',
      premio_07: '',
      premio_08: '',
      premio_09: '',
      premio_10: '',
      id_area: '',
      digitos: ''
    });
  };

  /**
   * Descarga la plantilla de Excel con las columnas y ejemplos
   */
  const handleDescargarPlantilla = async () => {
    try {
      const response = await fetch('/api/opciones-premios/descargar-plantilla');
      
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla');
      }
      
      // Crear un blob con el archivo Excel
      const blob = await response.blob();
      
      // Crear un enlace temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_premios.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error descargando plantilla:', err);
      setError('Error al descargar la plantilla. Por favor, intenta de nuevo.');
    }
  };

  /**
   * Maneja la selección de un archivo Excel
   */
  const handleSeleccionarArchivo = (e) => {
    const archivo = e.target.files[0];
    
    if (!archivo) {
      return;
    }
    
    // Validar extensión
    const extensionesValidas = ['.xlsx', '.xls', '.ods'];
    const extension = archivo.name.substring(archivo.name.lastIndexOf('.')).toLowerCase();
    
    if (!extensionesValidas.includes(extension)) {
      setError('Solo se permiten archivos Excel (.xlsx, .xls, .ods)');
      e.target.value = '';
      return;
    }
    
    // Validar tamaño (5MB máximo)
    if (archivo.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB');
      e.target.value = '';
      return;
    }
    
    setArchivoExcel(archivo);
    setResultadoCarga(null);
    setError(null);
  };

  /**
   * Sube el archivo Excel al servidor para procesarlo
   */
  const handleCargarExcel = async () => {
    if (!archivoExcel) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }
    
    try {
      setCargandoExcel(true);
      setError(null);
      setResultadoCarga(null);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('archivo', archivoExcel);
      
      // Enviar al servidor
      const response = await fetch('/api/opciones-premios/cargar-excel', {
        method: 'POST',
        body: formData
      });
      
      const resultado = await response.json();
      
      if (!response.ok) {
        throw new Error(resultado.message || 'Error al procesar el archivo');
      }
      
      // Mostrar resultado
      setResultadoCarga(resultado.data);
      
      // Limpiar archivo seleccionado
      setArchivoExcel(null);
      document.getElementById('input-excel').value = '';
      
      // Recargar datos
      await cargarDatos();
      
      alert(`✅ ${resultado.message}`);
      
    } catch (err) {
      console.error('Error cargando Excel:', err);
      setError('Error al cargar el archivo: ' + err.message);
    } finally {
      setCargandoExcel(false);
    }
  };

  /**
   * Maneja los cambios en los filtros
   */
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      area: '',
      digitos: '',
      saldoMin: '',
      saldoMax: ''
    });
    setPaginaActual(1);
  };

  /**
   * Filtra los premios según los criterios seleccionados
   * Usa la lista de premios correcta según la pestaña activa
   */
  const datosActuales = pestanaActiva === 'numericos' ? premios : premiosTexto;
  
  const premiosFiltrados = datosActuales.filter(premio => {
    // Filtro por tipo
    if (filtros.tipo && premio.id_tipo_rifa !== parseInt(filtros.tipo)) {
      return false;
    }

    // Filtro por área
    if (filtros.area && premio.id_area !== parseInt(filtros.area)) {
      return false;
    }

    // Filtro por dígitos
    if (filtros.digitos && premio.digitos !== parseInt(filtros.digitos)) {
      return false;
    }

    // Filtro por saldo mínimo
    if (filtros.saldoMin && parseFloat(premio.saldo || 0) < parseFloat(filtros.saldoMin)) {
      return false;
    }

    // Filtro por saldo máximo
    if (filtros.saldoMax && parseFloat(premio.saldo || 0) > parseFloat(filtros.saldoMax)) {
      return false;
    }

    return true;
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(premiosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const premiosPaginados = premiosFiltrados.slice(indiceInicio, indiceFin);

  /**
   * Cambia la página actual
   */
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Cambia la cantidad de items por página
   */
  const cambiarItemsPorPagina = (e) => {
    setItemsPorPagina(parseInt(e.target.value));
    setPaginaActual(1);
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  /**
   * Elimina todos los premios de un tipo de rifa
   * @param {number} id_tipo_rifa - ID del tipo de rifa a eliminar
   */
  const handleEliminar = async (id_tipo_rifa, saldo, digitos, id_area, tipo_nombre, area_nombre) => {
    const mensaje = `¿Estás seguro de eliminar la configuración completa?\n\nTipo: ${tipo_nombre}\nApuesta: $${saldo}\nDígitos: ${digitos}D\nÁrea: ${area_nombre}\n\nSe eliminarán los 10 niveles de premios.`;
    
    if (!confirm(mensaje)) {
      return;
    }

    try {
      setLoading(true);
      
      // DELETE /api/opciones-premios/combo/:id_tipo_rifa/:saldo/:digitos/:id_area
      const response = await fetch(
        `/api/opciones-premios/combo/${id_tipo_rifa}/${saldo}/${digitos}/${id_area}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      // Recargar datos
      await cargarDatos();
      alert('Configuración de premios eliminada correctamente');

    } catch (err) {
      console.error('Error eliminando premios:', err);
      setError('Error al eliminar. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="gestion-premios-container">
        <div className="loading">Cargando premios...</div>
      </div>
    );
  }

  return (
    <div className="gestion-premios-container">
      <div className="header-section">
        <h2>Gestión de Premios</h2>
        <p className="subtitle">Administra los premios para cada tipo de rifa</p>
        
        {/* Pestañas para cambiar entre premios numéricos y texto */}
        <div className="pestanas-container">
          <button 
            className={`pestana ${pestanaActiva === 'numericos' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('numericos')}
          >
            💰 Premios Numéricos
          </button>
          <button 
            className={`pestana ${pestanaActiva === 'texto' ? 'activa' : ''}`}
            onClick={() => {
              setPestanaActiva('texto');
              if (premiosTexto.length === 0) {
                cargarDatos();
              }
            }}
          >
            📝 Premios en Texto
          </button>
        </div>
        
        <div className="botones-header">
          <button 
            className="btn-nuevo-premio"
            onClick={() => {
              setEditando('nuevo');
              setFormData({
                id_tipo_rifa: '',
                saldo: '',
                premio_01: '',
                premio_02: '',
                premio_03: '',
                premio_04: '',
                premio_05: '',
                premio_06: '',
                premio_07: '',
                premio_08: '',
                premio_09: '',
                premio_10: '',
                id_area: '',
                digitos: ''
              });
            }}
          >
            ➕ Agregar Nueva Configuración
          </button>
        </div>
      </div>

      {/* Sección de Carga de Excel */}
      <div className="excel-section">
        <h3>📊 Carga Masiva desde Excel</h3>
        <p className="excel-descripcion">
          Carga múltiples configuraciones de premios desde un archivo Excel
        </p>
        
        <div className="excel-controles">
          <button 
            className="btn-descargar-plantilla"
            onClick={handleDescargarPlantilla}
          >
            📥 Descargar Plantilla Excel
          </button>
          
          <div className="excel-upload">
            <input 
              type="file"
              id="input-excel"
              accept=".xlsx,.xls,.ods"
              onChange={handleSeleccionarArchivo}
              disabled={cargandoExcel}
            />
            <label htmlFor="input-excel" className="btn-seleccionar">
              {archivoExcel ? `📎 ${archivoExcel.name}` : '📁 Seleccionar Archivo'}
            </label>
            
            {archivoExcel && (
              <button 
                className="btn-cargar-excel"
                onClick={handleCargarExcel}
                disabled={cargandoExcel}
              >
                {cargandoExcel ? '⏳ Cargando...' : '⬆️ Subir Premios'}
              </button>
            )}
          </div>
        </div>

        {/* Resultado de la carga */}
        {resultadoCarga && (
          <div className="resultado-carga">
            <h4>Resultado de la Carga</h4>
            <div className="resultado-resumen">
              <span className="exitosos">✅ Exitosos: {resultadoCarga.exitosos}</span>
              <span className="errores">❌ Errores: {resultadoCarga.errores}</span>
            </div>
            
            {resultadoCarga.detalles && resultadoCarga.detalles.length > 0 && (
              <details className="resultado-detalles">
                <summary>Ver detalles ({resultadoCarga.detalles.length} filas procesadas)</summary>
                <div className="detalles-lista">
                  {resultadoCarga.detalles.map((detalle, index) => (
                    <div 
                      key={index} 
                      className={`detalle-item ${detalle.status}`}
                    >
                      <span className="fila">Fila {detalle.fila}:</span>
                      <span className="mensaje">{detalle.mensaje}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <h3>🔍 Filtros de Búsqueda</h3>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Tipo de Rifa</label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
            >
              <option value="">Todos los tipos</option>
              {tiposRifa.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label>Área</label>
            <select
              name="area"
              value={filtros.area}
              onChange={handleFiltroChange}
            >
              <option value="">Todas las áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label>Dígitos</label>
            <select
              name="digitos"
              value={filtros.digitos}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="2">2 Dígitos</option>
              <option value="3">3 Dígitos</option>
              <option value="4">4 Dígitos</option>
              <option value="5">5 Dígitos</option>
              <option value="6">6 Dígitos</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Apuesta Mínima</label>
            <input
              type="number"
              name="saldoMin"
              value={filtros.saldoMin}
              onChange={handleFiltroChange}
              placeholder="0.25"
              step="0.25"
              min="0"
            />
          </div>

          <div className="filtro-group">
            <label>Apuesta Máxima</label>
            <input
              type="number"
              name="saldoMax"
              value={filtros.saldoMax}
              onChange={handleFiltroChange}
              placeholder="20.00"
              step="0.25"
              min="0"
            />
          </div>

          <div className="filtro-actions">
            <button 
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              🗑️ Limpiar Filtros
            </button>
            <div className="resultados-count">
              {premiosFiltrados.length} resultado(s)
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para nuevo premio */}
      {editando === 'nuevo' && (
        <div className="nuevo-premio-form">
          <h3>Nueva Configuración de Premio</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de Rifa *</label>
              <select
                name="id_tipo_rifa"
                value={formData.id_tipo_rifa}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposRifa.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Área *</label>
              <select
                name="id_area"
                value={formData.id_area}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar área...</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Apuesta (Saldo) *</label>
              <input
                type="number"
                name="saldo"
                value={formData.saldo}
                onChange={handleInputChange}
                step="0.25"
                min="0.25"
                max="20.00"
                placeholder="0.25 - 20.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Dígitos *</label>
              <select
                name="digitos"
                value={formData.digitos}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="2">2 Dígitos</option>
                <option value="3">3 Dígitos</option>
                <option value="4">4 Dígitos</option>
                <option value="5">5 Dígitos</option>
                <option value="6">6 Dígitos</option>
              </select>
            </div>
          </div>

          <div className="premios-grid">
            <h4>{pestanaActiva === 'numericos' ? 'Valores de Premios' : 'Descripciones de Premios'}</h4>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nivel => (
              <div key={nivel} className="form-group">
                <label>Premio {nivel}</label>
                {pestanaActiva === 'numericos' ? (
                  <input
                    type="number"
                    name={`premio_${nivel.toString().padStart(2, '0')}`}
                    value={formData[`premio_${nivel.toString().padStart(2, '0')}`]}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                ) : (
                  <input
                    type="text"
                    name={`premio_${nivel.toString().padStart(2, '0')}`}
                    value={formData[`premio_${nivel.toString().padStart(2, '0')}`]}
                    onChange={handleInputChange}
                    placeholder="Ej: iPhone 15 Pro Max"
                    maxLength="255"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              onClick={handleGuardar}
              disabled={guardando || !formData.id_tipo_rifa || !formData.id_area || !formData.saldo || !formData.digitos}
              className="btn-save-form"
            >
              {guardando ? 'Guardando...' : '💾 Guardar Configuración'}
            </button>
            <button
              onClick={handleCancelar}
              disabled={guardando}
              className="btn-cancel-form"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de premios consolidada */}
      <div className="table-container">
        <table className="premios-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Apuesta</th>
              <th>Premio 1</th>
              <th>Premio 2</th>
              <th>Premio 3</th>
              <th>Premio 4</th>
              <th>Premio 5</th>
              <th>Premio 6</th>
              <th>Premio 7</th>
              <th>Premio 8</th>
              <th>Premio 9</th>
              <th>Premio 10</th>
              <th>Área</th>
              <th>Dígitos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {premiosPaginados.length === 0 ? (
              <tr>
                <td colSpan="15" className="no-data">
                  {premios.length === 0 ? 'No hay premios configurados' : 'No se encontraron resultados con los filtros aplicados'}
                </td>
              </tr>
            ) : (
              premiosPaginados.map((premio) => {
                const claveUnica = `${premio.id_tipo_rifa}-${premio.saldo}-${premio.digitos}-${premio.id_area}`;
                return (
                <tr key={claveUnica}>
                  {editando === claveUnica && editando !== 'nuevo' ? (
                    // MODO EDICIÓN: Mostrar inputs
                    <>
                      <td>{premio.tipo}</td>
                      <td>
                        <input
                          type="number"
                          name="saldo"
                          value={formData.saldo}
                          onChange={handleInputChange}
                          className="input-small"
                          step="0.25"
                          min="0.25"
                          max="20.00"
                          placeholder="0.25-20.00"
                        />
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nivel => (
                        <td key={nivel}>
                          <input
                            type="number"
                            name={`premio_${nivel.toString().padStart(2, '0')}`}
                            value={formData[`premio_${nivel.toString().padStart(2, '0')}`]}
                            onChange={handleInputChange}
                            className="input-small"
                            step="0.01"
                          />
                        </td>
                      ))}
                      <td>
                        <select
                          name="id_area"
                          value={formData.id_area}
                          onChange={handleInputChange}
                          className="select-small"
                        >
                          <option value="">Sin área</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>
                              {area.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          name="digitos"
                          value={formData.digitos}
                          onChange={handleInputChange}
                          className="select-small"
                        >
                          <option value="">-</option>
                          <option value="2">2D</option>
                          <option value="3">3D</option>
                          <option value="4">4D</option>
                          <option value="5">5D</option>
                          <option value="6">6D</option>
                        </select>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={handleGuardar}
                          disabled={guardando}
                          className="btn-save"
                        >
                          {guardando ? '...' : '💾'}
                        </button>
                        <button
                          onClick={handleCancelar}
                          disabled={guardando}
                          className="btn-cancel"
                        >
                          ✕
                        </button>
                      </td>
                    </>
                  ) : (
                    // MODO VISTA: Mostrar datos
                    <>
                      <td className="tipo-cell">{premio.tipo}</td>
                      <td className="apuesta-cell">${premio.saldo || '0.00'}</td>
                      {pestanaActiva === 'numericos' ? (
                        <>
                          <td className="premio-cell">${premio.premio_01 || 0}</td>
                          <td className="premio-cell">${premio.premio_02 || 0}</td>
                          <td className="premio-cell">${premio.premio_03 || 0}</td>
                          <td className="premio-cell">${premio.premio_04 || 0}</td>
                          <td className="premio-cell">${premio.premio_05 || 0}</td>
                          <td className="premio-cell">${premio.premio_06 || 0}</td>
                          <td className="premio-cell">${premio.premio_07 || 0}</td>
                          <td className="premio-cell">${premio.premio_08 || 0}</td>
                          <td className="premio-cell">${premio.premio_09 || 0}</td>
                          <td className="premio-cell">${premio.premio_10 || 0}</td>
                        </>
                      ) : (
                        <>
                          <td className="premio-texto-cell">{premio.premio_01 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_02 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_03 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_04 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_05 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_06 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_07 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_08 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_09 || '-'}</td>
                          <td className="premio-texto-cell">{premio.premio_10 || '-'}</td>
                        </>
                      )}
                      <td className="area-cell">{premio.area || 'Sin área'}</td>
                      <td className="digitos-cell">{premio.digitos ? `${premio.digitos}D` : '-'}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEditar(premio)}
                          className="btn-edit"
                          title="Editar premios"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEliminar(
                            premio.id_tipo_rifa, 
                            premio.saldo, 
                            premio.digitos, 
                            premio.id_area,
                            premio.tipo,
                            premio.area
                          )}
                          className="btn-delete"
                          title="Eliminar configuración completa"
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {premiosFiltrados.length > 0 && (
        <div className="paginacion-container">
          <div className="paginacion-info">
            <span>
              Mostrando {indiceInicio + 1} - {Math.min(indiceFin, premiosFiltrados.length)} de {premiosFiltrados.length} registros
            </span>
            <div className="items-por-pagina">
              <label>Registros por página:</label>
              <select value={itemsPorPagina} onChange={cambiarItemsPorPagina}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="paginacion-botones">
            <button
              onClick={() => cambiarPagina(1)}
              disabled={paginaActual === 1}
              className="btn-pag"
              title="Primera página"
            >
              ⏮️
            </button>
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="btn-pag"
              title="Anterior"
            >
              ◀️
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(num => {
                // Mostrar: primera, última, actual, y 2 a cada lado de la actual
                return (
                  num === 1 ||
                  num === totalPaginas ||
                  (num >= paginaActual - 2 && num <= paginaActual + 2)
                );
              })
              .map((num, index, array) => {
                // Agregar separador si hay salto
                const elementos = [];
                if (index > 0 && num > array[index - 1] + 1) {
                  elementos.push(
                    <span key={`sep-${num}`} className="paginacion-separador">
                      ...
                    </span>
                  );
                }
                elementos.push(
                  <button
                    key={num}
                    onClick={() => cambiarPagina(num)}
                    className={`btn-pag-num ${paginaActual === num ? 'activo' : ''}`}
                  >
                    {num}
                  </button>
                );
                return elementos;
              })}

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="btn-pag"
              title="Siguiente"
            >
              ▶️
            </button>
            <button
              onClick={() => cambiarPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              className="btn-pag"
              title="Última página"
            >
              ⏭️
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="info-section">
        <h3>ℹ️ Información</h3>
        <ul>
          <li><strong>Tipo:</strong> Nombre del tipo de rifa (Diaria, Semanal, etc.)</li>
          <li><strong>Apuesta:</strong> Valor que paga el usuario por jugar (rango: $0.25 a $20.00)</li>
          <li><strong>Premio 1-10:</strong> Valores de premios que se ganan por nivel (1=mayor premio, 10=menor)</li>
          <li><strong>Área:</strong> Área a la que pertenecen estos premios</li>
          <li><strong>Editar:</strong> Click en ✏️ para modificar los valores</li>
          <li><strong>Eliminar:</strong> Click en 🗑️ para borrar todos los premios del tipo</li>
          <li><strong>Ejemplo:</strong> Si apuesta = $5.00 y premio1 = $50,000, el usuario paga $5 y gana $50,000 si acierta el nivel 1</li>
        </ul>
      </div>
    </div>
  );
};

export default GestionPremios;
