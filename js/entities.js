/*
  Objeto 'entities' (Entidades).
  Este es nuestro catálogo central para definir las propiedades
  de todos los objetos que pueden interactuar en el juego.
*/
const entities = {
    
    // Lista de todas las definiciones de entidades
    definitions: {
        
        // --- Héroes ---
        "heroBird": {
            type: "hero", // Tipo para lógica
            radius: 15, // Radio en píxeles para la física
            health: 100, // Vida
            imageName: "hero.png" // (Aún no existe, lo cargaremos luego)
        },

        // --- Villanos ---
        "enemyPig": {
            type: "villain",
            radius: 20,
            health: 50,
            points: 100, // Puntos que da al ser destruido
            imageName: "enemy.png" // (Aún no existe)
        },

        // --- Bloques/Obstáculos ---
        "woodBlock": {
            type: "block",
            width: 40, // Ancho y alto para la física
            height: 20,
            health: 30, // Los bloques también tienen vida
            imageName: "wood.png" // (Aún no existe)
        },
        
        // --- Suelo/Paredes ---
        "ground": {
            type: "static", // Estático significa que no se mueve (como el suelo)
            width: 1000,
            height: 20,
            imageName: "ground.png" // (Aún no existe)
        }
    },

    /*
      Función 'create(entidadInfo)'
      ACTUALIZADA para llamar al motor de física.
    */
    create: function(entInfo) {
        const def = this.definitions[entInfo.nombre];
        if (!def) {
            console.warn("Definición no encontrada:", entInfo.nombre);
            return null;
        }
        const ent = Object.assign({}, def, entInfo);
        ent.x = entInfo.x || 0;
        ent.y = entInfo.y || 0;
        console.log("entities.create ->", ent.nombre, "type:", ent.type, "pos:", ent.x, ent.y);
        return ent;
    }
};