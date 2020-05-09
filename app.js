
var context;
var pacman = new Object();
var heart = new Object();
var board;
var score;
var start_time;
var time_elapsed;
var interval;
var monster_interval;
var food_left;
var life_left;
var board_size = { rows: 26, columns: 29 };
var treat = new Object();
var speed_up = new Object();
var speed_up_image = new Image();
var heart_image = new Image();
var pacman_interval_time = 201;
var monster_interval_time = 403;
var treat_interval_time = 3001;
var speed_up_interval_time = 5001;
speed_up_image.src = "images\\speed_up.png";
heart_image.src = "images\\heart_image.png";
var monsters;
var monster_colors = ["red", "green", "blue", "orange"]

var win_sound;
var eaten_sound;
var background_song;

/* keys for move */
var moveKeys = {
	"upButton": 38,
	"downButton": 40,
	"leftButton": 37,
	"rightButton": 39
};
var tmpMoveKeys = {
	"upButton": 38,
	"downButton": 40,
	"leftButton": 37,
	"rightButton": 39
};
var invalidMoveKeys = [
	20, 19, 27, 45, 46,
	91, 93, 144, 112, 113,
	114, 115, 116, 117, 118,
	119, 120, 121, 122, 123
]
var foodBallsNumber = 50;
var monstersNum = 4;
var ballsColors = {
	"smallBallsColor": "blue",
	"mediumBallsColor": "green",
	"bigBallsColor": "pink"
}
var pressedKey;
var isButtonPressed = {
	"upButton": false,
	"downButton": false,
	"leftButton": false,
	"rightButton": false
};

var users;
var isLogin = false;
var buttonClickedColor = "#ff3333";
var buttonDefaultColor = "#1a8cff";
var gameTime = 60;
const CSS_COLOR_NAMES = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
	'#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
	'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
	'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
	'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
	'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
	'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
	'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
	'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
	'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];




$(document).ready(function () {
	context = canvas.getContext("2d");
	resetUsersDictionary();
	createDivsDictionary();
	dateOptionReset();
	resetMoveKeysButtons();
	addEvents();
});

function addEvents() {
	$("#welcomeToRegisterButton").click(goToRegisterPage);
	$("#welcomeToLoginButton").click(goToLoginPage);
	$("#loginToRegisterBtn").click(goToRegisterPage);
	$("#registerForm").on("submit", register);
	$("#loginForm").on("submit", login);

	// $("#aboutMenu").click()

	$("#settingMenu").click(goToSettings)
	$("#loginMenu").click(goToLoginPage)
	$("#registerMenu").click(goToRegisterPage)
	$("#welcomeMenu").click(goToWelcomePage)

	$("#ballsNum").mouseup(setSliderValue.bind(context, "#lblBalssNum", "Number Of Balls: ", $("#ballsNum")[0]));
	$("#monstersNum").mouseup(setSliderValue.bind(context, "#lblmonstersNum", "Number Of Monsters: ", $("#monstersNum")[0]));
	$("#startGameButton").click(submit);
	$("#randomSettingButton").click(setRandomSetting);
	$("#upButton").click(pressedSetKeyButton.bind($("#upButton")[0]));
	$("#downButton").click(pressedSetKeyButton.bind($("#downButton")[0]));
	$("#leftButton").click(pressedSetKeyButton.bind($("#leftButton")[0]));
	$("#rightButton").click(pressedSetKeyButton.bind($("#rightButton")[0]));

	win_sound = new Audio("sounds\\win.mp3");
	eaten_sound = new Audio("sounds\\death.mp3")
	background_song = new Audio("sounds\\backgroundSong.mp3");
}

function Start() {
	board = new Array();
	monsters = new Array();
	score = 0;
	pac_color = "yellow";
	start_time = new Date();
	pacman_interval_time = 201;
	let monster_remain = window.monstersNum;
	for (var i = 0; i < board_size.rows; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < board_size.columns; j++) {
			let cell = "" + j + "," + i;
			if (wall_locations.includes(cell)) {
				board[i][j] = 4;
			}
			else if (box_fill.includes(cell)) {
				board[i][j] = -1;
			}
			else if (monster_remain > 0 &&
				((i == 0 && j == 0) ||
					(i == 0 && j == board_size.columns - 1) ||
					(i == board_size.rows - 1 && j == 0) ||
					(i == board_size.rows - 1 && j == board_size.columns - 1))
			) {
				board[i][j] = 3;
				let monster = new Object();
				monster.i = i;
				monster.j = j;
				monster.color = monster_colors[monster_remain - 1];
				monster.sit_on = 0;
				monsters.push(monster)
				monster_remain--;
			}
			else
				board[i][j] = 0
		}
	}
	food_left = window.foodBallsNumber;
	treat.is_appears = false;
	speed_up.is_appears = false;
	life_left = 5;
	DrawSettingsMonsters();
	SetSettingsKeysLabels();
	SetSettingsBallColors();
	SetPacmanLocation();
	SetHeartLocation();
	SetFoodLocation();
	keysDown = {};
	addEventListener(
		"keydown",
		function (e) {
			keyPress(e);
		},
		false
	);
	addEventListener(
		"keyup",
		function (e) {
			keyRelease(e);
		},
		false
	);
	if (interval != undefined) {
		clearInterval(interval);
		clearInterval(monster_interval);
		clearInterval(treat_interval);
		clearInterval(speed_up_interval);
	}
	interval = setInterval(UpdatePosition, pacman_interval_time);
	monster_interval = setInterval(UpdateMonster, monster_interval_time);
	treat_interval = setInterval(UpdateTreat, treat_interval_time);
	speed_up_interval = setInterval(UpdateSpeedUp, speed_up_interval_time);
	background_song.play();
}

function SetSettingsBallColors() {
	$("#SmallBall")[0].style.backgroundColor = ballsColors.smallBallsColor;
	$("#MediumBall")[0].style.backgroundColor = ballsColors.mediumBallsColor;
	$("#BigBall")[0].style.backgroundColor = ballsColors.bigBallsColor;
}

function SetSettingsKeysLabels() {
	lblKeyUp.value = keyCodes[moveKeys.upButton];
	lblKeyDown.value = keyCodes[moveKeys.downButton];
	lblKeyLeft.value = keyCodes[moveKeys.leftButton];
	lblKeyRight.value = keyCodes[moveKeys.rightButton];
}

function DrawSettingsMonsters() {
	let img_array = [SettingMonster1, SettingMonster2, SettingMonster3, SettingMonster4];
	for (let i = 0; i < monstersNum; i++) {
		img_array[i].src = "images\\" + monster_colors[i] + "Ghost.png";
		img_array[i].style.display = "inline";
	}
}

function UpdateSpeedUp() {
	if (speed_up.is_appears) {
		board[speed_up.i][speed_up.j] = 0;
		speed_up.is_appears = false;
	}
	else {
		new_location = findRandomEmptyCell();
		board[new_location[0]][new_location[1]] = 6;
		speed_up.i = new_location[0];
		speed_up.j = new_location[1];
		speed_up.is_appears = true;
	}
}

