# Script para agregar columna digitos a opciones_premios
# Ejecutar desde: backend/database/migrations/

Write-Host "=== Migracion: Agregar columna digitos ===" -ForegroundColor Cyan
Write-Host ""

# Configuración de la base de datos
$dbHost = "167.88.36.159"
$dbUser = "admin_rifas"
$dbPassword = "M0n3d4.2024"
$dbName = "rifaparatodos"

# Ruta al archivo SQL
$sqlFile = "002_add_digitos_simple.sql"

Write-Host "Base de datos: $dbName" -ForegroundColor Yellow
Write-Host "Archivo SQL: $sqlFile" -ForegroundColor Yellow
Write-Host ""

# Verificar si el archivo existe
if (-Not (Test-Path $sqlFile)) {
    Write-Host "ERROR: No se encuentra el archivo $sqlFile" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde la carpeta migrations/" -ForegroundColor Red
    exit 1
}

# Leer el contenido del archivo SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Ejecutando migracion..." -ForegroundColor Green

# Ejecutar el comando MySQL
try {
    $mysqlCommand = "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e `"$sqlContent`""
    Invoke-Expression $mysqlCommand
    
    Write-Host ""
    Write-Host "=== Migracion completada exitosamente ===" -ForegroundColor Green
    Write-Host ""
    
    # Verificar que la columna fue creada
    Write-Host "Verificando columna..." -ForegroundColor Cyan
    $verifySQL = "DESCRIBE opciones_premios;"
    $mysqlVerify = "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e `"$verifySQL`""
    Invoke-Expression $mysqlVerify
    
} catch {
    Write-Host ""
    Write-Host "ERROR al ejecutar la migracion:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName < $sqlFile" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
