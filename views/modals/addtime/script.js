function remTime() {
	let time = counterTotal(document.getElementById("Minimum"));
	modifyTime(-time);
}

function addTime() {
	let time = counterTotal(document.getElementById("Minimum"));
	modifyTime(time);
}

async function modifyTime(time) {
	if (time > 0) await window.electronAPI.lock(undefined, "time", time);
	window.close();
}

function increase(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) + 1;
	if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
}

function decrease(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) - 1;
	if (newCounterValue < 0) newCounterValue = "00";
	else if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
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
	var keyCode = event.which || event.keyCode;
	var isValid = (keyCode >= 48 && keyCode <= 57) || keyCode === 8; // Allow numbers (48-57) and backspace (8)

	if (!isValid) {
		event.preventDefault();
	}
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
