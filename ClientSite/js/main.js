/*
Function: loadEditor
Use: This function is used to start the editor page for new or existing grids.
Details: The function sets up the controller that is used for drawing the walls and adding destinations.
         The Panel sets up the draggable areas where the buttons and inputs are found.
*/
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

// GLOBALS
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
var floorArray = [];
var currentFloor = 0;
var width = 0;
var height = 0;
var obj;


// Reloading the grid and images. for adjusting tile size
/*
Button: name - submit | text - Redraw Grid
Function: onclick
Use: Clears the current grid and redraws it.
Details: This function is useful if you want to resize the tiles.
         No walls will be saved or redrawn then this is called.
*/
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

/*
Function: loadGrid()
Use: Creates and loads all of the backgroud images for the grid then called drawGrid
Details: This function is called whenever a grid is drawn on screen.
*/
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
}

/*
Function: alertWhenDone(string, function)
Use: Used to make sure that the images are loaded in the right order and they are done loading before the grid is drawn.
Details: This process was more important when floors were all loaded into one grid.
*/
function alertWhenDone(msg, callback) {
    console.log(msg);
    callback();
}

/*
Function: loadOldGrid(string, string)
Use: Loads a grid for the first floor of an existing building in the editor page.
Details: This function opens the editor page and closes all other pages.
         Sets current_floor to 1.
         loadEditor() is called. 
         all svg and img elements are removed and width, height, and enterStoreMode are reset.
         Finally the page gets the information about the building from the database and calls loadGrid()
         after setting the floorArray and imgArray.
*/
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
            if (obj[current_floor].storeInfo.length > 0) {
                storeArray = obj[current_floor].storeInfo;
            }
            console.log(storeArray);
            console.log(floorArray);
            imgArray = obj[current_floor].imageInfo;
            console.log(imgArray);

            loadGrid();
        }
    });
}

/*
Function: finishLoadingGrid()
Use: This function draws in any walls after the grid finishes loading.
Details: Issues occure when loading stores and walls at the same time. --RESOLVED
*/
function finishLoadingGrid() {
    if (floorArray[current_floor]) {
        // Load walls
        var matrix = floorArray[current_floor].nodes.map(function(nested) {
            return nested.map(function(element) {
                Controller.setTileAt(element.x, element.y, 'walkable', element.walkable);
                return element.walkable ? 0 : 1;
            });
        });
        // Load stores
        var stores = floorArray[current_floor].storeInfo;
        var numStores = Object.keys(stores).length;
        for (var x = 0; x < numStores; x++) {
            Controller.setTileAt(stores[x].x, stores[x].y, 'tested', true);
        }
    }
}

/*
Button: name - show_stores | text - Show Stores
Function: onclick
Use: Highlights all store locations for the current floor in pink.
Details: Currently issue: when this runs the grids loaded after are not animated correctly --RESOLVED
*/
show_stores.onclick = function() {
    var stores = floorArray[current_floor].storeInfo;
    var numStores = Object.keys(stores).length;
    for (var x = 0; x < numStores; x++) {
        Controller.setTileAt(stores[x].x, stores[x].y, 'tested', true);
    }
}

/*
Function: drawGrid()
Use: Draws the svg editor grid over an image or images in the imgArray.
Details: This function is used everytime a grid is made on the screen.
*/
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
/*
Function: resizeImage(string, int, int)
Use: Resizes element with the given id to the given height and width.
Details: This function is used in the drawGrid() function to make sure the background image fits the svg grid.
*/
function resizeImage(imgID, height, width) {
    img = document.getElementById(imgID);
    img.setAttribute("style", "width:" + width + "px; height:" + height + "px;");

}

/*
Button: name - addStore | text - ADD
Function: onclick
Use: starts the add store process.
Details: The function tells teh user to select a location for the store
         and sets enterStroreMode to true.
         Button location: store_panel div on the editor page.
*/
addStore.onclick = function() {
    alert("Select coordinates on grid");
    enterStoreMode = true;
}

