# 🎮 Características del Juego - Cosmos Combat

## Modos de Partida

### 🎲 Modo Aleatorio (Predeterminado)
- Los personajes se asignan automáticamente al iniciar la partida
- Ideal para testeo rápido y balanceo
- Permite comparar qué tipo de juego gusta más a los jugadores
- Los jugadores solo necesitan estar "listos" para iniciar
- Seleccionado por defecto al crear una partida

### 👤 Modo Selección
- Los jugadores eligen sus personajes antes de iniciar
- Validación de personajes únicos (si aplica)
- Interfaz de selección mejorada con información de personajes
- Todos los jugadores deben tener personaje seleccionado para iniciar

## Página "Cómo se juega"

Accesible desde el lobby, incluye:

- **Objetivo del Juego**: Explicación del objetivo principal
- **Configuración de Partida**: Número de jugadores, preparación, cartas iniciales
- **Sistema de Turnos**: Fases de inicio, principal y fin
- **Acciones Disponibles**: Jugar carta, ataque básico, defensa, robar carta
- **Sistema de Vida**: HP, daño, victoria y derrota
- **Efectos y Estados**: Quemadura, congelación, parálisis, escudos
- **Estrategia y Consejos**: Tips para jugadores
- **Controles**: Guía de controles del juego

## Diseño y UI/UX

### Temática Espacial
- Gradientes oscuros con efectos de luz
- Colores temáticos:
  - Púrpura (#818cf8) - Acciones principales
  - Azul (#60a5fa) - Efectos y estados
  - Verde (#4ade80) - Éxito y victoria
- Efectos hover y transiciones suaves
- Scrollbar personalizada
- Estilo adulto pero apto (sin sangre)

### Diseño Responsive
- **Breakpoints**:
  - Desktop: > 1024px
  - Tablet: 768px - 1024px
  - Móvil: < 768px
  - Móvil pequeño: < 480px
- **Tipografía adaptativa**: Uso de `clamp()` para tamaños de fuente
- **Grids adaptativos**: Layouts flexibles con `auto-fit` y `minmax()`
- **Móvil-first**: Optimizado para dispositivos móviles (donde se jugará más)
- Todos los componentes son 100% responsive

## Funcionalidades del Juego

### Sistema de Lobby
- Crear partida nueva con selección de modo
- Unirse a partida existente
- Listar partidas disponibles
- Sistema de códigos de partida (UUID)
- Límite de jugadores (2-6)

### Sistema de Turnos
- Inicialización de turno (orden por velocidad)
- Indicador visual de turno actual
- Contador de acciones (2 por turno)
- Finalización de turno
- Fases: Inicio, Principal, Fin

### Acciones Básicas
- **Ataque básico**: Selección de objetivo, cálculo de daño
- **Jugar carta**: Selección de carta y objetivo
- **Robar carta**: Robo adicional como acción
- **Defensa**: Sistema de escudos

### Sistema de Vida
- Puntos de vida iniciales (configurables)
- Reducción de HP por daño
- Visualización de HP en UI
- Detección de derrota (HP = 0)
- Detección de victoria (último jugador en pie)

### Persistencia
- Guardado automático de partidas en MongoDB
- Estadísticas de partidas
- Tracking de acciones durante el juego
- Historial completo de partidas

## Navegación

- **Lobby** (`/`): Crear/Unirse a partidas
- **Cómo se juega** (`/how-to-play`): Guía completa de reglas
- **Juego** (`/game/:gameId`): Partida en curso

## Accesibilidad

- Contraste adecuado para legibilidad
- Texto legible en todos los tamaños
- Navegación clara y intuitiva
- Feedback visual de acciones
- Sin elementos que requieran precisión extrema

