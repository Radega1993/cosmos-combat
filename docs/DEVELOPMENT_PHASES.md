# 📋 Fases de Desarrollo - Cosmos Combat

## Visión General

Este documento detalla las fases de desarrollo del prototipo digital de Cosmos Combat. El objetivo es crear un motor de reglas funcional que permita testeo rápido y balanceo eficiente del juego de mesa.

---

## 🎯 FASE 1: MVP Funcional (7 días)

### Objetivo
Crear la funcionalidad mínima necesaria para jugar una partida completa de Cosmos Combat.

### Funcionalidades Requeridas

#### 1. Sistema de Lobby
- [x] Crear partida nueva
- [x] Unirse a partida existente
- [x] Listar partidas disponibles
- [x] Sistema de códigos de partida (UUID)
- [x] Límite de jugadores (2-6)

#### 2. Selección de Personajes
- [x] Mostrar personajes disponibles (cargar desde MongoDB)
- [x] Selección de personaje por jugador
- [x] Validación de personajes únicos (si aplica)
- [x] Carga de estadísticas base del personaje
- [x] **Dos modos de partida**:
  - Modo Aleatorio: Personajes asignados automáticamente
  - Modo Selección: Jugadores eligen personajes

#### 3. Sistema de Cartas
- [x] Reparto automático de cartas iniciales
- [x] Visualización de mano del jugador
- [x] Robo de cartas del mazo
- [x] Descarte de cartas
- [x] Mazo personalizado por personaje
- [x] Recarga de mazo desde descarte

#### 4. Sistema de Turnos
- [x] Inicialización de turno (orden por velocidad)
- [x] Indicador de turno actual
- [x] Contador de acciones (2 por turno)
- [x] Finalización de turno
- [x] Siguiente jugador

#### 5. Acciones Básicas
- [x] Ataque básico
  - Selección de objetivo
  - Cálculo de daño
  - Aplicación de daño
- [x] Defensa básica
  - Reducción de daño recibido (escudos)
- [x] Robar carta
- [x] Usar carta de la mano

#### 6. Sistema de Vida
- [x] Puntos de vida iniciales (configurables)
- [x] Reducción de PV por daño
- [x] Detección de derrota (PV = 0)
- [x] Detección de victoria

#### 7. Configuración MongoDB
- [x] Setup de MongoDB y Mongoose
- [x] Schemas de MongoDB (personajes, cartas, balance)
- [x] Carga de configuraciones desde MongoDB
- [x] Seed inicial de datos (personajes, cartas, balance)
- [x] Persistencia de partidas en MongoDB
- [x] Guardar estadísticas de partidas
- [x] Tracking de acciones durante el juego

### Entregables
- ✅ Partida jugable de principio a fin
- ✅ Sistema de turnos funcional
- ✅ Acciones básicas implementadas
- ✅ MongoDB configurado con schemas básicos
- ✅ Valores editables desde MongoDB
- ✅ Partidas guardadas en base de datos
- ✅ Página "Cómo se juega" con guía completa
- ✅ Diseño responsive y temática espacial
- ✅ Dos modos de partida (Aleatorio y Selección)

### Criterios de Éxito
- Se puede jugar una partida completa con 2 jugadores
- Todas las acciones básicas funcionan
- Los valores se pueden modificar desde MongoDB sin cambiar código
- Las partidas se guardan automáticamente en MongoDB

---

## 🎯 FASE 2: Habilidades y Efectos (10 días)

### Objetivo
Implementar el sistema completo de habilidades especiales y efectos de estado de forma modular.

### Funcionalidades Requeridas

#### 1. Sistema Modular de Habilidades ✅
- [x] Schema de MongoDB para habilidades
- [x] Sistema de carga de habilidades desde MongoDB
- [x] Ejecución de habilidades
- [x] Validación de condiciones (cooldown, recursos, etc.)

#### 2. Efectos de Estado ✅
- [x] **Parálisis**
  - Bloqueo de acciones (-1 acción por turno)
  - Duración configurable
  - Curable con tirada de 6
- [x] **Quemadura**
  - Descarte de carta al inicio de turno
  - Duración configurable
- [x] **Congelación**
  - Reducción de acciones (-1 acción por turno)
  - Duración configurable
  - Curable con tirada de 6
- [x] Sistema genérico de efectos temporales (EffectsService)

