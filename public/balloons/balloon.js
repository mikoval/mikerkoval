
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

        
        

        fill("#000000")
        stroke("#FFFFFF");
        ellipse(this.root.x, this.root.y, 20, 20)
        

        noStroke()
        fill(this.color )
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius)

        stroke("#FFFFFF");
        
        
    }
    this.update = function(){

        this.vel.y = this.vel.y - 0.1;

        var dirToMouse = {x: mouseX - this.pos.x, y: mouseY - this.pos.y}
        var distToMouse = Math.sqrt(dirToMouse.x * dirToMouse.x + dirToMouse.y * dirToMouse.y)


        if(distToMouse < this.radius /2 && distToMouse > 0){
            this.vel.x = -dirToMouse.x / distToMouse  * 10
            this.vel.y = -dirToMouse.y  / distToMouse * 10
        }
        var dir = {x:this.root.x - this.pos.x , y:this.root.y - (this.pos.y + this.radius/2.5)}
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

        var dot = dir.x * this.vel.x + dir.y * this.vel.y;
        if(mag > this.length * 5 && dot < 0 ){
          
            dir.x = dir.x/ mag;
            dir.y = dir.y/ mag;
             dot = dir.x * this.vel.x + dir.y * this.vel.y;
            var vel = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y )
            this.vel.x += dir.x * -dot  * 1.6 ;
            this.vel.y += dir.y * -dot  * 1.6;
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
        if(mode == "IK1"){
            this.IK1();
        }
        else if(mode == "IK2"){
            this.IK2();
        }
        else if(mode == "catenary"){
            if(Math.abs(this.balloon.pos.x - this.root.x) < 10){
                this.IK1();
            }
            else{
                this.catenary();
            }
            
        }
    }
    this.catenary = function(){
        var p1 = {x: this.balloon.pos.x, y:this.balloon.pos.y + this.balloon.radius/5}
        catenary(p1, this.root, this.segments.length* 5.1, this.segments.length)


    }
    this.IK2 = function(){
        for(var i = 0; i < this.segments.length; i++){
            
               this.segments[i].follow(this.balloon.pos.x, this.balloon.pos.y + this.balloon.radius/2.2, 5);
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
    this.IK1 = function(){
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
        if(mode == "catenary"){
            if(Math.abs(this.balloon.pos.x - this.root.x) >= 10){
                return;
            }

        }
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
    this.follow = function(tx, ty, dist = 3){


        var dir = {x: tx - this.a.x, y: -(ty - this.a.y)}
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
        if(mag < dist){
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
    //console.log(r + " , " + g + " , " + b)
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

var catenary = function(p1, p2, dist, segments){

    if(p1.x > p2.x){
        var tmp = p1;
        p1 = p2;
        p2  = tmp;
    }
    var v = p2.y - p1.y;
    var h = p2.x - p1.x;




    var s = dist;

    if( Math.sqrt(h*h + v*v)  > s){
        line(p1.x, p1.y, p2.x, p2.y)
        return;
    }
    

    


    var k = function (a){
                
      
        return Math.pow((2 * a*Math.sinh(h/(2 * a)) - Math.sqrt(s*s-v*v)), 2)
    }
    var d = function(a){
        var part1 = 2 * Math.sinh(h/(2*a)) - (h * Math.cosh(h/(2 * a)  ))  / a  ;

        var part2 = 2 * a*Math.sinh(h/(2 * a)) - Math.sqrt(s*s-v*v);
        return (  2 * part1 * part2);
    }

    
    var a = newtonRaphson(k, d, h/100)

    var x2b = - 1/2 * (a * Math.log((s + v)/(s-v) ) - h  )
    var x1b = -1/2 * (a * Math.log((s + v)/(s-v) ) + h  )

    var y1b = -a * Math.cosh(x1b / a);
    var y2b = -a * Math.cosh(x2b / a);

    var xshift =  x1b - p1.x;
    var yshift =  y1b - p1.y ;

    var step = h / segments


    

    

    

    for(var i = p1.x; i <=  p2.x -step; i = i + step){
        
        var x1 = i;
        var x2 = i + step;

        

        var y1 =   -a * Math.cosh( (x1 + xshift) / a) - yshift;
        var y2 =  -a * Math.cosh( (x2 + xshift) / a)  - yshift;

      

        /*x1 = x1 + width/2
        x2 = x2 + width/2
        y1 = y1 + height/2
        y2  = y2 + height/2*/
        line (x1, y1, x2, y2)

    }
}
function newtonRaphson (f, fp, x0, options) {
  var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;

  // Iterpret variadic forms:
  if (typeof fp !== 'function') {
    options = x0;
    x0 = fp;
    fp = null;
  }

  options = options || {};
  tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
  eps = options.epsilon === undefined ? 2.220446049250313e-16 : options.epsion;
  maxIter = options.maxIterations === undefined ? 2000 : options.maxIterations;
  h = options.h === undefined ? 1e-4 : options.h;
  verbose = options.verbose === undefined ? false : options.verbose;
  hr = 1 / h;

  iter = 0;
  while (iter++ < maxIter) {
    // Compute the value of the function:
    y = f(x0);

    if (fp) {
      yp = fp(x0);
    } else {
      // Needs numerical derivatives:
      yph = f(x0 + h);
      ymh = f(x0 - h);
      yp2h = f(x0 + 2 * h);
      ym2h = f(x0 - 2 * h);

      yp = ((ym2h - yp2h) + 8 * (yph - ymh)) * hr / 12;
    }

    // Check for badly conditioned update (extremely small first deriv relative to function):
    if (Math.abs(yp) <= eps * Math.abs(y)) {
      if (verbose) {
        console.log('Newton-Raphson: failed to converged due to nearly zero first derivative');
      }
      return false;
    }

    // Update the guess:
    x1 = x0 - y / yp;

    // Check for convergence:
    if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (verbose) {
        console.log('Newton-Raphson: converged to x = ' + x1 + ' after ' + iter + ' iterations');
      }
      return x1;
    }

    // Transfer update to the new guess:
    x0 = x1;
  }

  if (verbose) {
    console.log('Newton-Raphson: Maximum iterations reached (' + maxIter + ')');
  }

  return false;
}