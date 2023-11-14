var main; //5-9

let dice0;
let dice1;

function throwDice() {
	dice0 = Math.floor(Math.random() * 6) + 1;
	dice1 = Math.floor(Math.random() * 6) + 1;
}

main = 5; //Player selects value

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

throwDice();
let total = dice0 + dice1;
if (total <= 3 && total >= 2) lost();

if (chance.includes(total)) chanceCalc();
else function lost() {}
function chanceCalc() {}
function won() {}