/*
Button: name - add_transition_btn | text - Add Transition
Function: onclick
Use: Depreciated - used on old process of loading floors 
Details:
*/
add_transition_btn.onclick = function() {
    if (current_floor < imgArray.length) {
        current_floor++;
        addTransition(current_floor, start_end);
    } else {
        alert("You have already entered transition corridnates for each floor");
    }
}

/*
-------UNFINISHED-------
Function: addTransition(int, string)
Use: sets enterTransitionMode to true.
Details: This function will make enterTransition mode true for the start and end point of each transition.
*/
function addTransition(current_floor, start_end) {
    alert("Select transition " + start_end + " coordinates on grid for floor " + current_floor);
    enterTransitionMode = true;
}

/*
Function: getStore(int, int)
Use: This function will take an x and a y value and store that location information in storeArray.
Details: The function will also ask the user to enter a name for the location.
         The floor number will be added as the current_floor value.
*/
function getStore(gridX, gridY) {
    if (enterStoreMode == true) {
        var name = prompt("Enter store name");
        floorNum = current_floor;
        storeArray.push({
            x: gridX,
            y: gridY,
            floor: floorNum,
            name: name
        });
        enterStoreMode = false;
    }
    //console.log(storeArray);
    Controller.rest();
    return;
}

/*
-------UNFINISHED-------
Function: getTransition(int, int)
Use: Adds the location of transition tiles.
Details: This function will add a tile on one floor for where the transition starts
         and it will add an end tile on another floor.
*/
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


/*
Button: name - add_grid_url | text - Add
Function: onclick
Use: This function adds an image url to the array of image urls that will display the floor you are creating.
Details: This button is found in the createGridModal.
*/
add_grid_url.onclick = function() {
    imgURL = document.getElementById("grid_url");
    imgArray.push(imgURL.value);
    $('#grid_url').val('');
    console.log(imgURL.value);
    console.log(imgArray);
}

/*
Button: name - create_grid | text - Create Grid
Function: onclick
Use: Closes the createGridModal clears the old grid sets enterStore mode to false and calls loadGrid()
Details:
*/
create_grid.onclick = function() {
    document.getElementById("createGridModal").style.display = "none";

    var s = d3.selectAll('svg');
    s.remove();

    enterStoreMode = false;

    loadGrid();
}

/*
Button: name - get_array | text - Finish
Function: onclick
Use: Opens modal so a user can save their building information to the database.
Details: Also contains the onclick functions for add_name and no_add.
*/
get_array.onclick = function() {
    // Get  myModal
    var modal = document.getElementById('myModal');
    modal.style.display = "block";

    /*
    Button: name - add_name | text - Add
    Function: onclick
    Use: Adds building information to the database.
    Details: The function will check if the name for the grid has been entered before.
             If the name already exits it will ask if the user wishes to overwrite the data or not.
             If the name doesn't exist then the building info is added to the database.
             Building data added in JSON format.
    */
    add_name.onclick = function() {
        var grid_input_name = document.getElementById('buildingName');
        var grid_input_description = document.getElementById('buildingDescription');
        buildingName = grid_input_name.value;
        buildingDescription = grid_input_description.value;
        //check the DB if this building info already exists.
        firebase.database().ref('/' + api_key + '/buildings/' + buildingName).once('value').then(function(snapshot) {
            grid = snapshot.val();
            if (!grid) {
                console.log(buildingName);
                modal.style.display = "none";
                var jsonGrid = JSON.stringify(floorArray);

                try {
                    eval('(' + JSON.stringify(floorArray) + ')');
                } catch (e) {
                    console.log(e); // "SyntaxError: unterminated string literal"
                }

                writeGridData(buildingName, jsonGrid, buildingDescription);
                alert("Grid " + buildingName + " Added Sccussfully");
                //location.reload();
            } else {
                if (confirm('Are you sure you want to overwrite this grid in the database?')) {
                    // Save it!
                    console.log(buildingName);
                    modal.style.display = "none";

                    var jsonGrid = JSON.stringify(floorArray);

                    try {
                        eval('(' + JSON.stringify(floorArray) + ')');
                    } catch (e) {
                        console.log(e); // "SyntaxError: unterminated string literal"
                    }

                    writeGridData(buildingName, jsonGrid, buildingDescription);
                    alert("Grid " + buildingName + " overwriten Sccussfully");
                    //location.reload();
                } else {
                    // Do nothing!
                    modal.style.display = "none";
                }
            }
        });

    }

    /*
    Button: name - no_add | text - Cancel
    Function: onclick
    Use: Closes myModal modal to cancel upload to database and continue editing.
    Details: 
    */
    no_add.onclick = function() {
        modal.style.display = "none";
    }

    //download("Grid.json", jsonGrid);
}

