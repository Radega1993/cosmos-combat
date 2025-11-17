# 🔧 Especificaciones Técnicas - Cosmos Combat

## Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: React 18+ con TypeScript
- **Estado**: Zustand (para estado global)
- **Comunicación**: Socket.io Client
- **Estilos**: CSS Modules con temática espacial
- **Build**: Vite
- **Navegación**: React Router
- **Diseño**: 100% responsive (móvil-first)

#### Backend
- **Framework**: NestJS
- **WebSockets**: Socket.io Gateway
- **Base de Datos**: MongoDB (requerido) - Almacenamiento principal para:
  - Configuraciones editables (personajes, cartas, habilidades, balance)
  - Persistencia de todas las partidas
  - Estadísticas y analytics
  - Historial de versiones de balance
- **ODM**: Mongoose para modelos y schemas
- **Validación**: class-validator, class-transformer
- **Testing**: Jest

#### Infraestructura
- **Deployment**: Railway / Render / Vercel
- **CI/CD**: GitHub Actions (opcional)
- **Monitoreo**: Logs básicos (console.log inicialmente)

---

## Estructura de Proyecto

```
cosmos-combat/
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Lobby/
│   │   │   ├── Game/
│   │   │   ├── Cards/
│   │   │   └── UI/
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Servicios (API, WebSocket)
│   │   ├── store/             # Estado global
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilidades
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── game/              # Lógica del juego
│   │   │   ├── entities/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── gateway/           # WebSocket Gateway
│   │   ├── lobby/             # Sistema de lobby
│   │   ├── database/          # Schemas y modelos MongoDB
│   │   │   ├── schemas/
│   │   │   └── models/
│   │   ├── analytics/         # Servicios de estadísticas
│   │   ├── config/            # Configuración
│   │   └── main.ts
│   └── package.json
│
├── shared/                    # Código compartido
│   ├── types/                 # Types compartidos
│   └── constants/             # Constantes
│
├── docs/                      # Documentación
└── README.md
```

---

## Modelos de Datos

### Player (Jugador)

```typescript
interface Player {
  id: string;
  name: string;
  character: Character;
  hand: Card[];
  // deck and discard are now shared across all players (in GameState)
  hp: number;
  maxHp: number;
  status: PlayerStatus;
  isActive: boolean;
}

interface PlayerStatus {
  effects: Effect[];
  shields: number;
  cooldowns: Record<string, number>;
  resources?: Record<string, number>;
}
```

### Character (Personaje)

```typescript
interface Character {
  id: string;
  name: string;
  maxHp: number;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
  };
  skills: Skill[];
  deck: string[]; // IDs de cartas (used to create shared deck - all characters use same deck)
}
```

### Card (Carta)

```typescript
interface Card {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'utility' | 'skill';
  cost?: number;
  damage?: number;
  heal?: number;
  effects?: Effect[];
  description: string;
}
```

### Skill (Habilidad)

```typescript
interface Skill {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'utility';
  damage?: number;
  heal?: number;
  effects?: Effect[];
  cooldown: number;
  cost?: number;
  targetType: 'single' | 'area' | 'self' | 'all';
  description: string;
}
```

### Effect (Efecto)

```typescript
interface Effect {
  type: 'burn' | 'paralysis' | 'freeze' | 'shield' | 'counter' | 'poison';
  duration: number;
  value?: number;
  active: boolean;
  source?: string; // ID de carta/habilidad que lo aplicó
}
```

### Game (Partida)

```typescript
interface Game {
  id: string;
  players: Player[];
  currentTurn: number;
  currentPlayerId: string;
  turnOrder: string[];
  phase: 'lobby' | 'setup' | 'playing' | 'finished';
  sharedDeck: string[]; // Shared deck for all players (79 cards)
  sharedDiscard: string[]; // Shared discard pile for all players
  winner?: string;
  startedAt?: Date;
  finishedAt?: Date;
}
```

**Nota importante**: El mazo es compartido entre todos los jugadores. Todos roban del mismo mazo y descartan al mismo descarte compartido. Cuando el mazo se agota, se baraja el descarte compartido y se continúa.

---

## Flujo de Comunicación WebSocket

### Eventos del Cliente → Servidor

