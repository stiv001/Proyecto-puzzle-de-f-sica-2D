/*
  Objeto 'game' (juego).
  El "cerebro" principal que controla el flujo del juego.
*/
const game = {
    context: null,
    lastTick: 0,
    entities: [],
    state: "waiting",
    currentHero: null,
    isAiming: false,
    heroWaitTimer: 0,
    maxForce: 8, // ✅ NUEVO: Fuerza máxima del disparo

    init: function() {
        const canvas = document.getElementById("maincanvas");
        this.context = canvas.getContext("2d");
        
        if (typeof loader !== "undefined" && loader.init) loader.init();
        if (typeof physics !== "undefined" && physics.init) physics.init();
        if (typeof mouse !== "undefined" && mouse.init) mouse.init();

        this.hideScreens();
        this.showScreen("gamestartscreen");

        const playButton = document.getElementById("playbutton");
        if (playButton) {
            playButton.addEventListener("click", () => {
                this.hideScreens();
                this.showScreen("loadingscreen");

                loader.onload = () => {
                    this.showScreen("gamecanvas");
                    this.showScreen("scorescreen");
                    this.loadLevel(levels.current);
                    this.startGameLoop();
                };

                const currentLevel = levels.data[levels.current];
                if (currentLevel && currentLevel.requiredAssets) {
                    if (Array.isArray(currentLevel.requiredAssets.images)) {
                        currentLevel.requiredAssets.images.forEach(img => {
                            loader.loadImage("assets/images/" + img);
                        });
                    }
                    if (Array.isArray(currentLevel.requiredAssets.sounds)) {
                        currentLevel.requiredAssets.sounds.forEach(snd => {
                            const baseName = snd.split('.')[0];
                            loader.loadSound("assets/audio/" + baseName);
                        });
                    }
                }
            });
        }
    },

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

    loadLevel: function(levelIndex) {
        const level = levels.data[levelIndex];
        if (!level) {
            console.warn("Nivel no encontrado:", levelIndex);
            return;
        }

        this.entities = [];
        this.currentHero = null;
        this.state = "waiting";
        this.heroWaitTimer = 0;

        console.log("Cargando nivel", levelIndex, "con", level.entities.length, "entidades");

        level.entities.forEach(entInfo => {
            const ent = entities.create(entInfo);
            if (ent) {
                ent.body = physics.createBody(ent);
                this.entities.push(ent);
                
                if (ent.type === "hero") {
                    this.currentHero = ent;
                    console.log("Héroe actual establecido:", this.currentHero);
                }
            }
        });
    },

    startGameLoop: function() {
        this.lastTick = Date.now();
        const loop = () => {
            const now = Date.now();
            const deltaTime = (now - this.lastTick) / 1000;
            this.lastTick = now;

            this.update(deltaTime);
            this.draw();

            requestAnimationFrame(loop);
        };
        loop();
    },

    update: function(deltaTime) {
        if (typeof physics !== "undefined" && physics.step) {
            physics.step(deltaTime);
        }

        switch (this.state) {
            case "waiting":
                // ✅ Buscar el primer héroe disponible si no hay uno asignado
                if (!this.currentHero) {
                    for (let i = 0; i < this.entities.length; i++) {
                        if (this.entities[i].type === "hero" && this.entities[i].body) {
                            this.currentHero = this.entities[i];
                            console.log("Nuevo héroe seleccionado");
                            break;
                        }
                    }
                }

                if (this.currentHero && this.currentHero.body && mouse.isDown) {
                    const heroPos = this.currentHero.body.GetPosition();
                    const heroPixelX = heroPos.x * physics.scale;
                    const heroPixelY = heroPos.y * physics.scale;
                    
                    const dist = Math.sqrt(
                        Math.pow(heroPixelX - mouse.x, 2) + 
                        Math.pow(heroPixelY - mouse.y, 2)
                    );
                    
                    if (dist < this.currentHero.radius + 5) {
                        this.state = "aiming";
                        this.isAiming = true;
                        console.log("¡Apuntando!");
                    }
                }
                break;
                
            case "aiming":
                if (!mouse.isDown) {
                    this.state = "fired";
                    this.isAiming = false;
                    this.heroWaitTimer = 0;
                    console.log("¡Fuego!");
                    
                    if (this.currentHero && this.currentHero.body) {
                        const heroPos = this.currentHero.body.GetPosition();
                        const heroPixelX = heroPos.x * physics.scale;
                        const heroPixelY = heroPos.y * physics.scale;
                        let dx = heroPixelX - mouse.x;
                        let dy = heroPixelY - mouse.y;
                        
                        // ✅ NUEVO: Limitar la fuerza máxima
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > this.maxForce * physics.scale) {
                            const factor = (this.maxForce * physics.scale) / distance;
                            dx *= factor;
                            dy *= factor;
                            console.log("⚠️ Fuerza limitada al máximo permitido");
                        }
                        
                        const impulseVector = new b2Vec2(dx * 0.1, dy * 0.1);
                        this.currentHero.body.ApplyImpulse(impulseVector, heroPos);
                    }
                }
                break;
                
            case "fired":
                // ✅ NUEVA LÓGICA: Detectar cuándo el héroe se detiene
                if (this.currentHero && this.currentHero.body) {
                    const velocity = this.currentHero.body.GetLinearVelocity();
                    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    
                    // ✅ NUEVO: Detectar si el héroe salió del área visible
                    const heroPos = this.currentHero.body.GetPosition();
                    const heroPixelX = heroPos.x * physics.scale;
                    const heroPixelY = heroPos.y * physics.scale;
                    
                    const outOfBounds = (
                        heroPixelX < -50 || heroPixelX > 690 || // Margen extra
                        heroPixelY < -50 || heroPixelY > 530
                    );
                    
                    if (outOfBounds) {
                        console.log("❌ Héroe fuera de límites, siguiente turno");
                        this.currentHero = null;
                        this.state = "waiting";
                        this.heroWaitTimer = 0;
                        return; // Salir inmediatamente
                    }
                    
                    // Detección normal de detención
                    if (speed < 0.5) {
                        this.heroWaitTimer += deltaTime;
                        
                        // Esperar 1 segundo sin movimiento significativo
                        if (this.heroWaitTimer > 1.0) {
                            console.log("Héroe detenido, listo para nuevo disparo");
                            this.currentHero = null; // Liberar héroe actual
                            this.state = "waiting"; // Volver al estado de espera
                            this.heroWaitTimer = 0;
                        }
                    } else {
                        // Si se mueve de nuevo, reiniciar el temporizador
                        this.heroWaitTimer = 0;
                    }
                }
                break;
        }
    },

    draw: function() {
        const ctx = this.context;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 640, 480);

        this.entities.forEach(ent => {
            this.drawEntity(ent);
        });

        // ✅ Dibujar línea de apuntado
        if (this.isAiming && this.currentHero && this.currentHero.body) {
            const heroPos = this.currentHero.body.GetPosition();
            const heroPixelX = heroPos.x * physics.scale;
            const heroPixelY = heroPos.y * physics.scale;
            
            let dx = mouse.x - heroPixelX;
            let dy = mouse.y - heroPixelY;
            
            // ✅ NUEVO: Mostrar visualmente el límite de fuerza
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.maxForce * physics.scale) {
                const factor = (this.maxForce * physics.scale) / distance;
                dx *= factor;
                dy *= factor;
            }
            
            const targetX = heroPixelX + dx;
            const targetY = heroPixelY + dy;
            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(heroPixelX, heroPixelY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            
            // ✅ NUEVO: Círculo en el punto máximo si se excede la fuerza
            if (distance > this.maxForce * physics.scale) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.beginPath();
                ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    drawEntity: function(ent) {
        if (!ent.body) return;

        const pos = ent.body.GetPosition();
        const x = pos.x * physics.scale;
        const y = pos.y * physics.scale;
        const ctx = this.context;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ent.body.GetAngle());

        // ✅ NUEVO: No dibujar paredes (son invisibles)
        if (ent.nombre === "wall") {
            ctx.restore();
            return;
        }

        if (ent.type === "hero") {
            ctx.fillStyle = "#00f";
        } else if (ent.type === "villain") {
            ctx.fillStyle = "#f00";
        } else if (ent.type === "block") {
            ctx.fillStyle = "#a52a2a";
        } else if (ent.type === "static") {
            ctx.fillStyle = "#0f0";
        }

        if (ent.radius) {
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (ent.width && ent.height) {
            const hw = ent.width / 2;
            const hh = ent.height / 2;
            ctx.fillRect(-hw, -hh, ent.width, ent.height);
        }

        ctx.restore();
    }
};

window.addEventListener("load", function() {
    game.init();
});