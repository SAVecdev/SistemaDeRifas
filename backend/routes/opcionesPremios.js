import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import * as opcionesPremiosModel from '../models/opcionesPremiosModel.js';

const router = express.Router();

// Configurar multer para subir archivos Excel en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validar que sea un archivo Excel
    const validMimeTypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.oasis.opendocument.spreadsheet' // .ods
    ];
    if (validMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|ods)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls, .ods)'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

/**
 * GET /api/opciones-premios/vista-consolidada
 * Obtiene la vista consolidada de premios para el administrador
 * Muestra: tipo | saldo | premio1 | premio2 | ... | premio10 | area
 * Cada fila representa un tipo de rifa con todos sus premios
 */
router.get('/vista-consolidada', async (req, res) => {
  try {
    const vista = await opcionesPremiosModel.getVistaPremiosConsolidada();
    res.json({ status: 'success', data: vista });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/opciones-premios/descargar-plantilla
 * Descarga un archivo Excel de plantilla con las columnas y ejemplos de cómo llenar los premios
 */
router.get('/descargar-plantilla', async (req, res) => {
  try {
    // Crear un workbook nuevo
    const wb = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones
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
      ['- Puedes agregar tantas filas como configuraciones necesites']
    ];
    
    const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [{ width: 100 }];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');
    
    // Crear hoja de datos con ejemplos
    const datosEjemplo = [
      [
        'id_tipo_rifa', 'tipo_rifa', 'apuesta', 'digitos', 'id_area', 'area',
        'premio_01', 'premio_02', 'premio_03', 'premio_04', 'premio_05',
        'premio_06', 'premio_07', 'premio_08', 'premio_09', 'premio_10'
      ],
      [
        1, 'Rifa Normal', 1.00, 4, 1, 'Área Norte',
        500, 100, 50, 25, 10, 5, '', '', '', ''
      ],
      [
        1, 'Rifa Normal', 2.00, 4, 1, 'Área Norte',
        1000, 200, 100, 50, 20, 10, '', '', '', ''
      ],
      [
        2, 'Rifa Especial', 0.50, 3, '', '',
        250, 50, 25, '', '', '', '', '', '', ''
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
    
    // Crear hoja con tipos de rifa disponibles
    const tiposRifa = await opcionesPremiosModel.getAllTiposRifa?.() || [];
    const datosTipos = [['ID', 'Nombre del Tipo de Rifa']];
    tiposRifa.forEach(tipo => {
      datosTipos.push([tipo.id, tipo.nombre]);
    });
    
    const wsTipos = XLSX.utils.aoa_to_sheet(datosTipos);
    wsTipos['!cols'] = [{ width: 10 }, { width: 30 }];
    XLSX.utils.book_append_sheet(wb, wsTipos, 'Tipos de Rifa');
    
    // Crear hoja con áreas disponibles
    const areas = await opcionesPremiosModel.getAllAreas?.() || [];
    const datosAreas = [['ID', 'Nombre del Área']];
    areas.forEach(area => {
      datosAreas.push([area.id, area.nombre]);
    });
    
    const wsAreas = XLSX.utils.aoa_to_sheet(datosAreas);
    wsAreas['!cols'] = [{ width: 10 }, { width: 30 }];
    XLSX.utils.book_append_sheet(wb, wsAreas, 'Áreas');
    
    // Generar el archivo Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_premios.xlsx');
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error generando plantilla:', error);
    res.status(500).json({ status: 'error', message: 'Error al generar la plantilla: ' + error.message });
  }
});

/**
 * POST /api/opciones-premios/cargar-excel
 * Procesa un archivo Excel con premios y los carga en la base de datos
 * Formato esperado: id_tipo_rifa | tipo_rifa | apuesta | digitos | id_area | area | premio_01...premio_10
 */
router.post('/cargar-excel', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No se recibió ningún archivo' 
      });
    }
    
    console.log('📥 Archivo recibido:', req.file.originalname);
    
    // Leer el archivo Excel desde el buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Obtener la primera hoja (o la hoja llamada "Premios")
    const sheetName = workbook.SheetNames.find(name => name === 'Premios') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Filas encontradas:', data.length);
    
    if (data.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El archivo Excel no contiene datos' 
      });
    }
    
    // Validar columnas requeridas
    const primeraFila = data[0];
    const columnasRequeridas = ['id_tipo_rifa', 'apuesta', 'digitos'];
    const columnasFaltantes = columnasRequeridas.filter(col => !(col in primeraFila));
    
    if (columnasFaltantes.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Faltan columnas requeridas: ${columnasFaltantes.join(', ')}` 
      });
    }
    
    // Procesar cada fila
    const resultados = {
      exitosos: 0,
      errores: 0,
      detalles: []
    };
    
    for (let i = 0; i < data.length; i++) {
      const fila = data[i];
      const numFila = i + 2; // +2 porque Excel empieza en 1 y tiene encabezado
      
      try {
        // Validar datos obligatorios
        if (!fila.id_tipo_rifa || !fila.apuesta || !fila.digitos) {
          throw new Error('Faltan datos obligatorios (id_tipo_rifa, apuesta, digitos)');
        }
        
        // Procesar los 10 niveles de premio
        let premiosInsertados = 0;
        
        for (let nivel = 1; nivel <= 10; nivel++) {
          const nombreCampoPremio = `premio_${nivel.toString().padStart(2, '0')}`;
          const valorPremio = fila[nombreCampoPremio];
          
          // Solo insertar si tiene valor y es mayor que 0
          if (valorPremio && parseFloat(valorPremio) > 0) {
            const premioData = {
              id_tipo_rifa: parseInt(fila.id_tipo_rifa),
              valor_premio: parseFloat(valorPremio),
              nivel_premio: nivel,
              saldo_ganado: parseFloat(fila.apuesta),
              id_area: fila.id_area ? parseInt(fila.id_area) : null,
              digitos: parseInt(fila.digitos)
            };
            
            await opcionesPremiosModel.createOpcionPremio(premioData);
            premiosInsertados++;
          }
        }
        
        if (premiosInsertados > 0) {
          resultados.exitosos++;
          resultados.detalles.push({
            fila: numFila,
            status: 'ok',
            mensaje: `${premiosInsertados} premios insertados`
          });
        } else {
          resultados.errores++;
          resultados.detalles.push({
            fila: numFila,
            status: 'warning',
            mensaje: 'No se encontraron premios con valores válidos'
          });
        }
        
      } catch (error) {
        console.error(`Error procesando fila ${numFila}:`, error);
        resultados.errores++;
        resultados.detalles.push({
          fila: numFila,
          status: 'error',
          mensaje: error.message
        });
      }
    }
    
    console.log('✅ Procesamiento completado:', resultados);
    
    res.json({ 
      status: 'success', 
      message: `Procesamiento completado: ${resultados.exitosos} exitosos, ${resultados.errores} con errores`,
      data: resultados
    });
    
  } catch (error) {
    console.error('❌ Error procesando Excel:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al procesar el archivo: ' + error.message 
    });
  }
});

// Crear opción de premio
router.post('/', async (req, res) => {
  try {
    console.log('📥 Backend POST /opciones-premios - Body recibido:', req.body);
    const opcionId = await opcionesPremiosModel.createOpcionPremio(req.body);
    console.log('✅ Opción de premio creada con ID:', opcionId);
    res.status(201).json({ status: 'success', data: { id: opcionId } });
  } catch (error) {
    console.error('❌ Error en POST /opciones-premios:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener opciones de premio por tipo de rifa
router.get('/tipo/:id_tipo_rifa', async (req, res) => {
  try {
    const opciones = await opcionesPremiosModel.getOpcionesPremiosByTipo(req.params.id_tipo_rifa);
    res.json({ status: 'success', data: opciones });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener opción de premio por tipo y nivel
router.get('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const opcion = await opcionesPremiosModel.getOpcionPremioByNivel(
      req.params.id_tipo_rifa, 
      req.params.nivel_premio
    );
    if (!opcion) {
      return res.status(404).json({ status: 'error', message: 'Opción de premio no encontrada' });
    }
    res.json({ status: 'success', data: opcion });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las opciones de premio
router.get('/', async (req, res) => {
  try {
    const opciones = await opcionesPremiosModel.getAllOpcionesPremios();
    res.json({ status: 'success', data: opciones });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar opción de premio
router.put('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    console.log('📥 Backend PUT /opciones-premios - Tipo:', req.params.id_tipo_rifa, 'Nivel:', req.params.nivel_premio);
    console.log('📥 Body recibido:', req.body);
    const updated = await opcionesPremiosModel.updateOpcionPremio(
      req.params.id_tipo_rifa,
      req.params.nivel_premio,
      req.body
    );
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Opción de premio no encontrada' });
    }
    console.log('✅ Opción de premio actualizada correctamente');
    res.json({ status: 'success', message: 'Opción de premio actualizada' });
  } catch (error) {
    console.error('❌ Error en PUT /opciones-premios:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar opción de premio
router.delete('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const deleted = await opcionesPremiosModel.deleteOpcionPremio(
      req.params.id_tipo_rifa,
      req.params.nivel_premio
    );
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Opción de premio no encontrada' });
    }
    res.json({ status: 'success', message: 'Opción de premio eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar opciones de premio por combinación específica (tipo + saldo + digitos + area)
router.delete('/combo/:id_tipo_rifa/:saldo/:digitos/:id_area', async (req, res) => {
  try {
    const { id_tipo_rifa, saldo, digitos, id_area } = req.params;
    const count = await opcionesPremiosModel.deleteOpcionesByCombo(
      id_tipo_rifa,
      parseFloat(saldo),
      parseInt(digitos),
      id_area
    );
    res.json({ status: 'success', message: `${count} opciones eliminadas` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar todas las opciones de un tipo de rifa
router.delete('/tipo/:id_tipo_rifa', async (req, res) => {
  try {
    const count = await opcionesPremiosModel.deleteAllOpcionesByTipo(req.params.id_tipo_rifa);
    res.json({ status: 'success', message: `${count} opciones eliminadas` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Contar opciones por tipo de rifa
router.get('/tipo/:id_tipo_rifa/count', async (req, res) => {
  try {
    const count = await opcionesPremiosModel.countOpcionesByTipo(req.params.id_tipo_rifa);
    res.json({ status: 'success', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
