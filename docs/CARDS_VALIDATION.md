# Validación de Cartas - Cosmos Combat

## ⚠️ IMPORTANTE: Sistema de Juego Real

Según las reglas del juego:
- **Ataque básico**: Siempre inflige **1 punto de daño**
- **Sistema de defensa con dados**: NO está implementado
  - Regla: "Si el ataque y la defensa son del mismo tipo (ataque básico - defensa básica), lanza los dados. El mayor resultado gana."
  - Regla: "Si juegas una defensa de mayor nivel que el ataque (ataque básico - carta de habilidad defensiva), no necesitas dados. La defensa gana automáticamente."
- **Cartas de defensa**: Actualmente solo aplican escudos o efectos, no hay sistema de defensa básica vs ataque básico

## Cartas por Tipo

### Tipo: Attack

#### 1. Golpe Potenciado
- **ID**: `golpe-potenciado`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 0 (efecto temporal) ✅
- **Efectos**: `power-strike` (duration: 1, value: 1) - +1 daño siguiente ataque ✅
- **Target**: self ✅
- **Descripción**: "Aumenta temporalmente la fuerza de tus ataques, infligiendo un mayor daño a los oponentes. (+1 Daño del siguiente ataque)"
- **Cantidad en mazo**: 10 ✅
- **Estado**: ✅ CORRECTO

#### 2. Ataque Eléctrico
- **ID**: `ataque-electrico`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 1 ✅
- **Efectos**: `paralysis` (duration: 1) - Parálisis 1 turno ✅
- **Target**: single ✅
- **Descripción**: "Realiza un ataque elemental eléctrico. (1 daño. Parálisis 1 turno)"
- **Cantidad en mazo**: 4 ✅
- **Estado**: ✅ CORRECTO

#### 3. Ataque Fuego
- **ID**: `ataque-fuego`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 1 ✅
- **Efectos**: `burn` (duration: 1) - Quemadura: descartar carta ✅
- **Target**: single ✅
- **Descripción**: "Realiza un ataque elemental de fuego. (1 daño. Quemadura: descartas una carta de tu mano)"
- **Cantidad en mazo**: 4 ✅
- **Estado**: ✅ CORRECTO

#### 4. Ataque Hielo
- **ID**: `ataque-hielo`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 1 ✅
- **Efectos**: `freeze` (duration: 1, value: 1) - Congelación: -1 acción ✅
- **Target**: single ✅
- **Descripción**: "Realiza un ataque elemental de hielo. (1 daño. Congelación: 1 punto de acción)"
- **Cantidad en mazo**: 4 ✅
- **Estado**: ✅ CORRECTO

#### 5. Embate Furioso
- **ID**: `embate-furioso`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 0 (daño por dado) ✅
- **Target**: all ✅
- **Descripción**: "Realiza un ataque físico a los enemigos. Tira un dado tantas veces como jugadores en juego. Inflige 1 de daño físico a todos por cada tirada superior a 3."
- **Cantidad en mazo**: 3 ✅
- **Estado**: ✅ CORRECTO (daño especial por dado implementado)

#### 6. Implosión Energética
- **ID**: `implosion-energetica`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 2 ✅
- **Efectos**: `stun` (duration: 1) - Aturdido: no puede jugar cartas ✅
- **Target**: all ✅
- **Descripción**: "Realiza un ataque de área que afecta a todos los luchadores enemigos. Cada enemigo recibe 2 puntos de daño elemental. Además, todos quedan aturdidos durante 1 turno, lo que les impide jugar cartas en su siguiente turno, solo ataques básicos."
- **Cantidad en mazo**: 2 ✅
- **Estado**: ✅ CORRECTO

#### 7. Rayos Cósmicos
- **ID**: `rayos-cosmicos`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 0 (daño por dado) ✅
- **Target**: all ✅
- **Descripción**: "Realiza un ataque elemental a los enemigos. Tira un dado tantas veces como jugadores en juego. Inflige 1 de daño elemental a todos por cada tirada superior a 3."
- **Cantidad en mazo**: 3 ✅
- **Estado**: ✅ CORRECTO (daño especial por dado implementado)

