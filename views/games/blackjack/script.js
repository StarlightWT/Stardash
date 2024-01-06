const playDiv = document.getElementById("play");
const setupDiv = document.getElementById("setup");
const playerTotalTitle = document.getElementById("player_total");
const dealerTotalTitle = document.getElementById("dealer_total");
const winnerTitle = document.getElementById("winner");
const betInput = document.getElementById("bet");
const hitBtn = document.getElementById("hit_button");
const staBtn = document.getElementById("start_button");
const refBtn = document.getElementById("refresh_button");
const standBtn = document.getElementById("stand_button");
const backbtn = document.getElementById("back");

var deck = [
	{ key: "2", amount: 4 },
	{ key: "3", amount: 4 },
	{ key: "4", amount: 4 },
	{ key: "5", amount: 4 },
	{ key: "6", amount: 4 },
	{ key: "7", amount: 4 },
	{ key: "8", amount: 4 },
	{ key: "9", amount: 4 },
	{ key: "10", amount: 4 },
	{ key: "J", amount: 4 },
	{ key: "Q", amount: 4 },
	{ key: "K", amount: 4 },
	{ key: "A", amount: 4 },
];
deck.forEach((card) => {
	card.amount *= 8;
});
function debugDeckCount(deck) {
	deck.forEach((card) => {
		console.log(`Key: ${card.key}, amount: ${card.amount}`);
	});
}

function getRandomCard() {
	var cardIndex = Math.floor(Math.random() * 10) + 1;
	var card = deck[cardIndex];
	while (card.amount <= 0) {
		console.log(`Don't have card ${card.key}!`);
		card = deck[Math.floor(Math.random() * 10) + 1];
	}
	card.amount = card.amount - 1;

	if (card.key >= 2 && card.key <= 10) return new Number(card.key);
	if (card.key == "A") return 11;
	return 10;
}

function updateDealerTotal() {
	if (secretDealerTotal > 21) {
		winnerTitle.innerHTML = "player";
	}
	dealerTotalTitle.innerHTML = `${dealerTotal}`;
	console.log(!playerStand + `||` + !gameEnd);
	if (!playerStand && !gameEnd) dealerTotalTitle.innerHTML += `(+?)`;
}

function updatePlayerTotal() {
	if (playerTotal > 21) {
		playerTotalTitle.innerHTML = `${playerTotal}<br>Bust!`;
		endGame();
		return;
	}
	if (playerTotal == 21) {
		endGame();
		return;
	}
	playerTotalTitle.innerHTML = `${playerTotal}`;
	if (playerStand) playerTotalTitle.innerHTML += `<br>(standing)`;
}

async function playerWin(time, bj) {
	if (bj) time *= 1.5;
	else time *= 1.8;

	window.electronAPI.set("actionLockID", "no");
}

async function playerLose(time) {
	window.electronAPI.set("actionLockID", "no");
}

function endGame() {
	if (!gameActive) return;
	while (secretDealerTotal < 17) {
		secretDealerTotal += getRandomCard();
	}
	dealerTotal = secretDealerTotal;
	gameEnd = true;
	if (playerTotal > 21) {
		winnerTitle.innerHTML = "dealer";
		console.log("Adding time...");
		playerLose(bet);
		return;
	}
	updateDealerTotal();
	if (dealerTotal > 21) {
		winnerTitle.innerHTML = "player";
		console.log("Removing time...");
		playerWin(bet, false);
		return;
	}
	if (playerTotal == 21) {
		console.log("Removing time...");
		winnerTitle.innerHTML = "player";
		playerTotalTitle.innerHTML = "21! BlackJack!";
		playerWin(bet, true);
		return;
	}
	if (playerTotal < dealerTotal) {
		console.log("Adding time...");
		winnerTitle.innerHTML = "dealer";
		playerLose(bet);
		return;
	}
	if (playerTotal == dealerTotal) {
		winnerTitle.innerHTML = "draw";
		gameEnd = true;
		return;
	}
	if (playerTotal > dealerTotal) {
		console.log("Adding time...");
		winnerTitle.innerHTML = "player";
		playerWin(bet, false);
		return;
	}
}
//Game start:
var dealerTotal = 0,
	secretDealerTotal = dealerTotal,
	playerTotal = 0,
	playerStand = false,
	gameActive = false,
	gameEnd = false,
	bet = 0;

