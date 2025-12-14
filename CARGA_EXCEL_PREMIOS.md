# 📊 Carga Masiva de Premios desde Excel

## Descripción

Esta funcionalidad permite cargar múltiples configuraciones de premios para rifas mediante un archivo Excel. Es ideal para configurar rápidamente muchos premios sin tener que ingresarlos uno por uno.

## 🎯 Características

- ✅ Carga masiva de premios desde archivo Excel (.xlsx, .xls, .ods)
- ✅ Plantilla descargable con ejemplos y descripciones
- ✅ Validación automática de datos
- ✅ Reporte detallado de éxitos y errores
- ✅ Soporte para hasta 10 niveles de premio por configuración
- ✅ Configuración por tipo de rifa, apuesta, dígitos y área

## 📋 Estructura del Excel

El archivo Excel debe contener las siguientes columnas:

### Columnas Obligatorias

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id_tipo_rifa` | Número | ID del tipo de rifa en la base de datos | 1 |
| `tipo_rifa` | Texto | Nombre del tipo (solo referencia) | "Rifa Normal" |
| `apuesta` | Decimal | Valor que paga el usuario (0.25 a 20.00) | 1.00 |
| `digitos` | Número | Cantidad de dígitos a acertar (1 a 6) | 4 |
| `id_area` | Número | ID del área (opcional, vacío = todas) | 1 |
| `area` | Texto | Nombre del área (solo referencia) | "Área Norte" |

### Columnas de Premios

| Columna | Descripción |
|---------|-------------|
| `premio_01` | Premio si acierta nivel 1 |
| `premio_02` | Premio si acierta nivel 2 |
| `premio_03` | Premio si acierta nivel 3 |
| `premio_04` | Premio si acierta nivel 4 |
| `premio_05` | Premio si acierta nivel 5 |
| `premio_06` | Premio si acierta nivel 6 |
| `premio_07` | Premio si acierta nivel 7 |
| `premio_08` | Premio si acierta nivel 8 |
| `premio_09` | Premio si acierta nivel 9 |
| `premio_10` | Premio si acierta nivel 10 |

**Nota:** Solo llenar los niveles que apliquen. Los valores vacíos o en 0 se ignoran.

## 🚀 Cómo Usar

### Paso 1: Descargar la Plantilla

1. Ve a `http://localhost:3001/admin/gestion-premios`
2. En la sección "📊 Carga Masiva desde Excel"
3. Haz clic en el botón **"📥 Descargar Plantilla Excel"**
4. Se descargará el archivo `plantilla_premios.xlsx`

### Paso 2: Llenar los Datos

1. Abre el archivo Excel descargado
2. Ve a la hoja **"Instrucciones"** para leer la guía completa
3. Ve a la hoja **"Tipos de Rifa"** para ver los IDs disponibles
4. Ve a la hoja **"Áreas"** para ver los IDs de áreas
5. En la hoja **"Premios"**, llena tus datos siguiendo los ejemplos
6. Guarda el archivo

### Paso 3: Subir el Archivo

1. Ve a `http://localhost:3001/admin/gestion-premios`
2. Haz clic en **"📁 Seleccionar Archivo"**
3. Elige tu archivo Excel
4. Haz clic en **"⬆️ Subir Premios"**
5. Espera el reporte de resultados

### Paso 4: Revisar Resultados

El sistema mostrará:
- ✅ Número de filas procesadas exitosamente
- ❌ Número de filas con errores
- 📝 Detalle de cada fila procesada

## 📝 Ejemplos

### Ejemplo 1: Premios básicos para apuesta de $1

```
id_tipo_rifa: 1
tipo_rifa: Rifa Normal
apuesta: 1.00
digitos: 4
id_area: 1
area: Área Norte
premio_01: 500
premio_02: 100
premio_03: 50
```

**Significado:** En rifas tipo 1, área Norte, si alguien apuesta $1 a 4 dígitos y acierta nivel 1, gana $500.

### Ejemplo 2: Diferentes apuestas, diferentes premios

