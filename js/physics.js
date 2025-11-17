/*
  Objeto 'physics' (Física).
  Este módulo se encarga de TODA la interacción con Box2D.
  Cumple con el requisito de "física (Box2D/colisiones)".
*/

// Creamos atajos para los nombres largos de Box2D,
// tal como se recomienda en el libro.
const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2World = Box2D.Dynamics.b2World;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2ContactListener = Box2D.Dynamics.b2ContactListener;

const physics = {
    // El "mundo" de Box2D donde toda la simulación ocurre.
    world: null,

    // Escala: Box2D funciona en METROS, no en píxeles.
    // Debemos definir una escala. 30 píxeles = 1 metro es una buena escala.
    scale: 30,

    /*
      init(): Configura el mundo de física.
    */
    init: function() {
        // 1. Define la gravedad (10 m/s^2 en el eje Y, o sea, hacia abajo)
        // El libro usa 9.8, pero 10 es común y más fácil.
        const gravity = new b2Vec2(0, 10);
        
        // 2. Crea el mundo de Box2D
        // 'true' permite que los objetos se "duerman" si no se mueven.
        this.world = new b2World(gravity, true); 
        
        // ✅ NUEVO: Crear el Contact Listener
        this.setupContactListener();
    },

    setupContactListener: function() {
        const listener = new b2ContactListener();
        
        // ✅ BeginContact: Se llama cuando DOS cuerpos empiezan a tocarse
        listener.BeginContact = function(contact) {
            // No hacemos nada aquí por ahora
        };
        
        // ✅ PostSolve: Se llama DESPUÉS de resolver la colisión
        // Aquí tenemos acceso al IMPULSO (fuerza del choque)
        listener.PostSolve = function(contact, impulse) {
            // Obtenemos los dos cuerpos que chocaron
            const bodyA = contact.GetFixtureA().GetBody();
            const bodyB = contact.GetFixtureB().GetBody();
            
            // Obtenemos nuestras entidades (guardadas con SetUserData)
            const entityA = bodyA.GetUserData();
            const entityB = bodyB.GetUserData();
            
            // Si ambas entidades existen, procesamos la colisión
            if (entityA && entityB) {
                // Calculamos la fuerza del impacto
                const impulseForce = impulse.normalImpulses[0];
                
                // Solo procesamos impactos significativos (> 5)
                if (impulseForce > 5) {
                    // Llamamos a game.handleCollision con los datos
                    if (typeof game !== "undefined" && game.handleCollision) {
                        // Obtenemos el punto de contacto
                        const worldManifold = new Box2D.Collision.b2WorldManifold();
                        contact.GetWorldManifold(worldManifold);
                        const contactPoint = worldManifold.m_points[0];
                        
                        game.handleCollision(entityA, entityB, impulseForce, contactPoint);
                    }
                }
            }
        };
        
        // Asignamos el listener al mundo
        this.world.SetContactListener(listener);
        this.contactListener = listener;
    },

    /*
      createBody(entidad):
      Toma una de nuestras 'entidades' y le AÑADE un cuerpo físico.
    */
    createBody: function(entidad) {
        // 1. Definición del Cuerpo (BodyDef)
        //    Define dónde estará el cuerpo y si se puede mover.
        const bodyDef = new b2BodyDef();
        
        if (entidad.type === "static") {
            bodyDef.type = b2Body.b2_staticBody; // Estático (suelo): no se mueve.
        } else {
            bodyDef.type = b2Body.b2_dynamicBody; // Dinámico (héroe, enemigo): sí se mueve.
        }
        
        // Convertimos la posición de píxeles (juego) a metros (física)
        bodyDef.position.x = entidad.x / this.scale;
        bodyDef.position.y = entidad.y / this.scale;

        // 2. Definición de la Forma (FixtureDef)
        //    Define la forma, densidad, fricción y rebote del cuerpo.
        const fixtureDef = new b2FixtureDef();
        fixtureDef.density = 1.0; // Densidad (peso)
        fixtureDef.friction = 0.5; // Fricción
        fixtureDef.restitution = 0.3; // Rebote (0=nada, 1=mucho)

        // 3. Asignar la Forma (Shape)
        //    Le dice a Box2D si es un círculo o un rectángulo.
        
        if (entidad.radius) {
            // Si tiene radio, es un CÍRCULO
            // Convertimos el radio de píxeles a metros
            fixtureDef.shape = new b2CircleShape(entidad.radius / this.scale);
            
        } else if (entidad.width && entidad.height) {
            // Si tiene ancho y alto, es un RECTÁNGULO
            fixtureDef.shape = new b2PolygonShape();
            // IMPORTANTE: Box2D define los rectángulos desde su CENTRO.
            // Por eso usamos la "mitad" del ancho y la "mitad" del alto.
            let halfWidth = (entidad.width / 2) / this.scale;
            let halfHeight = (entidad.height / 2) / this.scale;
            fixtureDef.shape.SetAsBox(halfWidth, halfHeight);
        }

        // 4. ¡Crear el cuerpo!
        //    Añadimos el cuerpo al mundo y guardamos una referencia.
        const body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        
        // ✅ NUEVO: Adjuntamos la entidad al cuerpo usando SetUserData
        // Esto permite que el Contact Listener acceda a nuestra entidad
        body.SetUserData(entidad);
        
        // CORRECCIÓN: devolver el body para que game.js pueda asignarlo
        return body;
    },

    removeBody: function(body) {
        if (body && this.world) {
            this.world.DestroyBody(body);
        }
    },

    /*
      step(deltaTime):
      Esta función es el "corazón" del motor. Le dice a Box2D:
      "Calcula el siguiente pequeño paso de la simulación".
      'deltaTime' es el tiempo (en segundos) que ha pasado desde el último fotograma.
    */
    step: function(deltaTime) {
        if (this.world) {
            // 1. Damos el paso de simulación.
            //    8 y 3 son las iteraciones de velocidad y posición recomendadas
            //    por el libro. Son valores estándar.
            this.world.Step(deltaTime, 8, 3);
            
            // 2. Limpiamos las fuerzas (para el siguiente fotograma).
            this.world.ClearForces();
        }
    }
};