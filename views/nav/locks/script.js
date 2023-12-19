async function initialize() {
	const profile = await window.electronAPI.get("profile");
	const lock = await window.electronAPI.get("lock", profile.id);

	// if (lock == 1) loadNewLock(profile, lock); //No lock page
}

var error = 0;

initialize();

function showNew() {
	document.getElementById("noLock").className = "";
	document.getElementById("newLock").className = "visible";
}

function increase(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) + 1;
	if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	console.log(validateCounters());
	if (validateCounters() == 1)
		document.getElementById("warning").className = "";
	else document.getElementById("warning").className = "hidden";
}

function decrease(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) - 1;
	if (newCounterValue < 0) newCounterValue = "00";
	else if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	if (validateCounters() == 1)
		document.getElementById("warning").className = "";
	else document.getElementById("warning").className = "hidden";
}

function edit(element) {
	element.contentEditable = true;
	element.focus();
	element.onblur = (e) => {
		if (validateCounters() == 1)
			document.getElementById("warning").className = "";
		else document.getElementById("warning").className = "hidden";
		element.contentEditable = false;
	};
}

function validate(event) {
	console.log(event);
	var keyCode = event.which || event.keyCode;
	var isValid = (keyCode >= 48 && keyCode <= 57) || keyCode === 8; // Allow numbers (48-57) and backspace (8)

	if (!isValid) {
		event.preventDefault();
	}
}

function validateCounters() {
	const min = document.getElementById("Minimum");
	const max = document.getElementById("Maximum");

	if (counterTotal(min) > counterTotal(max)) return (error = 1);
	return (error = 0);
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
	return (total =
		counterValues[0] * DAY +
		counterValues[1] * HOUR +
		counterValues[2] * MINUTE);
}
