var WINDOWBORDERSIZE = 10;
var HUGE = 999999; //Sometimes useful when testing for big or small numbers
var animationDelay = 50; //controls simulation and transition speed
var isRunning = false; // used in simStep and toggleSimStep
var surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
var simTimer; // Set in the initialization function

//The drawing surface will be divided into logical cells
var maxCols = 80;
var cellWidth; //cellWidth is calculated in the redrawWindow function
var cellHeight; //cellHeight is calculated in the redrawWindow function

//urls for sprites
const urlWithoutorder = "images/Withoutorder.png";
const urlPickup = "images/Pickup.png";
const urlDelivery = "images/Delivery.png";
const urlHouse = "images/House.png";
const urlHouse_Ordered = "images/House_Ordered.png";
const urlMcd = "images/Mcd.png";
const urlBuilding = "images/Building.png";

//Delivery rider states
const WAITING_ORDER = 0;
const COLLECTING_ORDER = 1;
const DELIVERING_FOOD = 2;
const EXITED = 3;

//Order status of each house
const UNORDERED = 2;
const ORDERED = 1;

//for tracking state of food preparation
const notprepared = 0
const prepared = 1

// We can section our screen into different areas. In this model, the areas represent solely the city.
var srow=2;
var nrow = maxCols/2-4;
//var nrow=maxCols/2-1-3;
var scol=2;
var ncol = maxCols/2;
//var ncol=maxCols/2.1-2;

var areas =[
 {"label":"City","startRow":srow,"numRows":nrow,"startCol":scol,"numCols":ncol,"color":"#D3D3D3"},	
]

//list containing info of houses

//random houses scattered in bottom-mid
var houses = [
	{"id":0,"location":{"row":30,"col":20},"state":UNORDERED},
	{"id":1,"location":{"row":28,"col":23},"state":UNORDERED},
	{"id":2,"location":{"row":33,"col":22},"state":UNORDERED},
	{"id":3,"location":{"row":31,"col":24},"state":UNORDERED},
	{"id":4,"location":{"row":37,"col":18},"state":UNORDERED},
	{"id":5,"location":{"row":35,"col":25},"state":UNORDERED},
	{"id":6,"location":{"row":25,"col":20},"state":UNORDERED},
	{"id":7,"location":{"row":26,"col":27},"state":UNORDERED},
	{"id":8,"location":{"row":33,"col":27},"state":UNORDERED},
	{"id":9,"location":{"row":21,"col":26},"state":UNORDERED},
];

//keeps track of number of houses
house_count = 10

//houses at top left corner
for (i=srow+1;i<srow+16;i+=2){
	for (j=scol+1;j<scol+16;j+=2){
		var newhouse = {"id":house_count,"location":{"row":i,"col":j},"state":UNORDERED};
		house_count++;
		houses.push(newhouse);
	}
}

//houses at bottom left corner
for (i=nrow-6;i<nrow+2;i+=3){
	for (j=ncol-7;j<ncol+1;j+=3){
		var newhouse = {"id":house_count,"location":{"row":i,"col":j},"state":UNORDERED};
		house_count++;
		houses.push(newhouse);
	}
}

//houses at top right corner
for (i=srow+1;i<srow+20;i+=3){
	for (j=ncol-10;j<ncol+1;j+=2){
		var newhouse = {"id":house_count,"location":{"row":i,"col":j},"state":UNORDERED};
		house_count++;
		houses.push(newhouse);
	}
}

//houses at bottom left corner
for (i=nrow-12;i<nrow+2;i+=2){
	for (j=scol+1;j<scol+16;j+=3){
		var newhouse = {"id":house_count,"location":{"row":i,"col":j},"state":UNORDERED};
		house_count++;
		houses.push(newhouse);
	}
}

//list of McD locations
var mcd = [
	{"id":0,"location":{"row":20,"col":5},"state":UNORDERED},
	{"id":1,"location":{"row":15,"col":25},"state":UNORDERED},
	{"id":2,"location":{"row":23,"col":23},"state":UNORDERED},
	{"id":3,"location":{"row":33,"col":30},"state":UNORDERED},
];

