var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var Player = require("./Player").Player;	// Player class

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  	res.sendFile(__dirname + '/index.html');
});

var Player = function() {
	
	// Define which variables and methods can be accessed
	return {
		score: 0,
		id: id
	}
};

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8443
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players;	// Array of connected players
	
/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	
	// Set up Socket.IO to listen on port 8000
	//http.listen(server_port, server_ip_address, function(){
	http.listen("http://fasthands-henyotactics.rhcloud.com:8000/", function(){
		console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
	});
	
	// Start listening for events
	setEventHandlers();
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	io.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	console.log("New player has connected: "+client.id);

	client.on("enter player", function(data, callback){

		if(players.indexOf(data) != -1) {
			callback(false);
		} else {
			console.log("Player " + data + " has entered!");
			callback(true);

			client.nickname = data;

			players.push(data);
			this.broadcast.emit("playerlist", players);
		}
	});

	client.on("player hit", function(data){
		console.log(client.nickname + " HIT!");

		io.emit("player hit", { top: data.top, left: data.left, player: client.nickname });
	});

	client.on("player miss", function(data){
		console.log(client.nickname + " HIT!");

		io.emit("player miss", { player: client.nickname });
	});

	// Listen for client disconnected
	client.on("disconnect", function(){		
		console.log("Player has disconnected: " + client.nickname + ", Client Id: " + client.id);

		var index = players.indexOf(client.nickname);

		for(var x = 0; x < players.length; x++) {
			if(players[x] == client.nickname){
				players.splice(x, 1);
				console.log("Player " + client.nickname + " left the game!");
			}
		}
		
	});
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/


// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

/**************************************************
** RUN THE GAME
**************************************************/
init();