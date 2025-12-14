# Script para preparar y transferir el proyecto al VPS

Write-Host "=== Preparando proyecto para deployment ===" -ForegroundColor Green

# 1. Crear carpeta temporal
$tempDir = "D:\Program\actualizacionWeb_deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 2. Copiar archivos excluyendo node_modules
Write-Host "Copiando archivos..." -ForegroundColor Yellow
$exclude = @('node_modules', '.git', 'dist', 'build', '*.log')

Copy-Item -Path "D:\Program\actualizacionWeb\*" -Destination $tempDir -Recurse -Exclude $exclude

# 3. Crear archivo .env.example sin datos sensibles
Write-Host "Creando .env.example..." -ForegroundColor Yellow
$envExample = @"
# Database Configuration
DB_HOST=167.88.36.159
DB_USER=rifaspara_admin
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=rifaparatodos
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=TU_JWT_SECRET_AQUI
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_TIMEOUT_MINUTES=180
SESSION_CLEANUP_INTERVAL_MINUTES=5
"@

Set-Content -Path "$tempDir\backend\.env.example" -Value $envExample

# 4. Comprimir
Write-Host "Comprimiendo proyecto..." -ForegroundColor Yellow
$zipFile = "D:\actualizacionWeb_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# 5. Limpiar carpeta temporal
Remove-Item $tempDir -Recurse -Force

Write-Host "`n=== Proyecto preparado ===" -ForegroundColor Green
Write-Host "Archivo: $zipFile" -ForegroundColor Cyan
Write-Host "`nAhora transfiere el archivo al VPS usando:" -ForegroundColor Yellow
Write-Host "scp `"$zipFile`" usuario@TU_VPS_IP:/home/usuario/" -ForegroundColor White

# 6. Mostrar comandos para el VPS
Write-Host "`n=== Comandos para ejecutar en el VPS ===" -ForegroundColor Green
$vpsCommands = @"

# 1. Descomprimir
unzip actualizacionWeb_*.zip -d /var/www/actualizacionWeb
cd /var/www/actualizacionWeb

# 2. Instalar Node.js (si no está instalado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar PM2 globalmente
sudo npm install -g pm2

# 4. Configurar .env
cp backend/.env.example backend/.env
nano backend/.env  # Editar con tus datos reales

# 5. Instalar dependencias backend
cd backend
npm install --production

# 6. Instalar dependencias frontend
cd ../frontend
npm install
npm run build

# 7. Iniciar backend con PM2
cd ../backend
pm2 start server.js --name "rifas-backend"
pm2 save
pm2 startup

# 8. Configurar Nginx (opcional)
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/rifas

# Contenido de nginx:
server {
    listen 80;
    server_name TU_DOMINIO.com;

    # Frontend
    location / {
        root /var/www/actualizacionWeb/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Activar sitio
sudo ln -s /etc/nginx/sites-available/rifas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Ver logs
pm2 logs rifas-backend
"@

Write-Host $vpsCommands -ForegroundColor Cyan
