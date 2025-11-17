# 📊 Estado Actual del Proyecto - Cosmos Combat

**Última actualización**: Diciembre 2024 (FASE 4 - Completada al 100%)

---

## ✅ Completado

### Día 1-2: Setup y Lobby ✅
- [x] Configurar estructura del proyecto
- [x] Setup de NestJS backend
- [x] Setup de React frontend
- [x] Configurar WebSockets (Socket.io)
- [x] Implementar sistema de lobby
- [x] Crear/Unirse a partidas
- [x] Docker Compose para MongoDB
- [x] Schemas de MongoDB con Mongoose
- [x] Seed inicial de datos (personajes, cartas, balance)

### Día 3-4: Sistema de Juego Base (Parcial) ✅
- [x] Implementar selección de personajes (carga desde MongoDB)
- [x] Sistema de cartas básico
- [x] Reparto de cartas iniciales
- [x] Visualización de mano del jugador
- [x] Mazo personalizado por personaje
- [x] Inicio de partida con reparto de cartas
- [x] API REST para personajes y cartas
- [x] Endpoint batch para cargar múltiples cartas

---

## ✅ FASE 2: Habilidades y Efectos (En Progreso)

### Día 8-9: Sistema Modular de Habilidades ✅ COMPLETADO
- [x] **SkillsService creado**
  - [x] Carga de habilidades desde MongoDB
  - [x] Métodos: findAll(), findOne(), findByIds(), findByCharacter()
  - [x] SkillsController con endpoints REST
  - [x] SkillsModule integrado en GameModule

- [x] **Sistema de ejecución de habilidades**
  - [x] GameService.useSkill() implementado
  - [x] Validación de condiciones (turno, acciones, cooldown, personaje)
  - [x] Aplicación de efectos (daño, curación, escudo, estados)
  - [x] Reducción automática de cooldowns al final del turno
  - [x] Integración con analytics

- [x] **Frontend - UI de habilidades**
  - [x] SkillsList component creado
  - [x] Visualización de habilidades disponibles
  - [x] Indicadores de cooldown
  - [x] Selección de objetivos
  - [x] Integración en GamePage
  - [x] Carga automática por personaje

- [x] **WebSocket Gateway**
  - [x] Endpoint 'game:use-skill' implementado
  - [x] Eventos de acción y finalización de partida

### Día 10-11: Efectos de Estado ✅ COMPLETADO
- [x] **EffectsService creado**
  - [x] Sistema genérico y modular de efectos
  - [x] Aplicación al inicio de turno
  - [x] Verificación de inmunidades
  - [x] Sistema de curación con tirada de dado

- [x] **Efectos implementados**
  - [x] Quemadura: Descarte de carta al inicio de turno
  - [x] Parálisis: Reducción de 1 acción (curable con tirada de 6)
  - [x] Congelación: Reducción de 1 acción (curable con tirada de 6)

- [x] **Sistema de duración**
  - [x] Reducción automática al final de turno
  - [x] Eliminación automática de efectos expirados
  - [x] Procesamiento en processEffectDurations()

- [x] **Frontend - Visualización de efectos**
  - [x] Iconos y colores específicos por tipo
  - [x] Tooltips con descripciones
  - [x] Muestra duración restante
  - [x] Diseño responsive

### Día 12-13: Efectos Defensivos ✅ COMPLETADO
- [x] **Sistema de Escudos mejorado**
  - [x] Absorción de daño antes de afectar HP
  - [x] Escudos se consumen al absorber daño
  - [x] Visualización mejorada en UI
  - [x] Tooltips informativos

- [x] **Sistema de Contraataques**
  - [x] Reflejo de daño al atacante
  - [x] Soporte para porcentajes (50%, 100%)
  - [x] Tirada de dado para activación (opcional)
  - [x] Mínimo 1 de daño reflejado
  - [x] Integración completa en applyDamage()
  - [x] Registro en analytics
  - [x] Visualización en UI

