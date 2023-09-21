
const playerTotalTitle = document.getElementById("player_total");
const dealerTotalTitle = document.getElementById("dealer_total");
const winnerTitle = document.getElementById("winner");
const standBtn = document.getElementById("stand_button");
const hitBtn = document.getElementById("hit_button");
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

if(true){
    deck.forEach((card) => {
        card.amount *= 8;
    })
    console.log(deck.length);
}

debugDeckCount(deck);

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

var dealerTotal = 0,
    secretDealerTotal = dealerTotal, 
    playerTotal = 0,
    playerStand = false,
    gameEnded = false;

function updateDealerTotal(){
    if(gameEnded) return;
    if(secretDealerTotal > 21) {
        winnerTitle.innerHTML = "player";
        gameEnded = true;
    }
     dealerTotalTitle.innerHTML = `Dealer total: ${dealerTotal}`;
     if(!playerStand) dealerTotalTitle.innerHTML += `(+?)`;
}

function updatePlayerTotal(){
    if(gameEnded) return;
    if(playerTotal > 21) {
        playerTotalTitle.innerHTML = `Bust! ${playerTotal}`;
        gameEnded = true;
        return;
    }
    if(playerTotal == 21) {
        playerTotalTitle.innerHTML = "BlackJack!";
        winnerTitle.innerHTML = "player";
        return;
    }
    playerTotalTitle.innerHTML = `Player total: ${playerTotal}`;
    if(playerStand) playerTotalTitle.innerHTML += `(standing)`;
}

function endGame(){
    while(secretDealerTotal < 17){
        secretDealerTotal += getRandomCard();
    }
    dealerTotal = secretDealerTotal;
    updateDealerTotal();
    if(gameEnded) return;
    if(playerTotal < dealerTotal)
    winnerTitle.innerHTML = "dealer"; //dealer wins
    if(playerTotal == dealerTotal)
    winnerTitle.innerHTML = "draw"; //draw
    if(playerTotal > dealerTotal)
    winnerTitle.innerHTML = "player"; //player wins 2x
}

//Game start:
secretDealerTotal += getRandomCard();
dealerTotal = secretDealerTotal;
updateDealerTotal();
playerTotal += getRandomCard();
updatePlayerTotal();
secretDealerTotal += getRandomCard();
playerTotal += getRandomCard() ;
updatePlayerTotal();


hitBtn.addEventListener("click", () => {
    if(playerStand) return;
    playerTotal += getRandomCard();
    updatePlayerTotal();
})

standBtn.addEventListener("click", () => {
    playerStand = true;
    updatePlayerTotal();
    endGame();
})