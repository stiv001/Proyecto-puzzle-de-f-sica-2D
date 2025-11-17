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
    create: function(entidadInfo) {
        
        // 1. Obtiene la definición base de nuestro catálogo
        let nombre = entidadInfo.nombre; // ej: "heroBird"
        let definicion = entities.definitions[nombre];
        
        if (!definicion) {
            console.error("No se encontró definición para:", nombre);
            return null;
        }

        // 2. Crea un nuevo objeto 'entidad' combinando ambas informaciones
        let entidad = {
            // Propiedades del nivel (ej: { nombre: "heroBird", x: 100, y: 400 })
            ...entidadInfo,
            
            // Propiedades del catálogo (ej: { radius: 15, health: 100, ... })
            radius: definicion.radius,
            health: definicion.health,
            points: definicion.points,
            width: definicion.width,
            height: definicion.height,
            imageName: definicion.imageName,
            
            // Estado inicial del juego
            isAlive: true,
            
            // ¡NUEVO! Un espacio para guardar el cuerpo físico
            body: null 
        };

        // 3. ¡NUEVO! Llamamos a la física para crear el cuerpo
        //    Esto añade el cuerpo al 'physics.world' y
        //    guarda la referencia en 'entidad.body'.
        physics.createBody(entidad);

        console.log("Entidad física creada:", entidad.nombre);
        return entidad;
    }
};