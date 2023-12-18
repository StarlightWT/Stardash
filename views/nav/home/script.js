const lockeeUI = document.getElementById("lockee");
const keyholderUI = document.getElementById("keyholder");
async function start() {
	window.electronAPI.active("home");
	//Load all informatin
	var DBProfileSearch = await window.electronAPI.get("dbprofile");
	const DBProfile = await DBProfileSearch[0]._doc;

	//Load, update and pass info depending on role
	switch (DBProfile.role) {
		case "switch":
			loadKHInfo(profile);
			loadLockInfo(profile);
			break;
		case "keyholder":
			lockeeUI.style = "display: none;";
			loadKHInfo(profile);
			break;
		case "lockee":
			keyholderUI.style = "display: none;";
			loadLockInfo(profile);
			break;
	}
}

async function loadLockInfo(profile) {
	//Update all information upon page load
	var lock = await updateLock();
	updateLockTime(
		lock.endDate,
		lock.isAllowedToViewTime,
		lock.frozenAt,
		lock.status,
		lock._id
	);
	updateLockHistory();
	updateLockExtensions(lock);

	let DBLock = await window.electronAPI.getDBLock(lock._id, profile._id);
	DBLock = DBLock[0];
	loadModules(DBLock);
	console.log(lock);

	//Setup intervals to keep info up to date
	setInterval(async () => {
		lock = await updateLock();
		updateLockTime(
			lock.endDate,
			lock.isAllowedToViewTime,
			lock.frozenAt,
			lock.status,
			lock._id
		);
		updateLockHistory();
	}, 1000);
}

var KhLocksUpdate = [];
async function loadKHInfo() {
	//Update all information upon page load
	loadAllKHLocks();
	KhLocksUpdate = [];
	//Setup intervals to keep info up to date
	setInterval(async () => {
		loadAllKHLocks();
	}, 1000);
	setInterval(() => {
		KhLocksUpdate = [];
	}, 5000);
}

async function updateLock() {
	lockObject = await window.electronAPI.get("lock"); //Get lock list json from API
	lock = lockObject[0]; //Select first lock

	return lock;
}

