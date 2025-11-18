/* Niveles del juego */
const levels = {
    current: 0,
    data: [
        {
            entities: [
                // Paredes imaginarias al ras (interior)
                { nombre: "wall", x: 5,   y: 240, width: 10, height: 480 },  // izquierda
                { nombre: "wall", x: 635, y: 240, width: 10, height: 480 },  // derecha
                { nombre: "wall", x: 320, y: 5,   width: 640, height: 10 },  // arriba
                { nombre: "wall", x: 320, y: 475, width: 640, height: 10 },  // abajo
                { nombre: "ground", x: 320, y: 460 },

                { nombre: "heroBird", x: 100, y: 400 },

                { nombre: "enemyPig", x: 450, y: 440 },
                { nombre: "woodBlock", x: 400, y: 440 },
                { nombre: "woodBlock", x: 400, y: 420 },
                { nombre: "woodBlock", x: 400, y: 400 }
            ],
            requiredAssets: {
                images: ["hero.png", "enemy.png", "wood.png", "ground.png"],
                sounds: ["8-bit-loop.ogg", "space-laser-shot.ogg", "explosion.ogg"]
            }
        },
        {
            entities: [
                { nombre: "wall", x: 5,   y: 240, width: 10, height: 480 },
                { nombre: "wall", x: 635, y: 240, width: 10, height: 480 },
                { nombre: "wall", x: 320, y: 5,   width: 640, height: 10 },
                { nombre: "wall", x: 320, y: 475, width: 640, height: 10 },
                { nombre: "ground", x: 320, y: 470 },

                { nombre: "heroBird", x: 80, y: 400 },

                { nombre: "enemyPig", x: 450, y: 440 },
                { nombre: "enemyPig", x: 500, y: 440 },
                { nombre: "woodBlock", x: 400, y: 440 },
                { nombre: "woodBlock", x: 400, y: 420 },
                { nombre: "woodBlock", x: 450, y: 400 },
                { nombre: "woodBlock", x: 500, y: 400 }
            ],
            requiredAssets: {
                images: ["hero.png", "enemy.png", "wood.png", "ground.png"],
                sounds: ["8-bit-loop.ogg", "space-laser-shot.ogg", "explosion.ogg"]
            }
        },
        {
            entities: [
                { nombre: "wall", x: 5,   y: 240, width: 10, height: 480 },
                { nombre: "wall", x: 635, y: 240, width: 10, height: 480 },
                { nombre: "wall", x: 320, y: 5,   width: 640, height: 10 },
                { nombre: "wall", x: 320, y: 475, width: 640, height: 10 },
                { nombre: "ground", x: 320, y: 470 },

                { nombre: "heroBird", x: 60, y: 400 },

                { nombre: "enemyPig", x: 420, y: 440 },
                { nombre: "enemyPig", x: 480, y: 440 },
                { nombre: "enemyPig", x: 540, y: 440 },
                { nombre: "woodBlock", x: 400, y: 440 },
                { nombre: "woodBlock", x: 400, y: 420 },
                { nombre: "woodBlock", x: 450, y: 420 },
                { nombre: "woodBlock", x: 500, y: 420 },
                { nombre: "woodBlock", x: 450, y: 400 },
                { nombre: "woodBlock", x: 500, y: 400 }
            ],
            requiredAssets: {
                images: ["hero.png", "enemy.png", "wood.png", "ground.png"],
                sounds: ["8-bit-loop.ogg", "space-laser-shot.ogg", "explosion.ogg"]
            }
        }
    ]
};