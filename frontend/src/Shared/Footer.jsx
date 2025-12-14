import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>RifaParaTodos</h3>
          <p>Sistema transparente de rifas en línea basado en loterías nacionales</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/rifas">Rifas Activas</a></li>
            <li><a href="/como-funciona">¿Cómo funciona?</a></li>
            <li><a href="/terminos">Términos y Condiciones</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: info@rifaparatodos.com</p>
          <p>Teléfono: +123 456 7890</p>
        </div>
        
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#twitter">Twitter</a>
            <a href="#instagram">Instagram</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 RifaParaTodos. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