#### 3. Efectos Defensivos ✅
- [x] **Escudos**
  - Absorción de daño antes de que afecte HP
  - Escudos se consumen al absorber daño
  - Visualización en UI
- [x] **Contraataques**
  - Reflejo de daño al atacante
  - Soporte para porcentajes de reflejo (50%, 100%)
  - Tirada de dado para activación (opcional)
  - Mínimo 1 de daño reflejado
  - Visualización en UI

#### 4. Ataques Especiales ✅
- [x] **Ataques de Área**
  - Sistema de objetivos múltiples (all, area)
  - Aplicación de daño a múltiples objetivos
  - Aplicación de efectos a múltiples objetivos
  - Ataques con tiradas de dado (Embate Furioso, Rayos Cósmicos)
  - Visualización en UI con badge "ÁREA"
  - No requiere selección de objetivo para ataques de área
- [x] **Ataques con efectos combinados**
  - Combinación de daño + efectos simultáneos
  - Aplicación a múltiples objetivos
  - Ejemplo: Implosión Energética (daño + aturdimiento)

#### 5. Sistema de Autenticación y Administración ✅
- [x] **Autenticación**
  - Sistema de usuarios con roles (admin, user)
  - JWT para autenticación segura
  - Guards para proteger rutas
  - Modo invitado (sin login)
- [x] **Panel de Administración**
  - Interfaz para activar/desactivar elementos
  - Modificación de habilidades, cartas y personajes
  - Solo accesible para administradores
  - Interfaz responsive y temática
- [ ] Stack de efectos (múltiples efectos simultáneos)

#### 6. Panel de Configuración
- [ ] Interfaz para modificar habilidades
- [ ] Cambio de valores de efectos
- [ ] Activación/desactivación de habilidades

### Estructura de Datos Propuesta

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
}

interface Effect {
  type: 'burn' | 'paralysis' | 'freeze' | 'shield' | 'counter';
  duration: number;
  value?: number;
  active: boolean;
}

