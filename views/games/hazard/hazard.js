var main; //5-9

let dice0;
let dice1;

function throwDice(dice) {
	if (dice == 0) dice0 = Math.floor(Math.random() * 6) + 1;
	if (dice == 1) dice1 = Math.floor(Math.random() * 6) + 1;
}
