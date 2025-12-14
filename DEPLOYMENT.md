# Guía de Deployment al VPS

## Paso 1: Preparar el proyecto localmente

Ejecuta el script de PowerShell:
```powershell
cd D:\Program\actualizacionWeb
.\deploy-to-vps.ps1
```

Esto creará un archivo .zip con tu proyecto (sin node_modules).

## Paso 2: Transferir al VPS

### Opción A: Usando SCP (desde PowerShell)
```powershell
scp "D:\actualizacionWeb_FECHA.zip" usuario@TU_VPS_IP:/home/usuario/
```

### Opción B: Usando FileZilla/WinSCP
1. Conecta con FileZilla a tu VPS
2. Arrastra el archivo .zip a /home/usuario/

## Paso 3: En el VPS (SSH)

```bash
# Conectarse al VPS
ssh usuario@TU_VPS_IP

# Crear directorio y descomprimir
sudo mkdir -p /var/www/actualizacionWeb
sudo unzip ~/actualizacionWeb_*.zip -d /var/www/actualizacionWeb
cd /var/www/actualizacionWeb
sudo chown -R $USER:$USER /var/www/actualizacionWeb

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node -v
npm -v

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

## Paso 4: Configurar variables de entorno

```bash
cd /var/www/actualizacionWeb/backend
cp .env.example .env
nano .env
```

Edita el archivo .env con tus datos reales:
- DB_PASSWORD
- JWT_SECRET
- Otros datos sensibles

## Paso 5: Instalar dependencias y construir

```bash
# Backend
cd /var/www/actualizacionWeb/backend
npm install --production

# Frontend
cd /var/www/actualizacionWeb/frontend
npm install
npm run build
```

## Paso 6: Iniciar con PM2

```bash
cd /var/www/actualizacionWeb/backend
pm2 start server.js --name "rifas-backend" --watch
pm2 save
pm2 startup
```

Copia y ejecuta el comando que PM2 te muestra.

## Paso 7: Configurar Nginx (servidor web)

```bash
sudo apt-get install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/rifas
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name TU_DOMINIO.com;

    # Frontend estático
    location / {
        root /var/www/actualizacionWeb/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/rifas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Paso 8: Firewall (si es necesario)

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Paso 9: SSL con Let's Encrypt (HTTPS)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d TU_DOMINIO.com
```

## Comandos útiles PM2

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs rifas-backend

# Reiniciar
pm2 restart rifas-backend

# Detener
pm2 stop rifas-backend

# Eliminar
pm2 delete rifas-backend

# Ver uso de recursos
pm2 monit
```

## Actualizar el proyecto

Cuando hagas cambios:

```bash
# Detener PM2
pm2 stop rifas-backend

# Actualizar archivos (sube el nuevo .zip y descomprime)
cd /var/www/actualizacionWeb

# Reinstalar dependencias si es necesario
cd backend && npm install
cd ../frontend && npm install && npm run build

# Reiniciar
cd ../backend
pm2 restart rifas-backend
```

## Backup de la base de datos

```bash
# Crear backup
mysqldump -h 167.88.36.159 -u rifaspara_admin -p rifaparatodos > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -h 167.88.36.159 -u rifaspara_admin -p rifaparatodos < backup_20250114.sql
```

## Troubleshooting

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Reiniciar servicios
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Verificar puertos
```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
```
