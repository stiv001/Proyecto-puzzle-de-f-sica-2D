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

    // -- Métodos (Funciones) del Cargador --

    init: function() {
        const audio = new Audio();
        const mp3 = audio.canPlayType("audio/mpeg");
        const ogg = audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        this.soundFileExtn = ogg ? ".ogg" : (mp3 ? ".mp3" : undefined);
    },

    loadImage: function(url) {
        this.totalCount++;
        this.loaded = false;
        try { game.showScreen("loadingscreen"); } catch (e) {}
        this.updateMessage();

        const img = new Image();
        const name = url.split('/').pop(); // ✅ Extraer nombre (ej: "hero.png")
        
        img.addEventListener("load", function() {
            loader.images[name] = img; // ✅ Guardar imagen
            loader.itemLoaded();
        }, false);
        
        img.addEventListener("error", function() {
            console.warn("❌ No se pudo cargar:", url);
            loader.itemLoaded();
        }, false);
        
        img.src = url;
        return img;
    },

    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        try { game.showScreen("loadingscreen"); } catch (e) {}
        this.updateMessage();

        const audio = new Audio();
        let src = url;
        if (!/\.(ogg|mp3)$/i.test(url) && this.soundFileExtn) {
            src = url + this.soundFileExtn;
        }
        
        audio.addEventListener("canplaythrough", function() {
            loader.itemLoaded();
        }, false);
        
        audio.addEventListener("error", function() {
            console.warn("❌ No se pudo cargar:", src);
            loader.itemLoaded();
        }, false);
        
        audio.src = src;
        if (audio.load) audio.load();
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