# Validación de Personajes - Cosmos Combat

## ⚠️ IMPORTANTE: Sistema de Juego Real

Según las reglas del juego:
- **Ataque básico**: Siempre inflige **1 punto de daño** (no usa stats de ataque)
- **Stats de ataque/defensa**: NO se usan en el combate básico
- **Solo importa**: HP máximo del personaje
- **Sistema de defensa con dados**: NO está implementado
- **Orden de turnos**: Se determina con **lanzamiento de dados** (NO con velocidad)
  - Cada jugador tira un dado (1-6)
  - El mayor resultado va primero
  - En caso de empate, se re-tira o se mantiene orden

## Personajes por ID

### 1. Ironclad
- **ID**: `ironclad`
- **Nombre**: Ironclad
- **Descripción**: "Un guerrero blindado con alta resistencia física"
- **HP Máximo**: 22 ⚠️ (Actual en BD: 100 - INCORRECTO, debe ser 22)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 10 (no se usa) ⚠️
  - Defensa: 5 (no se usa) ⚠️
  - Velocidad: 3 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 0 (no implementado) ⚠️
  - Acierto: 0 (no implementado) ⚠️
- **Atributos** (resistencias e inmunidades):
  - Resistencia Física: 1 ✅
  - Resistencia Fuego: 0 ✅
  - Resistencia Frío: 0 ✅
  - Inmunidad Parálisis: false ✅
- **Habilidades**: 
  - `golpe-poderoso` ✅
  - `armadura-fortificada` ✅
  - `contraataque-skill` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

### 2. Blaze
- **ID**: `blaze`
- **Nombre**: Blaze
- **Descripción**: "Maestro del fuego con ataques ardientes"
- **HP Máximo**: 18 ⚠️ (Actual en BD: 80 - INCORRECTO, debe ser 18)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 12 (no se usa) ⚠️
  - Defensa: 3 (no se usa) ⚠️
  - Velocidad: 4 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 0 (no implementado) ⚠️
  - Acierto: 0 (no implementado) ⚠️
- **Atributos**:
  - Resistencia Física: 0 ✅
  - Resistencia Fuego: 2 ✅
  - Resistencia Frío: 0 ✅
  - Inmunidad Parálisis: false ✅
- **Habilidades**: 
  - `lanzamiento-fuego` ✅
  - `escudo-ardiente` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

### 3. Frost
- **ID**: `frost`
- **Nombre**: Frost
- **Descripción**: "Guerrero del hielo que congela a sus enemigos"
- **HP Máximo**: 15 ⚠️ (Actual en BD: 90 - INCORRECTO, debe ser 15)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 9 (no se usa) ⚠️
  - Defensa: 4 (no se usa) ⚠️
  - Velocidad: 4 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 0 (no implementado) ⚠️
  - Acierto: 0 (no implementado) ⚠️
- **Atributos**:
  - Resistencia Física: 0 ✅
  - Resistencia Fuego: 0 ✅
  - Resistencia Frío: 2 ✅
  - Inmunidad Parálisis: false ✅
- **Habilidades**: 
  - `escudo-hielo` ✅
  - `inmovilizacion` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

### 4. Thunder
- **ID**: `thunder`
- **Nombre**: Thunder
- **Descripción**: "Guerrero eléctrico con velocidad relámpago"
- **HP Máximo**: 17 ⚠️ (Actual en BD: 85 - INCORRECTO, debe ser 17)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 11 (no se usa) ⚠️
  - Defensa: 3 (no se usa) ⚠️
  - Velocidad: 5 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 0 (no implementado) ⚠️
  - Acierto: 1 (no implementado) ⚠️
- **Atributos**:
  - Resistencia Física: 0 ✅
  - Resistencia Fuego: 0 ✅
  - Resistencia Frío: 0 ✅
  - Inmunidad Parálisis: true ✅ (Tiene sentido para un personaje eléctrico)
- **Habilidades**: 
  - `descarga-electrica` ✅
  - `velocidad-estatica` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

### 5. Shadow
- **ID**: `shadow`
- **Nombre**: Shadow
- **Descripción**: "Asesino sigiloso con ataques críticos"
- **HP Máximo**: 16 ⚠️ (Actual en BD: 90 - INCORRECTO, debe ser 16)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 8 (no se usa) ⚠️
  - Defensa: 4 (no se usa) ⚠️
  - Velocidad: 5 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 2 (no implementado) ⚠️
  - Acierto: 1 (no implementado) ⚠️
- **Atributos**:
  - Resistencia Física: 0 ✅
  - Resistencia Fuego: 0 ✅
  - Resistencia Frío: 0 ✅
  - Inmunidad Parálisis: false ✅
- **Habilidades**: 
  - `salto-acrobatico` ✅
  - `camuflaje` ✅
  - `ataque-furtivo` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

