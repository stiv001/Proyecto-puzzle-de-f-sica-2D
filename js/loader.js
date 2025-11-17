/*
  Objeto 'loader' (Cargador).
  Este objeto se encargará de cargar todas nuestras imágenes y sonidos.
*/
const loader = {
    
    // -- Propiedades del Cargador --
    
    // 'loaded': true si todos los recursos están cargados.
    loaded: true, 
    
    // 'loadedCount': Cuántos recursos se han cargado hasta ahora.
    loadedCount: 0,
    
    // 'totalCount': El número total de recursos que NECESITAMOS cargar.
    totalCount: 0,

    // 'soundFileExtn': Qué formato de audio usará el navegador (lo detectaremos).
    soundFileExtn: undefined,

    // 'onload': Una función "callback" que se ejecutará cuando TODO esté cargado.
    // La dejaremos vacía por ahora, 'game.js' le dirá qué hacer.
    onload: null,

    // -- Métodos (Funciones) del Cargador --

    /*
      init(): Detecta qué formato de audio (MP3 u OGG) prefiere el navegador.
      Esto es importante porque no todos los navegadores soportan los mismos formatos[cite: 579, 580].
    */
    init: function() {
        // Creamos un elemento de audio temporal solo para preguntar al navegador.
        const audio = new Audio();
        
        // Verificamos si puede reproducir MP3
        let mp3Support = audio.canPlayType("audio/mpeg");
        // Verificamos si puede reproducir OGG
        let oggSupport = audio.canPlayType("audio/ogg; codecs=\"vorbis\"");

        // Damos prioridad a OGG si es soportado, si no, usamos MP3.
        if (oggSupport) {
            this.soundFileExtn = ".ogg";
        } else if (mp3Support) {
            this.soundFileExtn = ".mp3";
        } else {
            // Si no soporta ninguno, no podremos cargar sonidos.
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

        // Creamos un objeto de Imagen en la memoria del navegador.
        const image = new Image();
        
        // Le decimos al navegador: "Cuando esta imagen termine de cargarse ('load'),
        // llama a la función 'itemLoaded'". [cite: 89, 617, 819]
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

        // Creamos un objeto de Audio.
        const audio = new Audio();

        // Para los sonidos, no usamos el evento 'load', usamos 'canplaythrough'.
        // Este evento se dispara cuando el navegador cree que puede reproducir
        // el sonido completo sin pausas. [cite: 604, 824]
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);

        // Le decimos que comience a descargarse (añadiendo la extensión correcta).
        audio.src = url + this.soundFileExtn;
        
        return audio;
    },

    /*
      itemLoaded(ev): ¡Esta es la función MÁGICA!
      Se llama CADA VEZ que UN recurso (imagen o sonido) termina de cargarse.
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
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            // CORRECCIÓN: llamar a la función existente para ocultar pantallas
            game.hideScreens();

            if (loader.onload) {
                loader.onload();
                loader.onload = null;
            }
        }
    }
};