#### 8. Robo de Vida
- **ID**: `robo-de-vida`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 0 (daño variable, cura igual al daño) ⚠️
- **Curación**: 0 (cura igual al daño infligido) ⚠️
- **Target**: single ✅
- **Descripción**: "Absorbe la vitalidad del oponente al realizar un ataque exitoso, curando tus propios puntos de vida."
- **Cantidad en mazo**: 6 ✅
- **Estado**: ⚠️ REVISAR - El daño y curación están en 0, pero la descripción dice que debe hacer daño y curar igual. Necesita implementación especial.

#### 9. Explosión Elemental
- **ID**: `explosion-elemental`
- **Tipo**: attack
- **Costo**: 0 ✅
- **Daño**: 1 ✅
- **Target**: all ✅
- **Descripción**: "Desata una explosión de energía elemental que afecta a todos los luchadores en un área, causando daño elemental (1 daño a todos, no se puede defender)."
- **Cantidad en mazo**: 6 ✅
- **Estado**: ✅ CORRECTO (nota: "no se puede defender" podría necesitar implementación especial)

### Tipo: Defense

#### 10. Barrera Defensiva
- **ID**: `barrera-defensiva`
- **Tipo**: defense
- **Costo**: 0 ✅
- **Defensa**: 1 (-1 daño recibido) ⚠️
- **Target**: self ✅
- **Descripción**: "Crea una barrera protectora que reduce todo el daño recibido durante el próximo turno. (-1 Daño)"
- **Cantidad en mazo**: 8 ✅
- **Estado**: ⚠️ REVISAR - El campo `defense` no está implementado en el sistema de daño. Podría necesitar un efecto especial o cambiar a `shield`

#### 11. Escudo Reflectante
- **ID**: `escudo-reflectante`
- **Tipo**: defense
- **Costo**: 0 ✅
- **Shield**: 0 (refleja mitad del daño) ⚠️
- **Efectos**: `counter` (duration: 1, value: 0.5) - Refleja 50% del daño ✅
- **Target**: self ✅
- **Descripción**: "Crea un escudo que refleja la mitad del daño recibido hacia el atacante. (mínimo 1 de daño)"
- **Cantidad en mazo**: 8 ✅
- **Estado**: ✅ CORRECTO (el shield 0 es correcto porque el efecto es counter)

#### 12. Contraataque
- **ID**: `contraataque`
- **Tipo**: defense
- **Costo**: 0 ✅
- **Efectos**: `counter` (duration: 1, value: 1) - Devuelve todo el daño ✅
- **Target**: self ✅
- **Descripción**: "Responde al ataque enemigo con un golpe certero y preciso, devolviendo el daño al oponente que te atacó."
- **Cantidad en mazo**: 5 ✅
- **Estado**: ✅ CORRECTO

### Tipo: Utility

#### 13. Sanación Rápida
- **ID**: `sanacion-rapida`
- **Tipo**: utility
- **Costo**: 0 ✅
- **Curación**: 3 ✅
- **Target**: self ✅
- **Descripción**: "Recupera 3 puntos de vida para mantener tu resistencia en la batalla."
- **Cantidad en mazo**: 6 ✅
- **Estado**: ✅ CORRECTO

#### 14. Telequinesis
- **ID**: `telequinesis`
- **Tipo**: utility
- **Costo**: 0 ✅
- **Target**: single ✅
- **Descripción**: "Puedes robar una carta de la mano de otro jugador y añadirla a tu mano."
- **Cantidad en mazo**: 8 ✅
- **Estado**: ⚠️ REVISAR - No tiene efectos ni daño/curación, necesita implementación especial para robar carta del oponente

#### 15. Energía Vital
- **ID**: `energia-vital`
- **Tipo**: utility
- **Costo**: 0 ✅
- **Curación**: 4 ✅
- **Efectos**: 
  - `physical-resistance` (duration: 2, value: 1) - +1 resistencia ✅
  - `action-limit` (duration: 2, value: 1) - Solo 1 acción ✅
