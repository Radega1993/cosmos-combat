# 🗄️ Schemas de MongoDB - Cosmos Combat

## 📋 Visión General

Toda la información del juego se almacena en MongoDB para permitir:
- ✅ Modificación dinámica de datos (balance, cartas, personajes)
- ✅ Persistencia de todas las partidas
- ✅ Análisis estadístico completo
- ✅ Estudios de balanceo basados en datos reales

---

## 🏗️ Estructura de Colecciones

### 1. `characters` - Personajes

```typescript
interface Character {
  _id: ObjectId;
  id: string; // ID único del personaje (ej: "warrior")
  name: string;
  description: string;
  maxHp: number;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
  };
  skills: string[]; // IDs de habilidades
  deck: string[]; // IDs de cartas del mazo
  isActive: boolean; // Para activar/desactivar personajes
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices:**
- `id` (único)
- `isActive`

---

### 2. `cards` - Cartas

```typescript
interface Card {
  _id: ObjectId;
  id: string; // ID único de la carta
  name: string;
  type: 'attack' | 'defense' | 'utility' | 'skill';
  cost: number;
  damage?: number;
  heal?: number;
  defense?: number;
  shield?: number;
  effects?: Array<{
    type: string;
    duration: number;
    value?: number;
  }>;
  targetType: 'single' | 'area' | 'self' | 'all';
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices:**
- `id` (único)
- `type`
- `isActive`

---

### 3. `skills` - Habilidades

```typescript
interface Skill {
  _id: ObjectId;
  id: string; // ID único de la habilidad
  name: string;
  character: string; // ID del personaje que la posee
  type: 'attack' | 'defense' | 'utility';
  damage?: number;
  heal?: number;
  shield?: number;
  effects?: Array<{
    type: string;
    duration: number;
    value?: number;
  }>;
  cooldown: number;
  cost?: number;
  targetType: 'single' | 'area' | 'self' | 'all';
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices:**
- `id` (único)
- `character`
- `isActive`

---

### 4. `gameBalance` - Configuración de Balance

```typescript
interface GameBalance {
  _id: ObjectId;
  version: string; // Versión de la configuración (ej: "1.0.0")
  game: {
    startingHandSize: number;
    maxHandSize: number;
    cardsPerTurn: number;
    actionsPerTurn: number;
    minPlayers: number;
    maxPlayers: number;
  };
  characters: Record<string, {
    maxHp: number;
    baseAttack: number;
    baseDefense: number;
    baseSpeed: number;
  }>;
  effects: Record<string, {
    damagePerTurn?: number;
    actionsReduced?: number;
    absorption?: number;
    damageReflected?: number;
    maxDuration: number;
    stackable: boolean;
  }>;
  combat: {
    minDamage: number;
    criticalHitMultiplier: number;
    criticalHitChance: number;
  };
  cards: {
    defaultCost: number;
    maxCost: number;
  };
  skills: {
    defaultCooldown: number;
    minCooldown: number;
    maxCooldown: number;
  };
  isActive: boolean; // Solo una configuración activa
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices:**
- `isActive` (único cuando isActive = true)
- `version`

---

### 5. `games` - Partidas Completadas

```typescript
interface Game {
  _id: ObjectId;
  gameId: string; // ID único de la partida
  players: Array<{
    playerId: string;
    playerName: string;
    characterId: string;
    characterName: string;
    finalHp: number;
    maxHp: number;
    position: number; // Posición final (1 = ganador)
    isWinner: boolean;
  }>;
  winner: {
    playerId: string;
    playerName: string;
    characterId: string;
    finalHp: number;
  };
  gameStats: {
    totalTurns: number;
    totalActions: number;
    duration: number; // Duración en segundos
    averageTurnDuration: number;
  };
  balanceVersion: string; // Versión de balance usada
  startedAt: Date;
  finishedAt: Date;
  createdAt: Date;
}
```

**Índices:**
- `gameId` (único)
- `finishedAt`
- `balanceVersion`
- `winner.characterId`

---

### 6. `gameActions` - Acciones de Partidas

```typescript
interface GameAction {
  _id: ObjectId;
  gameId: string; // Referencia a la partida
  turn: number;
  playerId: string;
  playerName: string;
  characterId: string;
  actionType: 'play-card' | 'use-skill' | 'attack' | 'defend' | 'draw-card' | 'end-turn';
  actionDetails: {
    cardId?: string;
    cardName?: string;
    skillId?: string;
    skillName?: string;
    targetId?: string;
    targetName?: string;
    damage?: number;
    heal?: number;
    effectsApplied?: Array<{
      type: string;
      duration: number;
    }>;
  };
  timestamp: Date;
  createdAt: Date;
}
```

**Índices:**
- `gameId`
- `playerId`
- `actionType`
- `timestamp`
- `characterId`

---

### 7. `playerStats` - Estadísticas por Jugador

```typescript
interface PlayerStats {
  _id: ObjectId;
  playerId: string; // ID único del jugador (puede ser UUID o nombre)
  playerName: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  favoriteCharacter: string; // ID del personaje más usado
  characterStats: Record<string, {
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    averageFinalHp: number;
    averageTurnsSurvived: number;
  }>;
  cardUsage: Record<string, {
    timesPlayed: number;
    averageDamage: number;
    averageHeal: number;
  }>;
  skillUsage: Record<string, {
    timesUsed: number;
    averageDamage: number;
    averageHeal: number;
  }>;
  updatedAt: Date;
}
```

**Índices:**
- `playerId` (único)
- `winRate`
- `favoriteCharacter`

---

### 8. `characterAnalytics` - Análisis de Personajes

```typescript
interface CharacterAnalytics {
  _id: ObjectId;
  characterId: string;
  characterName: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  averageFinalHp: number;
  averageTurnsSurvived: number;
  averageGameDuration: number;
  mostUsedCards: Array<{
    cardId: string;
    cardName: string;
    usageCount: number;
    usageRate: number;
  }>;
  mostUsedSkills: Array<{
    skillId: string;
    skillName: string;
    usageCount: number;
    usageRate: number;
  }>;
  matchupStats: Record<string, {
    // ID del personaje oponente
    games: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
  period: {
    startDate: Date;
    endDate: Date;
  };
  balanceVersion: string;
  updatedAt: Date;
}
```

**Índices:**
- `characterId`
- `winRate`
- `balanceVersion`
- `period.startDate`

---

### 9. `cardAnalytics` - Análisis de Cartas

```typescript
interface CardAnalytics {
  _id: ObjectId;
  cardId: string;
  cardName: string;
  totalPlayed: number;
  totalGames: number; // En cuántas partidas se jugó
  playRate: number; // % de partidas donde se jugó
  averageDamage: number;
  averageHeal: number;
  averageShield: number;
  totalDamage: number;
  totalHeal: number;
  totalShield: number;
  effectsApplied: Record<string, number>; // Tipo de efecto -> cantidad
  mostUsedByCharacter: Array<{
    characterId: string;
    characterName: string;
    usageCount: number;
  }>;
  period: {
    startDate: Date;
    endDate: Date;
  };
  balanceVersion: string;
  updatedAt: Date;
}
```

**Índices:**
- `cardId`
- `playRate`
- `balanceVersion`

---

### 10. `balanceVersions` - Historial de Versiones de Balance

```typescript
interface BalanceVersion {
  _id: ObjectId;
  version: string; // Versión (ej: "1.0.0", "1.1.0")
  description: string; // Descripción de los cambios
  changes: Array<{
    type: 'character' | 'card' | 'skill' | 'effect' | 'game';
    itemId: string;
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  gamesPlayed: number; // Partidas jugadas con esta versión
  isActive: boolean;
  createdAt: Date;
  deactivatedAt?: Date;
}
```

**Índices:**
- `version` (único)
- `isActive`
- `createdAt`

---

## 🔄 Relaciones entre Colecciones

```
games (partidas)
  ├── gameActions (acciones de la partida)
  └── players[] -> characterId -> characters

characters
  ├── skills[] -> skills
  └── deck[] -> cards

gameBalance
  └── version -> balanceVersions

characterAnalytics
  └── characterId -> characters

cardAnalytics
  └── cardId -> cards
```

---

## 📊 Queries Comunes para Análisis

### Win Rate por Personaje

```typescript
db.characterAnalytics.aggregate([
  { $match: { balanceVersion: "1.0.0" } },
  { $sort: { winRate: -1 } },
  { $project: { characterName: 1, winRate: 1, totalGames: 1 } }
]);
```

### Cartas Más Jugadas

```typescript
db.cardAnalytics.aggregate([
  { $match: { balanceVersion: "1.0.0" } },
  { $sort: { totalPlayed: -1 } },
  { $limit: 10 },
  { $project: { cardName: 1, totalPlayed: 1, playRate: 1 } }
]);
```

### Partidas por Período

```typescript
db.games.find({
  finishedAt: {
    $gte: new Date("2024-01-01"),
    $lte: new Date("2024-01-31")
  }
}).sort({ finishedAt: -1 });
```

### Comparación de Versiones de Balance

```typescript
db.characterAnalytics.aggregate([
  {
    $group: {
      _id: "$balanceVersion",
      avgWinRate: { $avg: "$winRate" },
      totalGames: { $sum: "$totalGames" }
    }
  },
  { $sort: { _id: 1 } }
]);
```

---

## 🛠️ Operaciones de Mantenimiento

### Actualizar Estadísticas

```typescript
// Función para recalcular estadísticas de un personaje
async function updateCharacterAnalytics(characterId: string, balanceVersion: string) {
  const games = await db.games.find({
    "players.characterId": characterId,
    balanceVersion: balanceVersion
  }).toArray();
  
  // Calcular estadísticas...
  // Actualizar characterAnalytics
}
```

### Migrar Datos de Balance

```typescript
// Crear nueva versión de balance
async function createBalanceVersion(newBalance: GameBalance) {
  // Desactivar versión anterior
  await db.gameBalance.updateOne(
    { isActive: true },
    { $set: { isActive: false } }
  );
  
  // Crear nueva versión
  await db.gameBalance.insertOne({
    ...newBalance,
    version: generateVersion(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
```

---

## 🔐 Consideraciones de Seguridad

### Validación de Datos

- Usar Mongoose schemas con validación
- Validar tipos y rangos de valores
- Sanitizar inputs antes de guardar

### Índices de Performance

- Crear índices en campos de búsqueda frecuente
- Índices compuestos para queries complejas
- Revisar y optimizar índices regularmente

### Backup y Restauración

- Backups regulares de la base de datos
- Versionado de configuraciones importantes
- Logs de cambios críticos

---

## 📈 Escalabilidad

### Estrategias Futuras

1. **Sharding**: Si el volumen de partidas crece mucho
2. **Replicación**: Para alta disponibilidad
3. **Caché**: Redis para datos frecuentemente accedidos
4. **Agregaciones**: Pre-calcular estadísticas comunes

---

**Última actualización**: [Fecha]
**Versión**: 1.0.0


