# Configuración de pgAdmin para SVT

## 🚀 Inicio Rápido

### Paso 1: Acceder a pgAdmin
- Ve a: **http://localhost:5050**

### Paso 2: Iniciar sesión en pgAdmin
- **Email**: `admin@svt.com`
- **Contraseña**: `admin123`

### Paso 3: Crear un nuevo servidor
1. **Clic derecho** en "Servers" en el panel izquierdo
2. Selecciona **"Create"** → **"Server..."**
3. En la pestaña **"General"**:
   - **Name**: `SVT PostgreSQL` (o el nombre que prefieras)
4. En la pestaña **"Connection"**:
   - **Host name/address**: `svt-postgres` (nombre del contenedor)
   - **Port**: `5432` (puerto interno del contenedor)
   - **Maintenance database**: `svt_database`
   - **Username**: `svt_user`
   - **Password**: `svt_password`
5. **Clic en "Save"**

## 🔐 Credenciales de la Base de Datos

### PostgreSQL
- **Host**: `localhost` (desde fuera del contenedor)
- **Puerto**: `5433` (puerto externo)
- **Base de datos**: `svt_database`
- **Usuario**: `svt_user`
- **Contraseña**: `svt_password`

### URL de conexión completa
```
postgresql://svt_user:svt_password@localhost:5433/svt_database
```

## 🐳 Comandos Docker Útiles

### Iniciar contenedores
```bash
docker-compose up -d
```

### Ver estado de contenedores
```bash
docker-compose ps
```

### Ver logs de PostgreSQL
```bash
docker-compose logs postgres
```

### Detener contenedores
```bash
docker-compose down
```

### Reiniciar contenedores
```bash
docker-compose restart
```

## 🔧 Solución de Problemas

### Error: "Connection refused"
1. Verificar que los contenedores estén ejecutándose:
   ```bash
   docker-compose ps
   ```

2. Si no están ejecutándose, iniciarlos:
   ```bash
   docker-compose up -d
   ```

3. Verificar que el puerto esté abierto:
   ```bash
   ss -tlnp | grep 5433
   ```

### Error: "Port already in use"
Si el puerto 5432 está ocupado, el docker-compose.yml ya está configurado para usar el puerto 5433 externamente.

### Probar conexión directa
```bash
docker exec svt-postgres psql -U svt_user -d svt_database -c "SELECT 'Conexión exitosa' as status;"
```

## 📝 Notas Importantes

- El puerto **5433** es el puerto externo (desde tu máquina host)
- El puerto **5432** es el puerto interno del contenedor
- Para conectar desde pgAdmin, usa el **nombre del contenedor** (`svt-postgres`) como host
- Para conectar desde tu aplicación, usa `localhost:5433`
