
function balloon(x,y,radius, length){

    this.pos = {x:x, y:y}
    this.root = {x:x, y:y}
    this.vel = {x:0, y:0}

    this.radius = radius;
    this.length = length
    this.rope= new rope(x,y,this.length,radians(-90), this);
    this.area = this.radius * this.radius  * PI;

    this.color = rgbToHex( Rand.int(0,255), Rand.int(0,255), Rand.int(0,255));

    this.draw = function(){
        this.rope.update()
        this.rope.draw()

        fill(this.color )
        noStroke()
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius)
        stroke("#FFFFFF");
        
        
    }
    this.update = function(){

        this.vel.y = this.vel.y - 0.1;

        var dirToMouse = {x: mouseX - this.pos.x, y: mouseY - this.pos.y}
        var distToMouse = Math.sqrt(dirToMouse.x * dirToMouse.x + dirToMouse.y * dirToMouse.y)


        if(distToMouse < this.radius /2 && distToMouse > 0){
            this.vel.x = -dirToMouse.x / distToMouse  * 5
            this.vel.y = -dirToMouse.y  / distToMouse * 5
        }
        var dir = {x:this.root.x - this.pos.x , y:(this.root.y - this.radius/2.5) - this.pos.y }
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

        var dot = dir.x * this.vel.x + dir.y * this.vel.y;
        if(mag > this.length * 5 && dot < 0 ){
          
            dir.x = dir.x/ mag;
            dir.y = dir.y/ mag;
             dot = dir.x * this.vel.x + dir.y * this.vel.y;
            var vel = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y )
            this.vel.x += dir.x * -dot  * 1.9 ;
            this.vel.y += dir.y * -dot  * 1.9;
            vel = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y )


        }

        this.vel.x = this.vel.x * 0.99
        this.vel.y = this.vel.y * 0.99
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
}

function rope(x, y, size, direction, balloon){
    this.balloon = balloon
    this.root = {x:x, y:y};
    this.segments = []
    this.segments.push(new rootSegment(x,y,5,direction, 0, this.balloon) )
    for(var i = 1; i < size; i++){
        
        
        this.segments.push(new bodySegment(this.segments[i-1],5,0 )  )
        this.segments[i].update();
    }
    this.update = function(){
        for(var i = this.segments.length-1; i >= 0; i--){
            
            if(i == this.segments.length-1) {
            
                this.segments[i].a.x = this.root.x 
                this.segments[i].a.y = this.root.y + this.segments[i].length;
                this.segments[i].angle = PI/2
                this.segments[i].b = this.segments[i].calculateB();
            }
            else{
                this.segments[i].a.x = this.segments[i+1].a.x
                this.segments[i].a.y = this.segments[i+1].a.y+ this.segments[i].length;
                this.segments[i].angle = PI/2
                this.segments[i].b = this.segments[i].calculateB();
            }
           
        }
        for(var l = 0; l < 3; l++ ){
            for(var i = 0; i < this.segments.length; i++){
            
               this.segments[i].follow(this.balloon.pos.x, this.balloon.pos.y + this.balloon.radius/2.5);
               this.segments[i].update();
            }
            var last = this.segments[this.segments.length -1]
            var dx = last.b.x - this.root.x;
            var dy = last.b.y - this.root.y;
      
            for(var i = 0; i < this.segments.length; i++){
              
                this.segments[i].a.x -= dx;
                this.segments[i].a.y -= dy;
                this.segments[i].b.x -= dx;
                this.segments[i].b.y -= dy;

            }
        }
        

    }
    this.draw = function(){
        for(var i = 0; i < this.segments.length; i++){
            this.segments[i].draw();
        }
    }
}
function rootSegment(x, y, length, angle, t, balloon) {
    
    this.a = {x:x, y:y};
    this.length = length;
    this.rootAngle = angle;
    this.angle = 0;
    this.b  = {x:x, y:y}
    this.balloon = t

    this.calculateB = function(){
        var dx = this.length * cos(this.angle)
        var dy = this.length * sin(this.angle);
        return {x:this.a.x + dx, y: this.a.y + dy}
    }
    this.draw = function(){
        line(this.a.x, this.a.y, this.b.x, this.b.y)
        
    }
    this.update = function(){
        this.b = this.calculateB();

    }
    this.follow = function(tx, ty){


        var dir = {x: tx - this.a.x, y: -(ty - this.a.y)}
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
        if(mag < 3){
            return
        }
        dir.x = dir.x / mag;
        dir.y = dir.y/mag;
        var angle = atan2(dir.x, dir.y);
        this.angle = angle + PI/2;

        dir.x = dir.x * mag 
        dir.y = dir.y * mag 

        this.a.x = this.a.x + dir.x
        this.a.y = this.a.y + -dir.y
        

    }

}
function bodySegment(parent, length, angle, t, tail, rate){
    this.parent = parent;
    this.a = {x: parent.b.x, y:parent.b.y}
    this.length = length;
    this.angle = 0;
    this.selfAngle = angle;
    this.t = t;
    this.rate = rate;
    this.tail = tail;

    this.calculateB = function(){
        var dx = this.length * cos(this.angle)
        var dy = this.length * sin(this.angle);
        return {x:this.a.x + dx, y: this.a.y + dy}
    }
    this.draw = function(){
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }
    this.update = function(){
        this.angle = this.angle
        this.b = this.calculateB();

    }
    this.follow = function(){

        var tx = this.parent.b.x;
        var ty = this.parent.b.y;
        var dir = {x: tx - this.a.x, y: -(ty - this.a.y)}
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
        if(mag <3){
            return
        }
        dir.x = dir.x / mag;
        dir.y = dir.y/mag;
        var angle = atan2(dir.x, dir.y);
        this.angle = angle + PI/2;

        dir.x = dir.x * mag 
        dir.y = dir.y * mag 

        this.a.x = this.a.x + dir.x
        this.a.y = this.a.y + -dir.y
        

    }
}
function rgbToHex(r, g, b) {
    console.log(r + " , " + g + " , " + b)
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}