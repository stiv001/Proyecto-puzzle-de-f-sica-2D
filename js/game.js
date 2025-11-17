const game = {
    context: null,
    
    init: function() {
        const canvas = document.getElementById("maincanvas");
        this.context = canvas.getContext("2d");
        
        // ¡NUEVO! Inicializamos el cargador (para detectar formato de audio).
        loader.init();
        
        this.hideScreens();
        this.showScreen("gamestartscreen");

        const playButton = document.getElementById("playbutton");
        
        // ¡ACTUALIZADO! Esta es la lógica principal.
        playButton.addEventListener("click", function() {
            // 1. Oculta el menú y muestra la pantalla de carga.
            game.hideScreens();
            game.showScreen("loadingscreen");
            
            // 2. Define QUÉ HACER cuando el cargador termine.
            loader.onload = function() {
                game.showScreen("gamecanvas");
                game.showScreen("scorescreen");
            };

            // 3. Ponemos recursos de prueba en la cola.
            loader.loadImage("assets/images/test.png");
            loader.loadSound("assets/audio/test");
        });
    },

    hideScreens: function() {
        const screens = document.getElementsByClassName("gamelayer");
        for (let i = screens.length - 1; i >= 0; i--) {
            const screen = screens[i];
            screen.style.display = "none";
        }
    },
    
    showScreen: function(screenId) {
        // CORRECCIÓN: usar la variable 'screenId' en lugar de la cadena "screenId"
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = "block";
        }
    }
};

window.addEventListener("load", function() {
    game.init();
});