function UpdateTreat() {
	if (treat.is_appears) {
		board[treat.i][treat.j] = 0;
		treat.is_appears = false;
	}
	else {
		new_location = findRandomEmptyCell();
		board[new_location[0]][new_location[1]] = 5;
		treat.i = new_location[0];
		treat.j = new_location[1];
		treat.is_appears = true;
	}
}

function SetFoodLocation() {
	let num_of_food = food_left;
	let big_food_num = Math.floor(food_left * 0.1);
	let medium_food_num = Math.floor(food_left * 0.3);
	for (let i = 0; i < big_food_num; i++) {
		let food_new_location = findRandomEmptyCell();
		board[food_new_location[0]][food_new_location[1]] = 9;
		num_of_food--;
	}
	for (let i = 0; i < medium_food_num; i++) {
		let food_new_location = findRandomEmptyCell();
		board[food_new_location[0]][food_new_location[1]] = 8;
		num_of_food--;
	}
	while (num_of_food > 0) {
		let food_new_location = findRandomEmptyCell();
		board[food_new_location[0]][food_new_location[1]] = 7;
		num_of_food--;
	}
}

function SetPacmanLocation() {
	let pacman_location = findRandomEmptyCell();
	pacman.i = pacman_location[0];
	pacman.j = pacman_location[1];
	pacman.direction = 2;
	board[pacman_location[0]][pacman_location[1]] = 2;
}

function SetHeartLocation() {
	let heart_location = findRandomEmptyCell();
	heart.i = heart_location[0];
	heart.j = heart_location[1];
	heart.sit_on = board[heart_location[0]][heart_location[1]];
	heart.is_appears = true;
	board[heart_location[0]][heart_location[1]] = 1;
}

function RestartBoard() {
	clearInterval(interval);
	clearInterval(monster_interval);
	clearInterval(treat_interval);
	clearInterval(speed_up_interval);
	treat.is_appears = false;
	speed_up.is_appears = false;
	SetMonstersLocation();
	SetPacmanLocation();
	SetHeartLocation();
	sleep(2000)
	pacman_interval_time = 201;
	interval = setInterval(UpdatePosition, pacman_interval_time);
	monster_interval = setInterval(UpdateMonster, monster_interval_time);
	treat_interval = setInterval(UpdateTreat, treat_interval_time);
	speed_up_interval = setInterval(UpdateSpeedUp, speed_up_interval_time);
}

function SetMonstersLocation() {
	let monster_locations = [[0, 0], [0, board_size.columns - 1], [board_size.rows - 1, 0], [board_size.rows - 1, board_size.columns - 1]];
	for (let i = 0; i < monsters.length; i++) {
		monsters[i].i = monster_locations[i][0];
		monsters[i].j = monster_locations[i][1];
	}
}

function findRandomEmptyCell() {
	var i = Math.floor(Math.random() * board_size.rows);
	var j = Math.floor(Math.random() * board_size.columns);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * board_size.rows);
		j = Math.floor(Math.random() * board_size.columns);
	}
	return [i, j];
}

function GetKeyPressed() {
	if (keysDown[this.moveKeys["upButton"]]) {
		return 1;
	}
	if (keysDown[this.moveKeys["downButton"]]) {
		return 2;
	}
	if (keysDown[this.moveKeys["leftButton"]]) {
		return 3;
	}
	if (keysDown[this.moveKeys["rightButton"]]) {
		return 4;
	}
}

function Draw() {
	canvas.width = canvas.width; //clean board
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

	lblScore.value = score;
	lblRemainingLife.value = life_left;
	lblNumberOfBalls.value = food_left;
	lblTime.value = parseInt(time_elapsed);

	let cell_width = canvas.width / (board_size.columns);
	let cell_height = canvas.width / (board_size.rows);
	for (var i = 0; i < board_size.rows; i++) {
		for (var j = 0; j < board_size.columns; j++) {
			var center = new Object();
			center.x = i * cell_height + cell_height / 2;
			center.y = j * cell_width + cell_width / 2;
			if (board[i][j] == 7) {
				context.beginPath();
				context.arc(center.x, center.y, cell_height / 6, 0, 2 * Math.PI); // circle
				context.fillStyle = ballsColors.smallBallsColor; //color
				context.fill();
			} else if (board[i][j] == 8) {
				context.beginPath();
				context.arc(center.x, center.y, cell_height / 4, 0, 2 * Math.PI); // circle
				context.fillStyle = ballsColors.mediumBallsColor; //color
				context.fill();
			} else if (board[i][j] == 9) {
				context.beginPath();
				context.arc(center.x, center.y, cell_height / 3, 0, 2 * Math.PI); // circle
				context.fillStyle = ballsColors.bigBallsColor; //color
				context.fill();
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - cell_height / 2, center.y - cell_width / 2, cell_height, cell_width);
				context.fillStyle = "black"; //color
				context.fill();
				context.strokeStyle = "blue";
				context.stroke()
			}
		}
	}
	draw_treat(cell_width, cell_height);
	draw_speed_up(cell_width, cell_height);
	draw_heart(cell_width, cell_height);
	draw_pacman(cell_width, cell_height);
	draw_monsters(cell_width, cell_height);
	for (let i = 0; i < monsters.length; i++) {
		if (pacman.i == monsters[i].i && pacman.j == monsters[i].j) {
			Eaten();
			break;
		}
	}
}

function draw_speed_up(cell_width, cell_height) {
	if (speed_up.is_appears) {
		let center = new Object();
		center.x = speed_up.i * cell_height + cell_height / 2 - 7;
		center.y = speed_up.j * cell_width + cell_width / 2 - 7;
		context.drawImage(speed_up_image, center.x, center.y, cell_width, cell_height - 5);
	}
}

function draw_treat(cell_width, cell_height) {
	if (treat.is_appears) {
		let center = new Object();
		center.x = treat.i * cell_height + cell_height / 2 - 10;
		center.y = treat.j * cell_width + cell_width / 2 - 7;
		cherry(context, center.x, center.y, cell_width-3, cell_height-5);
	}
}

