/*
  Objeto 'game' (juego).
  El "cerebro" principal que controla el flujo del juego.
*/
const game = {
    context: null,
    lastTick: 0,
    entities: [],

    // --- Función de INICIO (init) ---
    init: function() {
        const canvas = document.getElementById("maincanvas");
        this.context = canvas.getContext("2d");

        // Inicializar módulos
        if (typeof loader !== "undefined" && loader.init) loader.init();
        if (typeof physics !== "undefined" && physics.init) physics.init();

        // Mostrar SOLO el menú al inicio
        this.hideScreens();
        this.showScreen("gamestartscreen");

        // Listener del botón "Jugar"
        const playButton = document.getElementById("playbutton");
        if (playButton) {
            playButton.addEventListener("click", function() {
                game.hideScreens();
                game.showScreen("loadingscreen");

                // Configurar callback del loader
                loader.onload = function() {
                    game.showScreen("gamecanvas");
                    game.showScreen("scorescreen");
                    game.loadLevel(0);
                    game.startGameLoop();
                };

                // Encolar assets del nivel 0
                const level = levels.data[0];
                if (level && level.requiredAssets) {
                    if (Array.isArray(level.requiredAssets.images)) {
                        level.requiredAssets.images.forEach(img => {
                            loader.loadImage("assets/images/" + img);
                        });
                    }
                    if (Array.isArray(level.requiredAssets.sounds)) {
                        level.requiredAssets.sounds.forEach(snd => {
                            loader.loadSound("assets/audio/" + snd);
                        });
                    }
                }
            });
        }
    },

    // --- Manejadores de Pantallas (Sin cambios) ---
    hideScreens: function() {
        const screens = document.getElementsByClassName("gamelayer");
        for (let i = screens.length - 1; i >= 0; i--) {
            screens[i].style.display = "none";
        }
    },
    
    showScreen: function(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = "block";
        }
    },

    // --- Carga del Nivel (Sin cambios) ---
    loadLevel: function(levelIndex) {
        const level = levels.data[levelIndex];
        if (!level) {
            console.warn("Nivel no encontrado:", levelIndex);
            return;
        }

        this.entities = [];
        console.log("Cargando nivel", levelIndex, "con", level.entities.length, "entidades");

        level.entities.forEach(entInfo => {
            const ent = entities.create(entInfo);
            if (ent) {
                // CORRECCIÓN: physics.createBody ahora DEVUELVE el body
                ent.body = physics.createBody(ent);
                this.entities.push(ent);
                console.log("Entidad creada:", ent.nombre || ent.type, "en", ent.x, ent.y);
            }
        });
    },

    // --- FUNCIONES DEL GAME LOOP (LA SECCIÓN CORREGIDA) ---
    // Estas funciones AHORA están al nivel correcto,
    // como propiedades directas del objeto 'game'.
    
    /*
      startGameLoop():
      Inicia el bule de juego. Se llama UNA VEZ.
    */
    startGameLoop: function() {
        this.lastTick = Date.now();
        this.gameLoop();
    },

    /*
      gameLoop():
      Esta función es el "corazón" que se ejecuta 60 veces por segundo.
    */
    gameLoop: function() {
        const now = Date.now();
        const deltaTime = (now - game.lastTick) / 1000;
        game.lastTick = now;

        game.update(deltaTime);
        game.draw();

        requestAnimationFrame(game.gameLoop);
    },
    
    /*
      update(deltaTime):
      Mueve toda la lógica del juego un paso adelante.
    */
    update: function(deltaTime) {
        if (typeof physics !== "undefined" && physics.step) {
            physics.step(deltaTime);
        }
    },
    
    /*
      draw():
      Dibuja todo el juego en el canvas.
    */
    draw: function() {
        const ctx = this.context;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 640, 480);

        this.entities.forEach(ent => {
            this.drawEntity(ent);
        });
    },

    /*
      drawEntity(entidad):
      Dibuja UNA entidad en el canvas.
    */
    drawEntity: function(ent) {
        if (!ent.body) return;

        const pos = ent.body.GetPosition();
        const x = pos.x * physics.scale;
        const y = pos.y * physics.scale;
        const ctx = this.context;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ent.body.GetAngle());

        if (ent.radius) {
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
            ctx.fillStyle = (ent.type === "hero") ? "#00f" : "#f00";
            ctx.fill();
        } else if (ent.width && ent.height) {
            const hw = ent.width / 2;
            const hh = ent.height / 2;
            ctx.fillStyle = (ent.type === "static") ? "#0f0" : "#a52a2a";
            ctx.fillRect(-hw, -hh, ent.width, ent.height);
        }

        ctx.restore();
    }
};

/*
  Iniciador del juego.
*/
window.addEventListener("load", function() {
    game.init();
});