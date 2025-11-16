# 🤝 Guía de Contribución - Cosmos Combat

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

---

## 📜 Código de Conducta

Este proyecto sigue un código de conducta simple:

- **Respeto**: Trata a todos con respeto
- **Colaboración**: Trabaja en equipo
- **Comunicación**: Comunica claramente
- **Aprendizaje**: Aprende de los errores

---

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/cosmos-combat.git
cd cosmos-combat
```

### 2. Crear una Rama

```bash
# Crear rama para tu feature/bugfix
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/nombre-del-bug
```

### 3. Hacer Cambios

- Sigue los estándares de código
- Escribe código limpio y comentado
- Añade tests si es necesario
- Actualiza documentación

### 4. Commit

```bash
# Hacer commit con mensaje descriptivo
git add .
git commit -m "feat: añadir sistema de lobby"
```

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-de-tu-feature

# Crear Pull Request en GitHub
```

---

## 📝 Estándares de Código

### TypeScript

- Usa TypeScript estricto
- Define tipos explícitos
- Evita `any` cuando sea posible
- Usa interfaces para objetos complejos

### Naming Conventions

```typescript
// Variables y funciones: camelCase
const playerName = "John";
function calculateDamage() {}

// Clases: PascalCase
class GameSession {}

// Constantes: UPPER_SNAKE_CASE
const MAX_PLAYERS = 6;

// Interfaces: PascalCase con prefijo I (opcional)
interface IPlayer {}
// o simplemente
interface Player {}
```

### Estructura de Archivos

```
component/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.styles.ts (si aplica)
└── index.ts
```

### Comentarios

```typescript
// Comentarios de línea para explicaciones breves

/**
 * Comentarios de bloque para funciones complejas
 * @param player - El jugador que ejecuta la acción
 * @returns El daño calculado
 */
function calculateDamage(player: Player): number {
  // Implementación
}
```

---

## 🔄 Proceso de Desarrollo

### Workflow

1. **Planificar**: Revisa la documentación y planifica tu trabajo
2. **Desarrollar**: Escribe código siguiendo estándares
3. **Testear**: Prueba tu código localmente
4. **Documentar**: Actualiza documentación si es necesario
5. **Commit**: Haz commits descriptivos
6. **Pull Request**: Crea PR con descripción clara

### Commits

Usa el formato Conventional Commits:

```
tipo(scope): descripción

[body opcional]

[footer opcional]
```

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc.
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

Ejemplos:

```bash
feat(game): añadir sistema de turnos
fix(combat): corregir cálculo de daño con escudos
docs(readme): actualizar instrucciones de instalación
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que no sea un bug ya reportado
2. Prueba en la última versión
3. Revisa la documentación

### Cómo Reportar

Usa el template de issue:

```markdown
**Descripción del Bug**
Descripción clara del problema

**Pasos para Reproducir**
1. Paso 1
2. Paso 2
3. ...

**Comportamiento Esperado**
Qué debería pasar

**Comportamiento Actual**
Qué pasa actualmente

**Screenshots**
Si aplica

**Entorno**
- OS: [ej: Windows 10]
- Node: [ej: 18.0.0]
- Navegador: [ej: Chrome 120]
```

---

## 💡 Sugerir Features

### Antes de Sugerir

1. Revisa si ya existe una feature similar
2. Considera si encaja con el proyecto
3. Piensa en la implementación

### Cómo Sugerir

```markdown
**Descripción de la Feature**
Descripción clara de la funcionalidad

**Problema que Resuelve**
Por qué es necesaria

**Solución Propuesta**
Cómo se implementaría

**Alternativas Consideradas**
Otras opciones evaluadas

**Contexto Adicional**
Cualquier información adicional
```

---

## ✅ Checklist de Pull Request

Antes de crear un PR, asegúrate de:

- [ ] Código sigue los estándares
- [ ] Tests pasan (si aplica)
- [ ] Documentación actualizada
- [ ] Sin errores de linting
- [ ] Commits descriptivos
- [ ] PR tiene descripción clara
- [ ] No hay conflictos con main

---

## 📚 Recursos

- [Documentación del Proyecto](./README.md)
- [Fases de Desarrollo](./DEVELOPMENT_PHASES.md)
- [Especificaciones Técnicas](./TECHNICAL_SPECS.md)

---

## 🙏 Agradecimientos

¡Gracias por contribuir a Cosmos Combat! Tu ayuda es valiosa para hacer este proyecto mejor.

---

**Última actualización**: [Fecha]


