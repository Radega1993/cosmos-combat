# 🚀 Cosmos Combat - Prototipo Digital

## 📋 Descripción del Proyecto

**Cosmos Combat** es un juego de cartas estratégico por turnos que está siendo digitalizado para permitir testeo rápido y balanceo eficiente. Este prototipo online permitirá validar y ajustar las reglas del juego antes de la producción física.

### 🎯 Objetivo del Prototipo

Este no es un juego completo con animaciones ni gráficos de alto nivel. Es un **"motor de reglas" + interfaz mínima** diseñado para:

- ✅ Permitir testeo rápido con 2-6 jugadores
- ✅ Visualizar cartas y personajes
- ✅ Ejecutar habilidades y efectos
- ✅ Ajustar valores desde un panel de control
- ✅ Guardar estadísticas automáticas para balanceo

## 🛠️ Stack Tecnológico

### Frontend
- **React + TypeScript** - Framework principal
- **Vite** - Build tool
- **Zustand** - Estado global
- **Socket.io Client** - Comunicación en tiempo real
- **React Router** - Navegación

### Backend
- **NestJS** - Framework backend
- **WebSockets Gateway** - Comunicación en tiempo real
- **MongoDB** - Base de datos principal para:
  - Configuraciones editables (personajes, cartas, balance)
  - Persistencia de todas las partidas
  - Estadísticas y analytics para balanceo
  - Historial de versiones de balance
- **Mongoose** - ODM para MongoDB

### Infraestructura
- **Docker Compose** - MongoDB para desarrollo
- **Railway / Render / Vercel** - Deployment (futuro)
- **Autenticación mínima** - UUID por sesión (sin login real para testeo)

## 📦 Estructura del Proyecto

```
cosmos-combat/
├── frontend/          # Aplicación React + TypeScript
├── backend/           # API NestJS + WebSockets
├── shared/            # Tipos y utilidades compartidas
├── docs/              # Documentación del proyecto
├── data/              # Archivos JSON de ejemplo
├── deck_img/          # Imágenes de cartas y personajes
└── docker-compose.yml # Configuración de MongoDB
```

## 🚦 Estado del Proyecto

### ✅ FASE 1: COMPLETADA
- [x] Configurar estructura del proyecto
- [x] Setup de NestJS backend
- [x] Setup de React frontend
- [x] Configurar WebSockets
- [x] Implementar sistema de lobby
- [x] Crear/Unirse a partidas
- [x] Docker Compose para MongoDB
- [x] Schemas de MongoDB con Mongoose
- [x] Seed inicial de datos
- [x] Sistema de selección de personajes
- [x] Sistema de cartas básico
- [x] Reparto de cartas
- [x] Visualización de mano
- [x] Sistema de turnos completo
- [x] Acciones básicas (2 por turno)
- [x] Ataque y defensa básicos
- [x] Robo de cartas
- [x] Sistema de puntos de vida
- [x] Persistencia de partidas en MongoDB
- [x] **Dos modos de partida**: Aleatorio (predeterminado) y Selección
- [x] **Página "Cómo se juega"** con guía completa
- [x] **Diseño responsive** optimizado para móvil y desktop
- [x] **Temática espacial** con estilos modernos

### ✅ FASE 2: COMPLETADA
- [x] Sistema modular de habilidades
- [x] Efectos de estado (Quemadura, Parálisis, Congelación)
- [x] Efectos defensivos (Escudos, Contraataques)
- [x] Ataques especiales (área, múltiples objetivos, tiradas de dado)
- [x] Sistema de autenticación JWT con roles
- [x] Panel de administración básico

### ✅ FASE 3: COMPLETADA
- [x] Panel de balanceo completo con dashboard
- [x] Gestión completa de personajes, cartas y habilidades
- [x] Ajustes de balance general del juego
- [x] Sistema de presets (guardar, cargar, comparar configuraciones)
- [x] Selección de imágenes para cartas y personajes
- [x] Formularios de edición completos con validación

