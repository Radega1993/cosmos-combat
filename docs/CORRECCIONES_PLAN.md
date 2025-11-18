# Plan de Correcciones - Cosmos Combat

**Fecha**: Noviembre 2025  
**Objetivo**: Corregir el juego para que funcione según las reglas reales  
**Estado**: ✅ FASE 1-3 COMPLETADAS

---

## 📋 Resumen de Problemas Identificados

### 🔴 CRÍTICOS (Afectan funcionalidad básica)

1. **Ataque básico incorrecto** - Usa stats de ataque en lugar de 1 punto fijo
2. **HP de personajes incorrectos** - Valores en BD no coinciden con los reales
3. **Orden de turnos incorrecto** - Usa velocidad en lugar de dados
4. **Sistema de defensa con dados NO implementado**

### 🟡 IMPORTANTES (Afectan balance)

5. **Stats de ataque/defensa no se usan** - Están en la BD pero no se utilizan
6. **Campo `defense` en cartas no se procesa**
7. **Cartas especiales sin implementar** (`robo-de-vida`, `telequinesis`)

---

## 🎯 Valores Correctos de Personajes

| Personaje | HP Máximo (CORRECTO) | HP Actual (BD) | Diferencia |
|-----------|---------------------|----------------|------------|
| Ironclad  | 22                  | 100            | -78        |
| Blaze     | 18                  | 80             | -62        |
| Shadow    | 16                  | 90             | -74        |
| Thunder   | 17                  | 85             | -68        |
| Strike    | 20                  | 95             | -75        |
| Frost     | 15                  | 90             | -75        |

---

## 📝 Plan de Acción Detallado

### FASE 1: Corrección de Datos Base (Prioridad ALTA)

#### 1.1 Actualizar HP de Personajes
- **Archivo**: `backend/src/database/seed.ts`
- **Cambios**:
  ```typescript
  ironclad: maxHp: 22  // era 100
  blaze: maxHp: 18      // era 80
  shadow: maxHp: 16     // era 90
  thunder: maxHp: 17    // era 85
  strike: maxHp: 20     // era 95
  frost: maxHp: 15      // era 90
  ```
- **Script de actualización**: Crear script para actualizar BD
- **Tiempo estimado**: 15 min

#### 1.2 Actualizar GameBalance con HP correctos
- **Archivo**: `backend/src/database/seed.ts` (gameBalance.characters)
- **Cambios**: Actualizar maxHp en balance para cada personaje
- **Tiempo estimado**: 10 min

### FASE 2: Corrección de Mecánicas de Combate (Prioridad ALTA)

#### 2.1 Corregir Ataque Básico
- **Archivo**: `backend/src/game/game.service.ts`
- **Línea**: ~991
- **Cambio actual**:
  ```typescript
  const attackPower = attackerChar.baseStats.attack;
  const damage = attackPower;
  ```
- **Cambio necesario**:
  ```typescript
  const damage = 1; // Ataque básico siempre es 1 punto de daño
  ```
- **Impacto**: Los ataques básicos ahora harán 1 punto de daño siempre
- **Tiempo estimado**: 5 min

#### 2.2 Cambiar Orden de Turnos a Dados
- **Archivo**: `backend/src/game/game.service.ts`
- **Línea**: ~174-181
- **Cambio actual**:
  ```typescript
  // Determine turn order by speed (higher speed goes first)
  turnOrder.sort((a, b) => {
    // ... ordena por velocidad
  });
  ```
- **Cambio necesario**:
  ```typescript
  // Determine turn order by dice roll (higher roll goes first)
  // Cada jugador tira un dado (1-6), mayor resultado va primero
  const diceRolls: Array<{playerId: string, roll: number}> = [];
  for (const playerId of turnOrder) {
    const roll = Math.floor(Math.random() * 6) + 1;
    diceRolls.push({playerId, roll});
  }
  // Ordenar por resultado de dado (mayor primero)
  diceRolls.sort((a, b) => b.roll - a.roll);
  turnOrder = diceRolls.map(d => d.playerId);
  // En caso de empate, mantener orden original o re-tirar
  ```
- **Impacto**: El orden de turnos se determina aleatoriamente con dados
- **Tiempo estimado**: 20 min

### FASE 3: Sistema de Defensa con Dados (Prioridad MEDIA)

