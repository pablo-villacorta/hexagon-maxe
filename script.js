var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var width = 500, height = 500;

canvas.width = width;
canvas.height = height;

var pause = 1;

var side = 15;
var ax = side*Math.cos(Math.PI/6);
var ay = side*Math.sin(Math.PI/6);

var rows, cols;
rows = Math.floor((height-ay)/(ay+side));
cols = Math.floor((width-ax)/(2*ax));

ctx.fillRect(0,0,width,height);

var grid = new Array(rows);
for(var i = 0; i < rows; i++){
  grid[i] = new Array(cols);
  for(var j = 0; j < cols; j++){
    grid[i][j] = new Cell(i,j);
  }
}

//set neighbours
for(var i = 0; i < rows; i++){
  for(var j = 0; j < cols; j++){
    grid[i][j].setNeighbours();
  }
}

var current = grid[0][0];
current.visited = true;

var stack = [];

function generate(){
  console.log("generating...");
  if(stillUnvisited()){
    var next = current.pickNeighbour();
    if(next){
      stack.push(current);
      removeWalls(current, next);
      current = next;
      current.visited = true;
    } else if(stack.length > 0){
        current = stack.pop();
    }
  } else {
    window.clearInterval(interval);
    start_solution();
  }

  background();
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < cols; j++){
      grid[i][j].fill();
      grid[i][j].show();
    }
  }
  current.fill("white");
  current.show();
}

function stillUnvisited(){
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < cols; j++){
      if(!grid[i][j].visited){
        return true;
      }
    }
  }
  return false;
}

function removeWalls(a,b){ //both a and b are cells
  if(a.i != b.i){
    if(a.i > b.i){
      if(a.i%2 == 0){
        if(b.j < a.j){
          a.walls[0] = false;
          b.walls[3] = false;
        } else {
          a.walls[1] = false;
          b.walls[4] = false;
        }
      } else {
        if(b.j > a.j){
          a.walls[1] = false;
          b.walls[4] = false;
        } else {
          a.walls[0] = false;
          b.walls[3] = false;
        }
      }
    } else {
      removeWalls(b,a);
    }
  } else {
    if(a.j < b.j){
      a.walls[2] = false;
      b.walls[5] = false;
    } else {
      a.walls[5] = false;
      b.walls[2] = false;
    }
  }

}

var interval = setInterval(generate, pause);

function Cell(i,j){
  this.i = i;
  this.j = j;
  this.walls = [];
  this.visited = false;
  for(var i = 0; i < 6; i++){
    this.walls.push(true);
  }
  this.neighbours = [];

  this.f = 0;
  this.g = 0;
  this.h = Math.abs(this.i-(rows-1))+Math.abs(this.j-(cols-1));
  this.previous = undefined;

  this.setNeighbours = function(){
    this.neighbours = [];
    var i = this.i;
    var j = this.j;
    if(i % 2 == 0){
      if(i > 0){
        this.neighbours.push(grid[i-1][j]);
        if(j > 0){
          this.neighbours.push(grid[i-1][j-1]);
        }
      }
      if(i < rows-1){
        this.neighbours.push(grid[i+1][j]);
        if(j > 0){
          this.neighbours.push(grid[i+1][j-1]);
        }
      }
    } else {
      if(i > 0){
        this.neighbours.push(grid[i-1][j]);
        if(j < cols-1){
          this.neighbours.push(grid[i-1][j+1]);
        }
      }
      if(i < rows-1){
        this.neighbours.push(grid[i+1][j]);
        if(j < cols-1){
          this.neighbours.push(grid[i+1][j+1]);
        }
      }
    }
    if(j > 0){
      this.neighbours.push(grid[i][j-1]);
    }
    if(j < cols-1){
      this.neighbours.push(grid[i][j+1]);
    }
  }

  this.setSolutionNeighbours = function(){
    this.neighbours = [];
    var i = this.i;
    var j = this.j;
    if(i % 2 == 0){
      if(i > 0){
        if(!this.walls[1]){
          this.neighbours.push(grid[i-1][j]);
        }
        if(j > 0 && !this.walls[0]){
          this.neighbours.push(grid[i-1][j-1]);
        }
      }
      if(i < rows-1){
        if(!this.walls[3]){
          this.neighbours.push(grid[i+1][j]);
        }
        if(j > 0 && !this.walls[4]){
          this.neighbours.push(grid[i+1][j-1]);
        }
      }
    } else {
      if(i > 0){
        if(!this.walls[0]){
          this.neighbours.push(grid[i-1][j]);
        }
        if(j < cols-1 && !this.walls[1]){
          this.neighbours.push(grid[i-1][j+1]);
        }
      }
      if(i < rows-1){
        if(!this.walls[4]){
          this.neighbours.push(grid[i+1][j]);
        }
        if(j < cols-1 && !this.walls[3]){
          this.neighbours.push(grid[i+1][j+1]);
        }
      }
    }
    if(j > 0 && !this.walls[5]){
      this.neighbours.push(grid[i][j-1]);
    }
    if(j < cols-1 && !this.walls[2]){
      this.neighbours.push(grid[i][j+1]);
    }
  }

  this.calc_f = function(){
    this.f = this.calc_g() + this.h;
    return this.f;
  }

  this.calc_g = function(){
    if(!this.previous){
      return 0;
    }
    return 1 + this.previous.calc_g();
  }

  this.pickNeighbour = function(){
    var unvisitedNeighbours = [];
    for(var i = 0; i < this.neighbours.length; i++){
      if(!this.neighbours[i].visited){
        unvisitedNeighbours.push(this.neighbours[i]);
      }
    }
    if(unvisitedNeighbours.length == 0){
      return undefined;
    }
    var r = Math.floor(Math.random()*unvisitedNeighbours.length);
    return unvisitedNeighbours[r];
  }

  this.show = function(){
    var x, y;
    if(this.i % 2 == 0){
      x = this.j*2*ax;
    } else {
      x = this.j*2*ax + ax;
    }
    var walls = this.walls;
    x+=1;
    y = this.i*(ay+side)+3*ay
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x,y);
    if(walls[5]){
      ctx.lineTo(x, y-side);
    } else {
      ctx.moveTo(x, y-side);
    }
    if(walls[0]){
      ctx.lineTo(x+ax, y-side-ay);
    } else {
      ctx.moveTo(x+ax, y-side-ay);
    }
    if(walls[1]){
      ctx.lineTo(x+2*ax, y-side);
    } else {
      ctx.moveTo(x+2*ax, y-side);
    }
    if(walls[2]){
      ctx.lineTo(x+2*ax, y);
    } else {
      ctx.moveTo(x+2*ax, y);
    }
    if(walls[3]){
      ctx.lineTo(x+ax, y+ay);
    } else {
      ctx.moveTo(x+ax, y+ay);
    }
    if(walls[4]){
      ctx.lineTo(x,y);
    } else {
      ctx.moveTo(x,y);
    }
    ctx.stroke();
  }

  this.fill = function(col){
    var x, y;
    if(this.i % 2 == 0){
      x = this.j*2*ax;
    } else {
      x = this.j*2*ax + ax;
    }
    var walls = this.walls;
    x+=1;
    y = this.i*(ay+side)+3*ay+1;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x, y-side);
    ctx.lineTo(x+ax, y-side-ay);
    ctx.lineTo(x+2*ax, y-side);
    ctx.lineTo(x+2*ax, y);
    ctx.lineTo(x+ax, y+ay);
    ctx.lineTo(x,y);
    if(this.visited){
      ctx.fillStyle = "#723372";
    } else {
      ctx.fillStyle = "#f44289";
    }
    if(col){
      ctx.fillStyle = col;
    }
    ctx.fill();
  }

  this.toPath = function(){
    path.push(this);
    if(this.previous){
      this.previous.toPath();
    }
  }
}

