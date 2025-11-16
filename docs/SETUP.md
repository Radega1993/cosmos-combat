# 🛠️ Guía de Configuración - Cosmos Combat

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- **npm** o **yarn** (viene con Node.js)
- **Docker** y **Docker Compose** ([Descargar Docker](https://www.docker.com/get-started))
- **Git** ([Descargar](https://git-scm.com/))

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <repo-url>
cd cosmos-combat
```

### 2. Configurar MongoDB con Docker

```bash
# Iniciar MongoDB
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs (opcional)
docker-compose logs -f mongodb
```

MongoDB estará disponible en:
- **Host**: localhost
- **Puerto**: 27019 (mapeado desde 27017 del contenedor)
- **Usuario**: admin
- **Contraseña**: admin123
- **Base de datos**: cosmos-combat

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env si es necesario (por defecto funciona con Docker Compose)
```

El archivo `.env` debería contener:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin
CORS_ORIGIN=http://localhost:3000
```

**Nota**: El puerto 27019 es el puerto mapeado en `docker-compose.yml`. Si cambias el puerto en docker-compose, actualiza esta URI.

### 4. Seed de Base de Datos

```bash
# Desde la carpeta backend
npm run seed
```

Esto creará:
- ✅ 6 personajes (Ironclad, Blaze, Frost, Thunder, Shadow, Strike)
- ✅ Cartas básicas
- ✅ Habilidades iniciales
- ✅ Configuración de balance v1.0.0

### 5. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env
```

El archivo `.env` debería contener:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## ▶️ Ejecutar el Proyecto

### Opción 1: Terminales Separadas (Recomendado)

**Terminal 1 - MongoDB**
```bash
# Ya está corriendo con Docker Compose
# Verificar: docker-compose ps
```

**Terminal 2 - Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
```

### Opción 2: Scripts NPM (Futuro)

Se pueden crear scripts para ejecutar todo junto, pero por ahora usa terminales separadas.

## ✅ Verificar que Todo Funciona

1. **MongoDB**: 
   ```bash
   docker-compose ps
   # Debe mostrar "Up" en estado
   ```

2. **Backend**: 
   - Abre http://localhost:3001/health
   - Debe responder: `{"status":"ok",...}`

3. **Frontend**: 
   - Abre http://localhost:3000
   - Debe mostrar la página de lobby

4. **WebSocket**:
   - Abre la consola del navegador
   - Debe mostrar: "✅ Connected to server"

## 🐛 Solución de Problemas

### MongoDB no inicia

```bash
# Ver logs
docker-compose logs mongodb

# Reiniciar
docker-compose restart mongodb

# Si persiste, eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d
```

### Backend no conecta a MongoDB

1. Verifica que MongoDB esté corriendo: `docker-compose ps`
2. Verifica la URI en `.env` (debe usar puerto 27019)
3. Prueba conectarte manualmente:
   ```bash
   mongosh "mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin"
   ```

### Frontend no conecta al backend

1. Verifica que el backend esté corriendo en puerto 3001
2. Verifica las variables de entorno en `frontend/.env`
3. Revisa la consola del navegador para errores de CORS

### Puerto ya en uso

```bash
# Cambiar puerto en .env o matar proceso
# Backend (puerto 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (puerto 3000)
lsof -ti:3000 | xargs kill -9
```

## 📁 Estructura de Archivos Importantes

```
cosmos-combat/
├── docker-compose.yml          # Configuración de MongoDB
├── backend/
│   ├── .env                    # Variables de entorno backend
│   ├── src/
│   │   ├── main.ts            # Punto de entrada
│   │   ├── app.module.ts      # Módulo principal
│   │   ├── database/          # Schemas MongoDB
│   │   ├── lobby/             # Sistema de lobby
│   │   └── gateway/           # WebSocket Gateway
│   └── package.json
├── frontend/
│   ├── .env                   # Variables de entorno frontend
│   ├── src/
│   │   ├── main.tsx           # Punto de entrada
│   │   ├── pages/             # Páginas React
│   │   ├── services/          # Servicios (WebSocket)
│   │   └── store/             # Estado global (Zustand)
│   └── package.json
└── docs/                      # Documentación
```

## 🔄 Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Seed base de datos
npm run seed

# Tests
npm test
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Iniciar MongoDB
docker-compose up -d

# Detener MongoDB
docker-compose down

# Ver logs
docker-compose logs -f mongodb

# Reiniciar
docker-compose restart mongodb

# Eliminar todo (incluyendo datos)
docker-compose down -v
```

## 📝 Próximos Pasos

Una vez que todo esté funcionando:

1. ✅ Verifica que puedes crear una partida
2. ✅ Verifica que puedes unirte a una partida
3. ✅ Revisa la consola del navegador para ver eventos WebSocket
4. ✅ Revisa MongoDB Compass o mongo shell para ver los datos

## 🔗 Enlaces Útiles

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health
- **MongoDB Compass**: Usa la URI del .env para conectarte

---

**¿Problemas?** Revisa los logs o crea un issue en el repositorio.