//random trees scattered at bottom-mid *note: buildings became trees but i'm still using the variable name, Buildings
var Buildings = [
	{"row":22,"col":23},
	{"row":27,"col":28},
	{"row":21,"col":21},
	{"row":25,"col":26},
	{"row":31,"col":22},
	{"row":33,"col":26},
	{"row":36,"col":22},
	{"row":34,"col":18},
	{"row":28,"col":18},
];

//forest at bottom right
for (i=srow+20;i<nrow-6;i+=1){
	for (j=ncol-8;j<ncol+1;j+=1){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//forest at top middle
for (i=srow+1;i<srow+13;i++){
	for (j=scol+16;j<ncol-10;j++){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//trees at bottom left
for (i=nrow-13;i<nrow+2;i+=2){
	for (j=scol+2;j<scol+16;j+=3){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//trees at bottom right
for (i=nrow-7;i<nrow+2;i+=3){
	for (j=ncol-8;j<ncol+1;j+=3){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//trees at top left
for (i=srow+2;i<srow+16;i+=2){
	for (j=scol+2;j<scol+16;j+=2){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//trees at top right
for (i=srow+2;i<srow+20;i+=3){
	for (j=ncol-9;j<ncol+1;j+=2){
		var newbuilding = {"row":i,"col":j};
		Buildings.push(newbuilding);
	}
}

//top and bottom parameter of trees
for (i=scol;i<ncol+scol;i++){
	var newbuilding_1 = {"row":srow,"col":i};
	var newbuilding_2 = {"row":nrow+2,"col":i};
	Buildings.push(newbuilding_1);
	Buildings.push(newbuilding_2);
}

//left and right parameter of trees
for (i=2;i<nrow+2;i++){
	var newbuilding_1 = {"row":i,"col":scol};
	var newbuilding_2 = {"row":i,"col":ncol+1};
	Buildings.push(newbuilding_1);
	Buildings.push(newbuilding_2);
}

//function to randomly shuffle riders so everyone gets an equal chance of receiving an order
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
}

//initialization variables 
var probMovement = 0.2; //probability that riders change direction/target when roaming
var probCancel =  0.061; //probability that an order is cancelled after min cancellation time (per cycle/1min)
var timeCancel = 60; //minimum cancellation time
var currentTime = 0; //time variable for tracking
var probFoodArrival = 0.2; //probability that a food for an order is done preparing (per cycle/1min)
var probOrderArrival = 0.002; //probability that a house orders McD (per cycle/1min)
var order_counter = 0; //counter variable for tracking total orders
var delivered_counter = 0; //counter variable for tracking total number of deliveries
var cancel_counter = 0; //counter variable for tracking total number of cancelations
var citizens = []; //list variable for storing information on all delivery riders
var num_citizens = 15; //number of delivery rider intialized at the start
var order_time = []; //list variable for storing information on delivery time for each order
var orders = []; //list variable for storing information on all orders



//function to calculate cancellation rate
function cancellation_rate() {
	if (order_counter == 0){
		return 0
	} else {
		return (cancel_counter/order_counter)*100
	}
}

//function to calculate average delivery time per order
function average(order_time, sum){
	if (order_time.length > 0){
		for (i=0; i<order_time.length; i++){
			sum += order_time[i]
		}
		var avg = sum/(order_time.length)
		return avg
	} 	else {
		var avg = 0
		return avg 
	}
}

//function to intialize delivery riders
function generateCitizens() {
	for (i=0;i < num_citizens; i++) {
		var homerow = Math.floor(Math.random() * ((nrow+srow) - srow - 1) +srow);
		var homecol = Math.floor(Math.random() * ((ncol+scol) - scol - 1) +scol);
		var homeisbuilding=Buildings.filter(function(d){return d.row==homerow && d.col==homecol;});
		while (homeisbuilding.length>0){
		homerow=Math.floor(Math.random() * ((nrow+srow) - srow -1) +srow);
		homecol=Math.floor(Math.random() * ((ncol+scol) - scol -1) +scol);
		homeisbuilding=Buildings.filter(function(d){return d.row==homerow && d.col==homecol;});    
		}
		var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
		var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
		var targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});
		while (targetisbuilding.length>0){
		targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
		targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
		targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});    
		}
		var newcitizen = {"id":i, "orderid":null, "houseloc":null, "houseid":null, "location":{"row":homerow,"col":homecol},
		"target":{"row":targetrow,"col":targetcol},"state":WAITING_ORDER,"available":1};
		citizens.push(newcitizen);
	}
}

//function to create/refresh all delivery orders (per cycle/1min)
function updateOrders(){
	for (a=0;a<orders.length;a++){
		orders[a].orderposition = a;
		orders[a].time++;
	}
	var houseorders = houses.filter(function(d){return d.state == UNORDERED});
    if (houseorders.length > 0) {
        for (i = 0;i < houseorders.length; i++) {
            if (Math.random()<probOrderArrival) {
				var neworder = {"orderid":order_counter,"orderposition":orders.length,"houseid":houseorders[i].id,"rider":null,"state":notprepared,"time":0, "cancelled":0};
				orders.push(neworder);
				order_counter++;
                for (j = 0; j<houses.length; j++) {
                    if (houses[j].id == neworder.houseid){
                        houses[j].state = ORDERED;
                    }
                }
            }
        }
    }
}

//function to assign orders to available delivery riders (per cycle/1min)
function checkriderAvailability(){
	var availableriders = citizens.filter(function(d){return d.available == 1});
	var availableorders = orders.filter(function(d){return d.rider == null});
	shuffle(availableorders)
	shuffle(availableriders)
	const no_availableriders = availableriders.length;
	const no_availableorders = availableorders.length;
	if (no_availableriders > 0 && no_availableorders > 0) {
		if (no_availableriders > no_availableorders) {
			for (i=0;i<no_availableorders;i++){
				index = availableorders[i].orderposition
				orders[index].rider = availableriders[i].id
			}
		} else {
			for (i=0;i<no_availableriders;i++){
				index = availableorders[i].orderposition
				orders[index].rider = availableriders[i].id
			}
		}
	}
}

//function to determine whether food is prepared (per cycle/1min)
function updatedfoodArrival(){
    var foodpreparation = orders.filter(function(d){return d.rider != null});
    if (foodpreparation.length > 0) {
        for (i = 0; i < foodpreparation.length; i++) {
            if (Math.random()<probFoodArrival) {
                var assigned_orderid = foodpreparation[i].orderid;
                for (j = 0; j < orders.length; j++) {
                    if (orders[j].orderid == assigned_orderid) {
                        orders[j].state = prepared;
                    }
                }
            }
        }
    }
}

//function to remove orders once they are delivered (per cycle/1min)
function removeOrders(){
	delivered_citizens = citizens.filter(function(d){return d.available == 2});
	for (i=0;i<delivered_citizens.length;i++){
		for (j=0;j<orders.length;j++){
			if (orders[j].orderid == delivered_citizens[i].orderid){
				order_time.push(orders[j].time);
				orders = orders.filter(function(d){return d.orderid != orders[j].orderid});
			}
		}
		for (k=0;k<houses.length;k++){
			if (houses[k].id == delivered_citizens[i].houseid){
				houses[k].state = UNORDERED;
			}
		}
		for (l=0;l<citizens.length;l++){
			if (citizens[l].id == delivered_citizens[i].id){
				citizens[l].available = 1;
				citizens[l].houseid = null;
				citizens[l].houseloc = null;
				citizens[l].orderid = null;
				var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
				var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
				citizens[l].target.row = targetrow;
				citizens[l].target.col = targetcol;
			}
		}
	}
}

//function to remove cancelled orders (per cycle/1min)
function cancelOrders(){
	for (a=0;a<orders.length;a++){
		if (orders[a].time > timeCancel){
			if (Math.random() < probCancel) {
				orders[a].cancelled = 1;
				cancel_counter++;
				console.log('CANCELLED')
			}
		}
	}
	cancelled_orders = orders.filter(function(d){return d.cancelled == 1});
	for (i=0;i<cancelled_orders.length;i++){
		for (j=0;j<citizens.length;j++){
			if (citizens[j].orderid == cancelled_orders[i].orderid){
				citizens[j].available = 1;
				citizens[j].houseloc = null;
				citizens[j].orderid = null;
				var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
				var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
				citizens[j].target.row = targetrow;
				citizens[j].target.col = targetcol;
				citizens[j].state = WAITING_ORDER;
			}
		}
		for (k=0;k<houses.length;k++){
			if (houses[k].id == cancelled_orders[i].houseid){
				houses[k].state = UNORDERED;
			}
		}
	}
	orders = orders.filter(function(d){return d.cancelled != 1});
}

//statistics for tracking
var statistics = [
	{"name":"Number of Delivery Riders: ","location":{"row":21,"col":scol+ncol+1},"stat":0}, //num_citizens
    {"name":"Time Elapsed(min): ","location":{"row":22,"col":scol+ncol+1},"stat":0}, //currentTime
	{"name":"Number of Completed Deliveries: ","location":{"row":23,"col":scol+ncol+1},"stat":0}, //delivered_counter
    {"name":"Number of Cancelled Deliveries: ","location":{"row":24,"col":scol+ncol+1},"stat":0}, //cancel_counter
	{"name":"% of Orders Cancelled: ","location":{"row":25,"col":scol+ncol+1},"stat":0},			//cancelled_percent
	{"name":"Min Cancellation Time(min): ","location":{"row":26,"col":scol+ncol+1},"stat":0},			//timeCancel = 60;
	{"name":"Average Delivery Time per Order(min): ","location":{"row":27,"col":scol+ncol+1},"stat":0}, //delivery_average_time
	{"name":"Average Number of Deliveries per Rider per Hour: ","location":{"row":28,"col":scol+ncol+1},"stat":0} 
    ];

// // This next function is executed when the script is loaded. It contains the page initialization code.
(function() {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	// Initialize the slider bar to match the initial animationDelay;
	redrawWindow();
})();
// We need a function to start and pause the simulation.
function toggleSimStep(){ 
	//this function is called by a click event on the html page. 
	isRunning = !isRunning;
	console.log("isRunning: "+isRunning);
	if(isRunning) {
		if (citizens.length == 0) {
			//generate delivery riders when running
			generateCitizens();
		}
	}
}

function redrawWindow(){
	isRunning = false; // used by simStep
	window.clearInterval(simTimer); // clear the Timer
	animationDelay = 550 - document.getElementById("slider1").value; 
	num_citizens = document.getElementById("slider2").value; //Parameters are no longer defined in the code but through the sliders
    probOrderArrival = document.getElementById("slider3").value;//Parameters are no longer defined in the code but through the sliders
    probFoodArrival = document.getElementById("slider4").value;//Parameters are no longer defined in the code but through the sliders
    timeCancel = document.getElementById("slider5").value;//Parameters are no longer defined in the code but through the sliders
    probCancel = document.getElementById("slider6").value;//Parameters are no longer defined in the code but through the sliders
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	
	// Re-initialize simulation variables
	currentTime = 0;
	citizens = [];
	orders = [];
	for (i=0;i<houses.length;i++){
		houses[i].state = UNORDERED
	};
	order_counter = 0;
	delivered_counter = 0;
	cancel_counter = 0;
	order_time = [];

	//resize the drawing surface; remove all its contents; 
	var drawsurface = document.getElementById("surface");
	var creditselement = document.getElementById("credits");
	var w = window.innerWidth;
	var h = window.innerHeight;
	var surfaceWidth =(w - 3*WINDOWBORDERSIZE);
	var surfaceHeight= (h-creditselement.offsetHeight - 3*WINDOWBORDERSIZE);
	
	drawsurface.style.width = surfaceWidth+"px";
	drawsurface.style.height = surfaceHeight+"px";
	drawsurface.style.left = WINDOWBORDERSIZE/2+'px';
	drawsurface.style.top = WINDOWBORDERSIZE/2+'px';
	drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
	drawsurface.innerHTML = ''; //This empties the contents of the drawing surface, like jQuery erase().
	
	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	numCols = maxCols;
	cellWidth = surfaceWidth/numCols;
	numRows = Math.ceil(surfaceHeight/cellWidth);
	cellHeight = surfaceHeight/numRows;
	
	// In other functions we will access the drawing surface using the d3 library. 
	//Here we set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface');
	surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
	surface.style("font-size","100%");
	// rebuild contents of the drawing surface
	updateSurface();	
};
// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1)*cellWidth; //cellWidth is set in the redrawWindow function
	var y = (row-1)*cellHeight; //cellHeight is set in the redrawWindow function
	return {"x":x,"y":y};
}
function updateSurface(){
	// This function is used to create or update most of the svg elements on the drawing surface.
	// See the function removeDynamicAgents() for how we remove svg elements
	//Select all svg elements of class "citizen" and map it to the data list called patients
	var allcitizens = surface.selectAll(".citizen").data(citizens);
	
	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	allcitizens.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the citizens array)
	 
	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	// The first time this is called, all the elements of data will be in the .enter() list.
	// Create an svg group ("g") for each new entry in the data list; give it class "citizen"
	var newcitizens = allcitizens.enter().append("g").attr("class","citizen"); 
	//Append an image element to each new citizen svg group, position it according to the location data, and size it to fill a cell
	// Also note that we can choose a different image to represent the citizen based on the citizen type
	newcitizens.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(cellWidth,cellHeight)+"px")
	 .attr("height", Math.min(cellWidth,cellHeight)+"px")
	 .attr("xlink:href",function(d){if (d.state==WAITING_ORDER) return urlWithoutorder; else if (d.state==COLLECTING_ORDER) return urlPickup; else return urlDelivery;});
	
	// For the existing citizens, we want to update their location on the screen 
	// but we would like to do it with a smooth transition from their previous position.
	// D3 provides a very nice transition function allowing us to animate transformations of our svg elements.
	
	//First, we select the image elements in the allcitizens list
	var images = allcitizens.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images.transition()
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
     .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
     .attr("xlink:href",function(d){if (d.state==WAITING_ORDER) return urlWithoutorder; else if (d.state==COLLECTING_ORDER) return urlPickup; else return urlDelivery;})
	 .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.

	// The simulation should serve some purpose 
	// so we will compute and display the average length of stay of each patient type.
	// We created the array "statistics" for this purpose.
	// Here we will create a group for each element of the statistics array (two elements)
	var allstatistics = surface.selectAll(".statistics").data(statistics);
	var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
	// For each new statistic group created we append a text label
	newstatistics.append("text")
	.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
    .attr("dy", ".35em")
    .text(""); 
	
	// The data in the statistics array are always being updated.
	// So, here we update the text in the labels with the updated information.
	allstatistics.selectAll("text").text(function(d) {
		var nocitizens = d.stat; // cumulativeValue and count for each statistic are always changing
		return d.name+nocitizens; }); //The toFixed() function sets the number of decimal places to display
	
	// Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.

	//First a box representing the city
	var allareas = surface.selectAll(".areas").data(areas);
	var newareas = allareas.enter().append("g").attr("class","areas");
	// For each new area, append a rectangle to the group
	newareas.append("rect")
	.attr("x", function(d){return (d.startCol-1)*cellWidth;})
	.attr("y",  function(d){return (d.startRow-1)*cellHeight;})
	.attr("width",  function(d){return d.numCols*cellWidth;})
	.attr("height",  function(d){return d.numRows*cellWidth;})
	.style("fill", function(d) { return d.color; })
	.style("stroke","black")
	.style("stroke-width",1);
	
	//representing Houses
	var allhouses = surface.selectAll(".houses").data(houses);
	var newhouses = allhouses.enter().append("g").attr("class","houses");
	newhouses.append("svg:image")
	.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	.attr("width", Math.min(cellWidth,cellHeight)+"px")
	.attr("height", Math.min(cellWidth,cellHeight)+"px")
	.attr("xlink:href", urlHouse)

	var images_house = allhouses.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images_house.transition()
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
     .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
     .attr("xlink:href",function(d){if (d.state==UNORDERED) return urlHouse; else return urlHouse_Ordered;})
	 .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.	
	
	 //representing McD
	var allmcd = surface.selectAll(".mcd").data(mcd);
	var newmcd = allmcd.enter().append("g").attr("class","mcd");
	newmcd.append("svg:image")
	.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	.attr("width", Math.min(cellWidth,cellHeight)+"px")
	.attr("height", Math.min(cellWidth,cellHeight)+"px")
	.attr("xlink:href", urlMcd)

	//trees representing the buildings
	var allbuildings = surface.selectAll(".Buildings").data(Buildings);
	var newbuildings = allbuildings.enter().append("g").attr("class","Buildings");
	newbuildings.append("svg:image")
	.attr("x", function(d){return (d.col-1)*cellWidth;})
	.attr("y",  function(d){return (d.row-1)*cellHeight;})
	.attr("width",  function(d){return 1*cellWidth;})
	.attr("height",  function(d){return 1*cellWidth;})
	.attr("xlink:href", urlBuilding)
	// .style("fill", function(d) { return "#0b8aff"; })
	// .style("stroke","black")
	// .style("stroke-width",1);
	
}
function updateCitizen(citizenIndex){
	//citizenIndex is an index into the citizens data array
	citizenIndex = Number(citizenIndex);
	var citizen = citizens[citizenIndex];
	// get the current location of the citizen
	var row = citizen.location.row;
    var col = citizen.location.col;
    var state = citizen.state;
    
	// determine if citizen has arrived at the target
	var hasArrived = (Math.abs(citizen.target.row-row)+Math.abs(citizen.target.col-col))==0;

   	// Behavior of citizen depends on his or her state
	switch(state){
        case WAITING_ORDER:
			if (hasArrived){
				//this section of the code makes the rider roam if he has no order)
				var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
				var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
				var targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});
				while (targetisbuilding.length>0){
                    var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
					var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
					var targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});
				}
				citizen.target.row = targetrow;
				citizen.target.col = targetcol;
				} else {
				//this section of the code makes the rider roam if he has no order)
					if (Math.random()<probMovement){
						var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
						var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
						var targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});
						while (targetisbuilding.length>0){
							var targetrow=Math.floor(Math.random() * ((nrow+srow) - srow) +srow);
							var targetcol=Math.floor(Math.random() * ((ncol+scol) - scol) +scol);
							var targetisbuilding=Buildings.filter(function(d){return d.row==targetrow && d.col==targetcol;});
						}
						citizen.target.row = targetrow;
						citizen.target.col = targetcol;
					}
				}
			for (i=0;i<orders.length;i++){
				if (orders[i].rider == citizen.id){
					var houseindex = orders[i].houseid;
					citizen.houseid = houseindex;
					citizen.houseloc = houses[houseindex].location;
					citizen.orderid = orders[i].orderid
					citizen.available = 0;
					shortestdist = HUGE;
					closestmcd = null;
					for (k = 0; k < mcd.length; k++) {
						//find closest mcdonalds to assign to the rider
						var mcddist = Math.sqrt((mcd[k].location.row - citizen.location.row)**2+(mcd[k].location.col - citizen.location.col)**2);
						if (mcddist < shortestdist) {
							shortestdist = mcddist;
							closestmcd = mcd[k].id;
							 }
						}
					citizen.target.row = mcd[closestmcd].location.row;
					citizen.target.col = mcd[closestmcd].location.col;
					citizen.state = COLLECTING_ORDER;
				}
			}
		break;
		case COLLECTING_ORDER:
			if (hasArrived){
				for (i=0; i<orders.length; i++){
                    if (orders[i].rider == citizen.id) {
						if (orders[i].state == prepared) {
							citizen.state = DELIVERING_FOOD;
							citizen.target.row = citizen.houseloc.row;
							citizen.target.col = citizen.houseloc.col;
							}
                   	   }
					}
			    }
		break;
		case DELIVERING_FOOD:
			if (hasArrived){
				citizen.state = WAITING_ORDER;
				citizen.available = 2;
				delivered_counter++;
			}
		break;
		default:
        break;
	}
     
   // set the current row and column of the citizen
   var currentrow=citizen.location.row;
   var currentcol=citizen.location.col;

   // set the destination row and column
   var targetRow = citizen.target.row;
   var targetCol = citizen.target.col;
   
   //Compute all possible directions for a citizen  
   nextsteps=[];
    for(const dx of [-1, 0, 1]) {
        for(const dy of [-1, 0, 1]) {
            for (const dz of [-1,1]) {
		  if(dx === 0 && dy === 0) continue;
            if (currentrow + dx == currentrow && currentcol + dy != currentcol){
                nextsteps.push({ row: currentrow + 0, col: currentcol + dz })               
            }               
            else if (currentrow + dx != currentrow && currentcol + dy == currentcol) {
                nextsteps.push({ row: currentrow + dz , col: currentcol + 0 }) 
            }
                
            }
        }
    }
	// Compute distance of each possible step to the destination
    stepdistance=[]
    for (i = 0; i < nextsteps.length-1; i++) {
        var nextstep=nextsteps[i];
        var nextrow=nextstep.row
        var nextcol=nextstep.col
        stepdistance[i]=Math.sqrt((nextrow-targetRow)*(nextrow-targetRow)+(nextcol-targetCol)*(nextcol-targetCol));
    } 

	//identify if the best next step (i.e. the step with the shortest distance to the target) is a building
    var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
    var minnexstep=nextsteps[indexMin];
    var nextsteprow=minnexstep.row;
    var nextstepcol=minnexstep.col;
	
	var nextstepisbuilding=Buildings.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});
 	//If the best next step is a building, then we analyze the 2nd best next step...etc, until the next step is not a building
	//Citizens cannot move through the buildings!
    while (nextstepisbuilding.length>0){
        nextsteps.splice((indexMin), 1);
        stepdistance.splice((indexMin), 1);
        var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
        var minnexstep=nextsteps[indexMin];
        var nextsteprow=minnexstep.row;
        var nextstepcol=minnexstep.col;
        var nextstepisbuilding=Buildings.filter(function(d){return d.row==nextsteprow && d.col==nextstepcol;});
    }
	
	// compute the cell to move to
	var newRow = nextsteprow;
    var newCol = nextstepcol;
    
	// update the location of the citizen
	if (citizen.state == COLLECTING_ORDER) {
			if (hasArrived) {
			} else {
			citizen.location.row = newRow;
			citizen.location.col = newCol;
			}
		}
	else {
			citizen.location.row = newRow;
			citizen.location.col = newCol;
		}
	// citizen.location.row = newRow;
	// citizen.location.col = newCol;

	
}
function updateDynamicAgents(){
	// loop over all the citizens and update their states
	for (var citizenIndex in citizens){
		updateCitizen(citizenIndex);
	}
	updateSurface();	
}
function simStep(){
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning){ //the isRunning variable is toggled by toggleSimStep
		currentTime++;
		updateOrders();
		checkriderAvailability();
		updatedfoodArrival();
		updateDynamicAgents();
		removeOrders();
		cancelOrders();
		//update statistics
		statistics[0].stat = num_citizens;
		statistics[1].stat = currentTime;
		statistics[2].stat = delivered_counter;
		statistics[3].stat = cancel_counter;
		statistics[4].stat = Math.round(cancellation_rate());
		statistics[5].stat = timeCancel;
		statistics[6].stat = average(order_time,0).toFixed(1);
		statistics[7].stat = ((delivered_counter/(currentTime/60))/num_citizens).toFixed(1);
	}
}
