uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform vec2  resolution;

uniform float dT;
uniform vec3 centerPos;
$rand

void main(){

  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  float x = 0.;
  float y = 0.;

  float life = pos.w;
  vec3 vel = pos.xyz - oPos.xyz;
  if(life < 100.0){
  	   x = pos.x;
      y = pos.y;

  	 
  	 life = 101.1;
  }
  
  else{
  	float distx = pos.x - centerPos.x;
  	float disty = pos.y - centerPos.y;
  	float radius = sqrt(distx * distx + disty * disty);
  	
  		x = pos.x + vel.x * .95 +  distx * 1.0/(radius*radius * radius * radius * .1);
  		y = pos.y + vel.y * .95 +  disty * 1.0/(radius*radius * radius * radius * .1);
  	   

  }
  




  gl_FragColor = vec4( x, y, 0 , life );


}
