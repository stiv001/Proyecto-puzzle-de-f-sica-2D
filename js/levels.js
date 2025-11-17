/*
  Objeto 'levels' (Niveles).
  Aquí definimos la estructura de cada nivel del juego.
*/
const levels = {
    
    // El índice del nivel actual (empezamos en el 0)
    current: 0, 

    // Un array (lista) con todos los niveles
    data: [
        
        // --- Nivel 1 (Índice 0) ---
        {
            // 'entities' es una lista de TODOS los objetos en este nivel
            entities: [
                // (Recuerda: El origen (0,0) es la esquina SUPERIOR izquierda)
                
                // El Suelo
                // (Lo centramos en 640/2 = 320. Y lo ponemos abajo en 470)
                { nombre: "ground", x: 320, y: 470 }, 

                // El Héroe
                { nombre: "heroBird", x: 100, y: 400 }, // Posición inicial
                
                // Un enemigo
                { nombre: "enemyPig", x: 450, y: 440 }, // Sobre el suelo

                // Una pila de bloques
                { nombre: "woodBlock", x: 400, y: 440 },
                { nombre: "woodBlock", x: 400, y: 420 },
                { nombre: "woodBlock", x: 400, y: 400 }
            ],
            
            // Recursos que este nivel necesita cargar
            // El 'loader' usará esta lista
            requiredAssets: {
                // (Aunque no los tengamos, el loader debe intentarlo)
                images: ["hero.png", "enemy.png", "wood.png", "ground.png", "background.png"],
                sounds: ["music.ogg", "launch.ogg", "impact.ogg"]
            }
        },

        // --- Nivel 2 (Índice 1) ---
        // (Cumplimos el requisito de "3 niveles" fácilmente)
        {
            entities: [
                { nombre: "ground", x: 320, y: 470 }, 
                { nombre: "heroBird", x: 100, y: 400 }, 
                { nombre: "enemyPig", x: 500, y: 440 },
            ],
            requiredAssets: {
                // (Podría reutilizar recursos o cargar nuevos)
                images: ["hero.png", "enemy.png", "ground.png", "background.png"],
                sounds: ["music.ogg", "launch.ogg", "impact.ogg"]
            }
        },

        // --- Nivel 3 (Índice 2) ---
        {
            entities: [
                { nombre: "ground", x: 320, y: 470 }, 
                { nombre: "heroBird", x: 100, y: 400 }, 
                { nombre: "enemyPig", x: 350, y: 440 },
                { nombre: "enemyPig", x: 450, y: 440 },
            ],
             requiredAssets: {
                images: ["hero.png", "enemy.png", "ground.png", "background.png"],
                sounds: ["music.ogg", "launch.ogg", "impact.ogg"]
            }
        },

        // --- Nivel 4 (Índice 3) ---
        {
            foreground: "background.png",
            requiredAssets: {
                images: ["hero.png", "enemy.png", "wood.png", "ground.png", "background.png"],
                sounds: ["music.ogg", "launch.ogg", "impact.ogg"]
            },
            entities: [
                { nombre: "ground", x: 320, y: 440 },
                { nombre: "heroBird", x: 100, y: 100 },
                { nombre: "enemyPig", x: 500, y: 100 },
                { nombre: "woodBlock", x: 450, y: 350 },
                { nombre: "woodBlock", x: 500, y: 350 },
                { nombre: "woodBlock", x: 550, y: 350 }
            ]
        }
    ]
};