function startGame() {
	(dealerTotal = 0),
		(secretDealerTotal = dealerTotal),
		(playerTotal = 0),
		(playerStand = false),
		(gameActive = false),
		(gameEnd = false);

	secretDealerTotal += getRandomCard();
	dealerTotal = secretDealerTotal;
	updateDealerTotal();
	playerTotal += getRandomCard();
	updatePlayerTotal();
	secretDealerTotal += getRandomCard();
	playerTotal += getRandomCard();
	updatePlayerTotal();
}

hitBtn.addEventListener("click", () => {
	console.log(`Trying to hit!\nActive:${!gameActive}\nStand:${playerStand}`);
	if (!gameActive || playerStand) return;
	console.log("Hitting!");
	playerTotal += getRandomCard();
	updatePlayerTotal();
});

standBtn.addEventListener("click", () => {
	console.log(`Trying to stand!\nActive:${!gameActive}\nStand:${playerStand}`);
	if (!gameActive || playerStand) return;
	console.log("Standing...");
	playerStand = true;
	updatePlayerTotal();
	endGame();
});

staBtn.addEventListener("click", async () => {
	console.log(`Trying to start game!\nActive: ${gameActive}\nEnd ${!gameEnd}`);
	if (gameActive && !gameEnd) return;
	bet = counterTotal(betInput);
	if (bet <= 0) return;

	startGame();

	console.log(`Game started! Bet: ${bet}`);
	gameActive = true;
	playDiv.style = "display: block";
	setupDiv.style = "display: none";
});

refBtn.addEventListener("click", () => {
	if (!gameActive || !gameEnd) return;
	location.reload();
});

function back() {
	window.electronAPI.redirect("games");
}

function increase(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) + 1;
	if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	startButtonEnable();
}

function decrease(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) - 1;
	if (newCounterValue < 0) newCounterValue = "00";
	else if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	startButtonEnable();
}

function edit(element) {
	element.contentEditable = true;
	element.focus();
	element.onblur = (e) => {
		element.contentEditable = false;
		startButtonEnable();
	};
}

function validate(event) {
	var keyCode = event.which || event.keyCode;
	var isValid = (keyCode >= 48 && keyCode <= 57) || keyCode === 8; // Allow numbers (48-57) and backspace (8)

	if (!isValid) {
		event.preventDefault();
	}
	startButtonEnable();
}

function counterTotal(counter) {
	let counterValues = [];
	Array.from(counter.children).forEach((singleCounter) => {
		counterValues.push(singleCounter.children[1].innerText);
	});
	while (counterValues[2] >= 60) {
		counterValues[2] -= 60;
		counterValues[1]++;
	}
	while (counterValues[1] >= 24) {
		counterValues[1] -= 24;
		counterValues[0]++;
	}
	let i = 0;
	Array.from(counter.children).forEach((singleCounter) => {
		let newValue = counterValues[i];
		newValue = newValue.toString();
		if (newValue < 10 && !newValue.startsWith("0")) newValue = `0${newValue}`;
		if (newValue == 0) newValue = "00";
		singleCounter.children[1].innerText = newValue;
		i++;
	});
	//CounterValues [0] => Days
	//CounterValues [1] => Hours
	//CounterValues [2] => Minutes
	const DAY = 86400000;
	const HOUR = 3600000;
	const MINUTE = 60000;
	const WEEK = DAY * 7;
	return (total =
		counterValues[0] * WEEK +
		counterValues[1] * DAY +
		counterValues[2] * HOUR +
		counterValues[3] * MINUTE);
}

function startButtonEnable() {
	if (counterTotal(betInput) > 0) staBtn.disabled = false;
	else staBtn.disabled = true;
}