```
Fila 1:
  apuesta: 1.00, premio_01: 500, premio_02: 100

Fila 2:
  apuesta: 2.00, premio_01: 1200, premio_02: 250

Fila 3:
  apuesta: 5.00, premio_01: 3500, premio_02: 800
```

### Ejemplo 3: Premios para todas las áreas

```
id_tipo_rifa: 1
apuesta: 0.50
digitos: 3
id_area: [VACÍO]
premio_01: 250
premio_02: 50
```

**Significado:** Aplica para todas las áreas.

## ⚠️ Validaciones y Errores

El sistema valida:

1. **Formato de archivo:** Solo acepta .xlsx, .xls, .ods
2. **Tamaño:** Máximo 5MB
3. **Columnas obligatorias:** Debe tener id_tipo_rifa, apuesta, digitos
4. **Valores numéricos:** Los IDs y valores deben ser números válidos
5. **IDs existentes:** Los tipos de rifa y áreas deben existir en la BD

### Errores Comunes

| Error | Solución |
|-------|----------|
| "Faltan columnas requeridas" | Verifica que el Excel tenga todas las columnas obligatorias |
| "ID no existe" | Revisa que los id_tipo_rifa e id_area existan en la base de datos |
| "Valor inválido" | Asegúrate de que los números no tengan símbolos como $ o , |
| "No se encontraron premios" | Al menos un campo premio_01 a premio_10 debe tener valor |

## 🛠️ Archivos de Ejemplo

### Archivo Generado Automáticamente

Ejecuta este comando para generar un archivo de ejemplo completo:

```bash
node generar-excel-ejemplo.js
```

Se creará el archivo `plantilla_premios_ejemplo.xlsx` con:
- 5 ejemplos de configuraciones de premios
- Hojas con tipos de rifa y áreas de referencia
- Instrucciones detalladas
- Preguntas frecuentes

## 🔧 Implementación Técnica

### Backend

**Endpoint de descarga de plantilla:**
```
GET /api/opciones-premios/descargar-plantilla
```

**Endpoint de carga:**
```
POST /api/opciones-premios/cargar-excel
Content-Type: multipart/form-data
Body: archivo (file)
```

### Tecnologías Utilizadas

- **Backend:** Node.js + Express + Multer + XLSX
- **Frontend:** React + Fetch API
- **Base de datos:** MySQL

### Archivos Modificados

- `backend/routes/opcionesPremios.js` - Rutas para Excel
- `backend/models/opcionesPremiosModel.js` - Funciones auxiliares
- `frontend/src/Admin/GestionPremios.jsx` - Interfaz de carga
- `frontend/src/Admin/GestionPremios.css` - Estilos

## 📚 Recursos Adicionales

- **Plantilla de ejemplo:** `plantilla_premios_ejemplo.xlsx`
- **Script generador:** `generar-excel-ejemplo.js`
- **Documentación de API:** Ver `backend/API_DOCUMENTATION.md`

## 💡 Tips

1. **Copia ejemplos existentes:** La plantilla descargable incluye ejemplos que puedes copiar
2. **Prueba con pocos datos:** Primero sube 2-3 filas para verificar que todo funcione
3. **Revisa los IDs:** Siempre verifica los IDs en las hojas de referencia
4. **Usa la misma plantilla:** No cambies los nombres de las columnas
5. **Guarda backups:** Antes de cargas masivas, haz backup de tu base de datos

## 🐛 Solución de Problemas

**El archivo no se sube:**
- Verifica que sea un archivo Excel válido
- Revisa que no supere 5MB
- Asegúrate de que el backend esté corriendo

**Muchos errores al cargar:**
- Revisa que los IDs existan en la base de datos
- Verifica que no haya símbolos extraños en los números
- Usa la plantilla descargable como base

**La plantilla no se descarga:**
- Verifica que el backend esté corriendo
- Revisa la consola del navegador por errores
- Prueba con otro navegador

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor backend
3. Verifica que todas las dependencias estén instaladas (`npm install`)

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2025
