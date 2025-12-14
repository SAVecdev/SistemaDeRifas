import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const resultado = await login(formData.email, formData.password);
      
      if (!resultado.success) {
        setError(resultado.error || 'Error al iniciar sesión');
        setCargando(false);
      }
      // El login exitoso redirige automáticamente en el AuthContext
    } catch (err) {
      setError('Error al conectar con el servidor');
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <h1>🔐 Iniciar Sesión</h1>
        <p className="auth-subtitle">Bienvenido a RifaParaTodos</p>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={cargando}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/recuperar-password" className="link">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-large" disabled={cargando}>
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="divider">
          <span>O inicia sesión con</span>
        </div>

        <div className="divider">
          <span>O inicia sesión con</span>
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
          <p>¿No tienes cuenta? <Link to="/registro" className="link">Regístrate aquí</Link></p>
          <Link to="/" className="link-secondary">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
