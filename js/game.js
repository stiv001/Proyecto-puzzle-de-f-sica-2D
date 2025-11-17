/*
  Objeto 'game' (juego).
  El "cerebro" principal que controla el flujo del juego.
*/
const game = {
    
    // El "pincel" para dibujar en el canvas.
    context: null,
    
    // Función de INICIO. Se llama una sola vez.
    init: function() {
        // 1. Busca el elemento <canvas> en el HTML
        const canvas = document.getElementById("maincanvas");
        
        // 2. Obtiene el "contexto 2D" (el "pincel")
        this.context = canvas.getContext("2d");
        
        // 3. Inicializamos el cargador (para detectar formato de audio).
        // (Esto viene de loader.js)
        loader.init();

        // 4. ¡NUEVO! Inicializamos el mundo de física (crea la gravedad)
        // (Esto viene de physics.js)
        physics.init();

        // 5. Oculta todas las pantallas
        this.hideScreens();
        
        // 6. Muestra SOLO la pantalla del menú principal
        this.showScreen("gamestartscreen");

        // 7. Configura el botón "Jugar"
        const playButton = document.getElementById("playbutton");
        
        playButton.addEventListener("click", function() {
            // 1. Oculta el menú y muestra la pantalla de carga
            game.hideScreens();
            game.showScreen("loadingscreen");
            
            // 2. Define QUÉ HACER cuando el cargador termine.
            //    Esta es una función "callback".
            loader.onload = function() {
                // Cuando todo esté cargado:
                
                // a. Carga las entidades del nivel en el juego
                //    (Usa el objeto 'levels' y 'entities')
                game.loadLevel(levels.current); 
                
                // b. Muestra el canvas del juego y el HUD
                game.hideScreens(); // Oculta "loadingscreen"
                game.showScreen("gamecanvas");
                game.showScreen("scorescreen");
                
                // c. (En el Paso 5) Inicia el bucle principal del juego
                // game.startGameLoop(); 
            };

            // 3. Obtenemos los recursos REQUERIDOS del nivel actual
            //    (Usa el objeto 'levels')
            let currentLevel = levels.data[levels.current];
            let assets = currentLevel.requiredAssets;
            
            // 4. Le decimos al cargador qué cargar
            //    (Usa el objeto 'loader')
            
            // Cargamos las imágenes
            assets.images.forEach(imgName => {
                // (Por ahora fallará, no tenemos la carpeta /assets/)
                loader.loadImage("assets/images/" + imgName);
            });
            
            // Cargamos los sonidos
            assets.sounds.forEach(soundName => {
                // Quitamos la extensión (ej: "music.ogg" -> "music")
                // El cargador ('loader') añade la extensión correcta.
                loader.loadSound("assets/audio/" + soundName.split('.')[0]); 
            });

            // Si el nivel no tiene NADA que cargar (totalCount es 0),
            // ejecutamos 'onload' manualmente para no quedarnos atascados.
            if (loader.totalCount === 0) {
                loader.onload();
            }
        });
    },

    // --- FUNCIONES DE AYUDA PARA MANEJAR PANTALLAS ---

    // Oculta TODAS las capas que tengan la clase 'gamelayer'
    hideScreens: function() {
        const screens = document.getElementsByClassName("gamelayer");
        for (let i = screens.length - 1; i >= 0; i--) {
            const screen = screens[i];
            screen.style.display = "none";
        }
    },
    
    // Muestra UNA capa específica, buscando por su 'id'
    showScreen: function(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = "block";
        }
    },

    // --- FUNCIÓN DEL PASO 3 (Sin cambios) ---
    
    /*
      loadLevel(levelData): 
      Toma los datos del nivel y crea todas las entidades.
    */
    loadLevel: function(levelIndex) {
        // Obtiene los datos del nivel (del archivo levels.js)
        let level = levels.data[levelIndex];

        // Recorre la lista 'entities' del nivel
        level.entities.forEach(entidadInfo => {
            
            // Llama a la función 'create' (del archivo entities.js)
            let entidad = entities.create(entidadInfo);
            
            // (Más adelante, guardaremos esta 'entidad' en una lista
            //  y la dibujaremos en el bucle del juego)
        });

        // (En el Paso 5) Dibujaremos el fondo y los objetos
    }
};

/*
  Iniciador del juego.
  Espera a que toda la página HTML esté cargada.
*/
window.addEventListener("load", function() {
    game.init();
});