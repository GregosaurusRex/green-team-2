var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();


function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;

	if(deltaTime > 1)
		deltaTime = 1;

	return deltaTime;
}

var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_GAMEWIN = 3;

var gameState = STATE_SPLASH;

var heartImage = document.createElement("img");
heartImage.src = "heartImage.png"

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var time = getDeltaTime;
var score = 0;
var lives = 1;

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";


var tileset = document.createElement("img");
tileset.src = "tileset.png";


var LAYER_COUNT = 4;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var LAYER_OBJECT_TRIGGERS = 3;
var MAP = { tw: 60, th: 15 };
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var player = new Player();
var keyboard = new Keyboard();

var METER = TILE;

var GRAVITY = METER * 9.8 * 4;

var MAXDX = METER * 10;

var MAXDY = METER * 15;

var ACCEL = MAXDX * 2;

var FRICTION = MAXDX * 6;

var JUMP = METER * 2500;




var cells = [];
function initialize() {
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) {
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) {
				if(level1.layers[layerIdx].data[idx] != 0) {

					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) {

					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
}


function cellAtPixelCoord(layer, x, y)
{
	if(x < 0 || x > SCREEN_WIDTH || y < 0)
		return 1;

	if(y > SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
	if(tx < 0 || tx >= Map.tw || ty < 0)
		return 1;

	if(ty >= Map.th)
		return 0;
	return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

var worldOffsetX = 0;

function drawMap()
{
	var startX = -1;
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x % TILE);
	
	startX = tileX - Math.floor(maxTiles / 2);
	
	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	if(startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}
	
	worldOffsetX = startX * TILE + offsetX;
	
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
	{
		for( var y = 0; y < level1.layers[layerIdx].height; y++)
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			for( var x = startX; x < startX + maxTiles; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0)
				{
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
					
				}
				idx++;
			}
		}
	}
	

}

var splashTimer = 3;
function runSplash(deltaTime)
{
	splashTimer -= deltaTime;
	if(splashTimer <= 0)
	{
		gameState = STATE_GAME;
		return;
	}
	
	context.fillStyle = "#000";
	context.font = "24px Arial";
	context.fillText("You Are About To Play The Best Game Ever", 60, SCREEN_HEIGHT/2);
	context.font = "12px Arial";
	context.fillText("Prepare Your Pants", 160, (SCREEN_HEIGHT/2) + 40)
}



function runGame(deltaTime)
{
	context.fillStyle = "#ccc";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "white";
	context.font="32px Comic Sans MS";
	var scoreText = "Score: " + score;
	context.fillText(scoreText, SCREEN_WIDTH - 190, 35);



	//var deltaTime = getDeltaTime();

	drawMap();

	player.update(deltaTime);
	player.draw();

	//context.fillStyle = "black";
	//context.fillRect();

	context.fillStyle = "red";
	context.font = "30px Comic Sans MS"
	context.fillText("Health", 10, 450)
	
		for(var i = 0; i < lives; i++)
	{
		context.drawImage(heartImage, 20 + ((heartImage.width + 2) * i), 460);
	
	}

	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}

	context.fillStyle = "#f00";
	context.font = "14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
	
	if(player.position.y > 460)
	{
		gameState = STATE_GAMEOVER;
		return;
	}
	
	if(player.position.x > 1980)
	{
		gameState = STATE_GAMEWIN;
		return;
	}
	
	
}

function runGameOver(deltaTime)
{
	context.fillStyle = "Black"
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	context.fillStyle = "#ff0000";
	context.font = "80px Arial";
	context.fillText("YOU DIED", 120, SCREEN_HEIGHT/2);
	context.font = "20px Arial";
	context.fillText("You Scored:" + score, 150, 300);
	context.fillText("Press SPACE to restart", 155, 350);
	
	context.font = "12px Arial";
	context.fillText("Das a lot of decimal points :O", 150, 450)
	
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true) 
	{
		location.reload();
	}
	
}

function runGameWin(deltaTime)
{
	context.fillStyle = "Red";
	context.fillRect(0, 0, 50, 640);
	
	context.fillStyle = "Orange";
	context.fillRect(50, 0, 50, 640);
	
	context.fillStyle = "Yellow";
	context.fillRect(100, 0, 50, 640);
	
	context.fillStyle = "Green";
	context.fillRect(150, 0, 50, 640);
	
	context.fillStyle = "Blue";
	context.fillRect(200, 0, 50, 640);
	
	context.fillStyle = "Indigo";
	context.fillRect(250, 0, 50, 640);
	
	context.fillStyle = "Violet";
	context.fillRect(300, 0, 50, 640);
	
	context.fillStyle = "Red";
	context.fillRect(350, 0, 50, 640);
	
	context.fillStyle = "Orange";
	context.fillRect(400, 0, 50, 640);
	
	context.fillStyle = "Yellow";
	context.fillRect(450, 0, 50, 640);
	
	context.fillStyle = "Green";
	context.fillRect(500, 0, 50, 640);
	
	context.fillStyle = "Blue";
	context.fillRect(550, 0, 50, 640);
	
	context.fillStyle = "Indigo";
	context.fillRect(600, 0, 50, 640);
	
	context.font = "50px Arial";
	context.fillStyle = "white";
	context.fillText("You have won the game", 50, 100);
	
	context.strokeStyle = "Black";
	context.lineWidth = 2;
	context.strokeText("You have won the game", 50, 100);
	
	context.font = "20px Arial";
	context.lineWidth = 3;
	context.strokeText("Your Score Was: " + score, 120, 200);
	context.fillText("Your Score Was: " + score, 120, 200);
	
	context.font = "20px Arial";
	context.strokeStyle = "Black";
	context.lineWidth = 3;
	context.strokeText("Press SPACE to restart", 120, 250);
	context.fillStyle = "White";
	context.fillText("Press SPACE to restart", 120, 250);
	
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true) 
	{
		location.reload();
	}
}

function runSwitch()
{
	var deltaTime = getDeltaTime();
	switch(gameState)
	{
		case STATE_SPLASH:
			runSplash(deltaTime);
			break;
		case STATE_GAME:
			runGame(deltaTime);
			break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
			break;
		case STATE_GAMEWIN:
			runGameWin(deltaTime);
			break;
	}
}
var musicBackground;
var sfxFire;

musicBackground = new Howl(
	  {
		  urls: ["background.ogg"],
		  loop: true,
		  buffer: true,
		  volume: 0.25
	  } );
	  musicBackground.play();
	  
	  sfxFire = new Howl (
		  {
			  urls: ["fireEffect.ogg"],
			  buffer: true,
			  volume: 1,
			  onend: function() {
				  isSfxPlaying = false;
			  }
		  } );

initialize();

(function() {
	
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++) {
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) {
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) {
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) {
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
	
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(runSwitch);



