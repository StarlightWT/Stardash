var main; //5-9
var throws = 0;

const lostClr = "ee111a";
const wonClr = "1fe044";

const dice0Display = document.getElementById("0");
const dice1Display = document.getElementById("1");
const throwBtn = document.getElementById("throwDiceBtn");
const betInput = document.getElementById("bet");

const title = document.getElementById("title");
const backbtn = document.getElementById("back");
const game = document.getElementById("game");
const setup = document.getElementById("setup");
const mainInput = document.getElementById("main");

let dice0;
let dice1;
var bet;
function animateValue(obj, start, end, duration) {
	let startTimestamp = null;
	const step = (timestamp) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		obj.innerHTML = Math.floor(progress * (end - start) + start);
		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	};
	window.requestAnimationFrame(step);
}

function throwDice() {
	if (throws == 0) {
		if (betInput.value === "00:00") return;
		if (mainInput.value > 9 || mainInput.value < 5) return;
		backbtn.classList.add("hidden");
		title.classList.add("hidden");
		bet =
			betInput.value.slice(0, 2) * 60 * 60 + betInput.value.slice(3, 5) * 60;
		console.log(bet);
	}

	throwBtn.setAttribute("disabled", "true"); //Disable button
	throws++;
	dice0 = Math.floor(Math.random() * 6) + 1; //Get random number
	animateValue(dice0Display, 1, dice0, 200); //Play animation to show the number to player
	dice1 = Math.floor(Math.random() * 6) + 1; //Get random number
	animateValue(dice1Display, 1, dice1, 200);

	resultCalc();
}

function setupGame() {
	//Setup list of chances
	chance = [];
	j = 4;
	for (i = 0; i <= 6; i++) {
		if (j != main) chance[i] = j;
		j++;
	}

	outs = [2, 3, 11, 12];
	if (main == 6 || main == 8) outs = [2, 3, 11];
	if (main == 7) outs = [2, 3, 12];
}

function resultCalc() {
	var total = dice0 + dice1;
	console.log(total);
	console.log(chance.includes(total));
	if (total >= 2 && total <= 3) return lost();
	if (throws == 1) {
		throwBtn.innerHTML = "Throw";
		game.classList.remove("hidden");
		setup.classList.add("hidden");
		if (total == main) return won();
		if (!chance.includes(total)) return lost();
		if (outs.includes(total)) return lost();
		else throwBtn.removeAttribute("disabled"); //Activate button back
	} else {
		if (total == main) return lost();
		if (chance.includes(total)) return won();
	}
}
function won() {
	console.log("Player won!");
	const status = document.createElement("h1");
	const desc = document.createElement("p");
	status.innerHTML = "You won!";
	status.classList.add("victory", "status");
	var time = `00:00:${bet}`;
	if (bet > 60) time = `00:${bet / 60}`;
	if (bet > 60 && bet / 60 < 10) time = `00:0${bet / 60}`;
	if (bet > 3600) time = `${bet / 3600}:${bet % 360}`;
	if (bet > 3600 && bet / 3600 < 10) time = `0${bet / 3600}:${bet % 3600}`;
	if (bet > 3600 && bet / 3600 < 10 && bet % 3600 < 10)
		time = `0${bet / 3600}:${bet % 3600}0`;
	desc.innerHTML = `Time removed: ${time}`;
	window.electronAPI.action("remtime", bet);
	window.electronAPI.action("log", {
		role: "extension",
		colour: wonClr,
		title: "Hazard removed time",
		description: "Time removed for losing at Hazard",
	});
	game.append(status);
	game.append(desc);
	throwBtn.onclick = (e) => {
		location.reload();
	};
	throwBtn.innerHTML = "Restart";
	throwBtn.removeAttribute("disabled");
}
function lost() {
	console.log("Player lost!");
	const status = document.createElement("h1");
	const desc = document.createElement("p");
	status.innerHTML = "You lost!";
	status.classList.add("loss", "status");
	var time = `00:00:${bet}`;
	if (bet > 60) time = `00:${bet / 60}`;
	if (bet > 60 && bet / 60 < 10) time = `00:0${bet / 60}`;
	if (bet > 3600) time = `${bet / 3600}:${bet % 360}`;
	if (bet > 3600 && bet / 3600 < 10) time = `0${bet / 3600}:${bet % 3600}`;
	if (bet > 3600 && bet / 3600 < 10 && bet % 3600 < 10)
		time = `0${bet / 3600}:${bet % 3600}0`;
	desc.innerHTML = `Time added: ${time}`;
	window.electronAPI.action("addtime", bet);
	window.electronAPI.action("log", {
		role: "extension",
		colour: lostClr,
		title: "Hazard added time",
		description: "Time added for losing at Hazard",
	});
	game.append(status);
	game.append(desc);
	throwBtn.onclick = (e) => {
		location.reload();
	};
	throwBtn.innerHTML = "Restart";
	throwBtn.removeAttribute("disabled");
}

main = 5; //Player selects value
setupGame();

function back() {
	window.electronAPI.redirect("games");
}
