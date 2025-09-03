# 🐳 Docker - Entorno de Desarrollo SVT

Este directorio contiene la configuración Docker para el entorno de desarrollo de **Stock Vision Technology (SVT)**.

## 🚀 Servicios Disponibles

### 1. **PostgreSQL Database** 🐘
- **Contenedor:** `svt-postgres`
- **Puerto:** `5432`
- **Base de datos:** `svt_database`
- **Usuario:** `svt_user`
- **Contraseña:** `svt_password`
- **Imagen:** `postgres:15`

### 2. **pgAdmin** 🗄️
- **Contenedor:** `svt-pgadmin`
- **Puerto:** `5050`
- **URL:** `http://localhost:5050`
- **Email:** `admin@svt.com`
- **Contraseña:** `admin123`
- **Imagen:** `dpage/pgadmin4`

## 📋 Flujo de Trabajo Diario

### **🌅 Iniciar el Entorno de Desarrollo**
```bash
# Navegar al directorio Docker
cd Docker

# Levantar todos los servicios en segundo plano
docker-compose up -d

# Verificar que estén corriendo correctamente
docker ps
```

### **🔄 Durante el Desarrollo**
- **Base de datos:** Siempre disponible en `localhost:5432`
- **pgAdmin:** Accesible en `http://localhost:5050`
- **Tu aplicación:** Se conecta automáticamente usando la URL del `.env`

### **🌙 Al Terminar el Día de Trabajo**
```bash
# Opción 1: Pausar servicios (mantiene datos, más rápido)
docker-compose pause

# Opción 2: Detener servicios (mantiene datos, recomendado)
docker-compose stop

# Opción 3: Apagar completamente (mantiene datos)
docker-compose down
```

### **🌅 Al Volver a Trabajar**
```bash
# Si usaste pause
docker-compose unpause

# Si usaste stop o down
docker-compose up -d
```

## 🛠️ Comandos Útiles

### **📊 Monitoreo de Estado**
```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores (activos e inactivos)
docker ps -a

# Ver con formato personalizado
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f svt-postgres
docker-compose logs -f svt-pgadmin
```

### **⚙️ Gestión de Servicios**
```bash
# Reiniciar un servicio específico
docker-compose restart svt-postgres
docker-compose restart svt-pgadmin

# Reiniciar todos los servicios
docker-compose restart

# Ver estadísticas de uso de recursos
docker stats

# Limpiar contenedores no utilizados
docker system prune
```

### **🔧 Mantenimiento**
```bash
# Reconstruir servicios (si cambias docker-compose.yml)
docker-compose up -d --build

# Ver información detallada de los servicios
docker-compose ps

# Ver logs de errores
docker-compose logs --tail=100
```

## 📊 Estados de los Contenedores

| Estado | Descripción | Acción Recomendada |
|--------|-------------|-------------------|
| **`Up`** | Funcionando correctamente | ✅ Todo bien, continuar |
| **`Exited`** | Detenido pero datos preservados | 🔄 Ejecutar `docker-compose up -d` |
| **`Paused`** | Pausado temporalmente | ▶️ Ejecutar `docker-compose unpause` |
| **`Restarting`** | Reiniciándose automáticamente | ⏳ Esperar o revisar logs |
| **`Error`** | Error en el servicio | 🚨 Revisar logs y reiniciar |

## 💾 Gestión de Datos

### **Persistencia de Datos**
- **Los datos se mantienen** entre reinicios gracias a volúmenes Docker
- **Volumen:** `postgres_data` - Almacena toda la base de datos
- **Solo se pierden** si ejecutas `docker-compose down -v` (elimina volúmenes)

### **Backup y Restauración**
```bash
# Crear backup de la base de datos
docker exec svt-postgres pg_dump -U svt_user svt_database > backup.sql

# Restaurar desde backup
docker exec -i svt-postgres psql -U svt_user svt_database < backup.sql
```

## 🚨 Solución de Problemas

### **Si la Base de Datos No Responde**
```bash
# Verificar estado
docker ps

# Revisar logs
docker-compose logs svt-postgres

# Reiniciar servicio
docker-compose restart svt-postgres

# Ejecutar
uvicorn main:app --reload

```

### **Si pgAdmin No Carga**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep svt-postgres

# Reiniciar pgAdmin
docker-compose restart svt-pgadmin

# Ver logs de pgAdmin
docker-compose logs svt-pgadmin
```

### **Si Hay Conflictos de Puerto**
```bash
# Ver qué está usando el puerto
sudo lsof -i :5432
sudo lsof -i :5050

# Detener servicios y cambiar puertos en docker-compose.yml
docker-compose down
```

## 🔐 Configuración de Seguridad

### **Variables de Entorno**
- **PostgreSQL:** Configurado en `docker-compose.yml`
- **pgAdmin:** Credenciales por defecto (cambiar en producción)
- **Red:** Aislada en `svt-network`

### **Recomendaciones para Producción**
- Cambiar contraseñas por defecto
- Usar variables de entorno para credenciales
- Configurar SSL/TLS
- Implementar backup automático

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [pgAdmin Docker Image](https://hub.docker.com/r/dpage/pgadmin4)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🎯 Flujo Recomendado para tu Proyecto

### **Mañana:**
```bash
cd Docker
docker-compose up -d
docker ps  # Verificar que todo esté bien
```

### **Durante el día:**
- Desarrollar tu aplicación
- Usar pgAdmin si necesitas ver/modificar la base de datos
- Los datos se mantienen entre sesiones

### **Noche:**
```bash
docker-compose stop  # Detener servicios
# Los datos se mantienen en volúmenes persistentes
```

### **Si algo falla:**
```bash
# Reiniciar todo
docker-compose down
docker-compose up -d

# Ver logs para debuggear
docker-compose logs svt-postgres
```

---

**💡 Tip:** Mantén este README actualizado con cualquier cambio en la configuración o nuevos comandos útiles que descubras.