- [x] **Integración con combate**
  - [x] Escudos aplicados antes de daño a HP
  - [x] Contraataques se activan automáticamente
  - [x] Funciona con ataques, cartas y habilidades
  - [x] Previene loops infinitos de contraataques

### Día 14-15: Ataques Especiales ✅ COMPLETADO
- [x] **Sistema de Objetivos Múltiples**
  - [x] Método `getValidTargets()` para obtener múltiples objetivos
  - [x] Soporte para `targetType: 'all'` y `targetType: 'area'`
  - [x] Excluye automáticamente al jugador que ataca
  - [x] Solo afecta a jugadores con HP > 0

- [x] **Ataques de Área**
  - [x] Método `applyDamageToMultiple()` para aplicar daño a múltiples objetivos
  - [x] Método `applyEffectsToMultiple()` para aplicar efectos a múltiples objetivos
  - [x] Integrado en `playCard()` y `useSkill()`
  - [x] Funciona con todas las cartas y habilidades de área

- [x] **Ataques con Efectos Combinados**
  - [x] Ataques de área pueden aplicar daño + efectos simultáneamente
  - [x] Ejemplo: Implosión Energética (daño + aturdimiento a todos)
  - [x] Efectos se aplican a todos los objetivos afectados

- [x] **Ataques Especiales con Tiradas**
  - [x] Embate Furioso: tirada por jugador, 1 daño por cada tirada > 3
  - [x] Rayos Cósmicos: tirada por jugador, 1 daño por cada tirada > 3
  - [x] Sistema de tiradas de dado integrado
  - [x] Mensajes informativos con resultados de tiradas

- [x] **Frontend - Visualización y UX**
  - [x] Badge "ÁREA" en cartas y habilidades de área
  - [x] No requiere selección de objetivo para ataques de área
  - [x] Selección automática de todos los oponentes
  - [x] Tooltips mejorados con información de objetivo

### Día 16-17: Panel de Configuración y Autenticación ✅ COMPLETADO
- [x] **Sistema de Autenticación**
  - [x] Backend: JWT, Guards (JwtAuthGuard, RolesGuard)
  - [x] Schema de User con roles (admin, user)
  - [x] Endpoints: /auth/register, /auth/login, /auth/me
  - [x] Frontend: AuthContext con persistencia en localStorage
  - [x] Páginas de Login y Register
  - [x] Protección de rutas (ProtectedRoute)
  - [x] Modo invitado integrado (sin login)

- [x] **Panel de Administración**
  - [x] Backend: AdminModule protegido (solo admin)
  - [x] Endpoints para actualizar y activar/desactivar:
    - Skills: /admin/skills/:id, /admin/skills/:id/toggle
    - Cards: /admin/cards/:id, /admin/cards/:id/toggle
    - Characters: /admin/characters/:id, /admin/characters/:id/toggle
  - [x] Frontend: Panel completo con tabs
  - [x] Interfaz responsive y temática
  - [x] Mensajes de éxito/error

- [x] **Integración con Lobby**
  - [x] Usuarios logueados usan su username automáticamente
  - [x] Invitados pueden ingresar nombre manualmente
  - [x] Enlaces a login/register en lobby
  - [x] Botón de admin para usuarios con rol admin

---

## ⏳ Pendiente - FASE 1 (Completada)

### Día 3-4: Sistema de Turnos ✅ COMPLETADO
- [x] **Inicialización de turno**
  - [x] Determinar orden de turnos (por velocidad)
  - [x] Establecer jugador inicial
  - [x] Inicializar contador de turno
  
- [x] **Gestión de turnos**
  - [x] Indicador visual de turno actual
  - [x] Contador de acciones disponibles (2 por turno)
  - [x] Validación de acciones según turno
  - [x] Finalización de turno
  - [x] Avance al siguiente jugador
  - [x] Eventos WebSocket para cambios de turno

- [x] **Fases de turno**
  - [x] Fase de inicio (robar cartas, aplicar efectos)
  - [x] Fase principal (acciones del jugador)
  - [x] Fase de fin (limpiar efectos, pasar turno)

