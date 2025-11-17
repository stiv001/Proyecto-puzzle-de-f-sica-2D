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

    // -- Métodos (Funciones) del Cargador --

    /*
      init(): Detecta qué formato de audio (MP3 u OGG) prefiere el navegador.
    */
    init: function() {
        const audio = new Audio();
        let mp3Support = audio.canPlayType("audio/mpeg");
        let oggSupport = audio.canPlayType("audio/ogg; codecs=\"vorbis\"");

        if (oggSupport) {
            this.soundFileExtn = ".ogg";
        } else if (mp3Support) {
            this.soundFileExtn = ".mp3";
        } else {
            this.soundFileExtn = undefined;
        }
    },

    /*
      loadImage(url): Le das la ruta de una imagen y la pone en la cola de carga.
    */
    loadImage: function(url) {
        this.totalCount++; // Sumamos 1 al total de cosas por cargar.
        this.loaded = false; // Marcamos que (ahora) estamos cargando algo.
        
        // Mostramos la pantalla de carga que hicimos en el Paso 1.
        game.showScreen("loadingscreen");

        const image = new Image();
        
        // Le decimos al navegador: "Cuando esta imagen termine de cargarse ('load'),
        // llama a la función 'itemLoaded'".
        image.addEventListener("load", loader.itemLoaded, false);
        
        // Ahora sí, le decimos a la imagen que comience a descargarse.
        image.src = url;
        
        return image; // Devolvemos el objeto de imagen.
    },

    /*
      loadSound(url): Idéntico a 'loadImage' pero para sonidos.
    */
    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        game.showScreen("loadingscreen");

        const audio = new Audio();

        // Para los sonidos, usamos 'canplaythrough'.
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);

        // Le decimos que comience a descargarse (añadiendo la extensión correcta).
        audio.src = url + this.soundFileExtn;
        
        return audio;
    },

    /*
      itemLoaded(ev): Se llama CADA VEZ que UN recurso termina de cargarse.
    */
    itemLoaded: function(ev) {
        // Sumamos 1 a nuestro contador de cosas cargadas.
        loader.loadedCount++;

        // Actualizamos el mensaje en la pantalla de carga.
        const loadingMessage = document.getElementById("loadingmessage");
        loadingMessage.innerHTML = "Cargando " + loader.loadedCount + " de " + loader.totalCount + "...";

        // IMPORTANTE: Removemos el "oyente" del evento para no llamarlo dos veces.
        if (ev.target.tagName === "IMG") {
            ev.target.removeEventListener("load", loader.itemLoaded, false);
        } else if (ev.target.tagName === "AUDIO") {
            ev.target.removeEventListener("canplaythrough", loader.itemLoaded, false);
        }

        // Comparamos: ¿Ya cargamos todo lo que pedimos?
        if (loader.loadedCount === loader.totalCount) {
            // ¡SÍ! Todo está cargado.
            
            // Reseteamos los contadores para la próxima vez (ej. otro nivel).
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            // Ocultamos la pantalla de carga.
            game.hideScreens(); // (Tu corrección)

            // Y ahora, llamamos a la función 'onload' que 'game.js' nos pasó.
            if (loader.onload) {
                loader.onload();
                loader.onload = null; // La limpiamos para que no se llame de nuevo.
            }
        }
    }
};