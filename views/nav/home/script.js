let lockID;
async function initialize() {
	const activities = await window.electronAPI.get("activities", {
		amount: 10,
		reset: true,
	});
	const profile = await window.electronAPI.get("user");
	const lock = await window.electronAPI.get("lock", profile.id);
	lockID = lock.id;
	if (lock == 1 || !lock) hideLockInfo();
	appendActivities(activities);
	setProfileInfo(profile, lock);
}

initialize();

function redirect(where) {
	window.electronAPI.redirect(where);
}

function appendActivities(activities) {
	const activityFeed = document.getElementById("activity");
	activities.forEach((activity) => {
		const activityLi = document.createElement("li");

		const title = document.createElement("h1");
		title.innerHTML = activity.title;

		const description = document.createElement("h2");
		description.innerHTML =
			activity.description + activity.description + activity.description;

		const icon = document.createElement("i");
		icon.className = activity.icon;

		const Date = document.createElement("h3");
		activityLi.append(title, description, icon, Date);
		activityFeed.append(activityLi);
	});
	const loadMoreButton = document.createElement("li");
	loadMoreButton.id = "loadMoreBtn";
	loadMoreButton.innerHTML = "Load More...";
	loadMoreButton.onclick = async (e) => {
		const activitiesSearch = await window.electronAPI.get("activities", {
			amount: 10,
			reset: false,
		});
		loadMoreButton.remove();
		appendActivities(activitiesSearch);
	};
	if (activities.length == 10) activityFeed.append(loadMoreButton);
}

function hideLockInfo() {
	const elements = Array.from(document.getElementsByClassName("lockInfo"));
	elements.forEach((element) => {
		element.style = "display: none;";
	});
}

function setProfileInfo(profile, lock) {
	const profilePictureElm = document.getElementById("profilePicture");
	const usernameElm = document.getElementById("username");
	usernameElm.innerText = profile.username;
	profilePictureElm.src = "../../../photos/blank.png";
	if (lock != 1) {
		console.log(lock);
		updateLockTimer(lock);
		setInterval(() => {
			updateLockTimer(lock);
		}, 1000);
		loadLockModules(lock);
	}
}

function updateLockTimer(lock) {
	const timer = document.getElementById("timer");

	if (!lock.settings?.timerVisible)
		return (timer.innerHTML = "Timer is hidden!");

	let timestamp = lock.endsAt - Date.now();
	console.log(lock);
	if (timestamp <= 0) {
		unlockable(true);
		return (timer.innerHTML = "Lock is ready to unlock!");
	}
	if (lock.frozenAt) timestamp = lock.endsAt - lock.frozenAt;

	if (timestamp > lock.timeLimit && lock.timeLimit > 0) {
		unlockable(true);
		return (timer.innerHTML = "Lock is ready to unlock!");
	}

	let timerString = convertTimestamp(timestamp);
	timer.innerHTML = timerString;
}

function convertTimestamp(timestamp) {
	var days = 0,
		hours = 0,
		minutes = 0,
		seconds = 0;

	const DAY = 86400000;
	const HOUR = 3600000;
	const MINUTE = 60000;
	const SECOND = 1000;
	while (timestamp >= DAY) {
		days++;
		timestamp -= DAY;
	}

	while (timestamp >= HOUR) {
		hours++;
		timestamp -= HOUR;
	}

	while (timestamp >= MINUTE) {
		minutes++;
		timestamp -= MINUTE;
	}

	while (timestamp >= SECOND) {
		seconds++;
		timestamp -= SECOND;
	}
	if (days < 10) days = `0${days}`;
	if (hours < 10) hours = `0${hours}`;
	if (minutes < 10) minutes = `0${minutes}`;
	if (seconds < 10) seconds = `0${seconds}`;
	return `${days}:${hours}:${minutes}:${seconds}`;
}

function unlock() {
	blurPage(true);
	window.electronAPI.redirect("combo");
}

function unlockable(newState) {
	const unlockButton = document.getElementById("unlockBtn");
	if (newState) return (unlockButton.className = "");
	return (unlockButton.className = "disabled");
}

function loadLockModules(lock) {
	const modules = lock.modules;
	const list = document.getElementById("moduleList");
	modules.forEach((module) => {
		const moduleLi = document.createElement("li");
		moduleLi.innerHTML = `${module.name}`;

		moduleLi.className = "disabled";

		moduleLi.onclick = (e) => {
			openModule(module.name);
		};
		list.append(moduleLi);
	});
}

function openModule(module) {
	//Redirect to module's standard page
}

function toggleList(title) {
	const list = title.parentElement;
	let height = 15;
	Array.from(list.children).forEach((child) => {
		height += child.getBoundingClientRect().height;
	});
	if (list.style.height == "15px") {
		list.style.height = `${height}px`;
		title.children[1].classList.add("openList");
		return;
	}
	list.style.height = "15px";
	title.children[1].classList.remove("openList");
}

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

window.addEventListener("focus", () => {
	blurPage(false);
	window.location.reload();
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