### ✅ FASE 4: COMPLETADA
- [x] Sistema de métricas y analytics (Backend)
- [x] Dashboard de estadísticas (Frontend)
- [x] Análisis de partidas
- [x] Recolección de datos expandida
- [x] Cálculo de métricas (win rates, uso de cartas, duraciones, jugadores)
- [x] Exportación de datos (JSON/CSV)
- [x] Visualización con gráficos de barras
- [x] Filtros por versión de balance y fechas

## ⏱️ Timeline Estimado

| Fase | Duración | Estado |
|------|----------|--------|
| FASE 1 | 7 días | ✅ Completada |
| FASE 2 | 10 días | ✅ Completada |
| FASE 3 | 3 días | ✅ Completada |
| FASE 4 | 5 días | ✅ Completada |
| **TOTAL** | **25 días** | |

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Docker y Docker Compose (para MongoDB)
- **MongoDB** (requerido) - Se ejecuta con Docker Compose

### Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd cosmos-combat

# 2. Iniciar MongoDB con Docker Compose
docker-compose up -d

# 3. Instalar dependencias backend
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno

# 4. Seed inicial de la base de datos
npm run seed

# 5. Instalar dependencias frontend
cd ../frontend
npm install
cp .env.example .env  # Configurar variables de entorno
```

### Desarrollo

Abre 3 terminales:

**Terminal 1 - MongoDB (ya corriendo con Docker)**
```bash
# Verificar que MongoDB está corriendo
docker-compose ps
```

**Terminal 2 - Backend (puerto 3001)**
```bash
cd backend
npm run start:dev
```

**Terminal 3 - Frontend (puerto 3000)**
```bash
cd frontend
npm run dev
```

### Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health
- **WebSocket**: ws://localhost:3001
- **MongoDB**: mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin

## 📝 Notas de Desarrollo

- **MongoDB es esencial**: Toda la información se guarda en MongoDB para:
  - Modificar datos dinámicamente (balance, cartas, personajes)
  - Guardar todas las partidas para análisis
  - Generar estadísticas automáticas para balanceo
  - Mantener historial de versiones de balance
- Los valores del juego deben ser editables desde MongoDB (no JSON estático)
- El sistema de efectos debe ser modular, no hard-coded
- **Dos modos de partida disponibles**:
  - **Modo Aleatorio** (predeterminado): Los personajes se asignan automáticamente al iniciar
  - **Modo Selección**: Los jugadores eligen sus personajes antes de iniciar
- **Diseño responsive**: Optimizado para móvil y desktop
- **Temática espacial**: Estilos modernos con gradientes y efectos visuales
- Las métricas son críticas para el balanceo final
- Ver [Schemas de MongoDB](./docs/MONGODB_SCHEMAS.md) para la estructura completa

## 📚 Documentación

- [Guía de Configuración](./docs/SETUP.md) - Instrucciones detalladas de setup
- [Fases de Desarrollo](./docs/DEVELOPMENT_PHASES.md) - Detalle de todas las fases
- [Schemas de MongoDB](./docs/MONGODB_SCHEMAS.md) - Estructura de base de datos
- [Especificaciones Técnicas](./docs/TECHNICAL_SPECS.md) - Arquitectura del sistema
- [Roadmap](./docs/ROADMAP.md) - Timeline del proyecto

## 📄 Licencia

[Definir licencia según necesidades]

## 👥 Contribuidores

[Equipo de desarrollo]

---

**Estado del Proyecto**: ✅ TODAS LAS FASES COMPLETADAS - Prototipo Funcional Completo

### 🎉 Proyecto Completado

El prototipo digital de **Cosmos Combat** está completamente funcional con todas las fases implementadas:

- ✅ **FASE 1**: MVP Funcional - Sistema de juego completo
- ✅ **FASE 2**: Habilidades y Efectos - Sistema modular completo
- ✅ **FASE 3**: Panel de Balanceo - Gestión completa de configuraciones
- ✅ **FASE 4**: Métricas y Analytics - Sistema completo de estadísticas

**Características principales:**
- 🎮 Sistema de juego completo con 2 modos (Aleatorio/Selección)
- ⚡ Sistema modular de habilidades y efectos
- ⚖️ Panel de balanceo con presets
- 📊 Dashboard de analytics con visualizaciones
- 📱 Diseño 100% responsive
- 🎨 Temática espacial moderna