// REDRAW GRID

// ADD TRANSITION

/*
Button: name - add_floor_btn | text - Add Floor
Function: onclick
Use: Creates a new grid for the next floor in the building.
Details: The function clears the last grid, updates the current_floor, and resets
         width, height, enterStoreMode, imgArray, and storeArray.
*/
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
    storeArray = [];

    document.getElementById('config_panel_header').innerHTML = "Configure Floor " + current_floor;

    document.getElementById("createGridModal").style.display = "inline";
}


/*
Button: name - save_floor_btn | text - Save Floor
Function: onclick
Use: Calls the saveFloor function and notifies the user that the save was successful.
Details:
*/
save_floor_btn.onclick = function() {
    saveFloor(current_floor);
    alert("Floor " + current_floor + " Saved Successfully");
    console.log(floorArray);
}

/*
Function: saveFloor(int)
Use: This function takes the grid info for the current floor and stores if in an array. 
Details: Called by save_floor_btn
*/
function saveFloor(floorCount) {
    var floor = Controller.grid
    console.log(storeArray);
    floor["storeInfo"] = storeArray;
    floor["scaleInfo"] = scaleObj;
    floor["imageInfo"] = imgArray;
    floorArray[floorCount] = floor;
    console.log(floor);
}


/*
Button: name - prev_floor_btn | text - Prev Floor
Function: onclick
Use: Loads the previous floor grid if there is one in the json.
Details: This onclick function will select and remove the svg that holds the grid and the image that is behind it.
         The Configure Grid header is set to the correct floor.
         Also the width, height, enterStoreMode, and Controller are reset.
         Lastly loadGrid() is called;
*/
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
        if (floorArray[current_floor].storeInfo) {
            storeArray = floorArray[current_floor].storeInfo;
        }

        Controller.clearOperations();
        Controller.clearAll();
        Controller.buildNewGrid();
        loadGrid();
    } else {
        alert("You are on the ground floor!");
    }

}

/*
Button: name - next_floor_btn | text - Next Floor
Function: onclick
Use: Loads the next floor grid if there is one in the json.
Details: This onclick function will select and remove the svg that holds the grid and the image that is behind it.
            The Configure Grid header is set to the correct floor.
            Also the width, height, enterStoreMode, and Controller are reset.
            Lastly loadGrid() is called;
*/
next_floor_btn.onclick = function() {
    var numFloors = Object.keys(obj).length - 1;
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

        console.log(floorArray[current_floor]);
        if (floorArray[current_floor].storeInfo) {
            storeArray = floorArray[current_floor].storeInfo;
        }

        Controller.clearOperations();
        Controller.clearAll();
        Controller.buildNewGrid();
        loadGrid();
    } else if (current_floor == numFloors) {
        alert("You are on the top floor!");
    }
}

/*
Function: download
Use: Depreciated
Details: This function will allow a user to download a file.
*/
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}