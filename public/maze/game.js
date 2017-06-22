

var count;
var maxFrames
var agents = [];
var population;
var goal;
var mutationRate;
var matingArr=[]
var obstacles = []
var maxSpeed
var p1; 
var p2;
var vecDensity;
var generation;
function setup() {
    width = $(window).width();
    height = $(window).height();

    var myCanvas = createCanvas(width, height);
    myCanvas.parent('myContainer');

    
    count = 0;
    generation = 0;
    maxFrames = 100;
    population = 100;
    mutationRate = 0.01;
    maxSpeed = 5
    vecDensity = 3;
    goal = {x:width/2, y:height/10}



    for(var i = 0; i < population; i++){
        var a = new agent ({x:width/2, y:height})
        a.randomize();
        agents.push(a)
    }
}

function draw(){
    if(count > maxFrames){
        count = 0;
        generation++;
        console.log(generation);
        regenerate();
    }
    background(50);

    for(var i = 0; i < agents.length; i++){
        var a = agents[i];
        a.update()
        a.draw();
        
    }
    stroke("#FFFFFF")
    strokeWeight(5)
    for(var i = 0; i < obstacles.length; i++){
        var o = obstacles[i]
        
        line(o.p1.x, o.p1.y, o.p2.x, o.p2.y);
        
    }
    noStroke();
    fill("#FF00FF")
    for(var i = 0; i < matingArr.length; i++){
        ellipse(matingArr[i].position.x,matingArr[i].position.y, 10, 10 )
    }

    fill("#FFAAAA")
    ellipse(goal.x, goal.y, 30,30)
    count = count + 1;
    
    
   
}
function regenerate(){
    nPop = []

    fitness()

    
     matingArr = selectMating();
    
    
   
    nPop = breed(matingArr);


    

   
    agents = nPop;
}
function breed(matingPool){
    var arr = []
    
    for(var i = 0 ; i < population; i++){
        var a = new agent({x:width/2, y:height});
        var first = matingPool[Math.floor(Math.random() * matingPool.length)]
        var second = matingPool[Math.floor(Math.random() * matingPool.length)]
        a.setDna(first.dna, second.dna);
        arr.push(a);
    }
    return arr;
}

function fitness(){
    
    var totalFitness  = 0;
    var minFitness = 10000000000000000000;
    var maxFitness = 0;

    for(var i = 0; i < agents.length; i++){
    
        var d = dist(agents[i].position.x, agents[i].position.y, goal.x, goal.y);

        agents[i].fitness = map(d, 0, width, width, 0);
        agents[i].fitness = Math.pow(agents[i].fitness, 4);
        if (agents[i].completed) {
            agents[i].fitness *= (maxFrames - agents[i].completedTime);
          
        }
        
        if (agents[i].crashed) {
            agents[i].fitness   /= 2
        }
        agents[i].fitness *= agents[i].fitness;
        if(agents[i].fitness < minFitness){
            minFitness = agents[i].fitness;
        }

        if(agents[i].fitness > maxFitness){
            maxFitness = agents[i].fitness;
        }
            

        

    }

    for(var i = 0; i < agents.length; i++){
        agents[i].fitness /= maxFitness

        agents[i].fitness =  Math.pow(agents[i].fitness , 4);
        totalFitness += agents[i].fitness;

    }
    for(var i = 0; i < agents.length; i++){
        
        agents[i].fitness /= totalFitness ;

    }

}
function selectMating(){
    var mating = []
    
    while(mating.length < agents.length/2 ){
        var i = Math.floor(Math.random() * agents.length);
        var j = Math.random();

        if(agents[i].fitness > j){
            mating.push(agents[i]);
        }
        
           
    }
    return mating;
}
var agent = function(position){
    this.position = position;
    this.velocity = {x: 0, y:0}
    this.acceleration = {x:0, y:0}
    this.dna = []
    this.completed = false;
    this.crashed = false;
    
    this.randomize = function(){
        
        /*for(var i = 0; i < maxFrames+1; i++){
            var x = Math.floor(Math.random() * 3)-1
            var y = Math.floor(Math.random() * 3)-1
            this.dna.push({x:x, y:y})
        }*/
        for (var i = 0; i < width/vecDensity; i++){
            this.dna.push([])
            for (var j = 0; j < height/vecDensity; j++){
                var x = Math.floor(Math.random() * 3)-1
                var y = Math.floor(Math.random() * 3)-1
                this.dna[i].push({x:x, y:y})
            }
        }

    }
    this.setDna = function(first, second){
        for (var i = 0; i < width/vecDensity; i++){
            this.dna.push([])
            for (var j = 0; j < height/vecDensity; j++){
                var r =Math.floor( Math.random() * 2);
                if(r == 0){
                    this.dna[i].push(first[i][j])
                }
                else{
                    this.dna[i].push(second[i][j])
                }
                var m = Math.random();
                if(m < mutationRate){
                    var x = Math.floor(Math.random() * 3)-1
                    var y = Math.floor(Math.random() * 3)-1
                    this.dna[i][j] = {x:x, y:y};
                }
               
            }
        }

       
    }
    this.update = function(){
        if(!this.completed && !this.crashed){
            var cellx =  Math.floor(this.position.x /vecDensity);
            var celly =  Math.floor(this.position.y /vecDensity);
            this.acceleration.x = this.dna[cellx][celly].x;
            this.acceleration.y= this.dna[cellx][celly].y;
            this.velocity.x += this.acceleration.x
            this.velocity.y += this.acceleration.y
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.acceleration.x = 0;
            this.acceleration.y = 0;
            var mag = Math.pow(Math.pow(this.velocity.x,2)  + Math.pow(this.velocity.y,2)  , 0.5 )
            if(mag > maxSpeed){
                this.velocity.x /= mag;
                this.velocity.y /= mag;
                this.velocity.x *= maxSpeed;
                this.velocity.y *= maxSpeed;

            }
            
            

        }
        if(this.crash()){
            this.crashed = true;
        }
        var d  = dist(this.position.x, this.position.y, goal.x, goal.y);
        if(d < 30 && !this.completed){
            this.completed = true;
            this.completedTime = count
        }
       
    }
    this.draw = function(){
        fill("#FFFFFF")
        ellipse(this.position.x, this.position.y, 10, 10);
    }
    this.crash = function(){
        var x = this.position.x;
        var y = this.position.y;
        for(var i = 0; i < obstacles.length; i++){
            var o = obstacles[i];
            var p1 = o.p1;
            var p2 = o.p2;
            var dist = distToSegment(this.position, p1, p2)
            
            
            if(dist < 5){
                this.crashed = true;
            }
        }
        if (this.position.x > width || this.position.x < 0) {
          this.crashed = true;
        }
        if (this.position.y > height || this.position.y < 0) {
          this.crashed = true;
        }

    }

}

function mousePressed() {
   p1 = {x:mouseX, y:mouseY}
}
function mouseReleased() {
   p2 = {x:mouseX, y:mouseY}
   obstacles.push({p1:p1, p2:p2})
}

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
