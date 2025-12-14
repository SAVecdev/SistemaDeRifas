import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script para generar un archivo Excel de ejemplo con premios
 * Este archivo puede usarse como referencia para cargar premios masivamente
 */

// Crear workbook
const wb = XLSX.utils.book_new();

// ==================== HOJA DE INSTRUCCIONES ====================
const instrucciones = [
  ['PLANTILLA DE CARGA DE PREMIOS - INSTRUCCIONES'],
  [''],
  ['Esta plantilla permite cargar múltiples configuraciones de premios para rifas.'],
  ['Cada fila representa una combinación única de: Tipo de Rifa + Apuesta + Dígitos + Área'],
  [''],
  ['COLUMNAS OBLIGATORIAS:'],
  ['- id_tipo_rifa: ID numérico del tipo de rifa (1, 2, 3, etc.)'],
  ['- tipo_rifa: Nombre del tipo de rifa (solo referencia, se usa el ID)'],
  ['- apuesta: Valor que paga el usuario para jugar (0.25 a 20.00)'],
  ['- digitos: Cantidad de dígitos a acertar (1 a 6)'],
  ['- id_area: ID numérico del área (1, 2, 3, etc.). Dejar vacío si aplica a todas las áreas'],
  ['- area: Nombre del área (solo referencia, se usa el ID)'],
  [''],
  ['COLUMNAS DE PREMIOS (premio_01 a premio_10):'],
  ['- Representan los premios que se ganan si el usuario acierta ese nivel'],
  ['- Solo llenar los niveles que apliquen para esa configuración'],
  ['- Los valores vacíos se ignoran'],
  [''],
  ['EJEMPLO:'],
  ['Si tipo_rifa=1, apuesta=1.00, digitos=4, id_area=1 y premio_01=500, premio_02=100'],
  ['Significa: Para rifas tipo 1, en área 1, si apuesta $1 a 4 dígitos:'],
  ['  - Si acierta nivel 1 (todos los dígitos), gana $500'],
  ['  - Si acierta nivel 2 (algunos dígitos), gana $100'],
  [''],
  ['IMPORTANTE:'],
  ['- No modificar los nombres de las columnas'],
  ['- Los ID deben existir en la base de datos'],
  ['- Los valores numéricos no deben tener símbolos como $ o ,'],
  ['- Puedes agregar tantas filas como configuraciones necesites'],
  [''],
  ['PASOS PARA USAR:'],
  ['1. Ve a la hoja "Tipos de Rifa" y "Áreas" para ver los IDs disponibles'],
  ['2. Llena los datos en la hoja "Premios" siguiendo los ejemplos'],
  ['3. Guarda el archivo'],
  ['4. Ve a http://localhost:3001/admin/gestion-premios'],
  ['5. Haz clic en "Seleccionar Archivo" y elige este Excel'],
  ['6. Haz clic en "Subir Premios"']
];

const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
wsInstrucciones['!cols'] = [{ width: 100 }];
XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

// ==================== HOJA DE DATOS CON EJEMPLOS ====================
const datosEjemplo = [
  // Encabezados
  [
    'id_tipo_rifa', 'tipo_rifa', 'apuesta', 'digitos', 'id_area', 'area',
    'premio_01', 'premio_02', 'premio_03', 'premio_04', 'premio_05',
    'premio_06', 'premio_07', 'premio_08', 'premio_09', 'premio_10'
  ],
  // Ejemplo 1: Rifa tipo 1, apuesta $1, 4 dígitos, área 1
  [
    1, 'Rifa Normal', 1.00, 4, 1, 'Área Norte',
    500, 100, 50, 25, 10, 5, '', '', '', ''
  ],
  // Ejemplo 2: Rifa tipo 1, apuesta $2, 4 dígitos, área 1
  [
    1, 'Rifa Normal', 2.00, 4, 1, 'Área Norte',
    1000, 200, 100, 50, 20, 10, '', '', '', ''
  ],
  // Ejemplo 3: Rifa tipo 1, apuesta $0.50, 3 dígitos, sin área específica
  [
    1, 'Rifa Normal', 0.50, 3, '', '',
    250, 50, 25, '', '', '', '', '', '', ''
  ],
  // Ejemplo 4: Rifa tipo 2, apuesta $5, 5 dígitos, área 2
  [
    2, 'Rifa Especial', 5.00, 5, 2, 'Área Sur',
    5000, 1000, 500, 250, 100, 50, 25, '', '', ''
  ],
  // Ejemplo 5: Rifa tipo 1, apuesta $0.25, 2 dígitos, todas las áreas
  [
    1, 'Rifa Normal', 0.25, 2, '', '',
    100, 25, 10, '', '', '', '', '', '', ''
  ]
];

const wsDatos = XLSX.utils.aoa_to_sheet(datosEjemplo);

// Establecer anchos de columna
wsDatos['!cols'] = [
  { width: 12 },  // id_tipo_rifa
  { width: 15 },  // tipo_rifa
  { width: 10 },  // apuesta
  { width: 10 },  // digitos
  { width: 10 },  // id_area
  { width: 15 },  // area
  { width: 10 },  // premio_01
  { width: 10 },  // premio_02
  { width: 10 },  // premio_03
  { width: 10 },  // premio_04
  { width: 10 },  // premio_05
  { width: 10 },  // premio_06
  { width: 10 },  // premio_07
  { width: 10 },  // premio_08
  { width: 10 },  // premio_09
  { width: 10 }   // premio_10
];

