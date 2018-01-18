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
// Elevator Info
var elevatorName;
var isNewElevator;
var elevatorArray = [];
var enterElevatorMode = false;
// Store Info
var enterStoreMode = false;
var storeArray = [];
var current_floor = 1;
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
        if (snapshot.val() != null) {
            console.log(snapshot.val())
            obj = JSON.parse(snapshot.val().floorGrids);
            floorArray = obj;
            /*
            if (buildingName == 'WestAcersDemo') {
                console.log('Readding stores');
                storeArray = 
            }
            */
            if (obj[current_floor].storeInfo.length > 0) {
                storeArray = obj[current_floor].storeInfo;
            }
            if (obj[0] != null) {
                elevatorArray = obj[0];
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
            Controller.setTileAt(stores[x].x, stores[x].y, 'store', true);
        }
        showElevators();
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
        Controller.setTileAt(stores[x].x, stores[x].y, 'store', true);
    }
    showElevators();
}

/*
Button: name - show_stores | text - Show Stores
Function: onclick
Use: Highlights all store locations for the current floor in pink.
Details: Currently issue: when this runs the grids loaded after are not animated correctly --RESOLVED
*/
function showElevators() {
    var elevators = floorArray[0];
    // In elevators array
    for (var x = 0; x < elevators.length; x++) {
        // In elevator x
        if (elevators[x].floorAccess) {
            curr_elevator = elevators[x].floorAccess;
            for (var y = 0; y < curr_elevator.length; y++) {
                console.log(curr_elevator[y]);
                if (curr_elevator[y].floor == current_floor) {
                    console.log(curr_elevator[y]);
                    Controller.setTileAt(curr_elevator[y].x, curr_elevator[y].y, 'elevator', true);
                }
            }
        }
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


//-----------------------------------------------------------------------------------------------------------------------------
// ADD STORE CODE HERE
//-----------------------------------------------------------------------------------------------------------------------------

/*
Button: name - addStore | text - ADD
Function: onclick
Use: starts the add store process.
Details: The function tells the user to select a location for the store
         and sets enterStroreMode to true.
         Button location: store_panel div on the editor page.
*/
addStore.onclick = function() {
    document.getElementById("addStoreModal").style.display = "block";
}

//Variables used when adding a new store.
var store_name;
var store_catagory;
var store_hours;
var store_description;
var store_imageUrl;
var store_index;
var store_x;
var store_y;

continue_btn.onclick = function() {
    //Get store Information and hide modal.
    store_name = document.getElementById("store_name").value;
    store_catagory = document.getElementById("store_catagories").value;
    store_hours = document.getElementById("store_hours").value;
    store_description = document.getElementById("store_description").value;
    store_imageUrl = document.getElementById("store_image").value;
    document.getElementById("addStoreModal").style.display = "none";
    //Clear store Information.
    document.getElementById("store_name").value = "";
    document.getElementById("store_catagories").value = "";
    document.getElementById("store_hours").value = "";
    document.getElementById("store_description").value = "";
    document.getElementById("store_image").value = "";
    //Inform user to select the location of the store.
    alert("Select coordinates on grid");
    enterStoreMode = true;
}

no_store_add.onclick = function() {
    //Clears store infromation and hides the modal for adding a store when the cancel button is clicked.
    document.getElementById("store_name").value = "";
    store_catagory = "";
    document.getElementById("store_catagories").value = "";
    store_hours = "";
    document.getElementById("store_hours").value = "";
    store_description = "";
    document.getElementById("store_description").value = "";
    store_imageUrl = "";
    document.getElementById("store_image").value = "";
    document.getElementById("addStoreModal").style.display = "none";
}

//-----------------------------------------------------------------------------------------------------------------------------
// EDIT STORE CODE HERE
//-----------------------------------------------------------------------------------------------------------------------------

// SHOW EDIT STORE MODAL
editStore.onclick = function() {
    populateStores();
    document.getElementById("editStoreModal").style.display = "block";
}

// LOAD SELECTED STORE TO EDIT
load_store_btn.onclick = function() {
    store_index = document.getElementById("select_store").value;
    console.log(storeArray[store_index]);
    console.log(store_index);
    document.getElementById("edit_store_name").value = storeArray[store_index].name;
    document.getElementById("edit_store_catagories").value = storeArray[store_index].category;
    document.getElementById("edit_store_hours").value = storeArray[store_index].hours;
    document.getElementById("edit_store_description").value = storeArray[store_index].description;
    document.getElementById("edit_store_image").value = storeArray[store_index].imageURL;

    store_x = storeArray[store_index].x;
    store_y = storeArray[store_index].y;
    console.log("X: " + store_x + " Y: " + store_y);
}

// POPULATE STORE SELECTOR
function populateStores() {
    //Clear old options
    var select = document.getElementById("select_store");
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }
    //Add new options
    for (var x = 0; x < storeArray.length; x++) {
        var opt = document.createElement('option');
        opt.innerHTML = storeArray[x].name;
        opt.value = x;
        select.appendChild(opt);
    }
}

// ADD EDITED STORE TO THE DATABASE/STOREARRAY
edit_continue_btn.onclick = function() {
    //Get store Information and hide modal.
    store_name = document.getElementById("edit_store_name").value;
    store_catagory = document.getElementById("edit_store_catagories").value;
    store_hours = document.getElementById("edit_store_hours").value;
    store_description = document.getElementById("edit_store_description").value;
    store_imageUrl = document.getElementById("edit_store_image").value;
    document.getElementById("editStoreModal").style.display = "none";
    storeArray.splice(store_index, 1);
    console.log(storeArray);
    //Clear store Information.
    document.getElementById("edit_store_name").value = "";
    document.getElementById("edit_store_catagories").value = "";
    document.getElementById("edit_store_hours").value = "";
    document.getElementById("edit_store_description").value = "";
    document.getElementById("edit_store_image").value = "";
    //inform user to add new coordinates on the graph
    if (confirm('Has the store moved?')) {
        alert("Select new coordinates on grid");
        enterStoreMode = true;
    } else {
        enterStoreMode = true;
        getStore(store_x, store_y);
    }

}

edit_no_store_add.onclick = function() {
    document.getElementById("editStoreModal").style.display = "none";
    //Clear store Information.
    document.getElementById("edit_store_name").value = "";
    document.getElementById("edit_store_catagories").value = "";
    document.getElementById("edit_store_hours").value = "";
    document.getElementById("edit_store_description").value = "";
    document.getElementById("edit_store_image").value = "";
}

/*
Function: getStore(int, int)
Use: This function will take an x and a y value and store that location information in storeArray.
Details: The function will also ask the user to enter a name for the location.
         The floor number will be added as the current_floor value.
*/
function getStore(gridX, gridY) {
    if (enterStoreMode == true) {
        var name = store_name;
        var category = store_catagory.split(",");
        //console.log(category);
        var hours = store_hours;
        var imageURL = store_imageUrl;
        var description = store_description;
        floorNum = current_floor;
        storeArray.push({
            x: gridX,
            y: gridY,
            floor: floorNum,
            name: name,
            category: category,
            description: description,
            hours: hours,
            imageURL: imageURL
        });
        alert("Store added successfully.");
        store_name = "";
        store_catagory = "";
        store_hours = "";
        store_description = "";
        store_imageUrl = "";
        enterStoreMode = false;
    }
    console.log(storeArray);
    Controller.rest();
    return;
}

/*
Button: name - config_elevator_btn | text - Config Elevator
Function: onclick
Use: Opens the elevatorEditor modal
Details: this button is located in the algorithm_panel div
*/
config_elevator_btn.onclick = function() {
    document.getElementById("configElevatorModal").style.display = "inline-block";
    document.getElementById("elevator_name").value = "";
    populateElevators();
}

/*
Function: addNewElevatorFloor()
Use: Sets enterElevatorMode and isNewElevator to true, gets the name for the new elevator, and informs the user to enter the location of the new elevator.
Details: 
*/
add_new_elevator.onclick = function() {
    elevatorName = document.getElementById("elevator_name").value;
    if (elevatorName != "") {
        for (var x = 0; x < elevatorArray.length; x++) {
            if (elevatorArray[x].name == elevatorName) {
                alert("This elevator already exists");
                return;
            }
        }
        document.getElementById("configElevatorModal").style.display = "none";
        alert("Select Elevator location");
        enterElevatorMode = true;
        isNewElevator = true;
    } else {
        alert("Enter a name for the new elevator and try again!");
    }
}

/*
Button: name - add_to_existing_elevator | text - Add Current Floor
Function: onclick
Use: Adds a floor tile to an existing elevator item.
Details: This function sets enterElevatorMode to true, isNewElevator to false, gets the name for the new elevator,
         and informs the user to enter the location of the new elevator.
         The function will also check if the selected elevator already has a location on the current floor.
*/
add_to_existing_elevator.onclick = function() {
    elevatorName = getSelectedText("select_elevator");
    if (elevatorName != null) {
        // Check if elevator already has access to current floor.
        for (var x = 0; x < elevatorArray.length; x++) {
            if (elevatorArray[x].name == elevatorName) {
                for (var y = 0; y < elevatorArray[x].floorAccess.length; y++) {
                    if (elevatorArray[x].floorAccess[y].floor == current_floor) {
                        alert("This elevator already has a location on this floor!");
                        return;
                    }
                }
            }
        }
        // Hide configElevatorModal and prepare to get the elevator location.
        document.getElementById("configElevatorModal").style.display = "none";
        alert("Select Elevator location");
        enterElevatorMode = true;
        isNewElevator = false;
    } else {
        alert("Currently there are no existing elevators. Please enter a new one.");
    }
}

/*
Function: getElevator(int, int)
Use: Adds the location of an elevator tile.
Details: This function will add a tile on one floor for the location of a new or existing elevator.
         If the elevator already has access to the current floor it will not add a new location.
*/
function getElevator(gridX, gridY) {
    if (enterElevatorMode == true) {
        var elevatorTile = {};
        elevatorTile["floor"] = current_floor;
        elevatorTile["x"] = gridX;
        elevatorTile["y"] = gridY;

        if (isNewElevator) {
            var newElevator = {};
            newElevator["name"] = elevatorName;
            newElevator["floorAccess"] = [elevatorTile];
            elevatorArray.push(newElevator);
            alert("New Elevator Added!");
        }
        if (!isNewElevator) {
            for (var x = 0; x < elevatorArray.length; x++) {
                if (elevatorArray[x].name == elevatorName) {
                    elevatorArray[x].floorAccess.push(elevatorTile);
                    alert("Existing Elevator Updated!");
                }
            }
        }
    }
    //populateElevators();
    enterElevatorMode = false;
    console.log(elevatorArray);
    Controller.rest();
    return;
}

/*
Function: populateElevators()
Use: This function will add select options to the select tag in the configElevatorModal
Details: The function will loop throught all the elevators in the elevatorArray and add there name as a select option.
*/
function populateElevators() {
    //Clear old options
    var select = document.getElementById("select_elevator");
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }
    //Add new options
    for (var x = 0; x < elevatorArray.length; x++) {
        var opt = document.createElement('option');
        opt.innerHTML = elevatorArray[x].name;
        opt.value = elevatorArray[x].name;
        select.appendChild(opt);
    }
}

