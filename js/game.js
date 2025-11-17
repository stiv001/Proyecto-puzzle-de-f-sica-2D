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
    maxForce: 8,
    score: 0,
    shakeIntensity: 0,
    shakeDecay: 0.9,
    damageIndicators: [],
    particles: [],

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
        this.score = 0;
        this.updateScore();

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

    // ✅ NUEVO: Manejo de colisiones
    handleCollision: function(entityA, entityB, impulseForce, contactPoint) {
        // ✅ NUEVO: Ignorar colisiones con objetos estáticos (suelo/paredes)
        const isStaticCollision = (entityA.type === "static" || entityB.type === "static");
        
        // ✅ NUEVO: No aplicar daño si uno de los objetos es estático
        // (Evita que el héroe pierda vida al caer sobre el suelo)
        if (isStaticCollision) {
            // Solo registramos la colisión pero NO aplicamos daño
            console.log(`💫 Colisión con suelo/pared: ${entityA.type} vs ${entityB.type}, Fuerza: ${impulseForce.toFixed(2)}`);
            return; // Salir sin aplicar daño
        }
        
        // Calculamos el daño basado en el impulso
        const damage = Math.round(impulseForce * 2);
        
        console.log(`💥 Colisión: ${entityA.type} vs ${entityB.type}, Fuerza: ${impulseForce.toFixed(2)}, Daño: ${damage}`);
        
        // Aplicamos daño a ambas entidades (si no son estáticas)
        if (entityA.type !== "static" && entityA.health !== undefined) {
            this.applyDamage(entityA, damage, contactPoint);
        }
        if (entityB.type !== "static" && entityB.health !== undefined) {
            this.applyDamage(entityB, damage, contactPoint);
        }
        
        // Efecto de sacudida si el impacto es fuerte
        if (impulseForce > 20) {
            this.shakeIntensity = Math.min(impulseForce / 10, 10);
        }
    },

    applyDamage: function(entity, damage, contactPoint) {
        if (!entity.health) return;
        
        entity.health -= damage;
        
        // Crear indicador de daño flotante
        const worldX = contactPoint.x * physics.scale;
        const worldY = contactPoint.y * physics.scale;
        this.createDamageIndicator(worldX, worldY, damage);
        
        console.log(`${entity.nombre || entity.type} recibe ${damage} de daño. Vida restante: ${entity.health}`);
        
        // Si la vida llega a 0 o menos, destruir la entidad
        if (entity.health <= 0) {
            this.destroyEntity(entity, worldX, worldY);
        }
    },

    destroyEntity: function(entity, x, y) {
        console.log(`💀 ${entity.nombre || entity.type} destruido`);
        
        // Crear partículas de explosión
        this.createExplosionParticles(x, y, entity.type);
        
        // ✅ CAMBIADO: Sumar puntos por ENEMIGOS Y BLOQUES
        if ((entity.type === "villain" || entity.type === "block") && entity.points) {
            this.score += entity.points;
            this.updateScore();
            console.log(`⭐ +${entity.points} puntos. Puntuación total: ${this.score}`);
        }
        
        // Remover el cuerpo físico
        if (entity.body) {
            physics.removeBody(entity.body);
            entity.body = null;
        }
        
        // Marcar para eliminación
        entity.destroyed = true;
    },

    startGameLoop: function() {
        const loop = (timestamp) => {
            const deltaTime = timestamp - this.lastTick;
            this.lastTick = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    },

    update: function(deltaTime) {
        if (this.state === "playing") {
            // Actualizar lógica del juego
            this.entities.forEach(entity => {
                if (entity.update) {
                    entity.update(deltaTime);
                }
            });
            
            // Limitar la sacudida con el tiempo
            this.shakeIntensity *= this.shakeDecay;
            if (this.shakeIntensity < 0.1) {
                this.shakeIntensity = 0;
            }
        }
    },

    render: function() {
        // Limpiar el canvas
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        
        // Aplicar efecto de sacudida
        if (this.shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.context.translate(shakeX, shakeY);
        }
        
        // Dibujar entidades
        this.entities.forEach(entity => {
            if (entity.draw) {
                entity.draw(this.context);
            }
        });
        
        // Resetear transformación (importante para no afectar futuras dibujados)
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    },

    // ✅ NUEVO: Crear partículas de explosión
    createExplosionParticles: function(x, y, entityType) {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: x,
                y: y,
                size: Math.random() * 5 + 2,
                color: entityType === "villain" ? "red" : "blue",
                life: Math.random() * 20 + 10,
                update: function() {
                    this.y += Math.random() * -2 - 1;
                    this.x += Math.random() * 2 - 1;
                    this.size *= 0.95;
                    this.life--;
                },
                draw: function(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            };
            this.particles.push(particle);
        }
    },

    // ✅ NUEVO: Crear indicador de daño
    createDamageIndicator: function(x, y, damage) {
        const indicator = {
            x: x,
            y: y,
            damage: damage,
            lifetime: 30,
            alpha: 1,
            update: function() {
                this.y -= 1;
                this.alpha -= 1 / this.lifetime;
                this.lifetime--;
            },
            draw: function(ctx) {
                ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`;
                ctx.font = "bold 12px Arial";
                ctx.fillText(`-${this.damage}`, this.x, this.y);
            }
        };
        this.damageIndicators.push(indicator);
    },

    // ✅ NUEVO: Actualizar partículas y indicadores de daño
    updateParticles: function() {
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
        
        this.damageIndicators = this.damageIndicators.filter(ind => ind.lifetime > 0);
        this.damageIndicators.forEach(ind => ind.update());
    },

    // ✅ NUEVO: Renderizar partículas y indicadores de daño
    renderParticles: function() {
        this.particles.forEach(p => p.draw(this.context));
        this.damageIndicators.forEach(ind => ind.draw(this.context));
    },

    // ✅ NUEVO: Método para pausar el juego
    pause: function() {
        this.state = "paused";
    },

    // ✅ NUEVO: Método para reanudar el juego
    resume: function() {
        this.state = "playing";
    },

    // ✅ NUEVO: Método para reiniciar el juego
    restart: function() {
        this.hideScreens();
        this.showScreen("loadingscreen");

        loader.onload = () => {
            this.showScreen("gamecanvas");
            this.showScreen("scorescreen");
            this.loadLevel(levels.current);
            this.startGameLoop();
        };
    },

    updateScore: function() {
        const scoreElement = document.getElementById("score");
        if (scoreElement) {
            scoreElement.innerHTML = this.score;
        }
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

        if (this.shakeIntensity > 0.1) {
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
        }

        this.damageIndicators = this.damageIndicators.filter(indicator => {
            indicator.lifetime += deltaTime;
            indicator.y -= 30 * deltaTime;
            indicator.alpha = 1 - (indicator.lifetime / indicator.maxLifetime);
            return indicator.lifetime < indicator.maxLifetime;
        });

        this.particles = this.particles.filter(particle => {
            particle.lifetime += deltaTime;
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.vy += 200 * deltaTime;
            particle.alpha = 1 - (particle.lifetime / particle.maxLifetime);
            return particle.lifetime < particle.maxLifetime;
        });

        this.entities = this.entities.filter(ent => !ent.destroyed);

        switch (this.state) {
            case "waiting":
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
                if (this.currentHero && this.currentHero.body) {
                    const velocity = this.currentHero.body.GetLinearVelocity();
                    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    
                    const heroPos = this.currentHero.body.GetPosition();
                    const heroPixelX = heroPos.x * physics.scale;
                    const heroPixelY = heroPos.y * physics.scale;
                    
                    const outOfBounds = (
                        heroPixelX < -50 || heroPixelX > 690 ||
                        heroPixelY < -50 || heroPixelY > 530
                    );
                    
                    if (outOfBounds) {
                        console.log("❌ Héroe fuera de límites, siguiente turno");
                        this.currentHero = null;
                        this.state = "waiting";
                        this.heroWaitTimer = 0;
                        return;
                    }
                    
                    if (speed < 0.5) {
                        this.heroWaitTimer += deltaTime;
                        
                        if (this.heroWaitTimer > 1.0) {
                            console.log("Héroe detenido, listo para nuevo disparo");
                            this.currentHero = null;
                            this.state = "waiting";
                            this.heroWaitTimer = 0;
                        }
                    } else {
                        this.heroWaitTimer = 0;
                    }
                }
                break;
        }
    },

    draw: function() {
        const ctx = this.context;
        
        ctx.save();
        if (this.shakeIntensity > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(offsetX, offsetY);
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 480);
        gradient.addColorStop(0, "#1a1a2e");
        gradient.addColorStop(1, "#0f0f1e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);

        this.entities.forEach(ent => {
            this.drawEntityShadow(ent);
        });
        
        this.entities.forEach(ent => {
            this.drawEntity(ent);
            this.drawHealthBar(ent);
        });

        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        this.damageIndicators.forEach(indicator => {
            ctx.globalAlpha = indicator.alpha;
            ctx.fillStyle = "#ff0";
            ctx.font = "bold 16px Arial";
            ctx.fillText(indicator.text, indicator.x, indicator.y);
        });
        ctx.globalAlpha = 1.0;

        if (this.isAiming && this.currentHero && this.currentHero.body) {
            const heroPos = this.currentHero.body.GetPosition();
            const heroPixelX = heroPos.x * physics.scale;
            const heroPixelY = heroPos.y * physics.scale;
            
            let dx = mouse.x - heroPixelX;
            let dy = mouse.y - heroPixelY;
            
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
            
            if (distance > this.maxForce * physics.scale) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.beginPath();
                ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    },

    drawEntityShadow: function(ent) {
        if (!ent.body || ent.nombre === "wall") return;

        const pos = ent.body.GetPosition();
        const x = pos.x * physics.scale;
        const y = pos.y * physics.scale + 5;
        const ctx = this.context;

        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#000";
        ctx.translate(x, y);

        if (ent.radius) {
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        } else if (ent.width && ent.height) {
            const hw = ent.width / 2;
            const hh = ent.height / 2;
            ctx.fillRect(-hw * 0.8, -hh * 0.8, ent.width * 0.8, ent.height * 0.8);
        }

        ctx.restore();
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

        if (ent.nombre === "wall") {
            ctx.restore();
            return;
        }

        if (ent.type === "hero") {
            ctx.fillStyle = "#2196F3";
        } else if (ent.type === "villain") {
            ctx.fillStyle = "#f44336";
        } else if (ent.type === "block") {
            ctx.fillStyle = "#8B4513";
        } else if (ent.type === "static") {
            ctx.fillStyle = "#4CAF50";
        }

        if (ent.radius) {
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (ent.width && ent.height) {
            const hw = ent.width / 2;
            const hh = ent.height / 2;
            ctx.fillRect(-hw, -hh, ent.width, ent.height);
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(-hw, -hh, ent.width, ent.height);
        }

        ctx.restore();
    },

    drawHealthBar: function(ent) {
        if (!ent.body || !ent.health || ent.type === "static" || ent.nombre === "wall") return;

        const maxHealth = entities.definitions[ent.nombre]?.health || 100;
        const healthPercent = Math.max(0, Math.min(1, ent.health / maxHealth));

        const pos = ent.body.GetPosition();
        const x = pos.x * physics.scale;
        const y = pos.y * physics.scale - (ent.radius || ent.height / 2) - 10;
        const ctx = this.context;

        const barWidth = 40;
        const barHeight = 5;

        ctx.fillStyle = "#333";
        ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

        ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : (healthPercent > 0.25 ? "#FFC107" : "#f44336");
        ctx.fillRect(x - barWidth / 2, y, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
    }
};

window.addEventListener("load", function() {
    game.init();
});
