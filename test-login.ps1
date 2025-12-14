# Script de prueba de login

Write-Host "🧪 PRUEBA DE LOGIN - Sistema RifaParaTodos" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend esté corriendo
Write-Host "1️⃣ Verificando backend..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if (-not $backend) {
    Write-Host "❌ Backend no está corriendo en puerto 5000" -ForegroundColor Red
    Write-Host "   Ejecuta: cd backend; node server.js" -ForegroundColor Cyan
    exit 1
}

Write-Host "   ✅ Backend corriendo" -ForegroundColor Green
Write-Host ""

# Probar endpoint de login con admin@rifas.com
Write-Host "2️⃣ Probando login con admin@rifas.com..." -ForegroundColor Yellow

$body = @{
    email = "admin@rifas.com"
    password = "cualquiera"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
                                   -Method Post `
                                   -Body $body `
                                   -ContentType "application/json"
    
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Respuesta del servidor:" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "👤 Datos del usuario:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.data.usuario.id)" -ForegroundColor Gray
    Write-Host "   Nombre: $($response.data.usuario.nombre) $($response.data.usuario.apellido)" -ForegroundColor Gray
    Write-Host "   Email: $($response.data.usuario.email)" -ForegroundColor Gray
    Write-Host "   🎭 Rol: $($response.data.usuario.rol)" -ForegroundColor Green
    Write-Host "   Saldo: `$$($response.data.usuario.saldo)" -ForegroundColor Gray
    Write-Host ""
    
    # Verificar el rol
    if ($response.data.usuario.rol -eq "administrador") {
        Write-Host "✅ ROL CORRECTO: Debería redirigir a /admin/dashboard" -ForegroundColor Green
    } else {
        Write-Host "❌ ROL INCORRECTO: Se esperaba 'administrador', se obtuvo '$($response.data.usuario.rol)'" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ❌ Error al hacer login" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Probar con admin@rifaparatodos.com
Write-Host "3️⃣ Probando login con admin@rifaparatodos.com..." -ForegroundColor Yellow

$body2 = @{
    email = "admin@rifaparatodos.com"
    password = "cualquiera"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
                                    -Method Post `
                                    -Body $body2 `
                                    -ContentType "application/json"
    
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host ""
    Write-Host "👤 Datos del usuario:" -ForegroundColor Cyan
    Write-Host "   Email: $($response2.data.usuario.email)" -ForegroundColor Gray
    Write-Host "   🎭 Rol: $($response2.data.usuario.rol)" -ForegroundColor Green
    Write-Host ""
    
    if ($response2.data.usuario.rol -eq "administrador") {
        Write-Host "✅ ROL CORRECTO: Debería redirigir a /admin/dashboard" -ForegroundColor Green
    }
    
} catch {
    Write-Host "   ❌ Error al hacer login" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Pruebas completadas" -ForegroundColor Green
Write-Host ""
Write-Host "📝 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "1. Abre el navegador en: http://localhost:3001/login" -ForegroundColor White
Write-Host "2. Usa: admin@rifas.com (cualquier contraseña)" -ForegroundColor White
Write-Host "3. Abre la consola del navegador (F12) para ver los logs" -ForegroundColor White
Write-Host "4. Deberías ver la redirección a /admin/dashboard" -ForegroundColor White
Write-Host ""
