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
function scene_setup(){
    //This is the basic scene setup
    scene = new THREE.Scene();
    var width = window.innerHeight;
    var height = window.innerHeight;
    renderingRate = 1;
    dimensions = 1;
    objs = [];
    //Note that we're using an orthographic camera here rather than a prespective

    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
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


    //add color 

    addColorScene = new THREE.Scene();
    //Create 2 buffer textures
    colorA = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType });
    colorB = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,  type: THREE.HalfFloatType} );
    velocityA = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter,type: THREE.HalfFloatType});
    velocityB = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType} );

    //Pass textureA to shader
    addColorMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: colorA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},//Keeps the resolution
         smokeSource: {type:"v4",value:new THREE.Vector4(0,0,0,0)},
        },
        fragmentShader: document.getElementById( 'AddColorShader' ).innerHTML
    } );
    plane = new THREE.PlaneBufferGeometry( window.innerHeight, window.innerHeight );
    addColorObject = new THREE.Mesh( plane, addColorMaterial );

    addColorScene.add(addColorObject);


    //diffuse color
    diffuseScene = new THREE.Scene();

    diffuseMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: colorA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},//Keeps the resolution
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
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},
         velocitySource: {type:"v4",value:new THREE.Vector4(0,0,0,0)},

        },
        fragmentShader: document.getElementById( 'AddVelocityShader' ).innerHTML
    } );
    addVelocityObject = new THREE.Mesh( plane, addVelocityMaterial );

    addVelocityScene.add(addVelocityObject);

    //advect color

    //add velocity
    advectScene = new THREE.Scene();

    advectMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         densityTexture: { type: "t", value: colorA },
         velocityTexture: { type: "t", value: velocityA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},

        },
        fragmentShader: document.getElementById( 'AdvectionShader' ).innerHTML
    } );
    advectObject = new THREE.Mesh( plane, advectMaterial );

    advectScene.add(advectObject);



    //Draw textureB to screen 
    finalMaterial =  new THREE.MeshBasicMaterial({map: colorB});


    quad = new THREE.Mesh( plane, finalMaterial );
    scene.add(quad);
}
buffer_texture_setup();

var mouseDown = false;
function UpdateMousePosition(X,Y){
    var mouseX = X;
    var mouseY = window.innerHeight - Y;
    addColorMaterial.uniforms.smokeSource.value.x = mouseX/dimensions;
    addColorMaterial.uniforms.smokeSource.value.y = mouseY/dimensions;
    addColorMaterial.uniforms.smokeSource.value.z = color;
}
document.onmousemove = function(event){
    UpdateMousePosition(event.clientX,event.clientY)
}

document.onmousedown = function(event){
    
    addColorMaterial.uniforms.smokeSource.value.w = 1.0;
}
document.onmouseup = function(event){
    addColorMaterial.uniforms.smokeSource.value.w = 0.0;


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
    
  

   //velocity
    addColorMaterial.uniforms.bufferTexture.value = velocityA;
    renderer.render(addVelocityScene,camera,velocityB,true);

    swapVelocity();
    //diffusion
    addColorMaterial.uniforms.bufferTexture.value = colorA;
    renderer.render(addColorScene,camera,colorB,true);
    swapColor();
    if(!paused){
        for(var j = 0; j < 3; j++){
            diffuseMaterial.uniforms.bufferTexture.value = colorA;
            renderer.render(diffuseScene,camera,colorB,true);

            swapColor();
        }
    
    }
    
    //advect 
    if(!paused){
        advectMaterial.uniforms.densityTexture.value = colorA;
        advectMaterial.uniforms.velocityTexture.value = velocityA;
        renderer.render(advectScene,camera,colorB,true);
        swapColor();
    }
    
    //draw to screen
    quad.material.map = colorA;
    renderer.render( scene, camera );
    


}
render();