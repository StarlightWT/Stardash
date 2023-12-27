let user,
	lock,
	redirected = false,
	unlockable = false;
async function initialize() {
	user = await window.electronAPI.get("user");
	lock = await window.electronAPI.get("lock", user.id);

	switch (user.role.toLowerCase()) {
		case "switch":
			if (lock != 1) showOverview();
			else showNoLock();
			showKHOverview(user);
			break;
		case "lockee":
			if (lock != 1) showOverview();
			break;
		case "keyholder":
			showKHOverview(user);
			break;
	}
}

var error = 0;

initialize();

function showNoLock() {
	document.getElementById("noLock").className = "visible";
}

function showOverview() {
	document.getElementById("noLock").className = "";
	document.getElementById("overview").className = "visible";
	updateTimer();
	if (lock.khId == null)
		document.getElementById("request").classList.remove("disabled");
	setInterval(() => {
		updateTimer();
	}, 1000);
}

function showNew() {
	document.getElementById("noLock").className = "";
	document.getElementById("newLock").className = "visible";
	document.getElementById("KHoverview").className = "";
}

async function showKHOverview(user) {
	const list = document.getElementById("KHoverview");
	const locks = await window.electronAPI.get("locks", user.id);

	locks.forEach((lock) => {
		const lockDIV = document.createElement("div");
		lockDIV.className = "lock";
		lockDIV.id = lock.id;
		lockDIV.innerHTML = `<h2>${lock?.user?.username ?? "error"}</h2>`;

		lockDIV.onclick = (e) => {
			console.log(lockDIV.id);
			blurPage(true);
			window.electronAPI.set("actionLockID", lock.id);
			window.electronAPI.redirect("khview");
		};

		list.append(lockDIV);
	});

	const addLock = document.createElement("div");
	addLock.id = "addLock";
	addLock.innerHTML = `<i class="fa-solid fa-plus"></i><br>Add new`;
	addLock.onclick = (e) => {
		window.electronAPI.redirect("addlock");
	};

	list.append(addLock);
	list.className = "visible";
}

function increase(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) + 1;
	if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
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

function increaseLimit(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) + 1;
	if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	limitCheck();
}

