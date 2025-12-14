# Script para ejecutar la migración de la tabla area
# Agrega campos: descripcion, activo, created_at, updated_at

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   MIGRACIÓN DE BASE DE DATOS - AREAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Leer variables del archivo .env
$envFile = "backend\.env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $name -Value $value
        }
    }
    Write-Host "✅ Variables de entorno cargadas" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró el archivo .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuración de conexión:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Usuario: $DB_USER" -ForegroundColor Gray
Write-Host "  Base de datos: $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Verificar si mysql está instalado
$mysqlPath = "mysql"
$mysqlInstalled = $null -ne (Get-Command $mysqlPath -ErrorAction SilentlyContinue)

if (-not $mysqlInstalled) {
    Write-Host "❌ MySQL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instala MySQL desde: https://dev.mysql.com/downloads/installer/" -ForegroundColor Gray
    Write-Host "2. Agrega MySQL al PATH de Windows" -ForegroundColor Gray
    Write-Host "3. Ejecuta la migración manualmente desde phpMyAdmin o MySQL Workbench" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Archivo de migración: backend\database\migrations\001_add_area_fields.sql" -ForegroundColor Cyan
    exit 1
}

Write-Host "🔧 Ejecutando migración..." -ForegroundColor Yellow
Write-Host ""

$migrationFile = "backend\database\migrations\001_add_area_fields.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ No se encontró el archivo de migración" -ForegroundColor Red
    Write-Host "   Ruta esperada: $migrationFile" -ForegroundColor Gray
    exit 1
}

# Ejecutar migración
try {
    $mysqlCmd = "mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $migrationFile"
    
    Write-Host "Ejecutando comando SQL..." -ForegroundColor Gray
    
    # Usar cmd para ejecutar el comando con redirección
    $output = cmd /c "mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $migrationFile 2>&1"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración ejecutada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Cambios aplicados:" -ForegroundColor White
        Write-Host "  • Campo 'descripcion' agregado (TEXT NULL)" -ForegroundColor Gray
        Write-Host "  • Campo 'activo' agregado (TINYINT DEFAULT 1)" -ForegroundColor Gray
        Write-Host "  • Campo 'created_at' agregado (TIMESTAMP)" -ForegroundColor Gray
        Write-Host "  • Campo 'updated_at' agregado (TIMESTAMP)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📊 Salida del comando:" -ForegroundColor Yellow
        Write-Host $output -ForegroundColor Gray
    } else {
        Write-Host "❌ Error al ejecutar la migración" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al ejecutar la migración: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   MIGRACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora puedes usar el CRUD de áreas en:" -ForegroundColor White
Write-Host "http://localhost:3001/admin/areas" -ForegroundColor Cyan
Write-Host ""
