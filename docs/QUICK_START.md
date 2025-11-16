# 🚀 Guía de Inicio Rápido - Cosmos Combat

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Git**
- **MongoDB** (requerido) - Para almacenar configuraciones, partidas y estadísticas

## 🏗️ Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas principales:

```
cosmos-combat/
├── frontend/          # Aplicación React
├── backend/           # API NestJS
├── shared/            # Código compartido
├── docs/              # Documentación
└── data/              # Configuraciones JSON
```

## ⚡ Inicio Rápido

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone <repo-url>
cd cosmos-combat

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 2. Configurar Variables de Entorno

#### Backend (.env)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cosmos-combat
CORS_ORIGIN=http://localhost:3000
```

**Importante**: Asegúrate de que MongoDB esté corriendo antes de iniciar el backend.

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Iniciar Servidores

#### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 🎮 Primera Partida

1. Abre `http://localhost:3000` en tu navegador
2. Crea una nueva partida o únete a una existente
3. Selecciona tu personaje
4. ¡Comienza a jugar!

## 📁 Configuración en MongoDB

Toda la configuración se almacena en MongoDB. Puedes modificar los datos directamente desde:

1. **Panel de Administración** (cuando esté implementado)
2. **MongoDB Compass** - Interfaz gráfica
3. **mongo shell** - Línea de comandos
4. **API REST** - Para modificaciones programáticas

### Ejemplo de Modificación Rápida

Para cambiar el HP de un personaje desde MongoDB:

```javascript
// En mongo shell o MongoDB Compass
use cosmos-combat
db.characters.updateOne(
  { id: "warrior" },
  { $set: { maxHp: 120 } }
)
```

Los cambios se aplicarán inmediatamente en las próximas partidas.

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 🗄️ Configuración de MongoDB

### Inicializar Base de Datos

1. Asegúrate de que MongoDB esté corriendo
2. Ejecuta el script de seed para cargar datos iniciales:

```bash
cd backend
npm run seed
```

Esto creará:
- Personajes iniciales
- Cartas básicas
- Habilidades
- Configuración de balance inicial

### Ver Datos

Puedes usar MongoDB Compass o mongo shell para ver los datos:

```bash
mongosh cosmos-combat
> show collections
> db.characters.find()
> db.games.find()
```

## 🐛 Solución de Problemas

### Error: Puerto en uso

```bash
# Cambiar puerto en .env o matar proceso
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Error: MongoDB no conectado

1. Verifica que MongoDB esté corriendo:
   ```bash
   # Linux/Mac
   sudo systemctl status mongod
   # o
   brew services list | grep mongodb
   
   # Windows
   # Verifica en Services
   ```

2. Verifica la URI de conexión en `.env`
3. Asegúrate de que MongoDB esté escuchando en el puerto correcto (27017 por defecto)

### Error: WebSocket no conecta

Verifica que:
- El backend esté corriendo
- La URL de WebSocket en frontend sea correcta
- No haya problemas de CORS

## 📚 Documentación Adicional

- [Fases de Desarrollo](./DEVELOPMENT_PHASES.md)
- [Especificaciones Técnicas](./TECHNICAL_SPECS.md)
- [Reglas del Juego](./GAME_RULES.md)

## 🎯 Próximos Pasos

1. ✅ Configurar el proyecto
2. ⏳ Implementar FASE 1 (MVP Funcional)
3. ⏳ Implementar FASE 2 (Habilidades y Efectos)
4. ⏳ Implementar FASE 3 (Panel de Balanceo)
5. ⏳ Implementar FASE 4 (Métricas y Analytics)

## 💡 Tips de Desarrollo

- **Modularidad**: Mantén todo configurable desde JSON
- **Testing**: Prueba cada funcionalidad antes de continuar
- **Commits**: Haz commits frecuentes y descriptivos
- **Documentación**: Actualiza la documentación mientras desarrollas

---

**¿Problemas?** Revisa la documentación o crea un issue en el repositorio.

