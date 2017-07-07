//@author Omar Shehata. 2020.
//We are loading the Three.js library from the cdn here: https://cdnjs.com/libraries/three.js/
var scene;
var camera;
var renderer;
var objs;
var color = 1;
var renderingRate;
var dimensions;
var paused = false;
var prevX = 0;
var prevY = 0;

var mouseX = 0;
var mouseY = 0;
var loader = new THREE.TextureLoader();
var mouseRadius = 5;
var showVelocity = false;

var sunsetTexture = loader.load('/fluid/sunset.jpg')
var octopusTexture = loader.load('/fluid/forest.jpg')
var forestTexture = loader.load('/fluid/octopus.jpg')
var monalisaTexture = loader.load('/fluid/monalisa.jpg')
var hutTexture = loader.load('/fluid/hut.jpg')
function start_simulation(simulation_size, mouse_size){
    document.getElementsByClassName('choose-resolution')[0].style.display = 'none';
    var width = simulation_size;
    var height = simulation_size;
    mouseRadius = mouse_size;

    function scene_setup(){
        //This is the basic scene setup

        scene = new THREE.Scene();
        
        renderingRate = 1;
        dimensions = 1.0;
        //Note that we're using an orthographic camera here rather than a prespective

        camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
        camera.position.z = 2;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width,height)


        var element = renderer.domElement;
        canvas = element;
        element.className += " c";
        element.style.width = "100%"
        element.style.height = "100%"
        //$(element).css("width", "100%");
        //$(element).css("height", "100%");
        document.body.appendChild( element );
    }


    //Initialize the Threejs scene
    scene_setup();


    var addColorScene;
    var colorA;
    var colorB;
    var velocityA;
    var velocityB;
    var addColorMaterial;
    var diffuseMaterial;
    var plane;
    var bufferObject;
    var diffuseObject;
    var finalMaterial;
    var quad;

    function buffer_texture_setup(){
        //Create buffer scene

        velocityA = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType,});
        velocityB = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType} );
        divergenceTexture = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false,  minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
        pressureTexture = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
        pressureTexture2 = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
        densityA = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType,});
        densityB = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType} );


        plane = new THREE.PlaneBufferGeometry( width, height );

        //diffuse 
        diffuseScene = new THREE.Scene();

        diffuseMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                x: { type: "t", value: velocityA },
                b: { type: "t", value: velocityA },
                res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
                alpha: { type: "f", value: 0.0 },
                rBeta: { type: "f", value: 0.0 },
            },
            fragmentShader: document.getElementById( 'DiffusionShader' ).innerHTML
        } );
        diffuseObject = new THREE.Mesh( plane, diffuseMaterial );

        diffuseScene.add(diffuseObject);

        //add velocity
        addVelocityScene = new THREE.Scene();

        addVelocityMaterial = new THREE.ShaderMaterial( {
            uniforms: {
             bufferTexture: { type: "t", value: velocityA },
             res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
             velocitySource: {type:"v4",value:new THREE.Vector4(0,0,0,0)},
             velocitySize: {type:"f",value:mouseRadius},

            },
            fragmentShader: document.getElementById( 'AddVelocityShader' ).innerHTML
        } );
        addVelocityObject = new THREE.Mesh( plane, addVelocityMaterial );

        addVelocityScene.add(addVelocityObject);

        //add density
        addDensityScene = new THREE.Scene();

        addDensityMaterial = new THREE.ShaderMaterial( {
            uniforms: {
             bufferTexture: { type: "t", value: densityA },
             res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
             densitySource: {type:"v4",value:new THREE.Vector4(0,0,0,0)},
             densitySize: {type:"f",value:mouseRadius},
            },
            fragmentShader: document.getElementById( 'AddDensityShader' ).innerHTML
        } );
        addDensityObject = new THREE.Mesh( plane, addDensityMaterial );

        addDensityScene.add(addDensityObject);


        //advect 
        advectScene = new THREE.Scene();

        advectMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                velocity: { type: "t", value: velocityA },
                quantity: { type: "t", value: velocityA },
                dx: { type: "f", value: 0.0 },
                timestep: { type: "f", value: 0.0 },

                res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},

            },
            fragmentShader: document.getElementById( 'AdvectionShader' ).innerHTML
        } );
        advectObject = new THREE.Mesh( plane, advectMaterial );

        advectScene.add(advectObject);

        //divergence 
        divergenceScene = new THREE.Scene();

        divergenceMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                velocity: { type: "t", value: velocityA },
                res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
            },
            fragmentShader: document.getElementById( 'DivergenceShader' ).innerHTML
        } );
        divergenceObject = new THREE.Mesh( plane, divergenceMaterial );

        divergenceScene.add(divergenceObject);

        //gradient
        gradientScene = new THREE.Scene();

        gradientMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                velocity: { type: "t", value: velocityA },
                pressure: { type: "t", value: velocityA },
                res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
            },
            fragmentShader: document.getElementById( 'GradientShader' ).innerHTML
        } );
        gradientObject = new THREE.Mesh( plane, gradientMaterial );

        gradientScene.add(gradientObject);


        //gradient
        boundaryScene = new THREE.Scene();

        boundaryMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                texture: { type: "t", value: velocityA },
                res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},
                scale: { type: "f", value: 0.0 },
            },
            fragmentShader: document.getElementById( 'BoundaryShader' ).innerHTML
        } );
        boundaryObject = new THREE.Mesh( plane, boundaryMaterial );

        boundaryScene.add(boundaryObject);

       


        //show velocity
        showVelocityScene = new THREE.Scene();

        showVelocityMaterial = new THREE.ShaderMaterial( {
            uniforms: {
             bufferTexture: { type: "t", value: velocityA },
             
             res : {type: 'v2',value:new THREE.Vector2(width/dimensions,height/dimensions)},

            },
            fragmentShader: document.getElementById( 'DisplayVelocityShader' ).innerHTML
        } );
        showVelocityObject = new THREE.Mesh( plane, showVelocityMaterial );

        showVelocityScene.add(showVelocityObject);



        //Draw textureB to screen 
        finalMaterial =  new THREE.MeshBasicMaterial({map: velocityA});


        quad = new THREE.Mesh( plane, finalMaterial );
        scene.add(quad);
    }
    buffer_texture_setup();
    pressed = false;
    function UpdateMousePosition(X,Y){
        var rect = canvas.getBoundingClientRect(),
        windowleft = rect.left,
        windowtop = rect.top;
        
        mouseX = (X - windowleft),
        mouseY = (Y - windowtop);
        sx = width/window.innerWidth;
        sy = height/window.innerHeight;

        mouseY = canvas.clientHeight - mouseY;
        mouseX *= sx;
        mouseY *= sy;
        

        
        if(!paused){
            addVelocityMaterial.uniforms.velocitySource.value.x = -1 * mouseRadius/3 * (mouseX - prevX);

            addVelocityMaterial.uniforms.velocitySource.value.y =  -1 * mouseRadius/3 * (mouseY - prevY);
            

            addVelocityMaterial.uniforms.velocitySource.value.z = mouseX;
            addVelocityMaterial.uniforms.velocitySource.value.w = mouseY;

            //add velocity
            addVelocityMaterial.uniforms.bufferTexture.value = velocityA;
            renderer.render(addVelocityScene,camera,velocityB,true);
            swapVelocity();
            
        }
        
        
        prevX = mouseX;
        prevY = mouseY;
    }
    document.onmousemove = function(event){

        UpdateMousePosition(event.clientX,event.clientY)

    }

    document.onmousedown = function(event){
        pressed = true;
    }
    document.onmouseup = function(event){
        pressed = false

    }
    document.onkeypress = function(event){
        if(event.key == "r"){
            color = 1.0;
        }
        if(event.key == "g"){
            color = 2.0;
        }
        if(event.key == "b"){
            color = 3.0;
        }
        if(event.key == "1"){
            var material = new THREE.MeshBasicMaterial({map: sunsetTexture})
         
            var mesh = new THREE.Mesh(plane, material)
            var imgscene = new THREE.Scene()

            imgscene.add(mesh);
            renderer.render(imgscene,camera, densityB);
            swapDensity();

        }
        if(event.key == "2"){
            var material = new THREE.MeshBasicMaterial({map: forestTexture})
         
            var mesh = new THREE.Mesh(plane, material)
            var imgscene = new THREE.Scene()

            imgscene.add(mesh);
            renderer.render(imgscene,camera, densityB);
            swapDensity();

        }
        if(event.key == "3"){
            var material = new THREE.MeshBasicMaterial({map: octopusTexture})
         
            var mesh = new THREE.Mesh(plane, material)
            var imgscene = new THREE.Scene()

            imgscene.add(mesh);
            renderer.render(imgscene,camera, densityB);
            swapDensity();

        }
        if(event.key == "4"){
            var material = new THREE.MeshBasicMaterial({map: monalisaTexture})
         
            var mesh = new THREE.Mesh(plane, material)
            var imgscene = new THREE.Scene()

            imgscene.add(mesh);
            renderer.render(imgscene,camera, densityB);
            swapDensity();

        }
        if(event.key == "5"){
            var material = new THREE.MeshBasicMaterial({map: hutTexture})
         
            var mesh = new THREE.Mesh(plane, material)
            var imgscene = new THREE.Scene()

            imgscene.add(mesh);
            renderer.render(imgscene,camera, densityB);
            swapDensity();

        }
        if(event.key == "0"){
            densityA = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType,});

        }
        if(event.key == "c"){
            velocityA = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType,});

        }
        if(event.key == "v"){
            showVelocity = !showVelocity;
        }
        if(event.key == "h"){
            var control = document.getElementById("controls")
            control.style.display = control.style.display === 'none' ? '' : 'none';
        }

        if(event.key == " "){
            paused = !paused;
        }
    };
    //Render everything!
    function swapColor(){
        var t = colorA;
        colorA = colorB;
        colorB = t;
    }
    function swapVelocity(){
        var t = velocityA;
        velocityA = velocityB;
        velocityB = t;
    }
    function swapPressure(){
        var t = pressureTexture;
        pressureTexture = pressureTexture2;
        pressureTexture2 = t;
    }
    function swapDensity(){
        var t = densityA;
        densityA = densityB;
        densityB = t;
    }
    function render() {

        requestAnimationFrame( render );

        dx = 1/(height);
        dt = 1/60.0;

        if(pressed){
            addDensityMaterial.uniforms.densitySource.value.x = 5.0;
            if(color == 1.0)
                addDensityMaterial.uniforms.densitySource.value.y = 1.0;
            else if(color == 2.0)
                addDensityMaterial.uniforms.densitySource.value.y = 2.0;
            else if (color == 3.0)
                addDensityMaterial.uniforms.densitySource.value.y = 3.0;
            addDensityMaterial.uniforms.densitySource.value.z = mouseX;
            addDensityMaterial.uniforms.densitySource.value.w = mouseY;

            addDensityMaterial.uniforms.bufferTexture.value = densityA;
            renderer.render(addDensityScene,camera,densityB,true);
            swapDensity();
        }

        if(!paused){
            pressureTexture = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
            pressureTexture2 = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, {depthBuffer: false, stencilBuffer:false, minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});


            

             //advect velocity
            boundaryMaterial.uniforms.scale.value = -1.0;
            boundaryMaterial.uniforms.texture.value = velocityA;
            renderer.render(boundaryScene,camera,velocityB,true);
            swapVelocity();

            advectMaterial.uniforms.timestep.value = dt;
            advectMaterial.uniforms.dx.value = dx;
            advectMaterial.uniforms.quantity.value = velocityA;
            advectMaterial.uniforms.velocity.value = velocityA;
            
            renderer.render(advectScene,camera,velocityB,true);
            swapVelocity();

            boundaryMaterial.uniforms.scale.value = -1.0;
            boundaryMaterial.uniforms.texture.value = velocityA;
            renderer.render(boundaryScene,camera,velocityB,true);
            swapVelocity();
            
            
            //diffuse velocity
            
            v = 100;
            boundaryMaterial.uniforms.scale.value = -1.0;
            for (var i = 0; i < 5; i ++ ){
                diffuseMaterial.uniforms.x.value = velocityA;
                diffuseMaterial.uniforms.b.value = velocityA;
                diffuseMaterial.uniforms.alpha.value = (dx*dx) / (v * dt) ;
                diffuseMaterial.uniforms.rBeta.value = 1.0/(4.0 + (dx * dx)/(v *dt))

                renderer.render(diffuseScene,camera,velocityB,true);
                swapVelocity();

                boundaryMaterial.uniforms.texture.value = velocityA;
                renderer.render(boundaryScene,camera,velocityB,true);
                swapVelocity();

            }
            
            boundaryMaterial.uniforms.scale.value = -1.0;
            boundaryMaterial.uniforms.texture.value = velocityA;
            renderer.render(boundaryScene,camera,velocityB,true);
            swapVelocity();

            
            


            
            
            
            //compute divergence
            divergenceMaterial.uniforms.velocity.value = velocityA;
            renderer.render(divergenceScene,camera,divergenceTexture,true);

            // compute pressure
            boundaryMaterial.uniforms.scale.value = 1.0;
            diffuseMaterial.uniforms.alpha.value = -1 ;
            diffuseMaterial.uniforms.rBeta.value = 0.25;
            diffuseMaterial.uniforms.b.value = divergenceTexture;
            for (var i = 0; i <5; i ++ ){
                diffuseMaterial.uniforms.x.value = pressureTexture;
                renderer.render(diffuseScene,camera,pressureTexture2,true);
                swapPressure();

                boundaryMaterial.uniforms.texture.value = pressureTexture;
                renderer.render(boundaryScene,camera,pressureTexture2,true);
                swapPressure();
            

            }


            //subtract pressure
            gradientMaterial.uniforms.velocity.value = velocityA;
            gradientMaterial.uniforms.pressure.value = pressureTexture;
            renderer.render(gradientScene,camera,velocityB,true);
            swapVelocity();



            //add density
            boundaryMaterial.uniforms.scale.value = -1.0;
            boundaryMaterial.uniforms.texture.value = velocityA;
            renderer.render(boundaryScene,camera,velocityB,true);
            swapVelocity();


            
            
            //advect density

            advectMaterial.uniforms.timestep.value = dt;
            advectMaterial.uniforms.dx.value = dx;
            advectMaterial.uniforms.quantity.value = densityA;
            advectMaterial.uniforms.velocity.value = velocityA;
            

            renderer.render(advectScene,camera,densityB,true);
            swapDensity();
            
            /*
            //draw to screen
            showVelocityMaterial.uniforms.bufferTexture.value = velocityA;
            renderer.render(showVelocityScene,camera,velocityB,true);

            */
        }
        
        
            
        
        if(showVelocity){
            quad.material.map = velocityA;
        }
        else{
            quad.material.map = densityA;
        }
        renderer.render( scene, camera );
        


    }
    render();
}
