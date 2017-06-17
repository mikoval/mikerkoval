Rand = {
    float: function(){
        return Math.random();
    },
    int: function(a, b){
        return Math.floor(Math.random() * (b-a)) + a;
    },
    normal: function(){
        return ((Math.random() + Math.random() + Math.random() + Math.random() + 
            Math.random() + Math.random() )- 3) / 3;
    }
}