XLSX.utils.book_append_sheet(wb, wsDatos, 'Premios');

// ==================== HOJA DE TIPOS DE RIFA ====================
const datosTipos = [
  ['ID', 'Nombre del Tipo de Rifa', 'Descripción'],
  [1, 'Rifa Normal', 'Rifa estándar con premios regulares'],
  [2, 'Rifa Especial', 'Rifa con premios especiales o mayores'],
  [3, 'Rifa Express', 'Rifa rápida con sorteos frecuentes'],
  ['', '', ''],
  ['NOTA:', 'Estos son ejemplos. Verifica los tipos disponibles en tu base de datos.', '']
];

const wsTipos = XLSX.utils.aoa_to_sheet(datosTipos);
wsTipos['!cols'] = [{ width: 10 }, { width: 30 }, { width: 50 }];
XLSX.utils.book_append_sheet(wb, wsTipos, 'Tipos de Rifa');

// ==================== HOJA DE ÁREAS ====================
const datosAreas = [
  ['ID', 'Nombre del Área', 'Descripción'],
  [1, 'Área Norte', 'Zona norte de la ciudad'],
  [2, 'Área Sur', 'Zona sur de la ciudad'],
  [3, 'Área Este', 'Zona este de la ciudad'],
  [4, 'Área Oeste', 'Zona oeste de la ciudad'],
  ['', '', ''],
  ['NOTA:', 'Estos son ejemplos. Verifica las áreas disponibles en tu base de datos.', ''],
  ['', 'Si dejas vacío el id_area, el premio aplicará para todas las áreas.', '']
];

const wsAreas = XLSX.utils.aoa_to_sheet(datosAreas);
wsAreas['!cols'] = [{ width: 10 }, { width: 30 }, { width: 50 }];
XLSX.utils.book_append_sheet(wb, wsAreas, 'Áreas');

// ==================== HOJA DE AYUDA ====================
const ayuda = [
  ['PREGUNTAS FRECUENTES'],
  [''],
  ['P: ¿Qué significa cada columna?'],
  ['R: - id_tipo_rifa: Número que identifica el tipo de rifa'],
  ['   - apuesta: Cuánto paga el usuario para jugar'],
  ['   - digitos: Cuántos números debe acertar'],
  ['   - id_area: En qué área aplica (vacío = todas)'],
  ['   - premio_01 a premio_10: Premios que gana según el nivel de aciertos'],
  [''],
  ['P: ¿Puedo dejar premios vacíos?'],
  ['R: Sí. Solo se cargarán los premios que tengan valor mayor a 0'],
  [''],
  ['P: ¿Qué pasa si hay un error?'],
  ['R: El sistema te mostrará qué filas tuvieron error y cuáles se cargaron bien'],
  [''],
  ['P: ¿Puedo cargar varias veces?'],
  ['R: Sí. Puedes cargar el archivo tantas veces como necesites'],
  [''],
  ['P: ¿Se borran los premios anteriores?'],
  ['R: No. Los premios que cargues se agregarán a los existentes'],
  [''],
  ['EJEMPLOS DE USO:'],
  [''],
  ['Caso 1: Premios para apuesta de $1 en 4 dígitos'],
  ['  id_tipo_rifa=1, apuesta=1.00, digitos=4, premio_01=500, premio_02=100'],
  ['  Significa: Si apuesta $1 y acierta 4 dígitos gana $500, si acierta 3 gana $100'],
  [''],
  ['Caso 2: Diferentes premios según el área'],
  ['  Fila 1: id_tipo_rifa=1, apuesta=1.00, digitos=4, id_area=1, premio_01=500'],
  ['  Fila 2: id_tipo_rifa=1, apuesta=1.00, digitos=4, id_area=2, premio_01=600'],
  ['  El área 2 tiene premios más altos que el área 1'],
  [''],
  ['Caso 3: Diferentes apuestas, diferentes premios'],
  ['  Fila 1: apuesta=1.00, premio_01=500'],
  ['  Fila 2: apuesta=2.00, premio_01=1200'],
  ['  Fila 3: apuesta=5.00, premio_01=3500'],
  ['  A mayor apuesta, mayor premio']
];

const wsAyuda = XLSX.utils.aoa_to_sheet(ayuda);
wsAyuda['!cols'] = [{ width: 100 }];
XLSX.utils.book_append_sheet(wb, wsAyuda, 'Ayuda');

// Generar archivo
const outputPath = join(__dirname, 'plantilla_premios_ejemplo.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Archivo Excel generado exitosamente:');
console.log('📁', outputPath);
console.log('');
console.log('📖 El archivo incluye:');
console.log('   - Hoja "Instrucciones": Guía completa de uso');
console.log('   - Hoja "Premios": Ejemplos de datos listos para cargar');
console.log('   - Hoja "Tipos de Rifa": Referencia de tipos disponibles');
console.log('   - Hoja "Áreas": Referencia de áreas disponibles');
console.log('   - Hoja "Ayuda": Preguntas frecuentes y ejemplos');
console.log('');
console.log('🚀 Para usar:');
console.log('   1. Revisa los ejemplos en la hoja "Premios"');
console.log('   2. Modifica los datos según tus necesidades');
console.log('   3. Ve a http://localhost:3001/admin/gestion-premios');
console.log('   4. Sube el archivo usando el botón "Seleccionar Archivo"');
