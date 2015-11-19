(function(){
  "use strict";

	var enemies = [];

	var socket = io.connect();

	var setEventHandlers = function() {
	    // Socket connection successful
	    socket.on("connect", onSocketConnected);
	};

	// Socket connected
	function onSocketConnected() {
		var sessionid = socket.io.engine.id;
	    console.log("Connected to socket server" + sessionid);
	};

	$(document).ready(function() {
		var $playerName = $('.player-name');

		setEventHandlers();
		var canvasWidth = 0;
		var canvasHeight = 0;

		var top = 0;
		var left = 0;

		var goalScore = 10;

		var gameTime = 0;

		$('.goal-score > span').text(goalScore);

		var audioHit = new Audio('audio/hit.mp3');
		
		/**
		 * Returns a random integer between min (inclusive) and max (inclusive)
		 * Using Math.round() will give you a non-uniform distribution!
		 */
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function moveDot(coords) {				
			$('.dot').css({
				top: coords.top + "px",
				left: coords.left + "px",
			});
		}
		
		var refreshId = setInterval(function() {
			//moveDot();
		}, 1000);


		$('.form-name-of-player').submit(function(event) {
			event.preventDefault();
			console.log($playerName.val());

			socket.emit('enter player', $playerName.val(), function(data) {
				if(data){
					$('#form-container').hide();
					$('#game-content-container').show();
		
					canvasWidth = $('.direction-display-text').width() - $('.dot').width();
					canvasHeight = $('.direction-display-text').height() - $('.dot').height();
				} else {
					alert("Enter as another player!");
				}
			});
		});
		
		$(document).on('click', '.direction-display-text', function(event) {
			if(old_time == 0) {
				timerStart();
			}

			if(event.target.className == "dot"){
				if ($('.dot').hasClass('already-hit')) {
					return;
				} else {					
					$('.dot').addClass('already-hit');

					console.log("HIT!");
					top = getRandomInt(0, canvasHeight);
					left = getRandomInt(0, canvasWidth);

					socket.emit('player hit', { top: top, left: left });
				}
			} else {
				console.log("MISS!");

				socket.emit('player miss');
			}
		});
		
		var playerOneScore = 0;
		var playerTwoScore = 0;

		socket.on('player hit', function(data){
					
			$('.dot').removeClass('already-hit');
			
			audioHit.play();
			moveDot({ top: data.top, left: data.left });

			if (data.player == "Ian") {
				playerOneScore++;

				$('.player-score').text(playerOneScore);
			} else {
				playerTwoScore++;

				$('.enemy-score').text(playerTwoScore);
			}

			updateAccuracyPercentage(data);

			if (playerTwoScore == goalScore || playerOneScore == goalScore) {
				$('#form-container').hide();
				$('#game-content-container').hide();

				$('.post-game-message').text("Congratulations " + data.player + ", you won!");
				$('#post-game-container').show();

				socket.emit('game end', { top: top, left: left });

				getGameTime();

				getWinnerStatistics(data);

				return false;
			}
		});
		
		var playerOneMiss = 0;
		var playerTwoMiss = 0;

		socket.on('player miss', function(data){
			moveDot({ top: data.top, left: data.left });

			if (data.player == "Ian") {
				playerOneMiss++;

				$('.missed-hit-player-1 > span').text(playerOneMiss);
			} else {
				playerTwoMiss++;

				$('.missed-hit-player-2 > span').text(playerTwoMiss);
			}

			updateAccuracyPercentage(data);
		});
		
		var playerOneAccuracyPercent = 0;
		var playerTwoAccuracyPercent = 0;

		function updateAccuracyPercentage(data) {
			if (data.player == "Ian") {
				playerOneAccuracyPercent = (playerOneScore/(playerOneMiss + playerOneScore)) * 100;

				playerOneAccuracyPercent = playerOneAccuracyPercent > 0 ? playerOneAccuracyPercent : 0;

				$('.hit-accuracy-player-1 > span').text(parseInt(playerOneAccuracyPercent));
			} else {
				playerTwoAccuracyPercent = (playerTwoScore/(playerTwoMiss + playerOneScore)) * 100;

				playerTwoAccuracyPercent = playerTwoAccuracyPercent > 0 ? playerTwoAccuracyPercent : 0;

				$('.hit-accuracy-player-2 > span').text(parseInt(playerTwoAccuracyPercent));
			}
		}

		function getWinnerStatistics(data) {
			if (data.player == "Ian") {
				$('.post-game-statistics > .accuracy > span').text(parseInt(playerOneAccuracyPercent));
			} else {
				$('.post-game-statistics > .accuracy > span').text(parseInt(playerTwoAccuracyPercent));
			}

			$('.post-game-statistics > .time > span').text(parseInt(gameTime));
		}

		var old_time = 0;
		var new_time = 0;

		function timerStart() {
			old_time = (new Date).getTime() / 1000;
		}

		function getGameTime() {
			gameTime = (new Date).getTime() / 1000 - old_time;
		}

		// Find player by ID
		function playerById(id) {
			var i;
			for (i = 0; i < enemies.length; i++) {
				if (enemies[i].player.name == id)
					return enemies[i];
			};
			
			return false;
		};
	});

})();