### Día 5-6: Acciones y Combate ✅ COMPLETADO
- [x] **Sistema de acciones básicas**
  - [x] Robar carta del mazo
  - [x] Jugar carta de la mano
  - [x] Ataque básico
  - [x] Defensa básica (escudos)
  - [x] Validación de acciones disponibles

- [x] **Sistema de combate**
  - [x] Selección de objetivo
  - [x] Cálculo de daño (ataque - defensa)
  - [x] Aplicación de daño a HP
  - [x] Sistema de escudos (absorción de daño)
  - [x] Validación de objetivos válidos

- [x] **Sistema de vida**
  - [x] Puntos de vida iniciales (desde balance)
  - [x] Reducción de PV por daño
  - [x] Visualización de HP en UI
  - [x] Detección de derrota (PV = 0)
  - [x] Detección de victoria (último jugador en pie)
  - [x] Finalización de partida

- [x] **Gestión de cartas**
  - [x] Robo de cartas del mazo
  - [x] Descarte de cartas usadas
  - [x] Recarga de mazo desde descarte (si se agota)
  - [x] Límite de mano (maxHandSize)

### Día 7: Configuración y Testing ✅ COMPLETADO
- [x] **Persistencia de partidas**
  - [x] Guardar estado de partida en MongoDB
  - [x] Recuperar partida guardada
  - [x] Schema de Game en MongoDB
  - [x] Guardar estadísticas de partidas
  - [x] Tracking de acciones durante el juego

- [ ] **Testing básico**
  - [ ] Tests unitarios de servicios clave
  - [ ] Tests de integración de flujo de juego
  - [ ] Validación de reglas básicas

- [ ] **Corrección de bugs**
  - [ ] Revisión de errores conocidos
  - [ ] Optimización de rendimiento
  - [ ] Manejo de errores mejorado

- [ ] **Documentación**
  - [ ] Actualizar documentación de FASE 1
  - [ ] Guía de uso básica
  - [ ] Documentación de API

---

## 🎯 Próximos Pasos Recomendados

### Prioridad Alta (Para completar MVP)

1. **Sistema de Turnos** (Día 3-4 restante)
   - Implementar gestión de turnos en `GameService`
   - Agregar eventos WebSocket para cambios de turno
   - UI para mostrar turno actual y acciones restantes

2. **Acciones Básicas** (Día 5-6)
   - Implementar robo de cartas
   - Implementar jugar carta
   - Implementar ataque básico
   - Sistema de selección de objetivos

3. **Sistema de Vida y Combate** (Día 5-6)
   - Cálculo y aplicación de daño
   - Detección de victoria/derrota
   - Visualización de HP

### Prioridad Media

4. **Persistencia de Partidas** (Día 7)
   - Guardar estado en MongoDB
   - Recuperar partidas guardadas

5. **Testing y Documentación** (Día 7)
   - Tests básicos
   - Documentación final

---

## 📝 Notas Técnicas

### Estado Actual del Código

**Backend:**
- ✅ `GameService.startGame()` - Inicia partida y reparte cartas
- ✅ `GameService.drawCard()` - Robo de cartas del mazo compartido
- ✅ `GameService.useSkill()` - Sistema de ejecución de habilidades
- ✅ `GameService.playCard()` - Jugar cartas con efectos
- ✅ `GameService.performAttack()` - Ataque básico
- ✅ `GameService.applyStartOfTurnEffects()` - Aplicación de efectos al inicio de turno
- ✅ `GameService.discardRandomCards()` - Descarte de cartas por efectos
- ✅ `GameService.applyDamage()` - Sistema mejorado con escudos y contraataques
- ✅ `GameService.applyShield()` - Aplicación de escudos
- ✅ `GameService.getValidTargets()` - Obtención de múltiples objetivos
- ✅ `GameService.applyDamageToMultiple()` - Aplicación de daño a múltiples objetivos
- ✅ `GameService.applyEffectsToMultiple()` - Aplicación de efectos a múltiples objetivos
- ✅ Estructura de `GameState` y `PlayerGameState` definida
- ✅ `SkillsService` - Carga de habilidades desde MongoDB
- ✅ `EffectsService` - Sistema genérico de efectos de estado
- ✅ Sistema de cooldowns y reducción automática
- ✅ Sistema de duración de efectos y expiración automática
- ✅ `AuthService` - Autenticación con JWT
- ✅ `AdminService` - Gestión de elementos del juego (solo admin)
- ✅ Guards: `JwtAuthGuard`, `RolesGuard`
- ✅ Decoradores: `@Roles()`, `@GetCurrentUser()`
- ✅ Persistencia de partidas en MongoDB

