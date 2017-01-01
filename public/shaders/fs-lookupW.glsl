varying float w;
void main(){
	if(w < 1.){
		gl_FragColor = vec4( 0.6, 0.6, 1.0, 1. );
	}
	else{
		gl_FragColor = vec4( 0.3, 0.3, 1.0, 1. );
	}
  

}