#### 3.1 Implementar Defensa Básica
- **Regla**: "Si el ataque y la defensa son del mismo tipo (ataque básico - defensa básica), lanza los dados. El mayor resultado gana."
- **Archivo**: `backend/src/game/game.service.ts`
- **Necesita**:
  - Detectar cuando se juega una carta de defensa básica
  - Si hay un ataque básico pendiente, comparar con tirada de dados
  - Si defensa es carta de habilidad vs ataque básico, defensa gana automáticamente
- **Tiempo estimado**: 1-2 horas

#### 3.2 Procesar Campo `defense` en Cartas
- **Archivo**: `backend/src/game/game.service.ts` (método `playCard`)
- **Problema**: Campo `defense` no se procesa
- **Solución**: 
  - Opción A: Convertir a efecto que reduzca daño recibido
  - Opción B: Implementar sistema de defensa básica
- **Tiempo estimado**: 30 min - 1 hora

### FASE 4: Cartas Especiales (Prioridad MEDIA)

#### 4.1 Implementar Robo de Vida
- **Carta**: `robo-de-vida`
- **Funcionalidad**: 
  - Hacer daño variable (usar ataque base del personaje o valor fijo)
  - Curar al jugador igual al daño infligido
- **Tiempo estimado**: 30 min

#### 4.2 Implementar Telequinesis
- **Carta**: `telequinesis`
- **Funcionalidad**:
  - Seleccionar objetivo
  - Robar carta aleatoria de su mano
  - Añadirla a tu mano
- **Tiempo estimado**: 45 min

### FASE 5: Limpieza y Optimización (Prioridad BAJA)

#### 5.1 Eliminar o Marcar Stats No Usados
- **Stats que no se usan**: `baseStats.attack`, `baseStats.defense`, `baseStats.dodge`, `baseStats.accuracy`
- **Opciones**:
  - Eliminar del schema (breaking change)
  - Mantener pero documentar que no se usan
  - Marcar como deprecated
- **Tiempo estimado**: 30 min

#### 5.2 Actualizar Documentación
- Actualizar `CHARACTERS_VALIDATION.md` con valores correctos
- Actualizar `CARDS_VALIDATION.md` con estado de implementación
- Actualizar `SKILLS_VALIDATION.md` si es necesario
- **Tiempo estimado**: 20 min

---

## 🔧 Scripts Necesarios

### Script 1: Actualizar HP de Personajes en BD
```javascript
// backend/scripts/update-character-hp.js
const characters = {
  ironclad: 22,
  blaze: 18,
  shadow: 16,
  thunder: 17,
  strike: 20,
  frost: 15,
};
```

### Script 2: Actualizar HP en GameBalance
```javascript
// Actualizar balance.characters con nuevos HP
```

---

## 📊 Orden de Implementación Recomendado

1. ✅ **FASE 1**: Actualizar HP (15-25 min) - CRÍTICO - **COMPLETADO**
2. ✅ **FASE 2.1**: Corregir ataque básico (5 min) - CRÍTICO - **COMPLETADO**
3. ✅ **FASE 2.2**: Cambiar orden de turnos (20 min) - CRÍTICO - **COMPLETADO**
4. ✅ **FASE 3**: Sistema de defensa (1-2 horas) - IMPORTANTE - **COMPLETADO**
5. ⏳ **FASE 4**: Cartas especiales (1.5 horas) - IMPORTANTE - **PENDIENTE**
6. ⏳ **FASE 5**: Limpieza (50 min) - OPCIONAL - **PENDIENTE**

**Tiempo total estimado**: 3-4 horas para fases críticas, 5-6 horas para completar todo  
**Progreso actual**: ✅ 4 de 6 fases completadas (67%)

---

## ⚠️ Consideraciones Importantes

### Breaking Changes
- Cambiar HP afectará partidas en curso (si las hay)
- Cambiar orden de turnos cambiará la mecánica del juego
- Cambiar ataque básico afectará el balance actual

### Testing Necesario
- Probar que los HP correctos se cargan
- Probar que el ataque básico hace 1 punto de daño
- Probar que el orden de turnos se determina con dados
- Probar sistema de defensa (cuando se implemente)

### Compatibilidad
- Las partidas en curso podrían tener problemas si se cambian los HP
- Considerar migración de datos si hay partidas guardadas

---

## 📝 Notas Adicionales

- Los stats de velocidad, ataque, defensa están en la BD pero no se usan según las reglas
- El sistema actual funciona pero no coincide con las reglas del juego
- Es importante actualizar la documentación después de cada cambio

