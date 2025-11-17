/* Sistema de física con Box2D */
const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2World = Box2D.Dynamics.b2World;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2ContactListener = Box2D.Dynamics.b2ContactListener;

const physics = {
    // Mundo de simulación física
    world: null,
    scale: 30, // Conversión píxeles a metros

    // Inicializar mundo físico
    init: function() {
        const gravity = new b2Vec2(0, 10);
        this.world = new b2World(gravity, true); 
        this.setupContactListener();
    },

    // Configurar detección de colisiones
    setupContactListener: function() {
        const listener = new b2ContactListener();
        
        // Cuando dos cuerpos comienzan a tocarse
        listener.BeginContact = function(contact) {
            // Sin funcionalidad actual
        };
        
        // Después de resolver colisión
        listener.PostSolve = function(contact, impulse) {
            const bodyA = contact.GetFixtureA().GetBody();
            const bodyB = contact.GetFixtureB().GetBody();
            
            const entityA = bodyA.GetUserData();
            const entityB = bodyB.GetUserData();
            
            if (entityA && entityB) {
                const impulseForce = impulse.normalImpulses[0];
                
                // Procesar solo impactos fuertes
                if (impulseForce > 5) {
                    if (typeof game !== "undefined" && game.handleCollision) {
                        const worldManifold = new Box2D.Collision.b2WorldManifold();
                        contact.GetWorldManifold(worldManifold);
                        const contactPoint = worldManifold.m_points[0];
                        
                        game.handleCollision(entityA, entityB, impulseForce, contactPoint);
                    }
                }
            }
        };
        
        this.world.SetContactListener(listener);
        this.contactListener = listener;
    },

    // Crear cuerpo físico para entidad
    createBody: function(entidad) {
        const bodyDef = new b2BodyDef();
        
        // Definir tipo de cuerpo
        if (entidad.type === "static") {
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        
        // Convertir posición a metros
        bodyDef.position.x = entidad.x / this.scale;
        bodyDef.position.y = entidad.y / this.scale;

        const fixtureDef = new b2FixtureDef();
        fixtureDef.density = 1.0;
        
        // Propiedades según tipo de entidad
        if (entidad.type === "hero") {
            fixtureDef.friction = 0.8;
            fixtureDef.restitution = 0.2;
        } else if (entidad.type === "block") {
            fixtureDef.friction = 0.6;
            fixtureDef.restitution = 0.1;
        } else {
            fixtureDef.friction = 0.5;
            fixtureDef.restitution = 0.3;
        }

        // Definir forma geométrica
        if (entidad.radius) {
            fixtureDef.shape = new b2CircleShape(entidad.radius / this.scale);
        } else if (entidad.width && entidad.height) {
            fixtureDef.shape = new b2PolygonShape();
            let halfWidth = (entidad.width / 2) / this.scale;
            let halfHeight = (entidad.height / 2) / this.scale;
            fixtureDef.shape.SetAsBox(halfWidth, halfHeight);
        }

        // Crear cuerpo en el mundo
        const body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        body.SetUserData(entidad);
        
        return body;
    },

    // Eliminar cuerpo del mundo
    removeBody: function(body) {
        if (body && this.world) {
            this.world.DestroyBody(body);
        }
    },

    // Actualizar simulación física
    step: function(deltaTime) {
        if (this.world) {
            this.world.Step(deltaTime, 8, 3);
            this.world.ClearForces();
        }
    }
};