const lockeeUI = document.getElementById("lockee");
const keyholderUI = document.getElementById("keyholder");
async function start() {
	//Load all informatin
	const profile = await window.electronAPI.get("profile");
	const DBProfileSearch = await window.electronAPI.get("dbprofile");
	const DBProfile = await DBProfileSearch[0]._doc;

	//Load, update and pass info depending on role
	switch (DBProfile.role) {
		case "switch":
			loadKHInfo(profile, DBProfile);
			loadLockInfo(profile, DBProfile);
			break;
		case "keyholder":
			lockeeUI.style = "display: none;";
			loadKHInfo(profile, DBProfile);
			break;
		case "lockee":
			keyholderUI.style = "display: none;";
			loadLockInfo(profile, DBProfile);
			break;
	}
}
start();

async function loadLockInfo(profile, DBProfile) {
	//Update all information upon page load
	var lock = await updateLock();
	updateLockTime(lock.endDate, lock.isAllowedToViewTime, lock.frozenAt);
	updateLockHistory();
	updateLockExtensions(lock);

	//Setup intervals to keep info up to date
	setInterval(async () => {
		lock = await updateLock();
		updateLockTime(lock.endDate, lock.isAllowedToViewTime, lock.frozenAt);
		updateLockHistory();
	}, 1000);
}

async function loadKHInfo() {
	//Update all information upon page load
	loadAllKHLocks();
	//Setup intervals to keep info up to date
	setInterval(async () => {
		loadAllKHLocks();
	}, 1500);
}

async function updateLock() {
	lockObject = await window.electronAPI.get("lock"); //Get lock list json from API
	lock = lockObject[0]; //Select first lock

	// if (DBProfile.tier != "Developer" && !DBProfile.subscribed) {
	// 	console.warn("Unsupported lock / No lock found!!!");
	// 	const body = document.getElementById("dash_body");

	// 	body.innerHTML = "";

	// 	var errorMessage = document.createElement("h1");
	// 	var errorMessage2 = document.createElement("h2");
	// 	var errorMessage3 = document.createElement("p");
	// 	var subscription = document.createElement("p");
	// 	body.append(errorMessage);
	// 	body.append(errorMessage2);
	// 	body.append(errorMessage3);
	// 	body.append(subscription);
	// 	body.style.textAlign = "center";
	// 	errorMessage.innerHTML = "Error getting lock/confirming subscription";
	// 	errorMessage2.innerHTML = "Your subscription or lock wasn't found!";
	// 	errorMessage3.innerHTML =
	// 		"Please relaunch the app, if issue persits please message Starlight(@starlightwt) on discord!";
	// 	subscription.innerHTML = `If you do not have a subscription <a href="https://ko-fi.com/mistressevelyn/tiers">click here</a> to get it!`;
	// 	return;
	// }

	return lock;
}

async function loadAllKHLocks() {
	var KHLocks = await window.electronAPI.get("khlocks");

	const currentDate = Date.now(); //Is also UTC

	const KHLockList = document.getElementById("KHLocks");
	KHLockList.innerHTML = "";
	KHLocks.forEach((lock) => {
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

		var name = document.createElement("h3");
		var card = document.createElement("li");
		name.innerHTML = lock.user.username;
		timer.innerHTML = `${days}:${hours}:${minutes}:${seconds}`;
		card.append(name);
		card.append(timer);
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
		const a = document.createElement("a");
		const ul = document.getElementById("extensionList");
		li.append(a);
		ul.append(li);

		const extensionId = extension.slice(0, 24);
		const lockId = lock._id;
		a.innerHTML = extension.slice(25);
		a.href = `https://chaster.app/locks/${lockId}/extensions/${extensionId}`;
	});
}

async function updateLockTime(endDateTimestamp, isAllowedToViewTime, frozenAt) {
	const timer = document.getElementById("timer");
	//check if the timer is currently hidden
	if (!isAllowedToViewTime) return (timer.innerHTML = "Time hidden");
	else
		timer.innerHTML = `<span id="days">NaN</span>:<span id="hours">NaN</span>:<span id="minutes">NaN</span>:<span id="seconds">NaN</span>`;

	//calculate time remaining
	const endDate = new Date(endDateTimestamp).getTime(); //Is UTC
	const currentDate = Date.now(); //Is also UTC
	var timeLeft = endDate - currentDate;
	if (timeLeft <= 0) return (timer.innerHTML = "Ready to unlock!");
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
	const lastLogs = lockHistory.results.slice(0, 10);
	//Get the log list and clear it
	const logList = await document.getElementById("logList");
	logList.innerHTML = "";

	//Add each log to the list
	lastLogs.forEach(async (log) => {
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
			if (extensionTitle.startsWith("Stardash"))
				extensionTitle = extensionTitle.slice(0, 8);
			title = extensionTitle + lastLogs[i].title.slice(6);
		}

		entryTitle.innerHTML = title;
		entryDescription.innerHTML = log.description;
		i++;
	});
}
