# 🎮 Puzzle de Física 2D

Juego de puzzle basado en física 2D, destruye enemigos y bloques usando trayectorias físicas realistas.

---

## Ejecución

### Opción 1: Servidor Local

Abrir `index.html` en el navegador

---

## Controles

- **Click y arrastrar** sobre el héroe: Apuntar
- **Soltar**: Lanzar
- **Botón Sonido**: Activar/desactivar audio
- **Siguiente Nivel**: Avanzar tras victoria
- **Reintentar**: Volver al nivel 1

---

## Estructura

```
├── index.html          # Página principal
├── style.css           # Estilos visuales
├── assets/
│   ├── audio/         # Sonidos (.mp3/.ogg)
│   └── images/        # Sprites (.png)
├── js/
│   ├── game.js        # Lógica principal
│   ├── entities.js    # Definición de entidades
│   ├── levels.js      # Configuración de niveles
│   ├── physics.js     # Motor Box2D
│   ├── loader.js      # Cargador de recursos
│   └── mouse.js       # Entrada de usuario
└── lib/
    └── Box2d.min.js   # Librería de física
```

---

##  Componentes Clave

### `game.js`
- Bucle principal con `requestAnimationFrame`
- Estados: `waiting`, `aiming`, `fired`, `won`, `lost`
- Sistema de colisiones y daño
- Efectos visuales (partículas, sacudida, indicadores)
- Puntuación y high score (`localStorage`)

### `physics.js`
- Mundo Box2D con gravedad (10 m/s²)
- Escala: 30 píxeles = 1 metro
- Cuerpos dinámicos (héroe, enemigos) y estáticos (suelo, paredes)
- Detección de colisiones con `b2ContactListener`

### `entities.js`
| Entidad | Tipo | Propiedades |
|---------|------|-------------|
| `heroBird` | hero | Radio: 15, Salud: 500 |
| `enemyPig` | villain | Radio: 20, Salud: 40, Puntos: 100 |
| `woodBlock` | block | 40×20, Salud: 20, Puntos: 50 |
| `ground` | static | 1000×20 |

### `levels.js`
- **Nivel 1**: 1 enemigo, 3 bloques
- **Nivel 2**: 2 enemigos, 4 bloques
- **Nivel 3**: 3 enemigos, 6 bloques

### `loader.js`
- Detección automática de formato audio (OGG/MP3)
- Carga asíncrona de imágenes
- Precarga de efectos de sonido
- Almacenamiento en caché

### `mouse.js`
- Eventos de ratón y táctiles
- Conversión coordenadas pantalla → canvas
- Soporte responsive

---

## Efectos Visuales

- **Partículas**: Explosiones al destruir
- **Indicadores de daño**: Números flotantes
- **Sacudida de cámara**: En impactos fuertes
- **Línea de trayectoria**: Apuntado
- **Barras de salud**: Sobre entidades
- **Sombras**: Proyección dinámica

---

##  Audio

- **Música**: Loop 8-bit (volumen 30%)
- **Efectos**:
  - `space-laser-shot`: Lanzamiento
  - `explosion`: Impacto fuerte
- Formatos: OGG (preferido) / MP3 (fallback)

---

## Puntuación

- **Enemigo**: 100 pts
- **Bloque**: 50 pts
- **High Score**: Guardado en `localStorage`
- **Victoria**: Destruir todos los enemigos y bloques
- **Derrota**: Sin vidas con enemigos vivos
- **Bonus**: +1 vida por nivel completado (máx. 5)

---

## 🛠️ Tecnologías

- HTML5 Canvas
- JavaScript ES6
- Box2D.js (física)
- CSS3 (UI/animaciones)
- LocalStorage API

---

## 🎓 Mecánicas

- **Física realista**: Gravedad, fricción, rebote
- **Sistema de daño**: Daño = Fuerza × 2
- **Salud**:
  - Héroe: 500 HP
  - Enemigo: 40 HP
  - Bloque: 20 HP
- **Fuerza máxima**: 8 unidades
- **Vidas iniciales**: 3

---

## Rúbrica y Autoevaluación 

| Criterio                            | Peso | Puntaje | Justificación |
|------------------------------------|------|--------|---------------|
| Funcionalidad núcleo               | 25%  | 20     | Loop, loader, menú, win/lose. |
| Mecánicas / IA / Puzzles           | 15%  | 12      | Mecánica única de lanzamiento y destrucción. |
| Física / Colisiones                | 10%  | 9      | Box2D integrado. |
| Rendimiento                        | 10%  | 8      | Fluido visualmente.
| UX / UI                            | 10%  | 8      | HUD básico y pantallas. 
| Audio                              | 5%   | 5      | Música loop y mute por botón. |
| Código / Arquitectura              | 15%  | 12     | Modular (game, physics, loader, levels, entities, mouse) |
| Documentación / Presentación       | 10%  | 7      | README con estructura y controles;

**Total:** 81 / 100