**Frontend:**
- ✅ Visualización de mano de cartas
- ✅ Selección de personajes
- ✅ UI completa de juego
- ✅ Sistema de turnos con indicadores
- ✅ UI de habilidades (SkillsList component)
- ✅ Visualización de cooldowns
- ✅ Visualización de efectos activos con iconos y colores
- ✅ Tooltips con descripciones de efectos
- ✅ Visualización de escudos y contraataques
- ✅ Selección de objetivos
- ✅ Páginas de Login y Register
- ✅ Panel de administración (solo admin)
- ✅ Contexto de autenticación
- ✅ Protección de rutas

### Problemas Conocidos

#### 🐛 Issue #1: Imágenes de personajes no visibles
**Estado**: Pendiente de resolución  
**Descripción**: Las imágenes de los personajes no se cargan correctamente al inicio de la partida. Los personajes aparecen como rectángulos oscuros en lugar de mostrar sus imágenes.

**Detalles técnicos**:
- Las imágenes están en `/deck_img/personajes/` con nombres: `strike.png`, `blaze.png`, `shadow.png`, `thunder.png`, `frost.png`, `ironclad.png`
- El backend sirve archivos estáticos desde `/deck_img` correctamente
- El componente `PlayerStatus` intenta cargar imágenes usando `character.image` o fallback a `/deck_img/personajes/${characterId}.png`
- El problema puede estar relacionado con:
  - Timing de carga de datos del personaje
  - Rutas de imágenes incorrectas
  - Problemas de CORS o permisos de archivos estáticos

**Workaround temporal**: Recargar la página o hacer hover sobre el personaje para forzar la carga.

**Prioridad**: Alta - Afecta la experiencia visual del juego

---

## ✅ FASE 4: Métricas y Analytics (Días 21-24 Completados)

### Día 21-22: Recolección de Datos ✅ COMPLETADO
- [x] **Sistema de tracking expandido**
  - [x] Nuevos tipos de eventos: `game-start`, `game-end`, `player-eliminated`
  - [x] Campos adicionales en `actionDetails`: shields, counterattacks, area attacks, dice rolls
  - [x] Tracking de eliminación de jugadores con fuente de daño
  - [x] Registro de eventos del sistema (inicio/fin de partida)

- [x] **Registro de partidas mejorado**
  - [x] Estadísticas expandidas en `Game` schema:
    - [x] `totalDamage`, `totalHealing`
    - [x] `cardsPlayed`, `skillsUsed`, `attacksPerformed`
    - [x] `effectsApplied`, `playersEliminated`
  - [x] Cálculo automático de estadísticas agregadas desde acciones
  - [x] Método `calculateGameStats()` para agregación de datos

- [x] **Captura de eventos detallada**
  - [x] Tracking de escudos absorbidos
  - [x] Tracking de contraataques con daño reflejado
  - [x] Tracking de ataques de área con número de objetivos
  - [x] Tracking de tiradas de dado (dice rolls y resultados)
  - [x] Tracking de fuente de daño (card, skill, attack, counterattack)

- [x] **Almacenamiento de datos**
  - [x] Schema `GameAction` expandido con nuevos campos
  - [x] Índices optimizados para consultas de analytics
  - [x] Persistencia completa de todas las acciones del juego

### Día 23-24: Cálculo de Métricas ✅ COMPLETADO
- [x] **AnalyticsController creado**
  - [x] Endpoints protegidos con autenticación JWT y rol ADMIN
  - [x] Filtros por `balanceVersion`, `startDate`, `endDate`
  - [x] Endpoints REST para todas las métricas

