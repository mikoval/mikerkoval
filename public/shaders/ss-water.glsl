const int colliders = @COLLIDERS;

uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform vec2  resolution;

uniform float dT;
uniform float t;
uniform vec3 centerPos;
uniform vec3  colliderPositions[ colliders ];
$rand

void main(){

  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  float x = 0.;
  float y = 0.;
  float w = 0.;

  float life = pos.w;
  vec3 vel = pos.xyz - oPos.xyz;


  if(life < 100.0){
  	   x = pos.x;
      y = pos.y;
      w = 1.0;

  	 
  	 life = 101.1;
  }
  
  else{
    if(pos.y < -149.0){
   
      y = (rand(uv * t + 2.0)-0.5) * 600.0 + 350.0;;
      x = (rand(uv * t + 1.0)-0.5) * 300.0;
      life = 0.0;
      w = 1.0;
    }
    else{
      

      x = pos.x;
      y = pos.y;
      
      
      float hit = 0.0;
      for( int i = 0; i < colliders; i++ ){
        float distx = x - colliderPositions[i].x;
        float disty = y - colliderPositions[i].y;
        if(sqrt(distx * distx + disty * disty) < 10.){
          x += distx * .02  ;
          y += disty * .02  ;
          w = 0.0;
          hit = 1.0;
        }

      }
      

      if(hit == 0.0){
         x = pos.x + vel.x  * .95 ;
        y = pos.y +  vel.y * 1.0 - .02;
        w = pos.z + .3;

      }
     


    }
  	
  	   

  }
  




  gl_FragColor = vec4( x, y, w , life );


}
