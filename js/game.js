/*
  Creamos un objeto 'game' (juego).
  Poner todas nuestras funciones y variables dentro de este objeto
  mantiene el código limpio y ordenado, justo como le gusta a tu profesor.
*/
const game = {
    
    // Aquí guardaremos el "pincel" para dibujar en el canvas.
    // Lo iniciamos como 'null' (vacío).
    context: null,
    
    // Esta es la función de INICIO. Se llama una sola vez.
    init: function() {
        // 1. Busca el elemento <canvas> en el HTML
        const canvas = document.getElementById("maincanvas");
        
        // 2. Obtiene el "contexto 2D" del canvas.
        //    Piensa en esto como obtener el "pincel" para poder dibujar.
        this.context = canvas.getContext("2d");
        
        // 3. Llama a nuestra función para ocultar todas las pantallas.
        this.hideScreens();
        
        // 4. Muestra SOLO la pantalla del menú principal
        this.showScreen("gamestartscreen");

        // 5. (Más adelante) Cargar la puntuación máxima guardada
        const playButton = document.getElementById("playbutton");
        playButton.addEventListener("click", function() {
            // Oculta todas las pantallas y muestra solo el canvas y el HUD
            game.hideScreens();
            game.showScreen("gamecanvas");
            game.showScreen("scorescreen"); // Muestra también el HUD
        });
    },

    // --- FUNCIONES DE AYUDA PARA MANEJAR PANTALLAS ---

    // Esta función oculta TODAS las capas que tengan la clase 'gamelayer'
    hideScreens: function() {
        const screens = document.getElementsByClassName("gamelayer");
        // Recorre todos los elementos y les pone 'display: "none"'
        for (let i = screens.length - 1; i >= 0; i--) {
            const screen = screens[i];
            screen.style.display = "none";
        }
    },
    
    // Esta función muestra UNA capa específica, buscando por su 'id'
    showScreen: function(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            // Le pone 'display: "block"' para hacerla visible
            screen.style.display = "block";
        }
    }
};


/*
  ¡MUY IMPORTANTE!
  Le decimos al navegador que espere a que TODA la página HTML
  se haya cargado ('window.addEventListener("load", ...)')
  antes de intentar ejecutar nuestra función 'game.init()'.

  Si no hacemos esto, 'game.init()' podría ejecutarse ANTES
  de que exista el <canvas> y nuestro código fallaría.
*/
window.addEventListener("load", function() {
    game.init();
});