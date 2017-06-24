//@author Omar Shehata. 2020.
//We are loading the Three.js library from the cdn here: https://cdnjs.com/libraries/three.js/
var scene;
var camera;
var renderer;
var objs;
var color = 1;
var renderingRate;
var dimensions;
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


var bufferScene;
var textureA;
var textureB;
var bufferMaterial;
var plane;
var bufferObject;
var finalMaterial;
var quad;

function buffer_texture_setup(){
    //Create buffer scene
    bufferScene = new THREE.Scene();
    //Create 2 buffer textures
    textureA = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    textureB = new THREE.WebGLRenderTarget( window.innerWidth/dimensions , window.innerHeight/dimensions, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );
    //Pass textureA to shader
    bufferMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: textureA },
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
         size: {type:"f",value:5.0,},
        },
        fragmentShader: document.getElementById( 'fragShader' ).innerHTML
    } );
    plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    bufferObject = new THREE.Mesh( plane, bufferMaterial );
    bufferScene.add(bufferObject);

    //Draw textureB to screen 
    finalMaterial =  new THREE.MeshBasicMaterial({map: textureB});
    quad = new THREE.Mesh( plane, finalMaterial );
    scene.add(quad);
}
buffer_texture_setup();

var mouseDown = false;
function UpdateMousePosition(X,Y){
    var mouseX = X;
    var mouseY = window.innerHeight - Y;
    bufferMaterial.uniforms.smokeSource.value.x = mouseX;
    bufferMaterial.uniforms.smokeSource.value.y = mouseY;
    bufferMaterial.uniforms.smokeSource.value.z = 0.1;
}
document.onmousemove = function(event){
    UpdateMousePosition(event.clientX,event.clientY)
}

document.onmousedown = function(event){
    X = event.clientX/dimensions
    Y = event.clientY/dimensions;
    mouseDown = true;
    var mouseX = X;
    var mouseY = window.innerHeight/dimensions - Y;
    
    objs.push(new THREE.Vector4( mouseX, mouseY, 1, color))
    console.log(objs.length)
    for(var i = 0; i < objs.length; i++){
        bufferMaterial.uniforms.objects.value[i] = objs[i];
    }
    
    bufferMaterial.uniforms.objectsLength.value = objs.length;
}
document.onmouseup = function(event){
    mouseDown = false;


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
};
//Render everything!
function render() {

  requestAnimationFrame( render );
    

  for(var i = 0; i < renderingRate; i++){
         //Draw to textureB
      renderer.render(bufferScene,camera,textureB,true);
        
      //Swap textureA and B
      var t = textureA;
      textureA = textureB;
      textureB = t;


      
      bufferMaterial.uniforms.bufferTexture.value = textureA;


      
    
      
      
  }
  quad.material.map = textureB;
  renderer.render( scene, camera );


}
render();