function draw_monsters(cell_width, cell_height) {
	let monster_width = cell_width / 3;
	let monster_height = cell_height / 3;
	for (let i = 0; i < monsters.length; i++) {
		let center = new Object();
		center.x = monsters[i].i * cell_height + cell_height / 2;
		center.y = monsters[i].j * cell_width + cell_width / 2;
		context.beginPath();
		context.fillStyle = monsters[i].color;
		context.arc(center.x, center.y, monster_width, Math.PI, 2 * Math.PI);
		context.lineTo(center.x + monster_width, center.y + monster_height);
		context.arc(center.x + monster_width / 2, center.y + monster_height, monster_width * 0.5, 0, Math.PI);
		context.arc(center.x + monster_width / 2 - monster_width, center.y + monster_height, monster_width * 0.5, 0, Math.PI);
		context.closePath();
		context.fill();
		context.strokeStyle = monsters[i].color;
		context.stroke();
		context.beginPath();
		context.arc(center.x + cell_height / 8, center.y - cell_width / 12, cell_width / 12, 0, 2 * Math.PI); // circle
		context.fillStyle = "white"; //color
		context.fill();
		context.beginPath();
		context.arc(center.x - cell_height / 8, center.y - cell_width / 12, cell_width / 12, 0, 2 * Math.PI); // circle
		context.fillStyle = "white"; //color
		context.fill();
		context.beginPath();
		context.arc(center.x + cell_height / 8, center.y - cell_width / 12, cell_width / 20, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();
		context.beginPath();
		context.arc(center.x - cell_height / 8, center.y - cell_width / 12, cell_width / 20, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();
	}
}

function draw_pacman(cell_width, cell_height) {
	let center = new Object();
	center.x = pacman.i * cell_height + cell_height / 2;
	center.y = pacman.j * cell_width + cell_width / 2;
	context.beginPath();
	context.arc(center.x, center.y, cell_height / 2, pacman.direction * (Math.PI / 2) + (0.15 * Math.PI), pacman.direction * (Math.PI / 2) + (1.85 * Math.PI)); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.strokeStyle = "black";
	context.stroke();
}

function draw_heart(cell_width, cell_height) {
	if (heart.is_appears) {
		let center = new Object();
		center.x = heart.i * cell_height + cell_height / 2 - 5;
		center.y = heart.j * cell_width + cell_width / 2 - 5;
		context.drawImage(heart_image, center.x, center.y, cell_width - 5, cell_height - 10);
	}
}

function UpdatePosition() {
	board[pacman.i][pacman.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) {
		if (pacman.j > 0 && board[pacman.i][pacman.j - 1] != 4) {
			pacman.j--;
			pacman.direction = 3;
		}
	}
	if (x == 2) {
		if (pacman.j < board_size.columns - 1 && board[pacman.i][pacman.j + 1] != 4) {
			pacman.j++;
			pacman.direction = 1;
		}
	}
	if (x == 3) {
		if (pacman.i > 0 && board[pacman.i - 1][pacman.j] != 4) {
			pacman.i--;
			pacman.direction = 2;
		}
	}
	if (x == 4) {
		if (pacman.i < board_size.rows - 1 && board[pacman.i + 1][pacman.j] != 4) {
			pacman.i++;
			pacman.direction = 0;
		}
	}
	if (pacman.i == heart.i && pacman.j == heart.j) {
		heart.is_appears = false;
		heart.i = -1;
		heart.j = -1;
		board[pacman.i][pacman.j] = heart.sit_on;
		score += 50;
	}
	if (board[pacman.i][pacman.j] == 7) {
		score += 5;
		food_left--;
	}
	if (board[pacman.i][pacman.j] == 8) {
		score += 15;
		food_left--;
	}
	if (board[pacman.i][pacman.j] == 9) {
		score += 25;
		food_left--;
	}
	if (board[pacman.i][pacman.j] == 5) {
		score += 30;
		treat.is_appears = false;
		board[pacman.i][pacman.j] = 0;
	}
	if (board[pacman.i][pacman.j] == 6) {
		speed_up.is_appears = false;
		board[pacman.i][pacman.j] = 0;
		if (pacman_interval_time > 121)
			pacman_interval_time -= 40;
		clearInterval(interval);
		interval = setInterval(UpdatePosition, pacman_interval_time);
	}
	board[pacman.i][pacman.j] = 2;
	var currentTime = new Date();
	time_elapsed = window.gameTime - ((currentTime - start_time) / 1000);
	Draw();
	if (time_elapsed <= 0) {
		time_elapsed = 0;
		try {
			background_song.pause();
			win_sound.play();
		}
		catch (error) { }
		window.clearInterval(interval);
		window.clearInterval(monster_interval);
		window.clearInterval(treat_interval_time);
		window.clearInterval(speed_up_interval);
		if(score < 100) {
			window.alert("You are better than " + score + " points!");
		}
		else {
		window.alert("Winner!");
		}
		win_sound.pause();
	}
}

function UpdateHeart() {
	board[heart.i][heart.j] = heart.sit_on;
	let next_move = Math.floor(Math.random() * 4 + 1);
	loop: for (let i = 0; i < 100; i++) {
		if (next_move == 1) {
			if (heart.j > 0 && board[heart.i][heart.j - 1] != 4 && board[heart.i][heart.j - 1] != 3) {
				heart.sit_on = board[heart.i][heart.j - 1];
				board[heart.i][heart.j - 1] = 1;
				heart.j--;
				break loop;
			}
			else
				next_move++;
		}
		if (next_move == 2) {
			if (heart.j < board_size.columns - 1 && board[heart.i][heart.j + 1] != 4 && board[heart.i][heart.j + 1] != 3) {
				heart.sit_on = board[heart.i][heart.j + 1];
				board[heart.i][heart.j + 1] = 1;
				heart.j++;
				break loop;
			}
			else
				next_move++;
		}
		if (next_move == 3) {
			if (heart.i > 0 && board[heart.i - 1][heart.j] != 4 && board[heart.i - 1][heart.j] != 3) {
				heart.sit_on = board[heart.i - 1][heart.j];
				board[heart.i - 1][heart.j] = 1;
				heart.i--;
				break loop;
			}
			else
				next_move++;
		}
		if (next_move == 4) {
			if (heart.i < board_size.rows - 1 && board[heart.i + 1][heart.j] != 4 && board[heart.i + 1][heart.j] != 3) {
				heart.sit_on = board[heart.i + 1][heart.j];
				board[heart.i + 1][heart.j] = 1;
				heart.i++;
				break loop;
			}
			else
				next_move = 1;
		}
	}
}

function UpdateMonster() {
	if (heart.is_appears)
		UpdateHeart();
	for (let i = 0; i < monsters.length; i++) {
		let monster = monsters[i];
		board[monster.i][monster.j] = monster.sit_on;
		var move_to = GetMonsterMove(monster);
		loop: while (true) {
			if (move_to == 1) {
				if (monster.j > 0 && board[monster.i][monster.j - 1] != 4 && board[monster.i][monster.j - 1] != 3) {
					monster.sit_on = board[monster.i][monster.j - 1];
					board[monster.i][monster.j - 1] = 3;
					monster.j--;
					break loop;
				}
				else
					move_to = Math.floor(Math.random() * 4) + 1;
			}
			if (move_to == 2) {
				if (monster.j < board_size.columns - 1 && board[monster.i][monster.j + 1] != 4 && board[monster.i][monster.j + 1] != 3) {
					monster.sit_on = board[monster.i][monster.j + 1];
					board[monster.i][monster.j + 1] = 3;
					monster.j++;
					break loop;
				}
				else
					move_to = Math.floor(Math.random() * 4) + 1;
			}
			if (move_to == 3) {
				if (monster.i > 0 && board[monster.i - 1][monster.j] != 4 && board[monster.i - 1][monster.j] != 3) {
					monster.sit_on = board[monster.i - 1][monster.j];
					board[monster.i - 1][monster.j] = 3;
					monster.i--;
					break loop;
				}
				else
					move_to = Math.floor(Math.random() * 4) + 1;
			}
			if (move_to == 4) {
				if (monster.i < board_size.rows - 1 && board[monster.i + 1][monster.j] != 4 && board[monster.i + 1][monster.j] != 3) {
					monster.sit_on = board[monster.i + 1][monster.j];
					board[monster.i + 1][monster.j] = 3;
					monster.i++;
					break loop;
				}
				else
					move_to = Math.floor(Math.random() * 4) + 1;
			}
		}
		if (monster.i == heart.i && monster.j == heart.j) {
			heart.is_appears = false;
			heart.sit_on = 0;
			SetHeartLocation();
		}
	}
}

function GetMonsterMove(monster) {
	if (pacman.j < monster.j)
		return 1;
	if (pacman.j > monster.j)
		return 2;
	if (pacman.i < monster.i)
		return 3;
	if (pacman.i > monster.i)
		return 4;
}

function Eaten() {
	try {
		eaten_sound.play();
	} catch (error) { }
	life_left--;
	score = score - 10;
	if (life_left == 0) {
		window.clearInterval(interval);
		window.clearInterval(monster_interval);
		window.clearInterval(treat_interval);
		window.clearInterval(speed_up_interval);
		background_song.pause();
		window.alert("Loser!");
	}
	else
		RestartBoard();
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function cherry(ctx, x, y, w, h) {

	function A(x, y, r) { ctx.arc(x, y, r, 0, Math.PI * 2) };
	function M(x, y) { ctx.moveTo(x, y) };
	function L(x, y) { ctx.lineTo(x, y) };
	function Q(x, y, x1, y1) { ctx.quadraticCurveTo(x, y, x1, y1) };
	function C(x, y, x1, y1, x2, y2) { ctx.bezierCurveTo(x, y, x1, y1, x2, y2) };

	var fillRule = 'evenodd';
	var fill = 'rgba(139,0,0,1.000)';
	var scx = w / 235;
	var scy = h / 240.51374573479714;
	ctx.globalAlpha = 1;
	ctx.setTransform(scx, 0, 0, scy, x, y);
	ctx.fillStyle = fill;
	ctx.beginPath();
	M(94.5, 6); Q(108.9, 9, 123.5, 18); Q(143.3, 34.2, 144.5, 53); Q(155.8, 37.7, 176.5, 22); Q(188.4, 24.4, 195.5, 38); Q(205.3, 31.8, 231.5, 28); Q(262.6, 26.3, 269, 34.5); Q(260.5, 67.9, 230.5, 82); Q(219.6, 85.8, 200.5, 85); Q(193.5, 83.2, 174, 69.5); Q(176.2, 72.6, 190.5, 100); Q(212.7, 97.8, 230.5, 110); Q(247, 123.2, 253, 141.5); Q(258.5, 163.5, 250, 185.5); Q(240.3, 202.7, 221.5, 214); Q(199.4, 222.6, 179.5, 217); Q(169.9, 230.3, 152.5, 239); Q(138.5, 245.6, 115.5, 244); Q(83, 238.2, 67, 210.5); Q(51, 180.6, 65, 147.5); Q(72.6, 132.5, 86.5, 122); Q(96, 114.7, 118, 108.5); Q(122.6, 90.4, 129, 79.5); Q(107.9, 85.7, 84.5, 73); Q(50.3, 53, 34, 26.5); Q(35.3, 17.7, 58.5, 9); Q(71.4, 5, 94.5, 6);
	M(154, 100.5); Q(145.6, 114.6, 153.5, 116); Q(164.9, 109.1, 154, 100.5);
	ctx.fill(fillRule); ctx.fillStyle = "#C00";
	ctx.beginPath();
	M(208.5, 100); Q(232.9, 107.6, 246, 126.5); Q(256.9, 142.9, 255, 168.5); Q(249.6, 194.1, 230.5, 208); Q(210.6, 223.2, 181.5, 218); Q(176.9, 216.5, 185.5, 205); Q(205.9, 207, 221.5, 197); Q(233.9, 186.3, 241, 172.5); Q(248.1, 144, 233, 125.5); Q(224.7, 113.7, 190, 100.5); L(208.5, 100);
	M(194.5, 108); Q(206.5, 117.9, 190.5, 129); Q(176.3, 135.1, 168, 126.5); Q(186, 124.3, 189.5, 122); Q(192.2, 120.9, 194.5, 108);
	M(159.5, 110); Q(166.3, 114.5, 157.5, 119); Q(149.9, 117.1, 159.5, 110);
	M(111.5, 114); Q(114.5, 125.7, 123.5, 129); Q(128.5, 130.9, 148, 130.5); Q(142.3, 136.6, 122.5, 135); Q(103.6, 128.9, 111.5, 114);
	ctx.fill(fillRule); ctx.fillStyle = "#D00";
	ctx.beginPath();
	M(194.5, 108); Q(202.6, 109.3, 198, 121.5); Q(190.9, 132.6, 174, 131.5); Q(194.1, 153.1, 192, 183.5); Q(188.1, 212.8, 168.5, 229); Q(148.2, 247.1, 115.5, 244); Q(89.3, 239.4, 73, 219.5); Q(55.9, 199.3, 59, 166.5); Q(63.8, 140.3, 82.5, 125); Q(97.5, 112.7, 116.5, 110); Q(109, 124.6, 123.5, 129); Q(135.5, 134.1, 149, 125.5); Q(147.6, 138.5, 122.5, 135); Q(108.6, 130.5, 109, 119); L(93.5, 124); Q(70.4, 137.8, 65, 165.5); Q(62.6, 194.6, 81.5, 213); Q(101.1, 231.4, 129.5, 229); Q(148.7, 224.9, 161.5, 214); Q(175.1, 200.2, 179, 180.5); Q(180.3, 160.6, 171, 143.5); Q(142.4, 118.9, 148, 114.5); Q(168.7, 126.4, 182.5, 125); Q(193.6, 123, 194.5, 108);
	ctx.fill(fillRule); ctx.fillStyle = "#F75";
	ctx.beginPath();
	M(103.2, 129.5); Q(127.1, 131.3, 129.5, 154.5); Q(127.1, 176.7, 104.8, 179.5); Q(81.1, 177.8, 78.5, 154.5); Q(81.2, 132, 103.2, 129.5);
	M(174.9, 129.6); Q(191.8, 127.1, 185.2, 143.4); Q(177, 141.7, 174.9, 129.6);
	M(99.1, 141.5); Q(90.4, 144.7, 91.6, 155.3); Q(94.1, 164.6, 105.3, 163.4); Q(114.9, 160.5, 113.4, 149.7); Q(110.3, 140.1, 99.1, 141.5);
	ctx.fill(fillRule); ctx.fillStyle = "#F00";
	ctx.beginPath();
	M(194.5, 106); Q(214.2, 108.5, 225.5, 118); Q(240.7, 131.8, 243, 152.5); Q(243.3, 173.4, 232, 187.5); Q(218.6, 200, 202.5, 205); L(186, 204.5); Q(188.8, 158, 194.5, 106);
	M(106.5, 119); Q(111.8, 130.1, 122.5, 135); Q(142.9, 137.7, 153.5, 126); Q(171.2, 138.8, 177, 157.5); Q(183, 180.3, 172, 200.5); Q(160, 219.8, 138.5, 227); Q(111.5, 233.7, 90.5, 220); Q(73.2, 207.4, 67, 188.5); Q(61.4, 167, 71, 147.5); Q(83.3, 125.3, 106.5, 119);
	M(97.2, 131.7); Q(86.7, 134.1, 81, 145.5); Q(79.8, 157.2, 83, 167.5); Q(94.5, 183.3, 115.5, 176); Q(124.4, 170.2, 128, 160.5); Q(128.8, 149.1, 125, 141.5); Q(114.9, 128.1, 97.2, 131.7);
	ctx.fill(fillRule); ctx.fillStyle = "#FAA"
	ctx.beginPath();
	M(105.5, 140); Q(117.4, 142.8, 115, 156.7); Q(110.1, 168.2, 97.1, 164.9); Q(88.6, 159.5, 90, 148.3); Q(94, 138.5, 105.5, 140);
	ctx.fill(fillRule); fill = 'rgba(255,100,0,1.000)'; ctx.fillStyle = fill;
	ctx.beginPath();
	M(192.5, 126); Q(205.1, 142.4, 189.5, 156); Q(182.8, 150.6, 183, 131.5); Q(192.5, 126.6, 192.5, 126);
	ctx.fill(fillRule); ctx.fillStyle = "#A83";
	ctx.beginPath();
	M(174.5, 25); Q(175.7, 34.3, 184, 41.5); Q(169.5, 52.8, 152, 74.5); Q(130, 115.7, 131, 130.5); Q(125.6, 130.1, 117.5, 126); Q(111.4, 118.2, 128, 80.5); Q(140.2, 79.5, 149, 70.5); Q(142.4, 68.2, 144, 53.5); Q(158.6, 33.8, 174.5, 25);
	M(189.5, 45); Q(171.9, 67.4, 172, 67.5); Q(195.3, 100.2, 192, 119.5); Q(181.5, 130.9, 174, 119.5); Q(158.7, 87.9, 169.5, 81); Q(170.8, 79.9, 191, 106.5); Q(175.7, 71, 170.5, 71); Q(162.7, 78.1, 157, 91.5); Q(159, 93.4, 171, 122.5); Q(163.3, 124.2, 154.5, 97); Q(141.1, 134.1, 135.5, 131); Q(142, 108.1, 159, 77.5); Q(171.7, 59.9, 189.5, 45);
	ctx.fill(fillRule); var fill = '#6c3f00'; ctx.fillStyle = fill;
	ctx.beginPath();
	M(181.5, 23); Q(196.1, 32.4, 196, 42.5); Q(179.9, 49.9, 162, 73.5); Q(160.5, 74.2, 131.5, 131); Q(129.1, 114.9, 152, 74.5); Q(168.2, 53.6, 184, 41.5); Q(166.8, 27.4, 181.5, 23);
	M(170.5, 71); Q(175.7, 69.3, 191, 105.5); Q(170.7, 79.9, 169.5, 81); Q(159, 92.2, 177.5, 124); Q(170.8, 128, 157, 91.5); Q(161.1, 79.2, 170.5, 71);
	ctx.fill(fillRule); fill = '#00a100'; ctx.fillStyle = fill;
	ctx.beginPath();
	M(75.9, 14.6); Q(90, 25.7, 104, 42); Q(93.2, 20.2, 101.1, 16.6); Q(113.4, 48.5, 126.7, 56.3); Q(117.4, 35.2, 124, 25.7); Q(136.6, 64.5, 143.2, 73.4); Q(114.6, 74.1, 78.6, 64.2); Q(78.4, 59.4, 121.2, 62.9); Q(119.2, 56, 62.9, 50.4); Q(62.3, 44.7, 97.5, 46.8); Q(81.3, 33.2, 54.9, 39.4); Q(52.9, 30.7, 68.3, 31.1); Q(56.6, 31.2, 42.5, 25.5); Q(60.9, 13.8, 80.1, 27.7); Q(75.2, 19.9, 75.9, 14.6);
	M(236.2, 32.5); Q(240.6, 36.2, 218.4, 53.8); Q(235.7, 50.5, 247, 34.6); Q(255.1, 38.5, 243.8, 46.8); Q(257.8, 33.5, 262.5, 37.8); Q(255.6, 54.3, 239.5, 55.5); Q(250.1, 55.9, 245.5, 63.5); Q(233.4, 59.1, 216.6, 61.1); Q(233.8, 65.4, 231.8, 74.5); Q(208.7, 63.8, 197, 64.6); Q(217, 75.7, 211.2, 81.5); Q(187.7, 67.3, 175.5, 64.5); Q(174.7, 63.6, 207.6, 38.8); Q(215.1, 33.5, 221.4, 34.9); Q(202, 50.8, 196.4, 57.9); Q(235.6, 31.7, 236.2, 32.5);
	ctx.fill(fillRule); ctx.fillStyle = "#0C0";
	ctx.beginPath();
	M(70.5, 6); Q(105.1, 4.4, 123.5, 18); Q(143.8, 31.9, 148, 70.5); Q(140.7, 78.4, 113.5, 82); Q(88.6, 78.6, 63.5, 59); Q(41.9, 40.5, 34, 26.5); Q(39.7, 13.5, 70.5, 6);
	M(77, 15.5); Q(74.9, 16.1, 80.5, 28); Q(60.8, 21, 43, 25.5); Q(69.5, 29.7, 99, 46); Q(99.3, 47.8, 66.5, 51); Q(118.8, 53.8, 122, 62.5); Q(122, 62.9, 84.5, 66); Q(138.1, 76.1, 142, 73.5); Q(133, 61.8, 123.5, 26); Q(120.3, 26.2, 125.5, 56); Q(109.9, 48.2, 100.5, 17); Q(96.5, 17.5, 103.5, 40); Q(93.7, 38.3, 77, 15.5);
	M(231.5, 28); Q(262.7, 26.4, 269, 34.5); Q(261.3, 62.3, 240.5, 76); Q(225.5, 87, 200.5, 85); Q(192.7, 82.3, 174, 68.5); Q(185.6, 59.5, 212.5, 81); Q(214.6, 79.2, 197.5, 64); Q(209.1, 61.4, 231.5, 73); Q(233.8, 70, 217, 61.7); Q(227.4, 56.6, 245.5, 62); Q(247.5, 60, 239, 55.7); Q(256.8, 50.1, 261.5, 36); Q(244.3, 49, 217.5, 55); Q(216.9, 52.4, 237.5, 33); Q(200.2, 62.5, 196, 57.5); Q(199, 51.4, 219.5, 35); Q(208.7, 37.9, 183, 59.5); Q(196, 46.5, 199.5, 36); Q(206.4, 32.1, 231.5, 28);
	ctx.stroke(); ctx.fill(fillRule);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function submit() {
	if (settingInputCheck()) {
		window.goToGame();
		window.assignMoveKeys();
		window.Start();
	}
}

/** This function checks the input from the setting page */
function settingInputCheck() {

	var inputs = $(".textBoxInput");

	// checks for balls colors
	for (let i = 0; i < inputs.length - 1; i++) {
		window.ballsColors[inputs[i].id] = inputs[i].value;
	}
	// check for a valid game time
	let gameTimeInput = parseInt(inputs[inputs.length - 1].value)
	if (gameTimeInput >= 60) {
		window.gameTime = gameTimeInput;
	} else if (inputs[inputs.length - 1].value != "") {
		let elemName = inputs[inputs.length - 1].labels[0].firstChild.data
		window.invalidInputAlert(elemName.substring(0, elemName.length - 1), "Time");
		return false;
	}
	window.foodBallsNumber = parseInt($("#ballsNum")[0].value);
	window.monstersNum = parseInt($("#monstersNum")[0].value);
	return true;
}

/** This function set random setting */
function setRandomSetting() {

	window.tmpMoveKeys["upButton"] = 38;
	window.tmpMoveKeys["rightButton"] = 39;
	window.tmpMoveKeys["downButton"] = 40;
	window.tmpMoveKeys["leftButton"] = 37;

	// sets random number of balls
	$("#ballsNum")[0].value = 50 + Math.floor(Math.random() * 41);
	setSliderValue("#lblBalssNum", "Number Of Balls: ", $("#ballsNum")[0]);
	// sets random number of monsters
	$("#monstersNum")[0].value = 1 + Math.floor(Math.random() * 4);
	setSliderValue("#lblmonstersNum", "Number Of Monsters: ", $("#monstersNum")[0]);

	$("#setTimer")[0].value = 60 + Math.floor(Math.random() * 241);

	let colorsIndex = new Set();
	while (colorsIndex.size < 3) {
		let randomIndex = Math.floor(Math.random() * CSS_COLOR_NAMES.length);
		if (!colorsIndex.has(randomIndex))
			colorsIndex.add(randomIndex);
	}
	const it = colorsIndex.values();
	$("#smallBallsColor")[0].value = CSS_COLOR_NAMES[it.next().value].toLowerCase();
	$("#mediumBallsColor")[0].value = CSS_COLOR_NAMES[it.next().value].toLowerCase();
	$("#bigBallsColor")[0].value = CSS_COLOR_NAMES[it.next().value].toLowerCase();
}

function invalidInputAlert(elementName, type) {
	let alert = "";
	if (type == "Color")
		alert = "Color Input at '" + elementName + "' TextBox is Invalid\nPlease Try Again...";
	else if (type == "Time")
		alert = "Time Setup at '" + elementName + "' TextBox is Invalid\nThe setup time should be a number greater then 60.\nPlease Try Again...";
	window.alert(alert)
}

function isColor(strColor) {
	var s = new Option().style;
	s.color = strColor;
	return s.color == strColor;
}

function setSliderValue(eleID, str, element) {
	$(eleID)[0].innerText = str + element.value;
}

function pressedSetKeyButton(button) {
	if (isAButtonPressed())
		return;
	isButtonPressed[button.target.id] = true;
	button.target.style.backgroundColor = window.buttonClickedColor;
	button.target.innerText = "Press\nKey!"
}

/* change */
function setupButtton(key, pressedID) {
	window.tmpMoveKeys[pressedID] = key;
	isButtonPressed[pressedID] = false;
}

function keyPress(e) {
	if (isAButtonPressed()) {
		return;
	} else {
		keysDown[e.keyCode] = true;
	}
}

function keyRelease(e) {
	if (isAButtonPressed()) {
		if (window.invalidMoveKeys.includes(e.keyCode)) {
			window.alert("You can't use this key foe playing.\nPlease Choose another...")
			return;
		}
		if (Object.values(window.tmpMoveKeys).includes(e.keyCode) &&
			this.tmpMoveKeys[getPressedSetupKeysID()] != e.keyCode) {
			window.alert("You alredy chose this key.\nPlease Choose another...")
			return;
		}
		setupButtton(e.keyCode, getPressedSetupKeysID());
		resetMoveKeysButtons();
	} else {
		keysDown[e.keyCode] = false;
	}
}

function isAButtonPressed() {
	return isButtonPressed["upButton"] || isButtonPressed["downButton"] || isButtonPressed["rightButton"] || isButtonPressed["leftButton"]
}

function getPressedSetupKeysID() {
	if (isButtonPressed["upButton"])
		return "upButton"
	if (isButtonPressed["downButton"])
		return "downButton"
	if (isButtonPressed["rightButton"])
		return "rightButton"
	if (isButtonPressed["leftButton"])
		return "leftButton"
}

function resetMoveKeysButtons() {
	$("#upButton")[0].style.backgroundColor = window.buttonDefaultColor;
	$("#upButton")[0].innerText = "Setup UP Button!";
	$("#downButton")[0].style.backgroundColor = window.buttonDefaultColor;
	$("#downButton")[0].innerText = "Setup DOWN Button!";
	$("#rightButton")[0].style.backgroundColor = window.buttonDefaultColor;
	$("#rightButton")[0].innerText = "Setup RIGHT Button!";
	$("#leftButton")[0].style.backgroundColor = window.buttonDefaultColor;
	$("#leftButton")[0].innerText = "Setup LEFT Button!";
}

function assignMoveKeys() {
	window.moveKeys["upButton"] = window.tmpMoveKeys["upButton"];
	window.moveKeys["rightButton"] = window.tmpMoveKeys["rightButton"];
	window.moveKeys["downButton"] = window.tmpMoveKeys["downButton"];
	window.moveKeys["leftButton"] = window.tmpMoveKeys["leftButton"];
}

function dateOptionReset() {

	//populate our years select box
	for (i = new Date().getFullYear(); i > 1900; i--) {
		$('#years').append($('<option />').val(i).html(i));
	}
	//populate our months select box
	for (i = 1; i < 13; i++) {
		$('#months').append($('<option />').val(i).html(i));
	}
	//populate our Days select box
	updateNumberOfDays();

	//"listen" for change events
	$('#months').change(function () {
		updateNumberOfDays();
	});

}

//function to update the days based on the current values of month and year
function updateNumberOfDays() {
	$('#days').html('');
	month = $('#months').val();
	year = $('#years').val();
	days = daysInMonth(month, year);

	for (i = 1; i < days + 1; i++) {
		$('#days').append($('<option />').val(i).html(i));
	}
}

//get the number of day in a given month
function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

function createDivsDictionary() {
	window.divsDictionary = {
		"header": $("#header")[0],
		"welcome": $("#welcome")[0],
		"register": $("#register")[0],
		"login": $("#login")[0],
		"setting": $("#setting")[0],
		"game": $("#game")[0],
		"footer": $("#footer")[0]
	}
}

function login() {
	let username = $("#loginUsername")[0].value;
	let password = $("#loginPassword")[0].value;
	if (window.getItem(username) == null || password != window.getItem(username).password) {
		window.alert("Sorry, your username or password is incorrect.\nPlease try again or register");
		return false;
	}
	window.isLogin = true;
	window.goToGame();
	window.Start();
	return false;
}

function register() {

	let username = $("#username")[0].value;
	let fullname = $("#fullName")[0].value;
	let email = $("#email")[0].value;
	let password = $("#password")[0].value;
	let repassword = $("#repassword")[0].value;
	let birthdate = new Date($("#years")[0].value, $("#months")[0].value, $("#days")[0].value)

	if (checkRegistrationInfo(username, fullname, password, repassword)) {
		let newUser = {
			userName: username,
			name: fullname,
			email: email,
			password: password,
			birthDate: birthdate
		};
		window.setItem(username, newUser);
		window.alert("The User account was created successfully");
		return true;
	}

	return false;
}

function checkRegistrationInfo(username, fullname, password, repassword) {

	// checks if the user name is not occupied 
	if (username in Object.entries(window.localStorage)) {
		window.alert("This Username already exists...\nPlease Choose another");
		return false;
	}
	if (!username.match(/^[0-9a-zA-Z]+$/)) {
		window.alert("This Username is not valid please use only letters and numbers...");
		return false;
	}
	// check full name
	if (!/^([\w]{3,})+\s+([\w\s]{3,})+$/i.test(fullname) || /\d/.test(fullname)) {
		window.alert("Full Name Field is not valid");
		return false;
	}
	//check password 
	if (password.length < 6 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) {
		window.alert("The password must be at least 6 characters\n and it must contain at least one number and letter");
		return false;
	}
	if (password != repassword) {
		window.alert("The passwords does not match");
		return false;
	}
	return true;
}

function goToWelcomePage() {
	window.hideAllDivs()
	window.divsDictionary.welcome.style.display = "block";
}

function goToRegisterPage() {
	window.hideAllDivs()
	window.divsDictionary.register.style.display = "block";
	window.divsDictionary.header.style.display = "block";
	window.divsDictionary.footer.style.display = "block";
}

function goToLoginPage() {
	window.hideAllDivs()
	window.divsDictionary.login.style.display = "block";
	window.divsDictionary.header.style.display = "block";
	window.divsDictionary.footer.style.display = "block";
}

function goToSettings() {
	if (window.isLogin) {
		window.hideAllDivs()
		window.divsDictionary.setting.style.display = "block";
		window.divsDictionary.header.style.display = "block";
		window.divsDictionary.footer.style.display = "block";
	} else {
		loginAlert();
	}
}

function goToGame() {
	if (window.isLogin) {
		window.hideAllDivs()
		window.divsDictionary.game.style.display = "block";
		window.divsDictionary.header.style.display = "block";
		window.divsDictionary.footer.style.display = "block";
		$("#loginUsername")[0].value = "";
		$("#loginPassword")[0].value = "";
	} else {
		loginAlert();
	}
}

function loginAlert() {
	window.alert("Please Login First...")
}

function hideAllDivs() {
	Object.values(window.divsDictionary).forEach(element => {
		element.style.display = "none";
	});
}

function resetUsersDictionary() {
	let deafultUser = {
		userName: "p",
		name: "p",
		email: "p",
		password: "p",
		birthDate: new Date(2000, 1, 1)
	};
	window.setItem("p", deafultUser);
}

function setItem(username, user) {
	window.localStorage.setItem(username, JSON.stringify(user));
}

function getItem(username) {
	return JSON.parse(window.localStorage.getItem(username));
}



const wall_locations = [
	"1,1", "1,2", "1,3", "1,4", "2,4", "3,4", "3,3", "3,2", "3,1", "2,1",
	"1,6", "2,6", "3,6", "1,7", "1,8", "1,9", "1,10", "2,10", "3,10", "3,9", "3,8", "3,7",
	"0,12", "1,12", "0,13", "1,13",
	"1,15", "2,15", "3,15", "1,16", "1,17", "1,18", "1,19", "2,19", "3,19", "3,18", "3,17", "3,16",
	"1,21", "1,22", "1,23", "1,24", "2,24", "3,24", "3,23", "3,22", "3,21", "2,21",
	"3,12", "4,12", "5,12", "6,12", "7,12", "8,12", "9,12", "3,13", "4,13", "5,13", "6,13", "7,13", "8,13", "9,13",
	"5,9", , "5,10", "5,11", , "5,14", "5,15", "5,16", "6,9", "6,10", "6,11", "6,14", "6,15", "6,16",
	"5,1", "5,2", "5,3", "5,4", "6,1", "6,2", "6,3", "6,4",
	"5,21", "5,22", "5,23", "5,24", "6,21", "6,22", "6,23", "6,24",
	"5,6", "6,6", "7,6", "8,6", "9,6", "5,7", "6,7", "7,7", "8,7", "9,7", "8,10", "8,8", "8,9", "9,10", "9,8", "9,9",
	"5,18", "6,18", "7,18", "8,18", "9,18", "5,19", "6,19", "7,19", "8,19", "9,19", "9,17", "9,16", "8,17", "8,16", "8,15", "9,15",
	"8,0", "8,1", "9,0", "9,1", "8,24", "8,25", "9,24", "9,25",
	"8,3", "9,3", "10,3", "11,3", "12,3", "8,4", "9,4", "10,4", "11,4", "12,4", "11,1", "11,2", "12,1", "12,2",
	"8,22", "9,22", "10,22", "11,22", "12,22", "8,21", "9,21", "10,21", "11,21", "12,21", "11,24", "11,23", "12,24", "12,23",
	"11,18", "12,18", "13,18", "14,18", "15,18", "16,18", "17,18", "18,18", "11,19", "12,19", "13,19", "14,19", "15,19", "16,19", "17,19", "18,19",
	"11,6", "12,6", "13,6", "14,6", "15,6", "16,6", "17,6", "18,6", "11,7", "12,7", "13,7", "14,7", "15,7", "16,7", "17,7", "18,7",
	"14,1", "14,2", "14,3", "14,4", "15,1", "15,2", "15,3", "15,4", "16,3", "17,3", "18,3", "16,4", "17,4", "18,4",
	"14,21", "14,22", "14,23", "14,24", "15,21", "15,22", "15,23", "15,24", "16,22", "17,22", "18,22", "16,21", "17,21", "18,21",
	"17,9", "17,10", "17,11", "17,12", "17,13", "17,14", "17,15", "17,16", "18,9", "18,10", "18,11", "18,12", "18,13", "18,14", "18,15", "18,16",
	"20,1", "20,2", "20,3", "20,4", "21,1", "21,2", "21,3", "21,4", "22,3", "23,3", "24,3", "22,4", "23,4", "24,4",
	"20,6", "20,7", "20,8", "20,9", "20,10", "21,6", "21,7", "21,8", "21,9", "21,10",
	"20,15", "20,16", "20,17", "20,18", "20,19", "21,15", "21,16", "21,17", "21,18", "21,19",
	"20,21", "20,22", "20,23", "20,24", "21,21", "21,22", "21,23", "21,24", "22,22", "23,22", "24,22", "22,21", "23,21", "24,21",
	"20,12", "20,13", "21,12", "21,13", "22,12", "22,13", "23,12", "23,13", "24,12", "24,13", "25,12", "25,13", "26,12", "26,13", "27,12", "27,13",
	"17,24", "17,25", "18,24", "18,25",
	"17,0", "17,1", "18,0", "18,1",
	"23,24", "23,25", "24,24", "24,25",
	"23,0", "23,1", "24,0", "24,1",
	"23,9", "23,10", "23,11", "23,14", "23,15", "23,16", "24,9", "24,10", "24,11", "24,14", "24,15", "24,16",
	"23,6", "24,6", "25,6", "26,6", "27,6", "23,7", "24,7", "25,7", "26,7", "27,7", "26,10", "26,8", "26,9", "27,10", "27,8", "27,9",
	"23,18", "24,18", "25,18", "26,18", "27,18", "23,19", "24,19", "25,19", "26,19", "27,19", "27,17", "27,16", "26,17", "26,16", "26,15", "27,15",
	"26,1", "26,2", "26,3", "26,4", "27,1", "27,2", "27,3", "27,4",
	"26,21", "26,22", "26,23", "26,24", "27,21", "27,22", "27,23", "27,24",
	"11,9", "11,10", "11,11", "11,12", "11,13", "11,14", "11,15", "11,16", "12,9", , "13,9", , "14,9", "15,9", "15,10", "15,11", "15,12", "15,13", "15,14", "15,15", "15,16", "14,16", "13,16", "12,16"
];

const box_fill = [
	"2,2", "2,3", "2,7", "2,8", "2,9", "2,16", "2,17", "2,18", "2,22", "2,23",
	"12,10", "12,11", "12,12", "12,13", "12,14", "12,15", "13,10", "13,11", "13,12", "13,13", "13,14", "13,15", "14,10", "14,11", "14,12", "14,13", "14,14", "14,15"
]

const keyCodes = {
	0: 'That key has no keycode',
	3: 'break',
	8: 'backspace / delete',
	9: 'tab',
	12: 'clear',
	13: 'enter',
	16: 'shift',
	17: 'ctrl',
	18: 'alt',
	19: 'pause/break',
	20: 'caps lock',
	21: 'hangul',
	25: 'hanja',
	27: 'escape',
	28: 'conversion',
	29: 'non-conversion',
	32: 'spacebar',
	33: 'page up',
	34: 'page down',
	35: 'end',
	36: 'home',
	37: 'left arrow',
	38: 'up arrow',
	39: 'right arrow',
	40: 'down arrow',
	41: 'select',
	42: 'print',
	43: 'execute',
	44: 'Print Screen',
	45: 'insert',
	46: 'delete',
	47: 'help',
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	58: ':',
	59: 'semicolon (firefox), equals',
	60: '<',
	61: 'equals (firefox)',
	63: 'ß',
	64: '@ (firefox)',
	65: 'a',
	66: 'b',
	67: 'c',
	68: 'd',
	69: 'e',
	70: 'f',
	71: 'g',
	72: 'h',
	73: 'i',
	74: 'j',
	75: 'k',
	76: 'l',
	77: 'm',
	78: 'n',
	79: 'o',
	80: 'p',
	81: 'q',
	82: 'r',
	83: 's',
	84: 't',
	85: 'u',
	86: 'v',
	87: 'w',
	88: 'x',
	89: 'y',
	90: 'z',
	91: 'Windows Key / Left ⌘ / Chromebook Search key',
	92: 'right window key',
	93: 'Windows Menu / Right ⌘',
	95: 'sleep',
	96: 'numpad 0',
	97: 'numpad 1',
	98: 'numpad 2',
	99: 'numpad 3',
	100: 'numpad 4',
	101: 'numpad 5',
	102: 'numpad 6',
	103: 'numpad 7',
	104: 'numpad 8',
	105: 'numpad 9',
	106: 'multiply',
	107: 'add',
	108: 'numpad period (firefox)',
	109: 'subtract',
	110: 'decimal point',
	111: 'divide',
	112: 'f1',
	113: 'f2',
	114: 'f3',
	115: 'f4',
	116: 'f5',
	117: 'f6',
	118: 'f7',
	119: 'f8',
	120: 'f9',
	121: 'f10',
	122: 'f11',
	123: 'f12',
	124: 'f13',
	125: 'f14',
	126: 'f15',
	127: 'f16',
	128: 'f17',
	129: 'f18',
	130: 'f19',
	131: 'f20',
	132: 'f21',
	133: 'f22',
	134: 'f23',
	135: 'f24',
	136: 'f25',
	137: 'f26',
	138: 'f27',
	139: 'f28',
	140: 'f29',
	141: 'f30',
	142: 'f31',
	143: 'f32',
	144: 'num lock',
	145: 'scroll lock',
	151: 'airplane mode',
	160: '^',
	161: '!',
	162: '؛ (arabic semicolon)',
	163: '#',
	164: '$',
	165: 'ù',
	166: 'page backward',
	167: 'page forward',
	168: 'refresh',
	169: 'closing paren (AZERTY)',
	170: '*',
	171: '~ + * key',
	172: 'home key',
	173: 'minus (firefox), mute/unmute',
	174: 'decrease volume level',
	175: 'increase volume level',
	176: 'next',
	177: 'previous',
	178: 'stop',
	179: 'play/pause',
	180: 'e-mail',
	181: 'mute/unmute (firefox)',
	182: 'decrease volume level (firefox)',
	183: 'increase volume level (firefox)',
	186: 'semi-colon / ñ',
	187: 'equal sign',
	188: 'comma',
	189: 'dash',
	190: 'period',
	191: 'forward slash / ç',
	192: 'grave accent / ñ / æ / ö',
	193: '?, / or °',
	194: 'numpad period (chrome)',
	219: 'open bracket',
	220: 'back slash',
	221: 'close bracket / å',
	222: 'single quote / ø / ä',
	223: '`',
	224: 'left or right ⌘ key (firefox)',
	225: 'altgr',
	226: '< /git >, left back slash',
	230: 'GNOME Compose Key',
	231: 'ç',
	233: 'XF86Forward',
	234: 'XF86Back',
	235: 'non-conversion',
	240: 'alphanumeric',
	242: 'hiragana/katakana',
	243: 'half-width/full-width',
	244: 'kanji',
	251: 'unlock trackpad (Chrome/Edge)',
	255: 'toggle touchpad',
};