function decreaseLimit(counter) {
	counter = counter.parentElement.children[1];
	let newCounterValue = parseInt(counter.innerText) - 1;
	if (newCounterValue < 0) newCounterValue = "00";
	else if (newCounterValue < 10) newCounterValue = `0${newCounterValue}`;
	counter.innerText = newCounterValue;
	limitCheck();
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

function editLimit(element) {
	element.contentEditable = true;
	element.focus();
	element.onblur = (e) => {
		limitCheck();
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

function validateCounters() {
	const min = document.getElementById("Minimum");
	const max = document.getElementById("Maximum");

	limitCheck();
	if (counterTotal(min) > counterTotal(max)) return (error = 1);
	return (error = 0);
}

function limitCheck() {
	if (limitCounterTotal(document.getElementById("Limit")) == 0)
		document.getElementById("warningLimit").className = "";
	else document.getElementById("warningLimit").className = "hidden";
	const min = document.getElementById("Minimum");
	const max = document.getElementById("Maximum");
	if (
		limitCounterTotal(document.getElementById("Limit")) < counterTotal(max) &&
		limitCounterTotal(document.getElementById("Limit")) != 0
	)
		document.getElementById("invalidLimit").className = "";
	else document.getElementById("invalidLimit").className = "hidden";
}

function limitCounterTotal(counter) {
	let counterValues = [];
	Array.from(counter.children).forEach((singleCounter) => {
		counterValues.push(singleCounter.children[1].innerText);
	});
	let i = 0;
	Array.from(counter.children).forEach((singleCounter) => {
		let newValue = counterValues[i];
		newValue = newValue.toString();
		if (newValue < 10 && !newValue.startsWith("0")) newValue = `0${newValue}`;
		if (newValue == 0) newValue = "00";
		singleCounter.children[1].innerText = newValue;
		i++;
	});
	const WEEK = 86400000 * 7;
	const DAY = 86400000;
	const HOUR = 3600000;
	return (total =
		counterValues[0] * WEEK + counterValues[1] * DAY + counterValues[2] * HOUR);
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

let opened = 0,
	lastModule;
var modules = [];

function selectModule(module) {
	const moduleTitles = document.getElementById("moduleTitles");
	const moduleBody = document.getElementById("moduleBody");
	if (opened == 0) {
		opened = 1;
		moduleTitles.parentElement.style.setProperty("--body-width", "500px");
		moduleTitles.children[1].innerText = module.innerText;
		moduleTitles.children[1].className = "open";
		moduleBody.className = "open";
		lastModule = module.innerText;
		loadModule(module);
		return;
	}

	if (opened == 1 && module.innerText == lastModule) {
		opened = 0;
		moduleTitles.parentElement.style.setProperty("--body-width", "000px");
		setTimeout(() => {
			moduleTitles.children[1].className = "";
			moduleBody.className = "moduleBody";
		}, 800);
		return;
	}

	lastModule = module.innerText;

	moduleTitles.parentElement.style.setProperty("--body-width", "00px");
	setTimeout(() => {
		moduleTitles.parentElement.style.setProperty("--body-width", "500px");
		moduleTitles.children[1].innerText = module.innerText;
		loadModule(module);
	}, 1000);
}

function loadModule(module) {
	moduleBody.innerHTML =
		"<h3 id='toggleButton' onclick='toggle(this)'>Enable</h3>";
	const toggleButton = document.getElementById("toggleButton");
	const search = modules.find((obj) => obj.name == module.innerText);
	if (search?.enabled) toggleButton.innerText = "Disable";
	else toggleButton.innerText = "Enable";

	switch (module.innerText) {
		case "Tasks":
			break;
		case "Rules":
			const ruleModule = moduleFromArray("Rules");
			const ruleList = document.createElement("ul");
			ruleList.id = "ruleList";

			const publicToggle = document.createElement("h3");
			if (ruleModule?.public) publicToggle.innerText = "Public";
			else publicToggle.innerText = "Private";
			publicToggle.className = "toggleButton";

			publicToggle.onclick = (e) => {
				if (!ruleModule) return;

				ruleModule.public = !ruleModule.public;
				loadModule(module);
			};

			moduleBody.append(ruleList, publicToggle);
			break;
	}
}

function toggle(module) {
	if (!isPremium(user) && modules.length >= 3) return;
	const state = module.innerText;
	const moduleName =
		module.parentElement.parentElement.parentElement.children[0].children[1]
			.innerText;

	if (state == "Enable") {
		switch (moduleName) {
			case "Tasks":
				modules.push({
					name: "Tasks",
					enabled: true,
					locked: true,
					premium: false,
					taskList: [],
					assignedTasks: [],
					taskLog: [],
					giveTasks: 0,
					selfAssign: false,
				});
				break;
			case "Rules":
				modules.push({
					name: "Rules",
					enabled: true,
					locked: true,
					premium: false,
					public: false,
					rules: [],
				});
				break;
		}
		module.innerText = "Disable";
	} else {
		let newModules = [];
		modules.forEach((module) => {
			if (module.name != moduleName) newModules.push(module);
		});
		modules = newModules;
		module.innerText = "Enable";
	}
	const moduleElm = document.getElementById("moduleTitles").children[1];
	loadModule(moduleElm);

	const counter = document.getElementById("moduleCount");
	let limit = 5;
	if (isPremium(user)) limit = `20`;
	counter.innerHTML = `${modules.length}/${limit}`;
}

function isPremium(user) {
	if (user.tier == "Basic") return 0;
	return 1;
}

function moduleFromArray(name) {
	return modules.find((obj) => obj.name == name);
}

function adddigit(element) {
	var digitCount = Array.from(
		element.parentElement.children[1].innerText
	).length;
	if (digitCount == 10)
		return (element.parentElement.children[1].innerText = comboGen(digitCount));
	element.parentElement.children[1].innerText = comboGen(++digitCount);
}
function remdigit(element) {
	var digitCount = Array.from(
		element.parentElement.children[1].innerText
	).length;
	if (digitCount == 0)
		return (element.parentElement.children[1].innerText = comboGen(digitCount));
	element.parentElement.children[1].innerText = comboGen(--digitCount);
}

function comboGen(digits) {
	let multiply = "1"; //0 digits
	for (i = 0; i < digits; i++) {
		multiply += "0";
	}
	return Math.floor(Math.random() * parseInt(multiply));
}

const combo = document.getElementById("combo");
combo.innerText = comboGen(4);

async function done() {
	const combination = combo.innerText;

	const min = document.getElementById("Minimum");
	const max = document.getElementById("Maximum");

	if (validateCounters() != 0) return; //Add error message

	const startTime =
		Math.floor(Math.random() * (counterTotal(max) - counterTotal(min))) +
		counterTotal(min);

	const endTime = Math.floor(Date.now() + startTime);

	const userID = user.id;

	const limit = document.getElementById("Limit");
	let timeLimit = limitCounterTotal(limit);
	if (timeLimit == "0") timeLimit = null;
	else timeLimit += Date.now();
	if (timeLimit != 0 && timeLimit < endTime) return;

	await window.electronAPI.create("lock", {
		id: userID,
		endsAt: endTime,
		limit: timeLimit,
		comboType: "gen",
		comboObj: { code: combination },
		modules: modules,
	});

	window.electronAPI.redirect("home");
}

function updateTimer() {
	const weeks = document.getElementById("weeks");
	const days = document.getElementById("days");
	const hours = document.getElementById("hours");
	const minutes = document.getElementById("minutes");
	const seconds = document.getElementById("seconds");

	let timestamp = lock.endsAt - Date.now();

	const SECOND = 1000;
	const MINUTE = SECOND * 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;
	const WEEK = DAY * 7;

	let countWeeks = 0;
	let countDays = 0;
	let countHours = 0;
	let countMinutes = 0;
	let countSeconds = 0;

	while (timestamp >= WEEK) {
		countWeeks++;
		timestamp -= WEEK;
	}
	while (timestamp >= DAY) {
		countDays++;
		timestamp -= DAY;
	}
	while (timestamp >= HOUR) {
		countHours++;
		timestamp -= HOUR;
	}
	while (timestamp >= MINUTE) {
		countMinutes++;
		timestamp -= MINUTE;
	}
	while (timestamp >= SECOND) {
		countSeconds++;
		timestamp -= SECOND;
	}

	weeks.innerText = format(countWeeks);
	days.innerText = format(countDays);
	hours.innerText = format(countHours);
	minutes.innerText = format(countMinutes);
	seconds.innerText = format(countSeconds);
}

function format(string) {
	if (string < 10) return `0${string}`;
	if (string == 0) return `00`;
	return string;
}

function unlock() {
	if (!unlockable) return;
	blurPage(true);
	redirected = true;
	window.electronAPI.redirect("combo");
}

function unlockState(newState) {
	const unlockButton = document.getElementById("unlock");
	if (newState) {
		unlockable = true;
		return (unlockButton.className = "");
	}
	return (unlockButton.className = "disabled");
}

function blurPage(option) {
	const page = document.getElementById("body");
	if (option == true) {
		page.style = "filter: blur(5px);";
		disableScroll();
		redirected = true;
	}
	if (option == false) {
		page.style = "";
		enableScroll();
		redirected = false;
		location.reload();
	}
}

window.addEventListener("focus", () => {
	if (!redirected) return;
	redirected = false;
	setTimeout(() => {
		window.location.reload();
	}, 100);
});

function disableScroll() {
	let x = window.scrollX;
	let y = window.scrollY;
	window.onscroll = () => {
		window.scrollTo(x, y);
	};
}

function enableScroll() {
	window.onscroll = null;
}

async function request() {
	if (!lock.id) return;
	const requestBtn = document.getElementById("request");
	if (requestBtn.className.includes("disabled")) return;
	const response = await window.electronAPI.create("khRequest", lock.id);
	await window.electronAPI.setClipboard(response._doc.token);

	requestBtn.innerText = "Copied!";
	setTimeout(() => {
		requestBtn.innerHTML = `<i class="fa-solid fa-key"></i> Request`;
	}, 500);
}

function addTime() {
	blurPage(true);
	window.electronAPI.set("actionLockID", lock.id);
	window.electronAPI.redirect("addtime");
}
