/* Catálogo central de entidades */
const entities = {

    // Definiciones base de todas las entidades
    definitions: {

        // Héroe del juego
        "heroBird": {
            type: "hero",
            radius: 15,
            health: 500,
            imageName: "hero.png"
        },

        // Enemigo principal
        "enemyPig": {
            type: "villain",
            radius: 20,
            health: 40,
            points: 100,
            imageName: "enemy.png"
        },

        // Bloques destructibles
        "woodBlock": {
            type: "block",
            width: 40,
            height: 20,
            health: 20,
            points: 50,
            imageName: "wood.png"
        },

        // Suelo del escenario
        "ground": {
            type: "static",
            width: 1000,
            height: 20,
            imageName: "ground.png"
        },

        // Paredes invisibles
        "wall": {
            type: "static",
            width: 20,
            height: 480,
            imageName: null
        }
    },

    /* Crea una entidad a partir de su definición */
    create: function(entInfo) {
        const def = this.definitions[entInfo.nombre];
        if (!def) {
            console.warn("Definición no encontrada:", entInfo.nombre);
            return null;
        }

        // Mezcla datos base con datos específicos
        const ent = Object.assign({}, def, entInfo);

        // Posición inicial
        ent.x = entInfo.x || 0;
        ent.y = entInfo.y || 0;

        console.log("entities.create ->", ent.nombre, "type:", ent.type, "pos:", ent.x, ent.y);
        return ent;
    }
};
