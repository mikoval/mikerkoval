

var balloons = []
var mode;
var instructions = true;
var holding = undefined;
function setup() {
   
    width = $(window).width();
    height = $(window).height();

    var myCanvas = createCanvas(width, height);
    myCanvas.parent('myContainer');
    
    
    stroke("#FFFFFF");
    strokeWeight(2);

    mode = "catenary"

}

function draw(){
    background(51);
    fill('#FFFFFF')
    textSize(20);
    strokeWeight(1)
    if(instructions){
        textAlign(LEFT);
        text("Instructions", 30,50)
        text("Press '1' for inverse kinematics", 30,50 + 30)
        text("Press '2' for inverse kinematics with gravity", 30,50  + 60)
        text("Press '3' for catenary curve", 30,50 + 90) 
        text("Click and drag the balloon holders to move them ", 30,50 + 120) 
        text("Press 'H' to toggle instructions", 30,50 + 150)
    }
    textAlign(CENTER);
    if(mode == "IK1"){
        text("Current mode: Inverse Kinematics", width/2, height - 50)
    }
    else if(mode == "IK2"){
        text("Current mode: Inverse Kinematics with gravity", width/2, height - 50 )
    }
    else if(mode == "catenary"){
        text("Current mode: Catenary Curve", width/2, height - 50  )
    }
    
    if(holding!=undefined){
        var balloon = balloons[holding];
        var differenceX = mouseX - balloon.root.x 
        var differenceY = mouseY - balloon.root.y 
        balloon.root.x = mouseX;
        balloon.root.y = mouseY;
        balloon.rope.root.x = mouseX;
        balloon.rope.root.y = mouseY;
        balloon.vel.x += differenceX/10;
        balloon.vel.y += differenceY/10;
    }
  
    for(var i = 0 ; i < balloons.length;i++){
        for(var j = i+1; j < balloons.length; j++){

            balloon1 = balloons[i]
            balloon2 = balloons[j]
            var dir = {x: balloon1.pos.x - balloon2.pos.x, y: balloon1.pos.y - balloon2.pos.y}
            var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            if(mag*2 < balloon1.radius + balloon2.radius){
                var tmpB1 = {x: balloon1.pos.x + balloon1.vel.x, y:balloon1.pos.y + balloon1.vel.y}
                var tmpB2 = {x: balloon2.pos.x + balloon2.vel.x, y:balloon2.pos.y + balloon2.vel.y}
                var dir2 = {x: tmpB1.x - tmpB2.x, y: tmpB1.y - tmpB2.y}

                var mag2 = Math.sqrt(dir2.x * dir2.x + dir2.y * dir2.y);
                if(mag2 < mag){
                    
                    dir.x = dir.x / mag;
                    dir.y = dir.y/mag;

                    var a1 = balloon1.vel.x * dir.x + balloon1.vel.y * dir.y;
                    var a2 = balloon2.vel.x * dir.x + balloon2.vel.y * dir.y;

                    var m1 = balloon1.area;
                    var m2 = balloon2.area;

                    var optimizedP = (2.0 * (a1 - a2)) /(m1 + m2);

                    dir.x = dir.x * optimizedP;
                    dir.y = dir.y * optimizedP;
                    
                    balloon1.vel.x = balloon1.vel.x -(dir.x * m2) ;
                    balloon1.vel.y = balloon1.vel.y -(dir.y * m2);

                    balloon2.vel.x = balloon2.vel.x +(dir.x * m1);
                    balloon2.vel.y = balloon2.vel.y +(dir.y * m1);

                }
            }

        }

        balloons[i].update()
        balloons[i].draw()
    }
   
}
function mousePressed() {
    var hit = false;
    for(var i = 0; i < balloons.length; i++){
        var p = balloons[i].root;
        var dx = p.x - mouseX;
        var dy = p.y - mouseY;
        if(Math.sqrt(dx * dx + dy * dy) < 25/2 ){
            var hit = true;
            holding = i;
        }
    }
    if(!hit){
        var ball = new balloon(mouseX, mouseY, Math.round(Rand.normal() * 80) + 100, Math.round(Rand.normal() * 50 )+ 50)
        balloons.push(ball)
    }
    
  

}
function mouseReleased(){
    holding = undefined;
}
function keyPressed(e) {
  if (e.key == "1") {
    mode = "IK1"
  } 
  else if  (e.key == "2") {
    mode = "IK2";
  }
  else if  (e.key == "3") {
    mode = "catenary";
  }
  else if  (e.key == "h") {
    instructions = !instructions;
  }
}
