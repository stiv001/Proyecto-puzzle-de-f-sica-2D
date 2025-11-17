/*
  Objeto 'levels' (Niveles).
  Aquí definimos la estructura de cada nivel del juego.
*/
const levels = {
    current: 0,
    data: [
        // ✅ NIVEL 1 - Fácil
        {
            entities: [
                // ✅ Paredes INVISIBLES para contener objetos
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },   // Pared izquierda
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },   // Pared derecha
                // ❌ ELIMINAR esta línea (el techo está causando el problema):
                // { nombre: "wall", x: 320, y: -10, width: 640, height: 20 },
                
                { nombre: "ground", x: 320, y: 460 }, // ✅ Subir el suelo (era 470)
                
                // Héroe
                { nombre: "heroBird", x: 100, y: 400 },
                
                // Enemigos y bloques
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
        
        // ✅ NIVEL 2 - Medio
        {
            entities: [
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 320, y: -10, width: 640, height: 20 },
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
        
        // ✅ NIVEL 3 - Difícil
        {
            entities: [
                { nombre: "wall", x: -10, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 650, y: 240, width: 20, height: 480 },
                { nombre: "wall", x: 320, y: -10, width: 640, height: 20 },
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