- **Target**: self ✅
- **Descripción**: "Recupera 4 puntos de vida. Además, durante los próximos 2 turnos, aumenta tu resistencia al daño +1, pero sólo puedes jugar 1 acción en tu turno."
- **Cantidad en mazo**: 2 ✅
- **Estado**: ✅ CORRECTO

## Resumen de Validación

### ✅ Cartas Correctas (13/15):
1. Golpe Potenciado
2. Ataque Eléctrico
3. Ataque Fuego
4. Ataque Hielo
5. Embate Furioso
6. Implosión Energética
7. Rayos Cósmicos
8. Explosión Elemental
9. Barrera Defensiva
10. Escudo Reflectante
11. Contraataque
12. Sanación Rápida
13. Energía Vital

### ⚠️ Cartas que Necesitan Revisión (2/15):

#### 1. Robo de Vida (`robo-de-vida`)
- **Problema**: Daño y curación están en 0
- **Descripción**: "Absorbe la vitalidad del oponente al realizar un ataque exitoso, curando tus propios puntos de vida."
- **Necesita**: Implementación especial que:
  - Haga daño basado en el ataque del jugador (o un valor fijo)
  - Cure al jugador igual al daño infligido
- **Sugerencia**: Podría usar el ataque base del personaje como daño, o un valor fijo como 2-3

#### 2. Telequinesis (`telequinesis`)
- **Problema**: No tiene efectos, daño, curación ni shield
- **Descripción**: "Puedes robar una carta de la mano de otro jugador y añadirla a tu mano."
- **Necesita**: Implementación especial para:
  - Seleccionar un objetivo
  - Robar una carta aleatoria de su mano
  - Añadirla a tu mano
- **Sugerencia**: Podría ser un efecto especial tipo `steal-card` que se procese de forma única

### 📊 Distribución del Mazo (Total: 79 cartas):

| Carta | Cantidad | Tipo |
|-------|----------|------|
| Golpe Potenciado | 10 | attack |
| Barrera Defensiva | 8 | defense |
| Ataque Eléctrico | 4 | attack |
| Ataque Fuego | 4 | attack |
| Ataque Hielo | 4 | attack |
| Sanación Rápida | 6 | utility |
| Telequinesis | 8 | utility |
| Embate Furioso | 3 | attack |
| Implosión Energética | 2 | attack |
| Energía Vital | 2 | utility |
| Rayos Cósmicos | 3 | attack |
| Escudo Reflectante | 8 | defense |
| Robo de Vida | 6 | attack |
| Contraataque | 5 | defense |
| Explosión Elemental | 6 | attack |
| **TOTAL** | **79** | |

### 🔍 Observaciones:
- ✅ Todas las cartas tienen costo 0 (correcto según las reglas)
- ✅ La distribución parece balanceada
- ✅ Hay variedad de tipos: attack, defense, utility
- ✅ Hay cartas de área (all) y de objetivo único (single)
- ✅ Los efectos están bien definidos
- ⚠️ 2 cartas necesitan implementación especial de mecánicas

### 📝 Notas Técnicas:
- Las cartas con daño por dado (Embate Furioso, Rayos Cósmicos) ya están implementadas correctamente
- Los efectos están bien mapeados a los tipos del balance
- Todas las cartas están activas (isActive: true)

### ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS:

#### 1. Sistema de Defensa NO Implementado
- **Problema**: No existe sistema de defensa básica vs ataque básico con dados
- **Regla**: "Si el ataque y la defensa son del mismo tipo (ataque básico - defensa básica), lanza los dados. El mayor resultado gana."
- **Estado actual**: NO implementado
- **Cartas afectadas**: `barrera-defensiva` tiene campo `defense: 1` que no se usa

#### 2. Campo `defense` en Cartas
- **Problema**: Las cartas tienen campo `defense` pero no se procesa en el sistema de daño
- **Solución necesaria**: 
  - Implementar sistema de defensa básica con dados, O
  - Convertir `defense` a un efecto que reduzca daño, O
  - Eliminar el campo si no se va a usar

#### 3. Cartas que Necesitan Implementación Especial
- `robo-de-vida`: Necesita hacer daño variable y curar igual al daño
- `telequinesis`: Necesita robar carta del oponente

