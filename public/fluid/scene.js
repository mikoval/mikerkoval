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
var width = window.innerHeight;
var height = window.innerHeight;
function scene_setup(){
    //This is the basic scene setup
    scene = new THREE.Scene();
    
    renderingRate = 1;
    dimensions = 1.0;
    //Note that we're using an orthographic camera here rather than a prespective

    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    var element = renderer.domElement;
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

    velocityA = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
    velocityB = new THREE.WebGLRenderTarget( width/dimensions , height/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType} );

    plane = new THREE.PlaneBufferGeometry( width/dimensions, height/dimensions );

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

        },
        fragmentShader: document.getElementById( 'AddVelocityShader' ).innerHTML
    } );
    addVelocityObject = new THREE.Mesh( plane, addVelocityMaterial );

    addVelocityScene.add(addVelocityObject);


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
    if(!pressed){
        addVelocityMaterial.uniforms.velocitySource.value.x = 0;
    
        addVelocityMaterial.uniforms.velocitySource.value.y = 0;
        
        
        addVelocityMaterial.uniforms.velocitySource.value.z = 0;
        addVelocityMaterial.uniforms.velocitySource.value.w = 0;
        return;
    }
    var mouseX = X;
    var mouseY = height - Y;
    
    
      
        addVelocityMaterial.uniforms.velocitySource.value.x = (mouseX - prevX);
    
        addVelocityMaterial.uniforms.velocitySource.value.y = (mouseY - prevY);
        
        
        addVelocityMaterial.uniforms.velocitySource.value.z = mouseX;
        addVelocityMaterial.uniforms.velocitySource.value.w = mouseY;

        
    
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
    if(event.key == "v"){
        color = -1.0;
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
function render() {

    requestAnimationFrame( render );

    dx = 1/(height/dimensions);
    dt = 1/60.0;
  

     //advect velocity

    
    advectMaterial.uniforms.timestep.value = dt;
    advectMaterial.uniforms.dx.value = dx;
    advectMaterial.uniforms.quantity.value = velocityA;
    advectMaterial.uniforms.velocity.value = velocityA;
    
    renderer.render(advectScene,camera,velocityB,true);
    swapVelocity();
    
    

    //diffuse velocity
    
    v = 100;
    console.log((dx * dx ) / (v * dt))
    for (var i = 0; i < 5; i ++ ){
        diffuseMaterial.uniforms.x.value = velocityA;
        diffuseMaterial.uniforms.b.value = velocityA;
        diffuseMaterial.uniforms.alpha.value = (dx*dx) / (v * dt) ;
        diffuseMaterial.uniforms.rBeta.value = 1.0/(4.0 + (dx * dx)/(v *dt))

        renderer.render(diffuseScene,camera,velocityB,true);
        swapVelocity();
    }
    
    

    
    //add velocity
    addVelocityMaterial.uniforms.bufferTexture.value = velocityA;
    renderer.render(addVelocityScene,camera,velocityB,true);
    swapVelocity();
   
    //compute pressure
    

    //subtract pressure

    
    
    
    //draw to screen
    showVelocityMaterial.uniforms.bufferTexture.value = velocityA;
    renderer.render(showVelocityScene,camera,velocityB,true);

    quad.material.map = velocityB;
    renderer.render( scene, camera );
    


}
render();