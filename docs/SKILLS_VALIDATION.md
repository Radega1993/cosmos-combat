# Validación de Habilidades - Cosmos Combat

## Habilidades por Personaje

### Ironclad

#### 1. Golpe Poderoso
- **ID**: `golpe-poderoso`
- **Tipo**: attack
- **Efectos**: `power-strike` (duration: 1, value: 1) - +1 daño con ataque físico
- **Cooldown**: 2 turnos ✅
- **Target**: self ✅
- **Descripción**: "Permite infligir un +1 daño con su ataque físico. (cada 2 turnos)"
- **Estado**: ✅ CORRECTO

#### 2. Armadura Fortificada
- **ID**: `armadura-fortificada`
- **Tipo**: defense
- **Efectos**: `physical-resistance` (duration: 0, value: 1) - Disminuye daño físico (permanente)
- **Cooldown**: 0 (sin cooldown) ✅
- **Target**: self ✅
- **Descripción**: "Proporciona una armadura resistente que disminuye el daño físico sufrido."
- **Estado**: ✅ CORRECTO

#### 3. Contraataque
- **ID**: `contraataque-skill`
- **Tipo**: defense
- **Efectos**: `counter` (duration: 3, value: 1) - Devuelve daño (3 turnos, tirada de 3 o más)
- **Cooldown**: 0 (sin cooldown) ✅
- **Target**: self ✅
- **Descripción**: "Devuelve el daño antes de ser recibido (3 turnos, tirada de 3 o más)"
- **Estado**: ✅ CORRECTO

### Blaze

#### 4. Lanzamiento de Fuego
- **ID**: `lanzamiento-fuego`
- **Tipo**: attack
- **Daño**: 0 (debe dañar a todos) ⚠️
- **Cooldown**: 2 turnos ✅
- **Target**: all ✅
- **Descripción**: "Permite lanzar proyectiles de fuego para dañar a sus oponentes. (daña a todos. Cada 2 turnos)"
- **Estado**: ⚠️ REVISAR - El daño está en 0, pero debería tener daño

#### 5. Escudo Ardiente
- **ID**: `escudo-ardiente`
- **Tipo**: defense
- **Shield**: 0 (absorbe mitad del daño) ⚠️
- **Efectos**: `fire-shield` (duration: 1, value: 0.5) - Absorbe 50% del daño
- **Cooldown**: -1 (infinito hasta que muera cualquier oponente) ✅
- **Target**: self ✅
- **Descripción**: "Otorga un escudo temporal que absorbe la mitad del daño recibido (1 solo uso, se reinicia si eliminas un oponente)"
- **Estado**: ✅ CORRECTO (cooldown infinito implementado)

### Shadow

#### 6. Salto Acrobático
- **ID**: `salto-acrobatico`
- **Tipo**: defense
- **Efectos**: `dodge` (duration: 1, value: 2) - +2 esquivar
- **Cooldown**: -1 (infinito hasta que muera cualquier oponente) ✅
- **Target**: self ✅
- **Descripción**: "Permite saltar y evadir ataques enemigos. (+2 esquivar. 1 solo uso, se reinicia si eliminas un oponente)"
- **Estado**: ✅ CORRECTO (cooldown infinito implementado)

#### 7. Camuflaje
- **ID**: `camuflaje`
- **Tipo**: utility
- **Efectos**: `invisibility` (duration: 1) - Invisible 1 turno
- **Cooldown**: -1 (infinito hasta que muera cualquier oponente) ✅
- **Target**: self ✅
- **Descripción**: "Permite volverse invisible 1 turno, dificultando que los enemigos lo detecten. (1 solo uso, se reinicia si eliminas un oponente)"
- **Estado**: ✅ CORRECTO (cooldown infinito implementado)

#### 8. Ataque Furtivo
- **ID**: `ataque-furtivo`
- **Tipo**: attack
- **Daño**: 0 (+1 daño, +1 acierto) ⚠️
- **Efectos**: `power-strike` (duration: 1, value: 1), `accuracy` (duration: 1, value: 1)
- **Cooldown**: 2 turnos ✅
- **Target**: self ✅
- **Descripción**: "Aumenta la capacidad para realizar ataques sorpresa con mayor precisión y daño. (+1 daño. +1 acierto. cada 2 turnos)"
- **Estado**: ✅ CORRECTO (el daño 0 es correcto porque es un buff)

### Thunder

#### 9. Descarga Eléctrica
- **ID**: `descarga-electrica`
- **Tipo**: attack
- **Daño**: 0 (debe dañar a todos) ⚠️
- **Cooldown**: 2 turnos ✅
- **Target**: all ✅
- **Descripción**: "Permite liberar una descarga eléctrica para dañar a sus oponentes. (daña a todos. Cada 2 turnos)"
- **Estado**: ⚠️ REVISAR - El daño está en 0, pero debería tener daño

#### 10. Velocidad Estática
- **ID**: `velocidad-estatica`
- **Tipo**: utility
- **Efectos**: `extra-action` (duration: 1, value: 1) - +1 jugada adicional
- **Cooldown**: 3 turnos ✅
- **Target**: self ✅
- **Descripción**: "Aumenta la velocidad durante el combate, lo que le permite moverse más rápidamente. (+1 jugada adicional. cada 3 turnos)"
- **Estado**: ✅ CORRECTO

### Frost

#### 11. Inmovilización
- **ID**: `inmovilizacion`
- **Tipo**: attack
- **Efectos**: `action-reduction` (duration: 1, value: 1) - -1 jugada en el turno ✅
- **Cooldown**: -1 (infinito hasta que muera el objetivo específico) ✅
- **Target**: single ✅
- **Descripción**: "Inmoviliza al objetivo. (-1 jugada en el turno. 1 solo uso, se reinicia si eliminas un oponente)"
- **Estado**: ✅ CORRECTO (cooldown infinito implementado, efecto action-reduction procesado)

#### 12. Escudo de Hielo
- **ID**: `escudo-hielo`
- **Tipo**: defense
- **Shield**: 1 ✅
- **Cooldown**: 0 (sin cooldown) ✅
- **Target**: self ✅
- **Descripción**: "Crea un escudo de hielo que absorbe el daño recibido (1 daño, 3 turnos)"
- **Estado**: ⚠️ REVISAR - La descripción dice "3 turnos" pero el shield no tiene duración, debería ser un efecto con duración

## Resumen de Problemas

### ✅ Cooldowns infinitos corregidos:
1. ✅ `inmovilizacion` (Frost) - Cooldown -1 implementado (infinito hasta que muera el objetivo específico)
2. ✅ `escudo-ardiente` (Blaze) - Cooldown -1 implementado (infinito hasta que muera cualquier oponente)
3. ✅ `salto-acrobatico` (Shadow) - Cooldown -1 implementado (infinito hasta que muera cualquier oponente)
4. ✅ `camuflaje` (Shadow) - Cooldown -1 implementado (infinito hasta que muera cualquier oponente)

### ⚠️ Habilidades con daño 0 que deberían tener daño:
1. `lanzamiento-fuego` (Blaze) - Debería tener daño (descripción dice "daña a todos")
2. `descarga-electrica` (Thunder) - Debería tener daño (descripción dice "daña a todos")

### ⚠️ Otros problemas:
1. `escudo-hielo` (Frost) - La descripción menciona "3 turnos" pero el shield no tiene duración. El shield se aplica instantáneamente y no tiene duración. Podría necesitar un efecto con duración o cambiar la descripción.