- [x] **% victorias por personaje**
  - [x] Método `getCharacterWinRates()` implementado
  - [x] Cálculo de juegos jugados y victorias por personaje
  - [x] Cálculo de win rate porcentual
  - [x] Ordenamiento por win rate descendente
  - [x] Incluye nombres de personajes

- [x] **Uso de cartas**
  - [x] Método `getCardUsage()` implementado
  - [x] Estadísticas de uso: veces jugadas, daño total, curación total
  - [x] Promedios: daño promedio, curación promedio
  - [x] Ordenamiento por veces jugadas
  - [x] Filtrado por versión de balance y fechas

- [x] **Duración de partidas**
  - [x] Método `getGameDurations()` implementado
  - [x] Estadísticas: promedio, mínimo, máximo, mediana
  - [x] Conteo de partidas totales
  - [x] Filtrado por versión de balance y fechas

- [x] **Estadísticas de jugadores**
  - [x] Método `getPlayerStats()` implementado
  - [x] Juegos jugados, victorias, win rate
  - [x] Daño promedio y curación promedio por acción
  - [x] Filtrado por jugador específico o todos
  - [x] Ordenamiento por win rate

- [x] **Estadísticas generales**
  - [x] Método `getOverallStats()` implementado
  - [x] Total de partidas y jugadores únicos
  - [x] Promedios: duración, turnos, acciones por partida
  - [x] Total de daño y curación
  - [x] Personaje y carta más jugados

- [x] **Exportación de datos**
  - [x] Método `exportData()` implementado
  - [x] Formato JSON con datos completos de partidas
  - [x] Formato CSV con datos resumidos
  - [x] Filtrado por versión de balance y fechas

- [x] **Backend - Endpoints de Analytics**
  - [x] `GET /analytics/character-win-rates` - Win rates por personaje
  - [x] `GET /analytics/card-usage` - Estadísticas de uso de cartas
  - [x] `GET /analytics/game-durations` - Estadísticas de duración
  - [x] `GET /analytics/player-stats` - Estadísticas de jugadores
  - [x] `GET /analytics/overall-stats` - Estadísticas generales
  - [x] `GET /analytics/export` - Exportación de datos (JSON/CSV)

### Día 25: Dashboard y Exportación ✅ COMPLETADO
- [x] **Dashboard de estadísticas en frontend**
  - [x] Página `AnalyticsPage` creada con diseño temático
  - [x] 5 secciones: Resumen, Personajes, Cartas, Jugadores, Duraciones
  - [x] Navegación integrada desde AdminPage
  - [x] Protección con autenticación admin

- [x] **Visualización de datos**
  - [x] Gráficos de barras para win rates y uso de cartas
  - [x] Tarjetas de estadísticas con métricas clave
  - [x] Colores dinámicos según valores (verde/naranja/rojo para win rates)
  - [x] Visualización de duraciones con formato legible
  - [x] Diseño responsive para móvil y desktop

- [x] **Interfaz de usuario para exportación**
  - [x] Botones de exportación JSON y CSV
  - [x] Descarga automática de archivos
  - [x] Filtros aplicados a la exportación
  - [x] Nombres de archivo con fecha

- [x] **Análisis básico**
  - [x] Filtros por versión de balance
  - [x] Filtros por rango de fechas (startDate, endDate)
  - [x] Actualización dinámica de datos al cambiar filtros
  - [x] Cálculo automático de métricas agregadas

- [x] **Frontend - Archivos creados**
  - [x] `AnalyticsPage.tsx` - Componente principal del dashboard
  - [x] `AnalyticsPage.css` - Estilos temáticos y responsive
  - [x] Métodos agregados en `api.service.ts` para todos los endpoints
  - [x] Ruta `/analytics` agregada en `App.tsx` con protección admin
  - [x] Enlace desde AdminPage al dashboard de analytics

---

## 🚀 Siguiente Sprint Sugerido

## ✅ FASE 3: Panel de Balanceo (Completada)

