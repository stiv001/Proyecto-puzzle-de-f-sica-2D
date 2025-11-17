/* Niveles del juego */
const levels = {
    current: 0, // Nivel actual
    data: [
        // NIVEL 1 - Fácil
        {
            entities: [
                // Paredes contenedoras
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },
                
                { nombre: "ground", x: 320, y: 460 }, // Suelo
                
                // Personaje principal
                { nombre: "heroBird", x: 100, y: 400 },
                
                // Enemigos y obstáculos
                { nombre: "enemyPig", x: 450, y: 440 },
                { nombre: "woodBlock", x: 400, y: 440 },
                { nombre: "woodBlock", x: 400, y: 420 },
                { nombre: "woodBlock", x: 400, y: 400 }
            ],
            // Recursos necesarios
            requiredAssets: {
                images: ["hero.png", "enemy.png", "wood.png", "ground.png"],
                sounds: ["8-bit-loop.ogg", "space-laser-shot.ogg", "explosion.ogg"]
            }
        },
        
        // NIVEL 2 - Medio
        {
            entities: [
                // Paredes y límites
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 320, y: -10, width: 640, height: 20 },
                { nombre: "ground", x: 320, y: 470 },
                
                { nombre: "heroBird", x: 80, y: 400 }, // Posición del héroe
                
                // Más enemigos y estructuras
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
        
        // NIVEL 3 - Difícil
        {
            entities: [
                // Límites del nivel
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 320, y: -10, width: 640, height: 20 },
                { nombre: "ground", x: 320, y: 470 },
                
                { nombre: "heroBird", x: 60, y: 400 }, // Héroe
                
                // Mayor cantidad de enemigos
                { nombre: "enemyPig", x: 420, y: 440 },
                { nombre: "enemyPig", x: 480, y: 440 },
                { nombre: "enemyPig", x: 540, y: 440 },
                // Estructura compleja de bloques
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