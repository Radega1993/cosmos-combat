# 🐛 Issues Conocidos - Cosmos Combat

**Última actualización**: Diciembre 2024

---

## 🔴 Issues Activos

### Issue #1: Imágenes de personajes no visibles
**Estado**: 🔴 Abierto  
**Prioridad**: Alta  
**Fecha reportado**: Diciembre 2024

#### Descripción
Las imágenes de los personajes no se cargan correctamente al inicio de la partida. Los personajes aparecen como rectángulos oscuros en lugar de mostrar sus imágenes desde `/deck_img/personajes/`.

#### Pasos para reproducir
1. Iniciar una nueva partida
2. Observar los personajes en la pantalla de juego
3. Las imágenes no se muestran, solo aparecen rectángulos oscuros

#### Comportamiento esperado
Las imágenes de los personajes deberían cargarse automáticamente al iniciar la partida, mostrando:
- `strike.png`
- `blaze.png`
- `shadow.png`
- `thunder.png`
- `frost.png`
- `ironclad.png`

#### Comportamiento actual
- Los personajes aparecen como rectángulos oscuros
- Las imágenes no se cargan hasta hacer hover o recargar la página

#### Información técnica
- **Ubicación de imágenes**: `/deck_img/personajes/`
- **Componente afectado**: `PlayerStatus.tsx`
- **Método de carga**: `getCharacterImagePath()` usa `character.image` o fallback a `/deck_img/personajes/${characterId}.png`
- **Backend**: Archivos estáticos servidos desde `/deck_img` (configurado en `main.ts`)

#### Posibles causas
1. Timing de carga: Los datos del personaje se cargan después de renderizar el componente
2. Rutas incorrectas: Las rutas de imágenes no coinciden con la estructura de archivos
3. CORS: Problemas de permisos para servir archivos estáticos
4. Caché del navegador: Imágenes en caché corruptas

#### Workaround temporal
- Recargar la página (Ctrl+R o Cmd+R)
- Hacer hover sobre el personaje para forzar la carga
- Limpiar caché del navegador

#### Notas adicionales
- El hover del personaje funciona correctamente y muestra la información
- Las imágenes se cargan correctamente cuando se accede directamente a la URL
- El problema parece estar relacionado con el timing de carga de datos

---

## ✅ Issues Resueltos

*No hay issues resueltos aún*

---

## 📝 Notas para Desarrolladores

### Cómo reportar un issue
1. Describir el problema claramente
2. Incluir pasos para reproducir
3. Especificar comportamiento esperado vs actual
4. Agregar información técnica relevante
5. Incluir screenshots si es posible

### Prioridades
- 🔴 **Alta**: Afecta funcionalidad crítica o experiencia de usuario
- 🟡 **Media**: Afecta funcionalidad secundaria o tiene workaround
- 🟢 **Baja**: Mejora menor o problema cosmético

