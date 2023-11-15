const playDiv = document.getElementById("play");
const setupDiv = document.getElementById("setup");
const playerTotalTitle = document.getElementById("player_total");
const dealerTotalTitle = document.getElementById("dealer_total");
const winnerTitle = document.getElementById("winner");
const betInput = document.getElementById("betInput");
const hitBtn = document.getElementById("hit_button");
const staBtn = document.getElementById("start_button");
const refBtn = document.getElementById("refresh_button");
const standBtn = document.getElementById("stand_button");
const title = document.getElementById("title");
const backbtn = document.getElementById("back");

const lostClr = "ee111a";
const wonClr = "1fe044";
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

function playerWin(time, bj) {
	if (bj) time *= 1.5;
	else time *= 1.8;
	window.electronAPI.action("remtime", time);
	window.electronAPI.action("log", {
		role: "extension",
		colour: wonClr,
		title: "BlackJack removed time",
		description: "Removed time for winning at BJ",
	});
}

function playerLose(time) {
	window.electronAPI.action("addtime", time);
	window.electronAPI.action("log", {
		role: "extension",
		colour: lostClr,
		title: "BlackJack added time",
		description: "Time added for losing at BJ",
	});
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
		//player gets bet back
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
	title.classList.add("hidden");
	backbtn.classList.add("hidden");

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
	var value = betInput.value;

	var inputArr = value.split(":");
	bet = inputArr[0] * 60 * 60 + inputArr[1] * 60;
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