```typescript
// Lobby
'create-game' → { playerName: string }
'join-game' → { gameId: string, playerName: string }
'leave-game' → { gameId: string }

// Game Setup
'select-character' → { gameId: string, characterId: string }
'ready' → { gameId: string }

// Game Actions
'play-card' → { gameId: string, cardId: string, targetId?: string }
'use-skill' → { gameId: string, skillId: string, targetId?: string }
'attack' → { gameId: string, targetId: string }
'defend' → { gameId: string }
'end-turn' → { gameId: string }
```

### Eventos del Servidor → Cliente

```typescript
// Lobby
'game-created' → { gameId: string, game: Game }
'game-joined' → { game: Game }
'player-joined' → { player: Player }
'player-left' → { playerId: string }

// Game State
'game-updated' → { game: Game }
'turn-started' → { playerId: string, actionsRemaining: number }
'action-executed' → { action: Action, result: ActionResult }
'game-ended' → { winner: string, game: Game }

// Errors
'error' → { message: string, code: string }
```

---

## Diseño y UI/UX

### Temática Espacial
- Gradientes oscuros con efectos de luz
- Colores temáticos: púrpura (#818cf8), azul (#60a5fa), verde (#4ade80)
- Efectos hover y transiciones suaves
- Scrollbar personalizada
- Estilo adulto pero apto (sin sangre)

### Diseño Responsive
- **Breakpoints**: 1024px, 768px, 480px
- **Tipografía adaptativa**: Uso de `clamp()` para tamaños de fuente
- **Grids adaptativos**: `auto-fit` y `minmax()` para layouts flexibles
- **Móvil-first**: Optimizado para dispositivos móviles (donde se jugará más)
- Todos los componentes son 100% responsive

### Páginas Disponibles
- **Lobby** (`/`): Crear/Unirse a partidas, selección de modo
- **Cómo se juega** (`/how-to-play`): Guía completa de reglas
- **Juego** (`/game/:gameId`): Partida en curso

## Sistema de Configuración JSON

### Estructura de Archivos

```
data/
├── characters.json      # Personajes disponibles
├── cards.json          # Todas las cartas
├── skills.json         # Habilidades
├── balance.json       # Valores de balance
└── effects.json        # Definiciones de efectos
```

### Ejemplo: characters.json

```json
{
  "characters": [
    {
      "id": "warrior",
      "name": "Guerrero",
      "maxHp": 100,
      "baseStats": {
        "attack": 10,
        "defense": 5,
        "speed": 3
      },
      "skills": ["slash", "shield-bash"],
      "deck": ["attack-1", "attack-2", "defend-1"]
    }
  ]
}
```

### Ejemplo: balance.json

```json
{
  "game": {
    "startingHandSize": 3,
    "maxHandSize": 10,
    "cardsPerTurn": 2
  },
  "characters": {
    "warrior": {
      "maxHp": 100,
      "baseAttack": 10
    }
  },
  "effects": {
    "burn": {
      "damagePerTurn": 5,
      "maxDuration": 3
    },
    "paralysis": {
      "maxDuration": 2
    }
  }
}
```

---

## Modos de Partida

El juego soporta dos modos de partida diferentes:

### Modo Aleatorio (Predeterminado)
- **gameMode**: `'random'`
- Los personajes se asignan automáticamente al iniciar la partida
- Ideal para testeo rápido y balanceo
- Permite comparar preferencias de jugadores
- Los jugadores solo necesitan estar "listos" para iniciar

### Modo Selección
- **gameMode**: `'select'`
- Los jugadores eligen sus personajes antes de iniciar
- Validación de personajes únicos (si aplica)
- Interfaz de selección mejorada
- Todos los jugadores deben tener personaje seleccionado para iniciar

### Implementación

```typescript
interface GameSession {
  gameId: string;
  players: Player[];
  phase: GamePhase;
  gameMode: 'random' | 'select'; // Campo agregado
  // ... otros campos
}
```

El modo se selecciona al crear la partida y se almacena en la sesión de juego.

## Lógica del Juego

### Flujo de Turno

1. **Inicio de Turno**
   - Aplicar efectos de inicio de turno
   - Robar cartas
   - Resetear acciones (2 acciones)

2. **Fase de Acciones**
   - Jugador puede realizar hasta 2 acciones:
     - Jugar carta
     - Usar habilidad
     - Ataque básico
     - Defensa
     - Robar carta adicional

3. **Fin de Turno**
   - Aplicar efectos de fin de turno
   - Reducir duración de efectos
   - Eliminar efectos expirados
   - Pasar turno al siguiente jugador

### Sistema de Efectos

```typescript
// Aplicación de efectos
function applyEffect(player: Player, effect: Effect) {
  player.status.effects.push(effect);
  
  // Aplicar efecto inmediato si tiene
  if (effect.type === 'burn' && effect.value) {
    player.hp -= effect.value;
  }
}

// Procesamiento de efectos por turno
function processTurnEffects(player: Player) {
  player.status.effects.forEach(effect => {
    switch (effect.type) {
      case 'burn':
        player.hp -= effect.value || 0;
        break;
      case 'paralysis':
        // Reducir acciones disponibles
        break;
    }
    
    effect.duration--;
  });
  
  // Eliminar efectos expirados
  player.status.effects = player.status.effects.filter(e => e.duration > 0);
}
```

### Sistema de Daño

```typescript
function calculateDamage(attacker: Player, defender: Player, baseDamage: number) {
  let damage = baseDamage;
  
  // Aplicar modificadores del atacante
  damage += attacker.character.baseStats.attack;
  
  // Aplicar defensa del defensor
  damage -= defender.character.baseStats.defense;
  
  // Aplicar escudos
  if (defender.status.shields > 0) {
    const shieldAbsorption = Math.min(damage, defender.status.shields);
    damage -= shieldAbsorption;
    defender.status.shields -= shieldAbsorption;
  }
  
  // Mínimo de daño
  return Math.max(1, damage);
}
```

---

## 🛡️ Panel de Administración

### Autenticación y Autorización
- **Sistema de autenticación**: JWT-based con Passport.js
- **Roles**: `USER` y `ADMIN`
- **Protección de rutas**: `JwtAuthGuard` y `RolesGuard`
- **Endpoints protegidos**: Todos los endpoints `/admin/*` requieren rol ADMIN

### Endpoints de Administración

#### Personajes
- `GET /admin/characters` - Obtener todos los personajes (incluye inactivos)
- `PUT /admin/characters/:id` - Actualizar personaje
- `PUT /admin/characters/:id/toggle` - Activar/desactivar personaje

#### Cartas
- `GET /admin/cards` - Obtener todas las cartas (incluye inactivas)
- `PUT /admin/cards/:id` - Actualizar carta
- `PUT /admin/cards/:id/toggle` - Activar/desactivar carta

#### Habilidades
- `GET /admin/skills` - Obtener todas las habilidades (incluye inactivas)
- `PUT /admin/skills/:id` - Actualizar habilidad
- `PUT /admin/skills/:id/toggle` - Activar/desactivar habilidad

#### Imágenes
- `GET /admin/images/cards` - Listar imágenes disponibles de cartas
- `GET /admin/images/characters` - Listar imágenes disponibles de personajes

#### Balance
- `GET /admin/balance` - Obtener configuración de balance actual
- `PUT /admin/balance` - Actualizar configuración de balance

### Servicios Backend

#### AdminService
- `getCardImages()`: Lee imágenes desde `deck_img/finales mazo`
- `getCharacterImages()`: Lee imágenes desde `deck_img/finales personajes`
- `updateSkill()`, `updateCard()`, `updateCharacter()`: Actualización completa de entidades
- `toggleSkillActive()`, `toggleCardActive()`, `toggleCharacterActive()`: Activar/desactivar
- `getGameBalance()`, `updateGameBalance()`: Gestión de balance general

#### Servicios Extendidos
- `CharactersService.findAllIncludingInactive()`: Obtener todos los personajes
- `CardsService.findAllIncludingInactive()`: Obtener todas las cartas
- `SkillsService.findAllIncludingInactive()`: Obtener todas las habilidades

### Frontend - AdminPage

#### Componentes
- **Dashboard**: Panel principal con estadísticas y accesos rápidos
- **CharactersSection**: Gestión de personajes con formulario de edición
- **CardsSection**: Gestión de cartas con formulario de edición
- **SkillsSection**: Gestión de habilidades con formulario de edición
- **BalanceSection**: Ajuste de parámetros globales del juego

#### Características
- Formularios completos de edición con validación
- Selector de imágenes con preview
- Indicadores visuales para elementos activos/inactivos
- Mensajes de éxito/error
- Diseño responsive y temático

### Archivos Estáticos
- **Ruta**: `/deck_img` servida por NestJS
- **Cartas**: `deck_img/finales mazo/`
- **Personajes**: `deck_img/finales personajes/`
- **Configuración**: `app.useStaticAssets()` en `main.ts`

### Sistema de Presets

#### Schema de Preset
- **Nombre y descripción**: Identificación del preset
- **Creador**: Asociado al usuario que lo creó
- **Configuración**: Objeto completo con personajes, cartas, habilidades y balance
- **Índices**: Búsqueda por nombre+usuario, activos, por defecto

#### Endpoints de Presets
- `POST /admin/presets` - Crear preset (requiere autenticación)
- `GET /admin/presets` - Listar presets del usuario
- `GET /admin/presets/:id` - Obtener preset específico
- `POST /admin/presets/:id/load` - Cargar preset (restaura configuración)
- `DELETE /admin/presets/:id` - Eliminar preset (soft delete)
- `POST /admin/presets/compare` - Comparar dos presets

#### Funcionalidades
- **Guardar**: Captura estado actual completo del juego
- **Cargar**: Restaura toda la configuración desde un preset
- **Comparar**: Detecta diferencias entre dos presets por sección
- **Gestión**: Listar, eliminar presets del usuario

#### Frontend - PresetsSection
- Lista de presets guardados
- Modal para crear nuevo preset
- Botones para cargar y eliminar
- Modal para comparar presets con vista lado a lado
- Confirmaciones antes de acciones destructivas

---

## Seguridad y Validación

### Validaciones del Servidor

- ✅ Validar que el jugador pertenece a la partida
- ✅ Validar que es el turno del jugador
- ✅ Validar que tiene acciones disponibles
- ✅ Validar que tiene recursos suficientes
- ✅ Validar que el objetivo es válido
- ✅ Validar cooldowns de habilidades

### Manejo de Errores

```typescript
// Errores comunes
enum GameError {
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  INVALID_ACTION = 'INVALID_ACTION',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  INVALID_TARGET = 'INVALID_TARGET',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND'
}
```

---

## Performance y Optimización

### Consideraciones MVP

- **Estado en memoria**: Para MVP, mantener partidas en memoria
- **Persistencia opcional**: Guardar solo partidas importantes
- **Límite de partidas**: Máximo 100 partidas simultáneas (configurable)

### Optimizaciones Futuras

- Redis para estado compartido
- Base de datos para persistencia
- Caché de configuraciones
- Compresión de mensajes WebSocket

---

## Testing

### Estrategia de Testing

1. **Unit Tests**: Lógica del juego (cálculos, efectos)
2. **Integration Tests**: Flujo completo de partida
3. **E2E Tests**: Flujo de usuario completo (opcional en MVP)

### Ejemplos de Tests

```typescript
describe('Damage Calculation', () => {
  it('should calculate damage correctly', () => {
    const attacker = createPlayer({ attack: 10 });
    const defender = createPlayer({ defense: 5 });
    const damage = calculateDamage(attacker, defender, 15);
    expect(damage).toBe(20); // 15 + 10 - 5
  });
});

describe('Effect System', () => {
  it('should apply burn effect', () => {
    const player = createPlayer({ hp: 100 });
    applyEffect(player, { type: 'burn', duration: 3, value: 5 });
    processTurnEffects(player);
    expect(player.hp).toBe(95);
  });
});
```

---

## Deployment

### Configuración de Entorno

```env
# Backend
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cosmos-combat
CORS_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Scripts de Deployment

```bash
# Build
npm run build

# Start production
npm run start:prod

# Docker (futuro)
docker-compose up
```

---

## Roadmap Técnico

### MVP (Fase 1-2)
- ✅ Funcionalidad básica
- ✅ WebSockets básicos
- ✅ Estado en memoria

### Mejoras (Post-MVP)
- 🔄 Persistencia en base de datos
- 🔄 Redis para escalabilidad
- 🔄 Autenticación real
- 🔄 Animaciones básicas
- 🔄 Mejoras de UI/UX

---

**Última actualización**: [Fecha]
**Versión**: 1.0.0

