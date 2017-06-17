

var balloons = []

function setup() {
   
    width = $(window).width();
    height = $(window).height();

    var myCanvas = createCanvas(width, height);
    myCanvas.parent('myContainer');
    
    
    stroke("#FFFFFF");
    strokeWeight(2);

}

function draw(){
    background(51);
  
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

                    var optimizedP = (2.0 * (a1 - a2)) /2.0;
                    dir.x = dir.x * optimizedP;
                    dir.y = dir.y * optimizedP;
                    
                    balloon1.vel.x = balloon1.vel.x -dir.x;
                    balloon1.vel.y = balloon1.vel.y -dir.y;

                    balloon2.vel.x = balloon2.vel.x +dir.x;
                    balloon2.vel.y = balloon2.vel.y +dir.y;

                }
            }

        }

        balloons[i].update()
        balloons[i].draw()
    }
   
}
function mouseClicked() {
   var ball = new balloon(mouseX, mouseY, 100)
   balloons.push(ball)
  

}

