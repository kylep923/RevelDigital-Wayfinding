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
var transitionStartArray = [];
var transitionEndAray = [];
var enterStoreMode = false;
var enterTransitionMode = false;
var current_floor = 1;
var start_end = "start";
var scaleObj;
var buildingName = "";
var buildingDescription = "";
var imgArray = [];
var floorArray = {};
var currentFloor = 0;
var width = 0;
var height = 0;
var obj;


// Reloading the grid and images. for adjusting tile size
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

function saveFloor(floorName) {
    var gridItem = {};
    gridItem["name"] = floorName;
    gridItem["floorGrids"] = Controller.grid;
    gridItem["gridImage"] = imageURL;
}

function loadOldGrid(api_key, buildingName) {
    document.getElementById("editor_container").style.display = "inline";
    document.getElementById("login_container").style.display = "none";
    document.getElementById("grid_list_container").style.display = "none";
    document.getElementById("buildingName").value = buildingName;

    current_floor = 1;

    loadEditor();

    var s = d3.selectAll('svg');
    var i = d3.selectAll('img');
    s.remove();
    i.remove();
    width = 0;
    height = 0;

    enterStoreMode = false;

    firebase.database().ref('/' + api_key + '/buildings/' + buildingName).once('value').then(function(snapshot) {
        if (snapshot.val() !== null) {
            console.log(snapshot.val())
            obj = JSON.parse(snapshot.val().floorGrids);
            floorArray = obj;
            console.log(floorArray);
            imgArray = obj[current_floor].imageInfo;
            console.log(imgArray);

            loadGrid();


            //document.getElementById("continueModal").style.display = "inline";
            /*
                        var matrix = obj.nodes.map(function(nested) {
                            return nested.map(function(element) {
                                return Controller.setWalkableAt(element.x, element.y, element.walkable);
                                //return element.walkable ? 0 : 1;
                            });
                        });
            */
        }
    });
}

//continue_btn.onclick = function() {

function finishLoadingGrid() {
    if (floorArray != {}) {
        var matrix = floorArray[current_floor].nodes.map(function(nested) {
            return nested.map(function(element) {
                Controller.setWalkableAt(element.x, element.y, element.walkable);
                return element.walkable ? 0 : 1;
            });
        });
        //document.getElementById("continueModal").style.display = "none";
        console.log(matrix);
    }
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


//------------------------------------------------------------
// ENTERING STORE AND TRANSITION INFO HERE 
//------------------------------------------------------------

addStore.onclick = function() {
    alert("Select coordinates on grid");
    enterStoreMode = true;

    console.log(storeArray);
}

add_transition_btn.onclick = function() {
    if (current_floor < imgArray.length) {
        current_floor++;
        addTransition(current_floor, start_end);
    } else {
        alert("You have already entered transition corridnates for each floor");
    }
}

function addTransition(current_floor, start_end) {
    alert("Select transition " + start_end + " coordinates on grid for floor " + current_floor);
    enterTransitionMode = true;
}


function getStore(gridX, gridY) {
    if (enterStoreMode == true) {
        var name = prompt("Enter store name");
        floorNum = Math.ceil(gridX / (height / imgArray.length));
        storeArray.push({
            x: gridX,
            y: gridY,
            floor: floorNum,
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
            floor: current_floor,
            name: start_end,
            x: gridX,
            y: gridY
        });
        console.log(transitionArray);
        if (start_end == "end") {
            enterTransitionMode = false;
            start_end = "start";
        } else {
            start_end = "end";
            addTransition(current_floor, start_end);
        }
    }
    Controller.rest();
    return;
}


//------------------------------------------------------------
//------------------------------------------------------------

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



//------------------------------------------------------------
// CONFIGURE GRID PANEL BUTTONS
//------------------------------------------------------------
// FINISH
get_array.onclick = function() {
    // Get the modal
    var modal = document.getElementById('myModal');
    modal.style.display = "block";

    // ADD 
    add_name.onclick = function() {
        var grid_input_name = document.getElementById('buildingName');
        var grid_input_description = document.getElementById('buildingDescription');
        buildingName = grid_input_name.value;
        buildingDescription = grid_input_description.value;
        //check if the DB if this already exists.
        firebase.database().ref('/' + api_key + '/buildings/' + buildingName).once('value').then(function(snapshot) {
            grid = snapshot.val();
            if (!grid) {
                console.log(buildingName);
                modal.style.display = "none";

                var jsonGrid = JSON.stringify(floorArray);
                console.log(jsonGrid);
                writeGridData(buildingName, jsonGrid, buildingDescription);
                loadListPage();
                alert("Grid " + buildingName + " Added Sccussfully");
                //location.reload();
            } else {
                if (confirm('Are you sure you want to overwrite this grid in the database?')) {
                    // Save it!
                    console.log(buildingName);
                    modal.style.display = "none";

                    var jsonGrid = JSON.stringify(floorArray);
                    console.log(jsonGrid);
                    writeGridData(buildingName, jsonGrid, buildingDescription);
                    loadListPage();
                    alert("Grid " + buildingName + " overwriten Sccussfully");
                    //location.reload();
                } else {
                    // Do nothing!
                }
            }
        });

    }

    //download("Grid.json", jsonGrid);
}

// REDRAW GRID

// ADD TRANSITION

// ADD FLOOR
add_floor_btn.onclick = function() {
    //saveFloor(current_floor);
    current_floor++;

    var s = d3.selectAll('svg');
    var i = d3.selectAll('img');
    s.remove();
    i.remove();
    width = 0;
    height = 0;
    enterStoreMode = false;

    imgArray = [];

    document.getElementById("createGridModal").style.display = "inline";
}

// SAVE FLOOR
save_floor_btn.onclick = function() {
    saveFloor(current_floor);
    console.log(floorArray);
}

function saveFloor(floorCount) {
    var floor = Controller.grid
    floor["storeInfo"] = storeArray;
    floor["scaleInfo"] = scaleObj;
    floor["imageInfo"] = imgArray;
    floorArray[floorCount] = floor;
    alert("Floor " + current_floor + " Saved Successfully");
}

// PREV FLOOR
prev_floor_btn.onclick = function() {
    console.log(current_floor);
    if (current_floor != 1) {
        current_floor--;

        document.getElementById('config_panel_header').innerHTML = "Configure Floor " + current_floor;

        var s = d3.selectAll('svg');
        var i = d3.selectAll('img');
        s.remove();
        i.remove();
        width = 0;
        height = 0;
        enterStoreMode = false;

        loadGrid();
    } else {
        alert("You are on the ground floor!");
    }

}

// NEXT FLOOR
next_floor_btn.onclick = function() {
    var numFloors = Object.keys(obj).length;
    if (numFloors > current_floor) {
        current_floor++;

        document.getElementById('config_panel_header').innerHTML = "Configure Floor " + current_floor;

        var s = d3.selectAll('svg');
        var i = d3.selectAll('img');
        s.remove();
        i.remove();
        width = 0;
        height = 0;
        enterStoreMode = false;

        loadGrid();
    } else if (current_floor == numFloors) {
        alert("You are on the top floor!");
    }
}


//------------------------------------------------------------
// END OF CONFIGURE GRIDS PANEL BUTTONS
//------------------------------------------------------------


// OLD FUNCTION USED TO DOWNLOAD JSON INFO
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}