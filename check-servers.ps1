# Script para verificar el estado de los servidores
Write-Host "🔍 Verificando estado de los servidores..." -ForegroundColor Cyan
Write-Host ""

# Verificar Backend (Puerto 5000)
Write-Host "Backend (Puerto 5000):" -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if ($backend) {
    Write-Host "  ✅ Backend corriendo" -ForegroundColor Green
    Write-Host "  📍 Proceso ID: $($backend.OwningProcess)" -ForegroundColor Gray
    
    # Probar endpoint
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 3
        Write-Host "  ✅ API respondiendo correctamente" -ForegroundColor Green
        Write-Host "  📦 Status: $($response.status)" -ForegroundColor Gray
    } catch {
        Write-Host "  ⚠️  Backend corriendo pero no responde" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Backend NO está corriendo" -ForegroundColor Red
    Write-Host "  💡 Ejecuta: cd backend; node server.js" -ForegroundColor Cyan
}

Write-Host ""

# Verificar Frontend (Puerto 3001)
Write-Host "Frontend (Puerto 3001):" -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue

if ($frontend) {
    Write-Host "  ✅ Frontend corriendo" -ForegroundColor Green
    Write-Host "  📍 Proceso ID: $($frontend.OwningProcess)" -ForegroundColor Gray
    Write-Host "  🌐 URL: http://localhost:3001" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ Frontend NO está corriendo" -ForegroundColor Red
    Write-Host "  💡 Ejecuta: cd frontend; npm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Resumen
if ($backend -and $frontend) {
    Write-Host "✅ Sistema completamente operativo" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Accede a: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📚 API: http://localhost:5000/api/health" -ForegroundColor Cyan
} elseif ($backend) {
    Write-Host "⚠️  Solo el backend está corriendo" -ForegroundColor Yellow
    Write-Host "Inicia el frontend para usar la aplicación completa" -ForegroundColor Yellow
} elseif ($frontend) {
    Write-Host "⚠️  Solo el frontend está corriendo" -ForegroundColor Yellow
    Write-Host "⚠️  El frontend NO podrá conectarse a la API sin el backend" -ForegroundColor Red
} else {
    Write-Host "❌ Ningún servidor está corriendo" -ForegroundColor Red
}

Write-Host ""
