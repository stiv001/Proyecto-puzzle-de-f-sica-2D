/*
  Objeto 'mouse' (Ratón y Táctil).
  Este módulo maneja toda la entrada del usuario.
*/
const mouse = {
    // Coordenadas x, y dentro del canvas
    x: 0,
    y: 0,
    
    // Estado del botón
    isDown: false,

    // Elemento canvas para calcular la posición
    canvas: null,
    
    // Referencia al 'gamecontainer' para la escala y offset
    gameContainer: null,

    /*
      init(): Configura los "oyentes" de eventos.
    */
    init: function() {
        this.canvas = document.getElementById("maincanvas");
        this.gameContainer = document.getElementById("gamecontainer");
        
        // Configurar los oyentes del mouse
        window.addEventListener("mousemove", this.handleMouseMove.bind(this), false);
        window.addEventListener("mousedown", this.handleMouseDown.bind(this), false);
        window.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
        
        // Configurar los oyentes táctiles (para responsividad)
        // 'touchstart' es el equivalente a 'mousedown'
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
        // 'touchmove' es el equivalente a 'mousemove'
        this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
        // 'touchend' es el equivalente a 'mouseup'
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    },

    /*
      getMousePosition(event):
      Una función de ayuda crucial. Convierte las coordenadas de la
      pantalla (ej. 800, 600) a coordenadas del canvas (ej. 320, 240).
    */
    getMousePosition: function(event) {
        // Obtenemos el rectángulo del 'gamecontainer'
        let rect = this.gameContainer.getBoundingClientRect();
        
        // Usamos el primer "toque" si es un evento táctil, o el evento del mouse
        let clientX = event.clientX || (event.touches && event.touches[0].clientX);
        let clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        // Calculamos la escala y la posición
        // (Esto es necesario si la ventana cambia de tamaño, pero 
        // para nuestro contenedor fijo es más simple)
        let scaleX = this.canvas.width / rect.width;
        let scaleY = this.canvas.height / rect.height;

        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;

        return { x: x, y: y };
    },
    
    // --- Manejadores de Eventos ---

    handleMouseMove: function(event) {
        let pos = this.getMousePosition(event);
        this.x = pos.x;
        this.y = pos.y;
    },

    handleMouseDown: function(event) {
        this.isDown = true;
    },

    handleMouseUp: function(event) {
        this.isDown = false;
    },
    
    // --- Manejadores Táctiles ---
    
    handleTouchStart: function(event) {
        // Previene el comportamiento táctil por defecto (como scroll)
        event.preventDefault(); 
        this.isDown = true;
        
        let pos = this.getMousePosition(event);
        this.x = pos.x;
        this.y = pos.y;
    },

    handleTouchMove: function(event) {
        event.preventDefault();
        
        let pos = this.getMousePosition(event);
        this.x = pos.x;
        this.y = pos.y;
    },

    handleTouchEnd: function(event) {
        event.preventDefault();
        this.isDown = false;
    }
};