function background(){
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,canvas.width, canvas.height);
}

//------------------------------------------------------------------------------

var frontier = [grid[0][0]];
var explored = [];

function solution_setup(){
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < cols; j++){
      var cell = grid[i][j];
      cell.setSolutionNeighbours();
    }
  }
  grid[0][0].previous = undefined;
}

var path_color = "#78ed97";

function solve(){
  grid[0][0].previous = undefined;
  console.log("solving...");
  if(frontier.length == 0){
    alert("no solution");
    window.clearInterval(solve_interval);
    //final_paint();
  }
  path = remove_choice();
  current = path[path.length-1];
  explored.push(current);
  if(current.i == rows-1 && current.j == cols-1){
    window.clearInterval(solve_interval);
    //final_paint();
    console.log("solved :)");
  }
  for(var i = 0; i < current.neighbours.length; i++){
    if(!(frontier.includes(current.neighbours[i]) || explored.includes(current.neighbours[i]))){
      frontier.push(current.neighbours[i]);
      current.neighbours[i].previous = current;
    }
  }

  for(var i = 0; i < rows; i++){
    for(var j = 0; j < cols; j++){
      grid[i][j].fill();
      grid[i][j].show();
    }
  }

  explored.forEach(function(e){
    e.fill("#af1342");
    e.show();
  });

  frontier.forEach(function(e){
    e.fill("#35b1b7");
    e.show();
  });

  path.forEach(function(e){
    e.fill(path_color);
    e.show();
  });

  grid[0][0].fill("#db8c1e");
  grid[0][0].show();
  grid[rows-1][cols-1].fill("#db8c1e");
  grid[rows-1][cols-1].show();
}

function final_paint(){
  console.log("final paint");
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < cols; j++){
      grid[i][j].fill();
      grid[i][j].show();
    }
  }

  path.forEach(function(e){
    e.fill("blue");
    e.show();
  });

  var c = grid[rows-1][cols-1];
  while(c.previous){
    c.fill("blue");
    c.show();
    c = c.previous;
  }
}

function remove_choice(){
  var lowest = 0;
  for(var i = 0; i < frontier.length; i++){
    if(frontier[i].calc_f() < frontier[lowest].calc_f()){
      lowest = i;
    }
  }
  var c = frontier[lowest];
  frontier.splice(lowest,1);
  if(c.i == 0 && c.j == 0){
    return [c];
  }
  var tmp = c.previous;
  var p = [c];
  while(!(tmp.i == 0 && tmp.j == 0)){
    p.unshift(tmp);
    tmp = tmp.previous;
  }
  p.unshift(grid[0][0]);
  return p;
}

var solve_interval;

function start_solution(){
  solution_setup();
  solve_interval = setInterval(solve, pause);
}