/*
Function: getSelected(elementId)
Use: Gets the selected item from a select element.
Details: Used to return elevator currently selected in add_to_existing_elevator.onclick
         The function will return the selected value or null if there is no values to select.
*/
function getSelectedText(elementId) {
    var elt = document.getElementById(elementId);

    if (elt.selectedIndex == -1)
        return null;

    return elt.options[elt.selectedIndex].text;
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
        saveFloor(current_floor);
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

/*
Button: name - add_floor_btn | text - Add Floor
Function: onclick
Use: Creates a new grid for the next floor in the building.
Details: The function clears the last grid, updates the current_floor, and resets
         width, height, enterStoreMode, imgArray, and storeArray.
*/
add_floor_btn.onclick = function() {
    saveFloor(current_floor);
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
    floorArray[0] = elevatorArray;
    console.log(floor);
}


/*
Button: name - prev_floor_btn | text - Prev Floor
Function: onclick
Use: Loads the previous floor grid if there is one in the json.
Details: This onclick function will select save the current floor info
         then remove the svg that holds the grid and the image that is behind it.
         The Configure Grid header is set to the correct floor.
         Also the width, height, enterStoreMode, and Controller are reset.
         Lastly loadGrid() is called;
*/
prev_floor_btn.onclick = function() {
    console.log(current_floor);
    if (current_floor != 1) {
        saveFloor(current_floor);
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
        if (floorArray[current_floor].imageInfo) {
            imgArray = floorArray[current_floor].imageInfo;
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
Details: This onclick function will save the current floor info 
            then select and remove the svg that holds the grid and the image that is behind it.
            The Configure Grid header is set to the correct floor.
            Also the width, height, enterStoreMode, and Controller are reset.
            Lastly loadGrid() is called;
*/
next_floor_btn.onclick = function() {
    if (floorArray.length > 0) {
        var numFloors = floorArray.length - 1;
    } else {
        var numFloors = floorArray.length
    }
    console.log(floorArray.length)
    if (numFloors > current_floor) {
        saveFloor(current_floor);
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
        if (floorArray[current_floor].imageInfo) {
            imgArray = floorArray[current_floor].imageInfo;
        }


        Controller.clearOperations();
        Controller.clearAll();
        Controller.buildNewGrid();
        loadGrid();
    } else if (current_floor == numFloors || numFloors == 0) {
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