/* Cargador de recursos */
const loader = {
    // Estado de carga
    loaded: true,
    loadedCount: 0,
    totalCount: 0,
    soundFileExtn: undefined,
    onload: null,
    images: {}, // Almacén de imágenes
    sounds: {}, // Almacén de sonidos

    // Detectar formato de audio compatible
    init: function() {
        const audio = new Audio();
        const mp3 = audio.canPlayType("audio/mpeg");
        const ogg = audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        this.soundFileExtn = ogg ? ".ogg" : (mp3 ? ".mp3" : undefined);
        console.log("🔊 Formato de audio detectado:", this.soundFileExtn || "NINGUNO");
    },

    // Cargar imagen
    loadImage: function(url) {
        this.totalCount++;
        this.loaded = false;
        this.updateMessage();

        const img = new Image();
        const name = url.split('/').pop();
        
        img.addEventListener("load", function() {
            loader.images[name] = img; // Guardar en almacén
            console.log("✅ Imagen cargada:", name);
            loader.itemLoaded();
        }, false);
        
        img.addEventListener("error", function() {
            console.warn("❌ Error cargando imagen:", url);
            loader.itemLoaded();
        }, false);
        
        img.src = url;
        return img;
    },

    // Cargar sonido
    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        this.updateMessage();

        const audio = new Audio();
        const name = url.split('/').pop().split('.')[0];
        let src = url;
        
        // Ajustar extensión según navegador
        if (!/\.(ogg|mp3)$/i.test(url) && this.soundFileExtn) {
            src = url + this.soundFileExtn;
        }
        
        audio.addEventListener("canplaythrough", function() {
            loader.sounds[name] = audio; // Guardar en almacén
            console.log("✅ Sonido cargado:", name, "→", src);
            loader.itemLoaded();
        }, false);
        
        audio.addEventListener("error", function() {
            console.warn("❌ Error cargando sonido:", src);
            loader.itemLoaded();
        }, false);
        
        audio.src = src;
        audio.load();
        return audio;
    },

    // Manejar recurso cargado
    itemLoaded: function() {
        loader.loadedCount++;
        loader.updateMessage();

        // Limpiar event listeners
        try {
            if (ev && ev.target) {
                const tag = (ev.target.tagName || "").toUpperCase();
                if (tag === "IMG") {
                    ev.target.removeEventListener("load", loader.itemLoaded, false);
                    ev.target.removeEventListener("error", loader.itemLoaded, false);
                } else if (tag === "AUDIO") {
                    ev.target.removeEventListener("canplaythrough", loader.itemLoaded, false);
                    ev.target.removeEventListener("error", loader.itemLoaded, false);
                }
            }
        } catch (e) {}

        // Verificar si terminó la carga
        if (loader.loadedCount === loader.totalCount) {
            loader.loaded = true;
            
            console.log("🎉 CARGA COMPLETA");
            console.log("📸 Imágenes cargadas:", Object.keys(loader.images));
            console.log("🔊 Sonidos cargados:", Object.keys(loader.sounds));
            
            loader.loadedCount = 0;
            loader.totalCount = 0;

            // Finalizar proceso
            try { game.hideScreens(); } catch (e) {}
            if (loader.onload) {
                const fn = loader.onload;
                loader.onload = null;
                fn();
            }
        }
    },

    // Actualizar mensaje de progreso
    updateMessage: function() {
        const msg = document.getElementById("loadingmessage");
        if (msg) {
            msg.innerHTML = "Cargando " + this.loadedCount + " de " + this.totalCount + "...";
        }
    }
};