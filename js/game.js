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
    sounds: {},
    musicPlaying: false,
    isMuted: false,
    currentLevel: 0,
    heroesRemaining: 3,
    highScore: 0,

    init: function() {
        const canvas = document.getElementById("maincanvas");
        this.context = canvas.getContext("2d");
        
        const savedHighScore = localStorage.getItem("puzzle2d_highscore");
        this.highScore = savedHighScore ? parseInt(savedHighScore) : 0;
        this.updateHighScore();
        
        if (typeof loader !== "undefined" && loader.init) loader.init();
        if (typeof physics !== "undefined" && physics.init) physics.init();
        if (typeof mouse !== "undefined" && mouse.init) mouse.init();

        this.hideScreens();
        this.showScreen("gamestartscreen");

        const muteButton = document.getElementById("mutebutton");
        if (muteButton) {
            muteButton.addEventListener("click", () => {
                this.toggleMute();
            });
        }

        const nextLevelButton = document.getElementById("nextlevelbutton");
        if (nextLevelButton) {
            nextLevelButton.addEventListener("click", () => {
                this.nextLevel();
            });
        }

        const restartButton = document.getElementById("restartbutton");
        if (restartButton) {
            restartButton.addEventListener("click", () => {
                this.restart();
            });
        }

        const playButton = document.getElementById("playbutton");
        if (playButton) {
            playButton.addEventListener("click", () => {
                this.hideScreens();
                this.showScreen("loadingscreen");

                loader.onload = () => {
                    this.sounds.music = loader.sounds["8-bit-loop"];
                    this.sounds.launch = loader.sounds["space-laser-shot"];
                    this.sounds.impact = loader.sounds["explosion"];
                    
                    console.log("🎵 Sonidos cargados:", Object.keys(loader.sounds));
                    
                    this.showScreen("gamecanvas");
                    this.showScreen("scorescreen");
                    this.loadLevel(levels.current);
                    this.playMusic();
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
        this.heroesRemaining = 3;
        this.updateHUD();

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

    handleCollision: function(entityA, entityB, impulseForce, contactPoint) {
        const isStaticCollision = (entityA.type === "static" || entityB.type === "static");
        
        if (isStaticCollision) {
            return;
        }
        
        if (impulseForce > 15) {
            this.playSound("explosion");
        }
        
        const damage = Math.round(impulseForce * 2);
        
        if (entityA.type !== "static" && entityA.health !== undefined) {
            this.applyDamage(entityA, damage, contactPoint);
        }
        if (entityB.type !== "static" && entityB.health !== undefined) {
            this.applyDamage(entityB, damage, contactPoint);
        }
        
        if (impulseForce > 20) {
            this.shakeIntensity = Math.min(impulseForce / 10, 10);
        }
    },

    applyDamage: function(entity, damage, contactPoint) {
        if (!entity.health) return;
        
        entity.health -= damage;
        
        const worldX = contactPoint.x * physics.scale;
        const worldY = contactPoint.y * physics.scale;
        this.createDamageIndicator(worldX, worldY, damage);
        
        if (entity.health <= 0) {
            this.destroyEntity(entity, worldX, worldY);
        }
    },

    destroyEntity: function(entity, x, y) {
        this.createExplosionParticles(x, y, entity.type);
        
        if ((entity.type === "villain" || entity.type === "block") && entity.points) {
            this.score += entity.points;
            this.updateScore();
        }
        
        if (entity.body) {
            physics.removeBody(entity.body);
            entity.body = null;
        }
        
        entity.destroyed = true;
    },

    createDamageIndicator: function(x, y, damage) {
        // ✅ MEJORAR: Color según daño
        let color = "#ff0"; // Amarillo por defecto
        if (damage > 50) color = "#f00"; // Rojo para mucho daño
        else if (damage > 20) color = "#f80"; // Naranja para daño medio
        
        this.damageIndicators.push({
            x: x,
            y: y,
            text: `-${damage}`,
            color: color, // ✅ NUEVO
            alpha: 1.0,
            lifetime: 0,
            maxLifetime: 1.0
        });
    },

    createExplosionParticles: function(x, y, type) {
        const particleCount = 15;
        const color = type === "villain" ? "#f00" : "#a52a2a";
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 50;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                size: 3 + Math.random() * 5,
                color: color,
                lifetime: 0,
                maxLifetime: 0.5 + Math.random() * 0.5
            });
        }
    },

    updateScore: function() {
        const scoreElement = document.getElementById("score");
        if (scoreElement) {
            scoreElement.innerHTML = this.score;
        }
    },

    playMusic: function() {
        if (this.sounds.music && !this.isMuted && !this.musicPlaying) {
            this.sounds.music.loop = true;
            this.sounds.music.volume = 0.3;
            this.sounds.music.play().catch(e => console.warn("No se pudo reproducir música:", e));
            this.musicPlaying = true;
        }
    },

    playSound: function(soundName) {
        let audioSource = null;
        
        if (this.sounds[soundName] && this.sounds[soundName].src) {
            audioSource = this.sounds[soundName].src;
        } else if (loader.sounds[soundName] && loader.sounds[soundName].src) {
            audioSource = loader.sounds[soundName].src;
        }
        
        if (audioSource && !this.isMuted) {
            try {
                const sound = new Audio(audioSource);
                sound.volume = 0.7;
                sound.play().catch(e => console.warn("⚠️ No se pudo reproducir:", soundName, e));
                console.log("🔊 Reproduciendo:", soundName);
            } catch (e) {
                console.warn("❌ Error reproduciendo sonido:", soundName, e);
            }
        } else {
            console.warn("⚠️ Sonido no encontrado:", soundName);
        }
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        const muteButton = document.getElementById("mutebutton");
        
        if (this.isMuted) {
            if (this.sounds.music) this.sounds.music.pause();
            this.musicPlaying = false;
            if (muteButton) muteButton.innerHTML = "🔇 Silenciado";
        } else {
            this.playMusic();
            if (muteButton) muteButton.innerHTML = "🔊 Sonido";
        }
    },

    updateHighScore: function() {
        const highScoreElements = document.querySelectorAll("#highscore, #losehighscore");
        highScoreElements.forEach(el => {
            if (el) el.innerHTML = this.highScore;
        });
    },

    saveHighScore: function() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("puzzle2d_highscore", this.highScore);
            this.updateHighScore();
        }
    },

    nextLevel: function() {
        this.currentLevel++;
        if (this.currentLevel >= levels.data.length) {
            this.currentLevel = 0;
        }
        levels.current = this.currentLevel;
        
        // ✅ NUEVO: No reiniciar puntuación, pero sí mantener vidas
        // Si quieres dar vidas extra por nivel:
        this.heroesRemaining = Math.min(this.heroesRemaining + 1, 5); // Máximo 5 héroes
        
        this.hideScreens();
        this.loadLevel(this.currentLevel);
        this.showScreen("gamecanvas");
        this.showScreen("scorescreen");
    },

    restart: function() {
        this.currentLevel = 0;
        levels.current = 0;
        this.score = 0;
        this.hideScreens();
        this.loadLevel(0);
        this.showScreen("gamecanvas");
        this.showScreen("scorescreen");
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
        this.checkWinLoseConditions();

        switch (this.state) {
            case "waiting":
                if (!this.currentHero) {
                    for (let i = 0; i < this.entities.length; i++) {
                        if (this.entities[i].type === "hero" && this.entities[i].body) {
                            this.currentHero = this.entities[i];
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
                    }
                }
                break;
                
            case "aiming":
                if (!mouse.isDown) {
                    this.state = "fired";
                    this.isAiming = false;
                    this.heroWaitTimer = 0;
                    this.playSound("space-laser-shot");
                    
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
                        heroPixelY > 530
                    );
                    
                    if (outOfBounds) {
                        this.heroesRemaining--;
                        this.updateHUD();
                        this.currentHero = null;
                        this.state = "waiting";
                        this.heroWaitTimer = 0;
                        return;
                    }
                    
                    if (speed < 0.5) {
                        this.heroWaitTimer += deltaTime;
                        
                        if (this.heroWaitTimer > 1.5) {
                            this.heroesRemaining--;
                            this.updateHUD();
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

    checkWinLoseConditions: function() {
        const enemiesAlive = this.entities.filter(e => 
            (e.type === "villain" || e.type === "block") && !e.destroyed
        ).length;
        
        if (enemiesAlive === 0 && this.state !== "won" && this.state !== "lost") {
            this.state = "won";
            this.saveHighScore();
            this.showVictoryScreen();
        }
        
        if (this.heroesRemaining <= 0 && enemiesAlive > 0 && this.state !== "lost" && this.state !== "won") {
            this.state = "lost";
            this.saveHighScore();
            this.showLoseScreen();
        }
    },

    showVictoryScreen: function() {
        this.hideScreens();
        this.showScreen("winscreen");
        const winScore = document.getElementById("winscore");
        if (winScore) winScore.innerHTML = this.score;
        
        // ✅ NUEVO: Mostrar qué nivel se completó
        const winLevel = document.getElementById("winlevel");
        if (winLevel) winLevel.innerHTML = this.currentLevel + 1;
    },

    showLoseScreen: function() {
        this.hideScreens();
        this.showScreen("losescreen");
        const loseScore = document.getElementById("losescore");
        const loseHighScore = document.getElementById("losehighscore");
        if (loseScore) loseScore.innerHTML = this.score;
        if (loseHighScore) loseHighScore.innerHTML = this.highScore;
    },

    updateHUD: function() {
        const heroesElement = document.getElementById("heroes");
        const levelElement = document.getElementById("level");
        if (heroesElement) heroesElement.innerHTML = this.heroesRemaining;
        if (levelElement) levelElement.innerHTML = this.currentLevel + 1;
        
        // ✅ NUEVO: Mostrar enemigos restantes
        const enemiesElement = document.getElementById("enemies");
        if (enemiesElement) {
            const count = this.entities.filter(e => 
                (e.type === "villain" || e.type === "block") && !e.destroyed
            ).length;
            enemiesElement.innerHTML = count;
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
            ctx.fillStyle = indicator.color; // ✅ Usar color dinámico
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

        const imageName = ent.imageName;
        const image = imageName ? loader.images[imageName] : null;

        if (image && image.complete) {
            if (ent.radius) {
                const size = ent.radius * 2;
                ctx.drawImage(image, -ent.radius, -ent.radius, size, size);
            } else if (ent.width && ent.height) {
                ctx.drawImage(image, -ent.width/2, -ent.height/2, ent.width, ent.height);
            }
        } else {
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
