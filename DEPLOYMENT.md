# Guía de Despliegue SIEME

## Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Servidor con acceso SSH
- Dominio configurado (opcional para SSL)

---

## 1. Variables de Entorno

Crear archivo `.env.production`:

```env
# Base de datos
DATABASE_URL="file:./db/production.db"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Aplicación
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
EMAIL_FROM="SIEME <noreply@tu-dominio.com>"
ADMIN_EMAIL="admin@tu-dominio.com"

# Resend (alternativa a SMTP)
# RESEND_API_KEY="re_xxxxx"
```

### Generar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## 2. Build de Producción

```bash
# Instalar dependencias
npm ci

# Generar cliente Prisma
npx prisma generate

# Crear/migrar base de datos
npx prisma db push

# Build
npm run build
```

---

## 3. Ejecutar en Producción

### Opción A: Node.js directo
```bash
npm start
```

### Opción B: PM2 (recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start npm --name "sieme" -- start

# Guardar configuración
pm2 save
pm2 startup
```

### Opción C: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 4. Configuración SSL/HTTPS

### Con Nginx (recomendado)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Certbot para SSL gratuito
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 5. Backups Automáticos

### Configurar cron job
```bash
# Editar crontab
crontab -e

# Backup cada 6 horas
0 */6 * * * cd /ruta/al/proyecto && npx tsx scripts/backup-db.ts >> /var/log/sieme-backup.log 2>&1
```

---

## 6. Monitoreo

### Logs con PM2
```bash
pm2 logs sieme
pm2 monit
```

### Healthcheck endpoint
```bash
curl https://tu-dominio.com/api
```

---

## 7. Actualizaciones

```bash
# Pull cambios
git pull origin main

# Instalar dependencias nuevas
npm ci

# Actualizar BD si hay cambios
npx prisma db push

# Rebuild
npm run build

# Reiniciar
pm2 restart sieme
```

---

## Checklist Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] NEXTAUTH_SECRET generado y seguro
- [ ] Base de datos migrada
- [ ] SSL configurado
- [ ] Backups automáticos activos
- [ ] PM2 o similar configurado
- [ ] Dominio DNS apuntando al servidor
- [ ] Firewall configurado (puertos 80, 443)
- [ ] WhatsApp número actualizado

---

## Soporte

Para problemas de despliegue, revisar:
1. Logs: `pm2 logs sieme`
2. Build: `npm run build` local para detectar errores
3. Variables de entorno: verificar que estén cargadas