### Día 18-19: Panel de Administración y Ajustes ✅ COMPLETADO
- [x] **Dashboard de configuración**
  - [x] Panel principal con estadísticas del sistema
  - [x] Navegación por pestañas (Dashboard, Personajes, Cartas, Habilidades, Balance)
  - [x] Visualización de elementos activos/inactivos
  - [x] Accesos rápidos a cada sección

- [x] **Gestión de Personajes**
  - [x] Lista completa de personajes (activos e inactivos)
  - [x] Formulario de edición completo:
    - [x] Nombre, descripción, HP máximo
    - [x] Estadísticas base (ataque, defensa, velocidad, esquiva, acierto)
    - [x] Atributos (resistencias, inmunidades)
    - [x] Selección de imagen con preview
  - [x] Activación/desactivación de personajes
  - [x] Indicadores visuales para elementos inactivos

- [x] **Gestión de Cartas**
  - [x] Lista completa de cartas (activas e inactivas)
  - [x] Formulario de edición completo:
    - [x] Nombre, descripción, tipo, objetivo
    - [x] Costo, daño, curación, escudo, defensa
    - [x] Selección de imagen con preview
  - [x] Activación/desactivación de cartas
  - [x] Indicadores visuales para elementos inactivos

- [x] **Gestión de Habilidades**
  - [x] Lista completa de habilidades (activas e inactivas)
  - [x] Formulario de edición completo:
    - [x] Nombre, descripción, tipo, objetivo
    - [x] Daño, curación, escudo
    - [x] Cooldown, costo
  - [x] Activación/desactivación de habilidades
  - [x] Indicadores visuales para elementos inactivos

- [x] **Ajustes de Balance General**
  - [x] Formulario para ajustar parámetros globales:
    - [x] Mano inicial
    - [x] Cartas por turno
    - [x] Acciones por turno
  - [x] Guardado de cambios en MongoDB

- [x] **Sistema de Imágenes**
  - [x] Endpoints para listar imágenes disponibles
  - [x] Servicio de archivos estáticos para `/deck_img`
  - [x] Selector de imágenes con preview
  - [x] Soporte para imágenes de cartas y personajes

- [x] **Backend - Endpoints de Administración**
  - [x] `GET /admin/characters` - Todos los personajes (incluye inactivos)
  - [x] `GET /admin/cards` - Todas las cartas (incluye inactivas)
  - [x] `GET /admin/skills` - Todas las habilidades (incluye inactivas)
  - [x] `GET /admin/images/cards` - Lista de imágenes de cartas
  - [x] `GET /admin/images/characters` - Lista de imágenes de personajes
  - [x] `GET /admin/balance` - Obtener balance actual
  - [x] `PUT /admin/balance` - Actualizar balance
  - [x] Métodos en servicios para obtener elementos inactivos

- [x] **Frontend - Panel de Administración**
  - [x] Interfaz completa de administración
  - [x] Formularios de edición con validación
  - [x] Preview de imágenes
  - [x] Mensajes de éxito/error
  - [x] Diseño responsive y temático

### Día 20: Sistema de Presets ✅ COMPLETADO
- [x] **Guardar Configuraciones**
  - [x] Schema de Preset en MongoDB
  - [x] Endpoint para crear presets con configuración completa
  - [x] Captura de estado actual (personajes, cartas, habilidades, balance)
  - [x] Validación de nombres únicos por usuario
  - [x] UI para crear presets con nombre y descripción

- [x] **Cargar Presets**
  - [x] Endpoint para cargar presets guardados
  - [x] Restauración completa de configuración
  - [x] Actualización de personajes, cartas, habilidades y balance
  - [x] UI para listar y cargar presets
  - [x] Confirmación antes de cargar (sobrescribe configuración actual)

- [x] **Comparar Configuraciones**
  - [x] Endpoint para comparar dos presets
  - [x] Detección de diferencias por sección (personajes, cartas, habilidades, balance)
  - [x] Vista lado a lado de diferencias
  - [x] UI modal para seleccionar y comparar presets
  - [x] Visualización clara de valores diferentes