### 6. Strike
- **ID**: `strike`
- **Nombre**: Strike
- **Descripción**: "Luchador equilibrado y versátil"
- **HP Máximo**: 20 ⚠️ (Actual en BD: 95 - INCORRECTO, debe ser 20)
- **Stats Base** (NO se usan en combate básico):
  - Ataque: 9 (no se usa) ⚠️
  - Defensa: 4 (no se usa) ⚠️
  - Velocidad: 4 (no se usa - orden de turnos se determina con dados) ⚠️
  - Esquivar: 1 (no implementado) ⚠️
  - Acierto: 0 (no implementado) ⚠️
- **Atributos**:
  - Resistencia Física: 0 ✅
  - Resistencia Fuego: 0 ✅
  - Resistencia Frío: 0 ✅
  - Inmunidad Parálisis: false ✅
- **Habilidades**: 
  - `golpe-poderoso` ✅
- **Mazo**: fullDeck (79 cartas compartidas) ✅
- **Estado**: ⚠️ REVISAR - HP y stats no se usan según reglas

## Resumen de Validación

### ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS:

#### 1. Sistema de Combate Incorrecto
- **Problema**: El código actual usa `baseStats.attack` para calcular daño del ataque básico
- **Regla del juego**: El ataque básico siempre debe infligir **1 punto de daño**
- **Ubicación del error**: `game.service.ts` línea 991: `const attackPower = attackerChar.baseStats.attack;`
- **Solución necesaria**: Cambiar a `const damage = 1;` (ataque básico siempre 1)

#### 2. Stats No Utilizados
- Los personajes tienen `baseStats.attack` y `baseStats.defense` que NO se usan según las reglas
- `baseStats.speed` NO se usa (el orden de turnos se determina con dados, no con velocidad)
- `baseStats.dodge` y `baseStats.accuracy` no están implementados

#### 3. Orden de Turnos Incorrecto
- **Problema**: El código actual usa `baseStats.speed` para determinar orden de turnos
- **Regla del juego**: El orden se determina con lanzamiento de dados (cada jugador tira 1 dado, mayor resultado va primero)
- **Ubicación del error**: `game.service.ts` línea 174-181
- **Solución necesaria**: Implementar sistema de dados para determinar orden de turnos

#### 4. Sistema de Defensa con Dados NO Implementado
- **Regla**: "Si el ataque y la defensa son del mismo tipo (ataque básico - defensa básica), lanza los dados. El mayor resultado gana."
- **Estado actual**: NO implementado
- **Necesita**: Sistema de defensa básica con tirada de dados

### 📊 Valores CORRECTOS vs Actuales en Base de Datos:

| Personaje | HP CORRECTO | HP Actual (BD) | Diferencia | Habilidades |
|-----------|-------------|---------------|------------|-------------|
| Ironclad  | 22          | 100           | -78        | 3           |
| Blaze     | 18          | 80            | -62        | 2           |
| Frost     | 15          | 90            | -75        | 2           |
| Thunder   | 17          | 85            | -68        | 2           |
| Shadow    | 16          | 90            | -74        | 3           |
| Strike    | 20          | 95            | -75        | 1           |

**⚠️ TODOS los HP están incorrectos y deben actualizarse**

### ⚠️ Problemas a Corregir:

1. **Ataque básico incorrecto**: 
   - Actual: Usa `baseStats.attack` (10, 12, 9, etc.)
   - Debería ser: Siempre 1 punto de daño

2. **HP de personajes INCORRECTOS**: 
   - Valores actuales en BD: 100, 80, 90, 85, 90, 95
   - Valores CORRECTOS: 22, 18, 15, 17, 16, 20
   - **ACCIÓN REQUERIDA**: Actualizar todos los HP en seed y BD

3. **Orden de turnos incorrecto**:
   - Actual: Usa velocidad (`baseStats.speed`)
   - Debería ser: Lanzamiento de dados (cada jugador tira 1 dado, mayor resultado va primero)
   - **ACCIÓN REQUERIDA**: Cambiar sistema de orden de turnos

4. **Sistema de defensa básica**: 
   - NO implementado
   - Necesita: Tirada de dados cuando ataque básico vs defensa básica

5. **Stats innecesarios**: 
   - `baseStats.attack`, `baseStats.defense`, `baseStats.speed`, `baseStats.dodge`, `baseStats.accuracy` no se usan
   - Podrían eliminarse o marcarse como no usados (solo se mantienen por compatibilidad del schema)

6. **Habilidades compartidas**: 
   - `golpe-poderoso` está asignada tanto a Ironclad como a Strike - verificar si es intencional

7. **Mazo compartido**: 
   - Todos los personajes usan el mismo mazo (fullDeck) - ✅ CORRECTO según reglas

---

## 📋 Plan de Corrección

Ver documento: `CORRECCIONES_PLAN.md` para el plan detallado de implementación.