async function loadAllKHLocks() {
	const KHLocks = await window.electronAPI.get("khlocks");
	//Setup home.js khlocks
	const currentDate = Date.now(); //Is also UTC

	const KHLockList = document.getElementById("KHLocks");

	KHLockList.innerHTML = "";
	for (i = 0; i <= KHLockList.length; i++) {
		if (KhLocksUpdate[i] == undefined || KhLocksUpdate[i] == null) {
			console.log(KhLocksUpdate[i]);
			console.log("CHANGING!!");
			KhLocksUpdate[i] = { id: lock._id, status: "notSet" };
			console.log(KhLocksUpdate[i]);
		}
	}

	KHLocks.forEach((lock) => {
		var changing = false;
		var endDate = new Date(lock.endDate).getTime(); //Is UTC
		var timeLeft = endDate - currentDate;
		//	if lock is frozen calculate time from the time of being frozen.
		if (lock.frozenAt == null) timeLeft = endDate - currentDate;
		else {
			const frozenDate = new Date(lock.frozenAt).getTime();
			timeLeft = endDate - frozenDate;
		}
		// if (currentDate > endDate) return;
		const timer = document.createElement("p");

		var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		if (days < 10) days = "0" + `${days}`;
		var hours = Math.floor(
			(timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		if (hours < 10) hours = "0" + `${hours}`;
		var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		if (minutes < 10) minutes = "0" + `${minutes}`;
		var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
		if (seconds < 10) seconds = "0" + `${seconds}`;

		//Create elements
		const name = document.createElement("h3");
		const card = document.createElement("li");
		const actionPanel = document.createElement("div");
		const changeTime = document.createElement("i");
		const toggleFreeze = document.createElement("i");
		const toggleVisibility = document.createElement("i");
		const openLock = document.createElement("i");
		const starDash = document.createElement("i");

		card.classList.add("card");
		actionPanel.classList.add("actionPanel");
		changeTime.classList.add("fa-regular", "fa-clock");
		toggleFreeze.classList.add("fa-regular", "fa-snowflake");
		toggleVisibility.classList.add("fa-regular", "fa-eye-slash");
		openLock.classList.add("fa-solid", "fa-arrow-up-right-from-square");
		starDash.classList.add("fa-regular", "fa-star", "move_left");

		name.innerHTML = lock.user.username;
		timer.innerHTML = `${days}:${hours}:${minutes}:${seconds}`;
		if (timeLeft < 0) timer.innerHTML = `Ready to unlock!`;
		if (!lock.displayRemainingTime) timer.innerHTML += "[H]";
		if (lock.isFrozen) timer.innerHTML += "[F]";

		for (i = 0; i <= KhLocksUpdate.length; i++) {
			if (
				KhLocksUpdate[i]?.id == lock._id &&
				KhLocksUpdate[i]?.status == "freeze"
			) {
				changing = true;
				toggleFreeze.classList.add("processing");
			}
			if (
				KhLocksUpdate[i]?.id == lock._id &&
				KhLocksUpdate[i]?.status == "hidden"
			) {
				toggleVisibility.classList.add("processing");
				changing = true;
			}
		}

		//Add functions to button
		changeTime.onclick = function (e) {
			window.electronAPI.lockId(lock._id);
			blurPage(true);
			window.electronAPI.redirect("addtime", true);
		};

		toggleFreeze.onclick = function (e) {
			if (changing) return;
			//Toggle freeze on lock
			KhLocksUpdate[i] = { id: lock._id, status: "freeze" };
			toggleFreeze.classList.add("processing");
			window.electronAPI.khaction("freeze", {
				state: !lock.isFrozen,
				id: lock._id,
			});
			if (!lock.isFrozen) {
				timer.innerHTML += "[F]";
			} else timer.innerHTML = timer.innerHTML.replace("[F]", "");
		};

		toggleVisibility.onclick = function (e) {
			if (changing) return;
			KhLocksUpdate[i] = { id: lock._id, status: "hidden" };
			toggleVisibility.classList.add("processing");
			window.electronAPI.khaction("settings", {
				id: lock._id,
				time: !lock.displayRemainingTime,
				logs: lock.hideTimeLogs,
			});
			showTimer = !lock.displayRemainingTime;

			if (lock.displayRemainingTime) {
				timer.innerHTML += "[H]";
			} else timer.innerHTML = timer.innerHTML.replace("[H]", "");
		};

		openLock.onclick = function (e) {
			blurPage(true);
			window.electronAPI.redirect(`https://chaster.app/keyholder/${lock._id}`);
		};

		starDash.onclick = function (e) {
			blurPage(true);
			window.electronAPI.lock(lock);
			window.electronAPI.redirect("locks", true);
		};

		//Add all items to card and add card to the list

		actionPanel.append(changeTime);
		actionPanel.append(toggleFreeze);
		actionPanel.append(toggleVisibility);
		actionPanel.append(openLock);
		lock.extensions.forEach((extension) => {
			if (extension.slug == "stardash-connect") actionPanel.append(starDash);
		});

		card.append(name);
		card.append(timer);
		card.append(actionPanel);

		KHLockList.append(card);
	});
}

async function updateLockExtensions(lock) {
	var extension_list = [];
	//Encode extension list that chaster provides
	lock.extensions.forEach((extension) => {
		var extensionName = extension.displayName;
		var extensionID = extension._id;
		extension_list.push(`${extensionID}:${extensionName}`);
	});

	//Add every extension to the extension list in the UI
	extension_list.forEach((extension) => {
		const li = document.createElement("li");
		const ul = document.getElementById("extensionList");
		ul.append(li);

		const extensionId = extension.slice(0, 24);
		const lockId = lock._id;
		li.innerHTML = extension.slice(25);
		li.classList.add("selectable");
		li.onclick = function (e) {
			blurPage(true);
			window.electronAPI.redirect(
				`https://chaster.app/locks/${lockId}/extensions/${extensionId}`
			);
		};
	});
}

async function updateLockTime(
	endDateTimestamp,
	isAllowedToViewTime,
	frozenAt,
	status,
	id
) {
	const timer = document.getElementById("timer");
	//check if the timer is currently hidden
	if (!isAllowedToViewTime) return (timer.innerHTML = "Time hidden");
	else if (status == "unlocked") {
		timer.innerHTML = "Unlocked!</br>";
		const unlockButton = document.createElement("button");
		unlockButton.innerHTML = "SHOW COMBINATION";
		unlockButton.classList.add("timerBtn");

		unlockButton.onclick = async (e) => {
			if (status != "unlocked")
				window.electronAPI.khaction("unlock", { id: id });
			let combination = await window.electronAPI.khaction("combo", {
				id: id,
			});
			console.log(await combination);
		};

		timer.append(unlockButton);
		return;
	} else
		timer.innerHTML = `<span id="days">NaN</span>:<span id="hours">NaN</span>:<span id="minutes">NaN</span>:<span id="seconds">NaN</span>`;

	//calculate time remaining
	const endDate = new Date(endDateTimestamp).getTime(); //Is UTC
	const currentDate = Date.now(); //Is also UTC
	var timeLeft = endDate - currentDate;
	if (timeLeft <= 0) {
		timer.innerHTML = "Ready to unlock!</br>";
		const unlockButton = document.createElement("button");
		unlockButton.innerHTML = "UNLOCK";
		unlockButton.classList.add("timerBtn");
		const addTimeButton = document.createElement("button");
		addTimeButton.innerHTML = "ADD TIME";
		addTimeButton.classList.add("timerBtn");

		addTimeButton.onclick = (e) => {
			window.electronAPI.lockId(id);
			blurPage(true);
			window.electronAPI.redirect("addtime");
			loadLockInfo();
		};

		unlockButton.onclick = (e) => {
			if (status != "unlocked")
				window.electronAPI.khaction("unlock", { id: id });
		};

		timer.append(unlockButton);
		timer.append(addTimeButton);
		return;
	}
	//if lock is frozen calculate time from the time of being frozen.
	if (frozenAt == null) timeLeft = endDate - currentDate;
	else {
		const frozenDate = new Date(frozenAt).getTime();
		timeLeft = endDate - frozenDate;
	}

	//Extract time
	var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
	var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

	//Get location for each time period
	const daysElement = document.getElementById("days");
	const hoursElement = document.getElementById("hours");
	const minutesElement = document.getElementById("minutes");
	const secondsElement = document.getElementById("seconds");
	let spacer = "0";
	//Make sure days fit
	if (days >= 100) spacer = "00";
	if (days >= 1000) spacer = "000";
	if (days >= 10000) spacer = "0000";
	//Update each time period
	daysElement.innerHTML = (spacer + days).slice(-spacer.length - 1);
	hoursElement.innerHTML = ("0" + hours).slice(-2);
	minutesElement.innerHTML = ("0" + minutes).slice(-2);
	secondsElement.innerHTML = ("0" + seconds).slice(-2);

	//if lock is frozen, add info text to the end of the timer
	if (frozenAt != null) timer.innerHTML += "</br>(frozen)";
}

async function updateLockHistory() {
	var i = 0;
	//Request lock history from api
	const lockHistory = await window.electronAPI.get("history");
	//Get only latest 10 logs
	const logs = lockHistory.results;
	var lastLogs = logs.filter(function (log) {
		if (
			(log.type != "time_changed" && log.extension != "stardash-connect") ||
			(log.type == "time_changed" && log.extension != "stardash-connect") ||
			(log.type != "time_changed" && log.extension == "stardash-connect")
		)
			return 1;
		return 0;
	});
	lastLogs = lastLogs.slice(0, 5);
	//Get the log list and clear it
	const logList = await document.getElementById("logList");
	logList.innerHTML = "";

	//Add each log to the list
	lastLogs.slice(0, 5).forEach(async (log) => {
		const entry = document.createElement("li");
		const entryTitle = document.createElement("h1");
		const entryDescription = document.createElement("p");
		await logList.append(entry);
		await entry.append(entryTitle);
		await entry.append(entryDescription);

		var title = lastLogs[i].title;
		//Translate %USER% tag to username
		if (lastLogs[i].title.includes("%USER%") && lastLogs[i].user)
			title = lastLogs[i].user.username + lastLogs[i].title.slice(6);
		//Translate %USER% tag to extension if not made by user
		else if (lastLogs[i].title.includes("%USER%")) {
			var extensionTitle =
				lastLogs[i].extension.charAt(0).toUpperCase() +
				lastLogs[i].extension.slice(1);
			var temp = extensionTitle.split("-");
			extensionTitle = temp.join(" ");
			title = extensionTitle + lastLogs[i].title.slice(6);
		}

		entryTitle.innerHTML = title;
		entryDescription.innerHTML = log.description;
		i++;
	});
}

start();

function blurPage(option) {
	const page = document.getElementById("body");
	if (option == true) {
		page.style = "filter: blur(5px);";
		disableScroll();
	}
	if (option == false) {
		page.style = "";
		enableScroll();
	}
}

function openHistory() {
	blurPage(true);
	window.electronAPI.redirect("history", true);
}
window.addEventListener("focus", () => {
	blurPage(false);
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

function openModule(module) {
	switch (module) {
		case "settings":
			window.electronAPI.redirect("moduleSettings");
			break;
		case "Tasks":
			window.electronAPI.redirect("tasks");
			break;
	}
}

function loadModules(DBLock) {
	const moduleList = document.getElementById("moduleList");
	DBLock.modules.forEach((module) => {
		if (!module.enabled) return;
		const newModule = document.createElement("li");
		newModule.innerHTML = module.name;
		if (module.name == "Tasks" && module.assignedTasks.length > 0) {
			const count = module.assignedTasks.length;
			newModule.innerHTML += ` <${count}>`;
		}
		newModule.className = "selectable";
		newModule.onclick = (e) => {
			openModule(module.name);
		};
		moduleList.append(newModule);
	});
}
