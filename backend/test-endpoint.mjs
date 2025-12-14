import axios from 'axios';

// Obtener token del administrador (asumiendo que está logueado)
// En un caso real, tomarías esto de localStorage o sessionStorage
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJyb2wiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzM0MTc3ODE3LCJleHAiOjE3MzQyNjQyMTd9.test'; // Token de ejemplo

async function testSesionesEndpoint() {
  try {
    console.log('🧪 Probando endpoint: GET http://localhost:5000/api/sesiones/activas\n');
    
    // Primero probamos sin token
    console.log('1️⃣ Probando sin token (debería fallar)...');
    try {
      const res1 = await axios.get('http://localhost:5000/api/sesiones/activas');
      console.log('❌ ERROR: No debería permitir acceso sin token');
    } catch (err) {
      console.log('✅ Correcto - rechazado:', err.response?.data?.message || err.message);
    }
    
    console.log('\n2️⃣ Probando con token simulado...');
    // Ahora probamos la estructura del endpoint
    // Nota: Si el token no es válido, fallará la autenticación
    // Pero al menos veremos si el endpoint existe
    try {
      const res2 = await axios.get('http://localhost:5000/api/sesiones/activas', {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      console.log('✅ Endpoint responde correctamente');
      console.log('📊 Datos recibidos:', JSON.stringify(res2.data, null, 2));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('⚠️ Endpoint existe pero token inválido (esperado)');
        console.log('   Mensaje:', err.response?.data?.message);
      } else if (err.response?.status === 404) {
        console.log('❌ ERROR: Endpoint no encontrado (404)');
      } else {
        console.log('❌ Error:', err.response?.data || err.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
  }
}

testSesionesEndpoint();
