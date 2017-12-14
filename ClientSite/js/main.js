function loadEditor() {
    if (!Raphael.svg) {
        window.location = './notsupported.html';
    }

    // suppress select events
    $(window).bind('selectstart', function(event) {
        event.preventDefault();
    });

    // initialize visualization
    Panel.init();
    Controller.init();
}

var input = document.getElementById("input");
var store = document.getElementById("store");
var drawArea = document.getElementById("draw_area");
var imgArea = document.getElementById("img_area");
var grid_width = document.getElementById("grid_x");
var grid_height = document.getElementById("grid_y");
var tile_Size = document.getElementById("tile_size");
var set_Node_Size = 30;
var grid_size_x = 64;
var grid_size_y = 36;
var storeArray = [];
var transitionArray = [];
var enterStoreMode = false;
var enterTransitionMode = false;
var scaleObj;
var grid_name = "";
var grid_description = "";
var imgArray = [];
var width = 0;
var height = 0;



submit.onclick = function() {

    var s = d3.selectAll('svg');
    var i = d3.selectAll('img');
    s.remove();
    i.remove();
    width = 0;
    height = 0;
    enterStoreMode = false;

    loadGrid();

}


//------------------------------------------------------------
// NEW FUNCTIONS HERE
//------------------------------------------------------------
function loadGrid() {
    var x = 0;
    var y = 0;
    // Create Image html elements
    var loopArray = function(arr) {
        alertWhenDone("Creating Image " + x, function() {
            x++;
            floorNum = x;
            var image = document.createElement("IMG");
            image.setAttribute("id", "floor" + floorNum);
            imgArea.appendChild(image);
            if (x < arr.length) {
                loopArray(arr);
            }
        });
    }
    loopArray(imgArray);

    // Populate each image with an image for that floor
    var loopArray2 = function(arr) {
        alertWhenDone(y + 1, function() {
            y++;
            floorNum = y;
            var image = document.getElementById("floor" + floorNum);
            var downloadingimage = new Image();
            downloadingimage.onload = function() {
                image.src = this.src;

                width = image.clientWidth;
                height += image.clientHeight;
                drawArea.width = width;
                console.log(width);
                console.log(height);

                image.width = width;
                image.height = image.clientHeight;
                image.display = "block";
                //drawArea.appendChild(image);
                if (y < arr.length) {
                    loopArray2(arr);
                } else {
                    drawGrid();
                }
            }
            downloadingimage.src = imgArray[y - 1];
        });
    }
    loopArray2(imgArray);

    //drawArea.setAttribute("style", "width:" + width + "px height:" + height + "px;");
    //console.log(width + " " + height);

}

function alertWhenDone(msg, callback) {
    console.log(msg);
    callback();
}

function drawGrid() {
    console.log(height);

    imageHeight = height;
    imageWidth = width;

    $("rect").remove();
    View.startNode = false;
    View.endNode = false;
    View.nodeSize = tile_Size.value;

    console.log(Math.round(imageWidth / parseInt(tile_Size.value)));
    console.log(Math.round(imageHeight / parseInt(tile_Size.value)));

    Controller.gridSize[0] = Math.round(imageWidth / parseInt(tile_Size.value));
    Controller.gridSize[1] = Math.round(imageHeight / parseInt(tile_Size.value));

    var numCols = Controller.gridSize[0],
        numRows = Controller.gridSize[1];

    Controller.grid = new PF.Grid(numCols, numRows);


    View.init({
        numCols: Math.round(imageWidth / parseInt(tile_Size.value)),
        numRows: Math.round(imageHeight / parseInt(tile_Size.value))
    });

    View.generateGrid(function() {
        Controller.setDefaultStartEndPos();
        Controller.bindEvents();
        //Controller.transition(); // transit to the next state (ready)
    });

    drawArea.setAttribute("style", "width:" + $("svg").width() + "px; height:" + $("svg").height() + "px;");
    imgArea.setAttribute("style", "width:" + $("svg").width() + "px; height:" + $("svg").height() + "px;");

    for (var x = 0; x < imgArray.length; x++) {
        floorNum = x + 1;
        resizeImage("floor" + floorNum, $("svg").height() / imgArray.length, $("svg").width());
    }

    var item = {};
    item["imgHeight"] = $("svg").height();
    item["imgWidth"] = $("svg").width();
    item["tileSize"] = tile_Size.value;
    scaleObj = item;

}

function resizeImage(imgID, height, width) {
    img = document.getElementById(imgID);
    img.setAttribute("style", "width:" + width + "px; height:" + height + "px;");

}
//------------------------------------------------------------
//------------------------------------------------------------


addStore.onclick = function() {
    alert("Select coordinates on grid");
    enterStoreMode = true;

    console.log(storeArray);
}

function addTransition() {
    alert("Select coordinates on grid");
    enterTransitionMode = true;

    console.log(transitionArray);
}

add_grid_url.onclick = function() {
    imgURL = document.getElementById("grid_url");
    imgArray.push(imgURL.value);
    $('#grid_url').val('');
    console.log(imgURL.value);
    console.log(imgArray);
}

create_grid.onclick = function() {
    document.getElementById("createGridModal").style.display = "none";

    var s = d3.selectAll('svg');
    s.remove();

    enterStoreMode = false;

    loadGrid();
}

get_array.onclick = function() {
    // Get the modal
    var modal = document.getElementById('myModal');
    modal.style.display = "block";

    add_name.onclick = function() {
        var grid_input_name = document.getElementById('grid_name');
        var grid_input_description = document.getElementById('grid_description');
        grid_name = grid_input_name.value;
        grid_description = grid_input_description.value;
        //check if the 
        firebase.database().ref('/' + api_key + '/grids/' + grid_name).once('value').then(function(snapshot) {
            grid = snapshot.val();
            if (!grid) {
                console.log(grid_name);
                modal.style.display = "none";

                var gridArray = Controller.grid;
                gridArray["storeInfo"] = storeArray;
                gridArray["scaleInfo"] = scaleObj;
                gridArray["imageInfo"] = imgArray;
                gridArray["floorInfo"] = transitionArray;
                var jsonGrid = JSON.stringify(gridArray);
                writeGridData(grid_name, jsonGrid, grid_description);
                loadListPage();
                alert("Grid " + grid_name + " Added Sccussfully");
            } else {
                alert("Error: That name already exits!");
            }
        });

    }

    //download("Grid.json", jsonGrid);
}

function getStore(gridX, gridY) {
    if (enterStoreMode == true) {
        var name = prompt("Enter store name");
        storeArray.push({
            x: gridX,
            y: gridY,
            name: name
        });
        enterStoreMode = false;
    }
    Controller.rest();
    return;
}

function getTransition(gridX, gridY) {
    if (enterTransitionMode == true) {
        floorNum = Math.ceil(gridX / (height / imgArray.length));
        transitionArray.push({
            Floor: floorNum,
            x: gridX,
            y: gridY
        });
        enterTransitionMode = false;
    }
    Controller.rest();
    return;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}