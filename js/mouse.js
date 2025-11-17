/* Manejo de entrada de usuario */
const mouse = {
    // Posición y estado del cursor
    x: 0,
    y: 0,
    isDown: false,
    canvas: null,
    gameContainer: null,

    // Configurar eventos de entrada
    init: function() {
        this.canvas = document.getElementById("maincanvas");
        this.gameContainer = document.getElementById("gamecontainer");
        
        // Eventos de ratón
        window.addEventListener("mousemove", this.handleMouseMove.bind(this), false);
        window.addEventListener("mousedown", this.handleMouseDown.bind(this), false);
        window.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
        
        // Eventos táctiles
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
        this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    },

    // Convertir coordenadas pantalla a canvas
    getMousePosition: function(event) {
        let rect = this.gameContainer.getBoundingClientRect();
        
        let clientX = event.clientX || (event.touches && event.touches[0].clientX);
        let clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        let scaleX = this.canvas.width / rect.width;
        let scaleY = this.canvas.height / rect.height;

        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;

        return { x: x, y: y };
    },
    
    // Manejadores de ratón
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
    
    // Manejadores táctiles
    handleTouchStart: function(event) {
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