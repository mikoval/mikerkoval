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
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderingRate = 1;
    dimensions = 2;
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
var addColorMaterial;
var diffuseMaterial;
var plane;
var bufferObject;
var diffuseObject;
var finalMaterial;
var quad;

function buffer_texture_setup(){
    //Create buffer scene
    addColorScene = new THREE.Scene();
    //Create 2 buffer textures
    colorA = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    colorB = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

    //Pass textureA to shader
    addColorMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: colorA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},//Keeps the resolution
         smokeSource: {type:"v4",value:new THREE.Vector4(0,0,0,0)},
        },
        fragmentShader: document.getElementById( 'AddColorShader' ).innerHTML
    } );
    plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    addColorObject = new THREE.Mesh( plane, addColorMaterial );

    addColorScene.add(addColorObject);



    diffuseScene = new THREE.Scene();

    diffuseMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: colorA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth/dimensions,window.innerHeight/dimensions)},//Keeps the resolution
         smokeSource: {type:"v3",value:new THREE.Vector3(0,0,0)},
         objects: {type:"v4v",value:[
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),new THREE.Vector4(0,0,0,0),
         ],},
         objectsLength: {type:"i",value:0,},
         wind: {type:"f",value:0.0,},
        },
        fragmentShader: document.getElementById( 'DiffusionShader' ).innerHTML
    } );
    diffuseObject = new THREE.Mesh( plane, diffuseMaterial );

    diffuseScene.add(diffuseObject);



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
    console.log(addColorMaterial.uniforms.smokeSource.value)
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
function swap(){
    var t = colorA;
    colorA = colorB;
    colorB = t;
}
function render() {

    requestAnimationFrame( render );
    
  

   //velocity
    
    
    //diffusion
    addColorMaterial.uniforms.bufferTexture.value = colorA;
    renderer.render(addColorScene,camera,colorB,true);
    swap();
    if(!paused){
        for(var j = 0; j < 1; j++){
            diffuseMaterial.uniforms.bufferTexture.value = colorA;
            renderer.render(diffuseScene,camera,colorB,true);

            swap();
        }
    
    }
    
    //advect 
    
    //draw to screen
    quad.material.map = colorA;
    renderer.render( scene, camera );


}
render();