interface PlayerStatus {
  effects: Effect[];
  shields: number;
  cooldowns: Record<string, number>;
}
```

### Entregables
- ✅ Sistema completo de habilidades
- ✅ Todos los efectos de estado implementados
- ✅ Panel de configuración de habilidades
- ✅ Sistema modular y extensible

### Criterios de Éxito
- Todas las habilidades funcionan correctamente
- Los efectos se aplican y expiran automáticamente
- Se pueden modificar valores desde MongoDB sin cambiar código
- El sistema es extensible para nuevas habilidades
- Todas las acciones se registran en MongoDB para análisis

---

## 🎯 FASE 3: Panel de Balanceo (3 días)

### Objetivo
Crear una interfaz de administración que permita ajustar valores del juego en tiempo real.

### Estado: ✅ Completada (Días 18-20)

### Funcionalidades Requeridas

#### 1. Panel de Control Principal ✅
- [x] Dashboard de configuración
- [x] Navegación entre secciones
- [x] Guardado de cambios
- [x] Carga de configuraciones guardadas

#### 2. Ajuste de Personajes ✅
- [x] Modificar puntos de vida iniciales
- [x] Cambiar estadísticas base (ataque, defensa, velocidad, esquiva, acierto)
- [x] Ajustar atributos (resistencias, inmunidades)
- [x] Selección de imagen con preview
- [x] Activación/desactivación de personajes

#### 3. Ajuste de Cartas ✅
- [x] Modificar daño de cartas
- [x] Cambiar efectos de cartas
- [x] Ajustar coste de cartas
- [x] Modificar tipo y objetivo
- [x] Selección de imagen con preview
- [x] Activación/desactivación de cartas

#### 4. Ajuste de Habilidades ✅
- [x] Modificar cooldown
- [x] Cambiar daño/efectos
- [x] Ajustar coste de recursos
- [x] Activar/desactivar habilidades
- [x] Modificar tipo y objetivo

#### 5. Ajuste de Efectos ✅
- [x] Ajuste de balance general (mano inicial, cartas por turno, acciones por turno)
- [x] Modificación de parámetros globales del juego

#### 6. Sistema de Presets ✅
- [x] Guardar configuración como preset
- [x] Cargar preset guardado
- [x] Comparar configuraciones
- [x] Eliminar presets

### Entregables
- ✅ Panel de administración completo
- ✅ Todas las variables ajustables
- ✅ Sistema de presets
- ✅ Guardado persistente de configuraciones

### Criterios de Éxito
- Se pueden modificar todos los valores del juego en MongoDB
- Los cambios se aplican inmediatamente
- Las configuraciones se guardan en MongoDB
- Sistema de versionado de balance funcional
- La interfaz es intuitiva y fácil de usar

---

## 🎯 FASE 4: Métricas y Analytics (5 días)

### Objetivo
Implementar un sistema de recolección y visualización de estadísticas para balanceo basado en datos.

### Funcionalidades Requeridas

#### 1. Recolección de Datos
- [ ] Guardar todas las partidas en MongoDB (colección `games`)
- [ ] Registrar todas las acciones en MongoDB (colección `gameActions`)
- [ ] Captura de estado final de partida
- [ ] Timestamp de eventos importantes
- [ ] Asociar partidas con versión de balance usada

#### 2. Métricas de Personajes
- [ ] % de victorias por personaje
- [ ] Tasa de uso de personajes
- [ ] PV promedio al finalizar partida
- [ ] Turnos promedio de supervivencia

#### 3. Métricas de Cartas
- [ ] Cartas más jugadas
- [ ] Cartas menos utilizadas
- [ ] Tasa de éxito de cartas
- [ ] Daño promedio por carta

#### 4. Métricas de Partidas
- [ ] Duración promedio de partidas
- [ ] Número de turnos promedio
- [ ] Tasa de abandono
- [ ] Distribución de resultados

#### 5. Dashboard de Estadísticas
- [ ] Queries agregadas en MongoDB para calcular métricas
- [ ] Visualización de métricas principales
- [ ] Gráficos de tendencias
- [ ] Filtros por fecha/rango/versión de balance
- [ ] Exportación de datos (CSV/JSON)
- [ ] Actualización automática de colecciones de analytics

#### 6. Análisis Avanzado
- [ ] Correlaciones entre personajes y victorias
- [ ] Análisis de balance (win rate por personaje)
- [ ] Detección de estrategias dominantes
- [ ] Recomendaciones de balanceo

### Estructura de Datos en MongoDB

Ver [Schemas de MongoDB](./MONGODB_SCHEMAS.md) para la estructura completa.

**Colecciones principales:**
- `games` - Partidas completadas
- `gameActions` - Acciones de cada partida
- `characterAnalytics` - Estadísticas por personaje
- `cardAnalytics` - Estadísticas por carta
- `playerStats` - Estadísticas por jugador
- `balanceVersions` - Historial de versiones de balance

### Entregables
- ✅ Sistema completo de tracking
- ✅ Dashboard de estadísticas
- ✅ Métricas clave implementadas
- ✅ Exportación de datos

### Criterios de Éxito
- Se registran todas las partidas en MongoDB
- Todas las acciones se guardan en `gameActions`
- Las métricas se calculan desde MongoDB usando agregaciones
- Los analytics se actualizan automáticamente
- El dashboard es claro y útil
- Los datos se pueden exportar
- Se puede comparar balance entre versiones

---

## 📊 Resumen de Fases

| Fase | Duración | Complejidad | Prioridad |
|------|----------|-------------|-----------|
| FASE 1 | 7 días | Media | 🔴 Crítica |
| FASE 2 | 10 días | Alta | 🔴 Crítica |
| FASE 3 | 3 días | Baja | 🟡 Alta |
| FASE 4 | 5 días | Media | 🟡 Alta |

## 🎯 Objetivos Finales

Al completar las 4 fases, el prototipo debe permitir:

1. ✅ Jugar partidas completas con todas las mecánicas
2. ✅ Ajustar balance rápidamente desde un panel
3. ✅ Obtener datos objetivos sobre el juego
4. ✅ Iterar rápidamente sobre diferentes versiones
5. ✅ Validar el juego antes de la producción física

## 📝 Notas Importantes

- **Modularidad**: Todo debe ser configurable desde JSON
- **Extensibilidad**: El sistema debe permitir agregar nuevas habilidades/efectos fácilmente
- **Performance**: No es crítico en MVP, pero mantener código limpio
- **Testing**: Priorizar funcionalidad sobre tests unitarios en MVP
- **Documentación**: Documentar decisiones importantes y estructuras de datos

---

**Última actualización**: [Fecha]
**Estado**: 🟡 En Planificación

