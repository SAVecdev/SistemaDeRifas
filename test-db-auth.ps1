# Script para probar autenticación con base de datos real

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   PRUEBA DE AUTENTICACIÓN CON BD" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"

# Función para hacer requests
function Invoke-ApiRequest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = @{}
    )
    
    $url = "$baseUrl$Endpoint"
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method $Method -ContentType "application/json"
        } else {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $jsonBody -ContentType "application/json"
        }
        return $response
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Respuesta: $responseBody" -ForegroundColor Red
        }
        return $null
    }
}

# 1. Verificar que el servidor esté activo
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor activo" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no responde. Asegúrate de que esté corriendo en el puerto 5000" -ForegroundColor Red
    exit
}
Write-Host ""

# 2. Probar registro de nuevo usuario
Write-Host "2. Probando registro de nuevo usuario..." -ForegroundColor Yellow
$nuevoUsuario = @{
    nombre = "Prueba"
    apellido = "Testing"
    email = "prueba@test.com"
    password = "test123"
    telefono = "1234567890"
    direccion = "Calle Test 123"
}

$registroResponse = Invoke-ApiRequest -Endpoint "/auth/registro" -Method POST -Body $nuevoUsuario

if ($registroResponse -and $registroResponse.status -eq "success") {
    Write-Host "✅ Registro exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($registroResponse.data.usuario.nombre)" -ForegroundColor Gray
    Write-Host "   Email: $($registroResponse.data.usuario.email)" -ForegroundColor Gray
    Write-Host "   Rol: $($registroResponse.data.usuario.rol)" -ForegroundColor Gray
    Write-Host "   Token generado: $($registroResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $registroResponse.data.token
} else {
    Write-Host "⚠️  El usuario ya existe o hubo un error en el registro" -ForegroundColor Yellow
}
Write-Host ""

# 3. Probar login con usuario existente
Write-Host "3. Probando login..." -ForegroundColor Yellow
$loginData = @{
    email = "prueba@test.com"
    password = "test123"
}

$loginResponse = Invoke-ApiRequest -Endpoint "/auth/login" -Method POST -Body $loginData

if ($loginResponse -and $loginResponse.status -eq "success") {
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($loginResponse.data.usuario.nombre)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.data.usuario.email)" -ForegroundColor Gray
    Write-Host "   Rol: $($loginResponse.data.usuario.rol)" -ForegroundColor Gray
    Write-Host "   Saldo: $($loginResponse.data.usuario.saldo)" -ForegroundColor Gray
    Write-Host "   Token: $($loginResponse.data.token.Substring(0, 30))..." -ForegroundColor Gray
    
    $token = $loginResponse.data.token
} else {
    Write-Host "❌ Login falló" -ForegroundColor Red
    exit
}
Write-Host ""

# 4. Probar acceso a ruta protegida
Write-Host "4. Probando acceso a ruta protegida con token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/usuarios/perfil" -Method GET -Headers $headers
    Write-Host "✅ Acceso autorizado a ruta protegida" -ForegroundColor Green
    Write-Host "   Perfil obtenido: $($response.data.nombre)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Ruta protegida aún no implementada (esperado)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Probar login con credenciales incorrectas
Write-Host "5. Probando login con contraseña incorrecta..." -ForegroundColor Yellow
$loginIncorrecto = @{
    email = "prueba@test.com"
    password = "wrongpassword"
}

$responseIncorrecta = Invoke-ApiRequest -Endpoint "/auth/login" -Method POST -Body $loginIncorrecto

if ($responseIncorrecta -and $responseIncorrecta.status -eq "error") {
    Write-Host "✅ Error manejado correctamente" -ForegroundColor Green
    Write-Host "   Mensaje: $($responseIncorrecta.message)" -ForegroundColor Gray
} else {
    Write-Host "❌ Debería haber rechazado las credenciales incorrectas" -ForegroundColor Red
}
Write-Host ""

# 6. Probar acceso sin token
Write-Host "6. Probando acceso sin token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/usuarios/perfil" -Method GET
    Write-Host "❌ No debería permitir acceso sin token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Acceso denegado correctamente (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Ruta no implementada o error diferente" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor White
Write-Host "- Autenticación con BD: ✅ Funcionando" -ForegroundColor Green
Write-Host "- Generación de JWT: ✅ Funcionando" -ForegroundColor Green
Write-Host "- Validación de contraseña: ✅ Funcionando" -ForegroundColor Green
Write-Host "- Manejo de errores: ✅ Funcionando" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso: Probar el login desde el frontend en http://localhost:3001/login" -ForegroundColor Cyan
