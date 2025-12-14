# Script para gestionar el sistema de sesiones
# Uso: .\gestionar-sesiones.ps1 [comando]

param(
    [Parameter(Position=0)]
    [ValidateSet("test", "expirar", "limpiar", "stats", "help")]
    [string]$Comando = "help"
)

$API_URL = "http://localhost:5000/api"

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Obtener token de administrador (debes iniciar sesión primero)
function Get-AdminToken {
    $token = $env:ADMIN_TOKEN
    if (-not $token) {
        Write-Warning "⚠️  Variable ADMIN_TOKEN no encontrada"
        Write-Info "💡 Inicia sesión como administrador y ejecuta:"
        Write-Info "   `$env:ADMIN_TOKEN = 'tu_token_aqui'"
        return $null
    }
    return $token
}

# Mostrar ayuda
function Show-Help {
    Write-Host ""
    Write-Host "🔐 GESTIÓN DEL SISTEMA DE SESIONES" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\gestionar-sesiones.ps1 [comando]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor White
    Write-Host ""
    Write-Host "  test      " -NoNewline -ForegroundColor Green
    Write-Host "- Ejecutar pruebas del sistema de sesiones"
    Write-Host "  expirar   " -NoNewline -ForegroundColor Yellow
    Write-Host "- Expirar sesiones inactivas (>3 horas)"
    Write-Host "  limpiar   " -NoNewline -ForegroundColor Red
    Write-Host "- Limpiar sesiones antiguas (>30 días)"
    Write-Host "  stats     " -NoNewline -ForegroundColor Cyan
    Write-Host "- Ver estadísticas de sesiones activas"
    Write-Host "  help      " -NoNewline -ForegroundColor Magenta
    Write-Host "- Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor White
    Write-Host "  .\gestionar-sesiones.ps1 test" -ForegroundColor Gray
    Write-Host "  .\gestionar-sesiones.ps1 stats" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Nota: Comandos 'expirar', 'limpiar' y 'stats' requieren" -ForegroundColor Yellow
    Write-Host "      token de administrador en variable `$env:ADMIN_TOKEN" -ForegroundColor Yellow
    Write-Host ""
}

# Ejecutar pruebas
function Run-Tests {
    Write-Info "🧪 Ejecutando pruebas del sistema de sesiones..."
    Write-Host ""
    
    Push-Location (Join-Path $PSScriptRoot "..")
    
    try {
        node scripts/test-sesiones.js
        if ($LASTEXITCODE -eq 0) {
            Write-Success "`n✅ Pruebas completadas exitosamente!"
        } else {
            Write-Error "`n❌ Las pruebas fallaron"
        }
    } catch {
        Write-Error "❌ Error al ejecutar pruebas: $_"
    } finally {
        Pop-Location
    }
}

# Expirar sesiones inactivas
function Expire-InactiveSessions {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Info "⏰ Expirando sesiones inactivas (>3 horas)..."
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$API_URL/sesiones/expirar-inactivas" `
                                       -Method Post `
                                       -Headers $headers
        
        if ($response.status -eq "success") {
            $count = $response.data.sesiones_expiradas
            Write-Success "✅ Se expiraron $count sesiones inactivas"
        }
    } catch {
        Write-Error "❌ Error al expirar sesiones: $_"
        Write-Error $_.Exception.Response.StatusCode
    }
}

# Limpiar sesiones antiguas
function Clean-OldSessions {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Warning "🗑️  Limpiando sesiones antiguas (>30 días cerradas)..."
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$API_URL/sesiones/limpiar" `
                                       -Method Delete `
                                       -Headers $headers
        
        if ($response.status -eq "success") {
            $count = $response.data.sesiones_eliminadas
            Write-Success "✅ Se eliminaron $count sesiones antiguas"
        }
    } catch {
        Write-Error "❌ Error al limpiar sesiones: $_"
    }
}

# Ver estadísticas
function Show-Stats {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Info "📊 Obteniendo estadísticas de sesiones activas..."
    Write-Host ""
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$API_URL/sesiones/activas" `
                                       -Method Get `
                                       -Headers $headers
        
        if ($response.status -eq "success") {
            $sesiones = $response.data
            $total = $response.total
            
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host "📊 ESTADÍSTICAS DE SESIONES ACTIVAS" -ForegroundColor Cyan
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host ""
            
            # Total
            Write-Host "Total de sesiones activas: " -NoNewline
            Write-Host $total -ForegroundColor Green
            Write-Host ""
            
            # Por rol
            $porRol = $sesiones | Group-Object -Property rol
            Write-Host "Por rol:" -ForegroundColor Yellow
            foreach ($grupo in $porRol) {
                Write-Host "  - $($grupo.Name): " -NoNewline
                Write-Host $grupo.Count -ForegroundColor Cyan
            }
            Write-Host ""
            
            # Sesiones críticas
            $criticas = $sesiones | Where-Object { $_.minutos_restantes -lt 30 }
            if ($criticas.Count -gt 0) {
                Write-Warning "⚠️  Sesiones críticas (< 30 min): $($criticas.Count)"
                foreach ($s in $criticas) {
                    Write-Host "   - $($s.nombre): $($s.tiempo_restante)" -ForegroundColor Red
                }
                Write-Host ""
            }
            
            # Últimas 5 sesiones
            Write-Host "Últimas 5 sesiones activas:" -ForegroundColor Yellow
            $sesiones | Select-Object -First 5 | ForEach-Object {
                Write-Host "  • $($_.nombre) ($($_.correo))" -ForegroundColor White
                Write-Host "    Rol: $($_.rol) | IP: $($_.ip)" -ForegroundColor Gray
                Write-Host "    Tiempo restante: $($_.tiempo_restante)" -ForegroundColor $(
                    if ($_.minutos_restantes -lt 30) { "Red" }
                    elseif ($_.minutos_restantes -lt 60) { "Yellow" }
                    else { "Green" }
                )
                Write-Host ""
            }
            
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host ""
            Write-Info "💡 Para ver más detalles, visita: http://localhost:3001/admin/sesiones"
        }
    } catch {
        Write-Error "❌ Error al obtener estadísticas: $_"
    }
}

# Ejecutar comando
Write-Host ""
switch ($Comando) {
    "test" { Run-Tests }
    "expirar" { Expire-InactiveSessions }
    "limpiar" { Clean-OldSessions }
    "stats" { Show-Stats }
    "help" { Show-Help }
    default { Show-Help }
}
Write-Host ""
