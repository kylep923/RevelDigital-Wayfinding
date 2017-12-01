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
var grid_width = document.getElementById("grid_x");
var grid_height = document.getElementById("grid_y");
var tile_Size = document.getElementById("tile_size");
var set_Node_Size = 30;
var grid_size_x = 64;
var grid_size_y = 36;
var storeArray = [];
var enterStoreMode = false;
var scaleObj;




submit.onclick = function() {

    var s = d3.selectAll('svg');
    s.remove();

    enterStoreMode = false;

    //drawArea.style.backgroundImage = 'url("' + input.value + '")';

    var image = document.createElement("IMG");
    image.setAttribute("src", input.value);
    image.setAttribute("id", "drawImage");
    image.setAttribute("style", "visibility: hidden;");
    document.body.appendChild(image);
    var drawImage = document.getElementById("drawImage");
    var imageHeight = image.clientHeight;
    var imageWidth = image.clientWidth;

    //drawArea.setAttribute("style", "width:" + imageWidth + "px; height:" + imageHeight + "px; background-image: " + 'url("' + input.value + '");');

    console.log(item);
    //console.log(scaleArray);

    $("#drawImage").remove();

    $("rect").remove();
    View.startNode = false;
    View.endNode = false;
    View.nodeSize = tile_Size.value;

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

    var item = {};
    item["imgHeight"] = $("svg").height();
    item["imgWidth"] = $("svg").width();
    item["tileSize"] = tile_Size.value;
    scaleObj = item;

    drawArea.setAttribute("style", "width:" + $("svg").width() + "px; height:" + $("svg").height() + "px; background-image: " + 'url("' + input.value + '");background-size: ' + $("svg").width() + 'px ' + $("svg").height() + 'px;');
}

addStore.onclick = function() {
    alert("Select coordinates on grid");
    enterStoreMode = true;

    console.log(storeArray);
}

exportStore.onclick = function() {
    var jsonStore = JSON.stringify(storeArray);

    download("Store.json", jsonStore);
}

get_array.onclick = function() {
    var gridArray = Controller.grid;
    gridArray["storeInfo"] = storeArray;
    gridArray["scaleInfo"] = scaleObj;
    gridArray["imageInfo"] = input.value;
    var jsonGrid = JSON.stringify(gridArray);

    download("Grid.json", jsonGrid);
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

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}