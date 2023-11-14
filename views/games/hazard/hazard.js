var main; //5-9
var throws = 0;

const dice0Display = document.getElementById("0");
const dice1Display = document.getElementById("1");
const throwBtn = document.getElementById("throwDiceBtn");

const game = document.getElementById("game");
const setup = document.getElementById("setup");

let dice0;
let dice1;

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

	var outs = [2, 3, 11, 12];
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
		else throwBtn.removeAttribute("disabled"); //Activate button back
	} else {
		if (total == main) return lost();
		if (chance.includes(total)) return won();
	}
}
function won() {
	console.log("Player won!");
}
function lost() {
	console.log("Player lost!");
}

main = 5; //Player selects value
setupGame();
