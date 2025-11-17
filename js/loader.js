/*
  Objeto 'loader' (Cargador).
  Este objeto se encargará de cargar todas nuestras imágenes y sonidos.
*/
const loader = {
    // -- Propiedades del Cargador --
    
    loaded: true, // true si todos los recursos están cargados.
    loadedCount: 0, // Cuántos recursos se han cargado hasta ahora.
    totalCount: 0, // El número total de recursos que NECESITAMOS cargar.
    soundFileExtn: undefined, // Qué formato de audio usará el navegador.
    onload: null, // Función "callback" que se ejecutará cuando TODO esté cargado.
    images: {}, // ✅ NUEVO: Almacenar imágenes cargadas
    sounds: {}, // ✅ NUEVO: Almacenar sonidos cargados

    // -- Métodos (Funciones) del Cargador --

    init: function() {
        const audio = new Audio();
        const mp3 = audio.canPlayType("audio/mpeg");
        const ogg = audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        this.soundFileExtn = ogg ? ".ogg" : (mp3 ? ".mp3" : undefined);
        console.log("🔊 Formato de audio detectado:", this.soundFileExtn || "NINGUNO");
    },

    loadImage: function(url) {
        this.totalCount++;
        this.loaded = false;
        this.updateMessage();

        const img = new Image();
        const name = url.split('/').pop(); // ✅ Extraer nombre (ej: "hero.png")
        
        img.addEventListener("load", function() {
            loader.images[name] = img; // ✅ Guardar imagen
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

    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        this.updateMessage();

        const audio = new Audio();
        const name = url.split('/').pop().split('.')[0]; // ✅ Extraer nombre sin extensión
        let src = url;
        
        // Si la URL NO tiene extensión, agregar la detectada
        if (!/\.(ogg|mp3)$/i.test(url) && this.soundFileExtn) {
            src = url + this.soundFileExtn;
        }
        
        audio.addEventListener("canplaythrough", function() {
            loader.sounds[name] = audio; // ✅ Guardar sonido
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

    /*
      itemLoaded(ev): Se llama CADA VEZ que UN recurso termina (con éxito O error).
    */
    itemLoaded: function() {
        // Sumamos 1 a nuestro contador de cosas cargadas.
        loader.loadedCount++;
        loader.updateMessage();

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

        // Comparamos: ¿Ya cargamos (o fallamos) todo lo que pedimos?
        if (loader.loadedCount === loader.totalCount) {
            // ¡SÍ! Todo está "procesado".
            
            loader.loaded = true;
            
            console.log("🎉 CARGA COMPLETA");
            console.log("📸 Imágenes cargadas:", Object.keys(loader.images));
            console.log("🔊 Sonidos cargados:", Object.keys(loader.sounds));
            
            loader.loadedCount = 0;
            loader.totalCount = 0;

            // Ocultamos la pantalla de carga.
            try { game.hideScreens(); } catch (e) {}
            // Y ahora, llamamos a la función 'onload' que 'game.js' nos pasó.
            // (Esta función es la que inicia el game loop).
            if (loader.onload) {
                const fn = loader.onload;
                loader.onload = null;
                fn();
            }
        }
    },

    updateMessage: function() {
        const msg = document.getElementById("loadingmessage");
        if (msg) {
            msg.innerHTML = "Cargando " + this.loadedCount + " de " + this.totalCount + "...";
        }
    }
};