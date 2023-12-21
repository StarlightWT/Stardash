async function initialize() {
	const activities = await window.electronAPI.get("activities", {
		amount: 10,
		reset: true,
	});
	const profile = await window.electronAPI.get("user");
	const lock = await window.electronAPI.get("lock", profile.id);

	setProfileInfo(profile, lock);
	appendActivities(activities);
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

function setProfileInfo(profile, lock) {
	const profilePictureElm = document.getElementById("profilePicture");
	const usernameElm = document.getElementById("username");
	usernameElm.innerText = profile.username;
	profilePictureElm.src = "../../../photos/blank.png";
	updateLockTimer(lock);
	setInterval(() => {
		updateLockTimer(lock);
	}, 1000);
}

function updateLockTimer(lock) {
	const timer = document.getElementById("timer");

	if (!lock.settings?.timerVisible)
		return (timer.innerHTML = "Timer is hidden!");

	let timestamp = lock.endsAt - Date.now();
	console.log(lock);
	if (timestamp <= 0) return (timer.innerHTML = "Lock is ready to unlock!");

	if (lock.frozenAt) timestamp = lock.endsAt - lock.frozenAt;

	if (timestamp > lock.timeLimit && lock.timeLimit > 0)
		return (timer.innerHTML = "Lock is ready to unlock!");

	let timerString = convertTimestamp(timestamp);
	timer.innerHTML =
		`<i class="fa-solid fa-lock" style="color: #ffffff;"></i>` + timerString;
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
