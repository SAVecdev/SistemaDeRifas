import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import './Registro.css';

function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    aceptaTerminos: false
  });
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos y condiciones';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setErrorGeneral('');
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCargando(true);

    try {
      // Llamar al endpoint de registro
      const response = await apiClient.post('/auth/register', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password
      });

      if (response.data.status === 'success') {
        // Registro exitoso - hacer login automático
        alert('¡Registro exitoso! Bienvenido a RifaParaTodos');
        
        // Login automático con las credenciales
        await login(formData.email, formData.password);
        // El login redirige automáticamente según el rol
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      
      if (err.response?.data?.message) {
        setErrorGeneral(err.response.data.message);
      } else {
        setErrorGeneral('Error al registrar usuario. Por favor intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card registro-card">
        <h1>📝 Crear Cuenta</h1>
        <p className="auth-subtitle">Únete a RifaParaTodos y empieza a participar</p>

        {errorGeneral && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <span>{errorGeneral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Juan"
                value={formData.nombre}
                onChange={handleChange}
                disabled={cargando}
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                className="form-control"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={handleChange}
                disabled={cargando}
              />
              {errors.apellido && <span className="error-text">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={cargando}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              className="form-control"
              placeholder="+1 234 567 8900"
              value={formData.telefono}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={cargando}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={cargando}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                disabled={cargando}
              />
              <span>
                Acepto los <Link to="/terminos" className="link">términos y condiciones</Link> y 
                la <Link to="/privacidad" className="link">política de privacidad</Link>
              </span>
            </label>
            {errors.aceptaTerminos && <span className="error-text">{errors.aceptaTerminos}</span>}
          </div>

          <button type="submit" className="btn btn-success btn-block btn-large" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="divider">
          <span>O regístrate con</span>
        </div>

        <div className="social-login">
          <button className="btn btn-social google" disabled={cargando}>
            <span>🔍</span> Google
          </button>
          <button className="btn btn-social facebook" disabled={cargando}>
            <span>📘</span> Facebook
          </button>
        </div>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login" className="link">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
