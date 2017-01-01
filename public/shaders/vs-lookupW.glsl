uniform sampler2D t_pos;
varying float w;

void main(){

  vec4 pos = texture2D( t_pos , position.xy );

  vec3 dif = cameraPosition - pos.xyz;
  w = pos.z;
  gl_PointSize = 1.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xy, 0. , 1. );


}
