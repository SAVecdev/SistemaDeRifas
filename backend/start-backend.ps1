# Script para iniciar el backend
Write-Host "🚀 Iniciando backend de RifaParaTodos..." -ForegroundColor Cyan
Write-Host ""

# Verificar si el puerto 5000 está en uso
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "⚠️  El puerto 5000 ya está en uso" -ForegroundColor Yellow
    Write-Host "Proceso ID: $($port5000.OwningProcess)" -ForegroundColor Yellow
    
    $respuesta = Read-Host "¿Deseas detener el proceso actual? (S/N)"
    if ($respuesta -eq 'S' -or $respuesta -eq 's') {
        Stop-Process -Id $port5000.OwningProcess -Force
        Write-Host "✅ Proceso detenido" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ No se puede iniciar el servidor. Puerto ocupado." -ForegroundColor Red
        exit 1
    }
}

# Cambiar al directorio del backend
Set-Location -Path "$PSScriptRoot"

# Verificar si existe node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró el archivo .env" -ForegroundColor Yellow
    Write-Host "📝 Creando archivo .env básico..." -ForegroundColor Cyan
    
    @"
PORT=5000
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development

# Database Configuration
DB_HOST=167.88.36.159
DB_USER=rifauser
DB_PASSWORD=rifapass2024
DB_NAME=rifaparatodos
DB_PORT=3306
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🟢 Iniciando servidor en puerto 5000..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor
node server.js
