
const playerTotalTitle = document.getElementById("player_total");
const dealerTotalTitle = document.getElementById("dealer_total");
const winnerTitle = document.getElementById("winner");
const betInput = document.getElementById("betInput");
const hitBtn = document.getElementById("hit_button");
const staBtn = document.getElementById("start_button");
const refBtn = document.getElementById("refresh_button");
const standBtn = document.getElementById("stand_button");

const lostClr = "ee111a";
const wonClr = "1fe044";
var deck = [
    {key: "2", amount: 4},
    {key: "3", amount: 4},
    {key: "4", amount: 4},
    {key: "5", amount: 4},
    {key: "6", amount: 4},
    {key: "7", amount: 4},
    {key: "8", amount: 4},
    {key: "9", amount: 4},
    {key: "10", amount: 4},
    {key: "J", amount: 4},
    {key: "Q", amount: 4},
    {key: "K", amount: 4},
    {key: "A", amount: 4},
];
    deck.forEach((card) => {
        card.amount *= 8;
    })


function debugDeckCount(deck){
    deck.forEach((card) => {
        console.log(`Key: ${card.key}, amount: ${card.amount}`);
    })
}

function getRandomCard(){
    var cardIndex = Math.floor(Math.random()*10) + 1;
    var card = deck[cardIndex];
    while(card.amount <= 0){
        console.log(`Don't have card ${card.key}!`)
        card = deck[Math.floor(Math.random()*10) + 1]; 
    }
    card.amount = card.amount-1;
    
    if(card.key >= 2 && card.key <= 10) return new Number(card.key);
    if(card.key == "A") return 11;
    return 10;
}

function updateDealerTotal(){
    if(secretDealerTotal > 21) {
        winnerTitle.innerHTML = "player";
    }
     dealerTotalTitle.innerHTML = `Dealer total: ${dealerTotal}`;
     console.log(!playerStand +`||`+!gameEnd);
     if(!playerStand && !gameEnd) dealerTotalTitle.innerHTML += `(+?)`;
}

function updatePlayerTotal(){
    if(playerTotal > 21) {
        playerTotalTitle.innerHTML = `Bust! ${playerTotal}`;
        endGame();
        return;
    }
    if(playerTotal == 21) {
        endGame();
        return;
    }
    playerTotalTitle.innerHTML = `Player total: ${playerTotal}`;
    if(playerStand) playerTotalTitle.innerHTML += `(standing)`;
}

function endGame(){
    if(!gameActive) return;
    while(secretDealerTotal < 17){
        secretDealerTotal += getRandomCard();
    }
    dealerTotal = secretDealerTotal;
    gameEnd = true;
    updateDealerTotal();
    console.log(bet);
    if(dealerTotal > 21){
        winnerTitle.innerHTML = "player"; 
        console.log("Removing time...");
        window.electronAPI.remTime(bet*2);
        return;
    }
    if(playerTotal > 21){
        winnerTitle.innerHTML = "dealer"; 
        console.log("Adding time...");
        window.electronAPI.addTime(bet);
        window.electronAPI.log("log", "BlackJack added time", "Added time for losing at BJ", "extension", lostClr)
        return;
    } 
    if(playerTotal == 21) {
        console.log("Removing time...");
        winnerTitle.innerHTML = "player";
        playerTotalTitle.innerHTML = "21! BlackJack!";
        window.electronAPI.remTime(bet*1.5);
        window.electronAPI.log("log", "BlackJack removed time", "Removed time for winning at BJ", "extension", wonClr)
        return;
    }
    if(playerTotal < dealerTotal){
        console.log("Adding time...");
        winnerTitle.innerHTML = "dealer"; 
        window.electronAPI.addTime(bet);
        return;
    }
    if(playerTotal == dealerTotal) {
        winnerTitle.innerHTML = "draw"; 
        //player gets bet back
        return;
    }
    if(playerTotal > dealerTotal) {
        console.log("Adding time...");
        winnerTitle.innerHTML = "player";
        window.electronAPI.remTime(bet*2);
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
    dealerTotal = 0,
    secretDealerTotal = dealerTotal, 
    playerTotal = 0,
    playerStand = false,
    gameActive = false,
    gameEnd = false,
    bet = 0;

    secretDealerTotal += getRandomCard();
    dealerTotal = secretDealerTotal;
    updateDealerTotal();
    playerTotal += getRandomCard();
    updatePlayerTotal();
    secretDealerTotal += getRandomCard();
    playerTotal += getRandomCard() ;
    updatePlayerTotal();
}

hitBtn.addEventListener("click", () => {
    console.log(`Trying to hit!\nActive:${!gameActive}\nStand:${playerStand}`);
    if(!gameActive || playerStand) return;
    console.log("Hitting!");
    playerTotal += getRandomCard();
    updatePlayerTotal();
})

standBtn.addEventListener("click", () => {
    console.log(`Trying to stand!\nActive:${!gameActive}\nStand:${playerStand}`);
    if(!gameActive || playerStand) return;
    console.log("Standing...");
    playerStand = true;
    updatePlayerTotal();
    endGame();
})

staBtn.addEventListener("click", () => {
    if(gameActive && !gameEnd) return;
    var value = betInput.value;
    if(value.length < 2 && !value.includes(":")) return;
    startGame();
    
    var inputArr = value.split(":");
    
    switch(inputArr.length) {
        case 1:
        console.log("min");
        bet = inputArr[0]*60;
        break;
        case 2:
        console.log("hour:min");
        bet = inputArr[0] * 60 * 60 + inputArr[1] * 60;
        break;
        case 3:
        console.log("day:hour:min");
        bet = inputArr[0] * 24 * 60 * 60 + inputArr[1] * 60 * 60 + inputArr[2] * 60;
        break;
        case 4:
        console.log("week:day:hour:min");
        bet = inputArr[0] * 7 * 24 * 60 * 60+ inputArr[1] * 24 * 60 * 60 + inputArr[2] * 60 * 60 + inputArr[3] * 60;
        break;
    }

    console.log(`Game started! Bet: ${bet}`);
    gameActive = true;
})


refBtn.addEventListener("click", ()=>{
    console.log(`
    Game active: ${!gameActive}
    Game ended: ${!gameEnd}`);
    if(!gameActive || !gameEnd) return;
    location.reload();
})