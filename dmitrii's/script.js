console.log("start");


function readTextFile() {
  console.log(DATA);
  return DATA;
}


function getPath() {

  var data = readTextFile();
  
  var matrix = data.nodes.map(function (nested) {
    return nested.map(function (element) {
        return element.walkable ? 0 : 1;
    });
});

 console.log(matrix);

  var grid = new PF.Grid(matrix);
  
  var finder = new PF.AStarFinder();
  var path = finder.findPath(50, 70, 40, 40, grid);
 
  return path;
}



window.onload = function() {
  // Get a reference to the canvas object
  var canvas = document.getElementById('myCanvas');
  // Create an empty project and a view for the canvas:
  paper.setup(canvas);
  // Create a Paper.js Path to draw a line into it:
  var path = new paper.Path();
  // Give the stroke a color
  path.strokeColor = 'black';

  var data = getPath();
  console.log(data);

  var start = new paper.Point(data[0]);
  // Move to start and draw a line from there
  path.moveTo(start);

  data.forEach(function(element) {
    path.lineTo(start.add(new paper.Point(element[0] * 100, element[1] * 10)));
  }, this);

  path.closed = false;

  // Select the path, so we can see its handles:
  path.fullySelected = true;

  path.smooth();
  
  // Draw the view now:
  paper.view.draw();
}