- [x] **Gestión de Presets**
  - [x] Listar presets del usuario
  - [x] Eliminar presets (soft delete)
  - [x] Persistencia en MongoDB
  - [x] Asociación con usuario creador

**Objetivo**: Completar FASE 4 - Métricas y Analytics

**Tiempo estimado**: 3 días

---

**Estado General**: ✅ FASE 1 COMPLETA + FASE 2 COMPLETA (Días 8-17 Completados)

**FASE 1 COMPLETA**: Todas las funcionalidades del MVP están implementadas y funcionando.
**FASE 2 COMPLETA**: 
  - ✅ Sistema modular de habilidades (Días 8-9)
  - ✅ Efectos de estado (Días 10-11)
  - ✅ Efectos defensivos (Días 12-13)
  - ✅ Ataques especiales (Días 14-15)
  - ✅ Panel de configuración y autenticación (Días 16-17)

---

## 🎨 Extras Implementados (Post-FASE 1)

### Página "Cómo se juega"
- [x] Página completa con guía de reglas del juego
- [x] Secciones: Objetivo, Configuración, Turnos, Acciones, Vida, Efectos, Estrategia, Controles
- [x] Diseño responsive y accesible
- [x] Navegación desde el lobby

### Diseño y UI/UX
- [x] **Temática espacial** implementada en todo el juego
  - Gradientes oscuros con efectos de luz
  - Colores temáticos (púrpura, azul, verde)
  - Efectos hover y transiciones suaves
  - Scrollbar personalizada
- [x] **Diseño 100% responsive**
  - Breakpoints: 1024px, 768px, 480px
  - Tipografía adaptativa con `clamp()`
  - Grids adaptativos
  - Optimizado para móvil (donde se jugará más)
- [x] Estilo adulto pero apto (sin sangre)
- [x] **Optimizaciones UI/UX recientes (Diciembre 2024)**
  - [x] Layout optimizado sin scroll vertical
  - [x] Grid de 2 columnas en desktop: Acciones y Habilidades lado a lado
  - [x] Panel de detalles de personaje con hover/click mejorado
  - [x] Panel centrado con overlay oscuro (móvil y desktop)
  - [x] Espaciado optimizado para aprovechar mejor el espacio
  - [x] Personajes más compactos (90x120px)
  - [x] Información de turno más compacta
  - [x] Carrusel horizontal para cartas y habilidades
  - [x] Traducción completa al español (España)
  - [x] **Mejoras de UI/UX de personajes (Enero 2025)**
    - [x] Layout horizontal para cards de personajes (imagen + info al lado)
    - [x] Información crítica visible directamente: HP, nombre, stats (ataque, defensa, velocidad)
    - [x] Efectos activos mostrados con badges compactos
    - [x] Panel de detalles mejorado con mejor legibilidad (colores más claros, menos blur)
    - [x] Sistema de hover y click para fijar panel (pinned state)
    - [x] Eliminación de overlays encima de la imagen (HP, "TU TURNO" ahora fuera)
    - [x] Optimización para 6 jugadores: Grid de 3 columnas en pantallas grandes
    - [x] Cards adaptativos que aprovechan mejor el ancho disponible
    - [x] Diseño de cartas de selección estilo TCG/MTG con formato full-art
    - [x] Modal de confirmación para selección de personajes
    - [x] Visualización de habilidades en cartas de selección

### Modos de Partida
- [x] **Modo Aleatorio** (predeterminado)
  - Personajes asignados automáticamente al iniciar
  - Ideal para testeo rápido y balanceo
  - Permite comparar preferencias de jugadores
- [x] **Modo Selección**
  - Jugadores eligen personajes antes de iniciar
  - Validación de personajes únicos
  - Interfaz de selección mejorada

### Mejoras Técnicas
- [x] Tipos TypeScript actualizados para modos de juego
- [x] Backend actualizado para soportar ambos modos
- [x] Asignación automática de personajes en modo aleatorio
- [x] Validación mejorada según modo de juego

