function adddigit(element) {
	var digitCount = Array.from(
		element.parentElement.children[1].innerHTML
	).length;
	if (digitCount == 10)
		return (element.parentElement.children[1].innerHTML = String(
			comboGen(digitCount)
		).padStart(digitCount, "0"));
	++digitCount;
	element.parentElement.children[1].innerHTML = String(
		comboGen(digitCount)
	).padStart(digitCount, "0");
}
function remdigit(element) {
	var digitCount = Array.from(
		element.parentElement.children[1].innerHTML
	).length;
	if (digitCount == 0)
		return (element.parentElement.children[1].innerHTML = String(
			comboGen(digitCount)
		).padStart(digitCount, "0"));
	--digitCount;
	element.parentElement.children[1].innerHTML = String(
		comboGen(digitCount)
	).padStart(digitCount, "0");
}

function comboGen(digits) {
	let multiply = "1"; //0 digits
	for (i = 0; i < digits; i++) {
		multiply += "0";
	}
	return Math.floor(Math.random() * parseInt(multiply));
}

async function relock() {
	await window.electronAPI.lock(undefined, "relock", combo.innerHTML);
	window.close();
}

const combo = document.getElementById("combo");
combo.innerHTML = String(comboGen(4)).padStart(4, "0");
