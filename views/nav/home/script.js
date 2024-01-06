let lockID,
	userID,
	unlockable,
	redirected = false;
async function initialize() {
	let activities = await window.electronAPI.get("activities", {
		amount: 10,
		reset: true,
	});
	let profile = await window.electronAPI.get("user");
	let lock = await window.electronAPI.get("lock", profile.id);
	lockID = lock.id;
	userID = profile.id;
	if (!(lock == 1 || !lock)) showLockInfo(lock);
	appendActivities(activities);
	setProfileInfo(profile, lock);

	setInterval(async () => {
		activities = await window.electronAPI.get("activities", {
			amount: 10,
			reset: true,
		});
		appendActivities(activities);
		setProfileInfo(profile, lock);
		profile = await window.electronAPI.get("user");
		lock = await window.electronAPI.get("lock", profile.id);
	}, 1000 * 5);
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
		if (activity.icon) title.innerHTML = activity.icon;
		title.innerHTML += ` ` + activity.title;

		const description = document.createElement("h2");
		description.innerHTML = activity.description;

		const icon = document.createElement("i");
		icon.className = activity.icon;

		const dateElement = document.createElement("h3");

		const date = new Date(parseInt(activity.Date));
		let hours = date.getHours();
		if (hours < 10) hours = `0${hours}`;
		if (hours == 0) hours = `00`;
		let minutes = date.getMinutes();
		if (minutes < 10) minutes = `0${minutes}`;
		if (minutes == 0) minutes = `00`;
		let day = date.getDate() + 1;
		if (day < 10) day = `0${day}`;
		let month = date.getMonth() + 1;
		if (month < 10) month = `0${month}`;

		dateElement.innerText = `${hours}:${minutes} ${day}/${month}`;
		activityLi.append(title, description, icon, dateElement);
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

function showLockInfo(lock) {
	const elements = Array.from(document.getElementsByClassName("lockInfo"));
	elements.forEach((element) => {
		element.classList.remove("lockInfo");
	});

	const modulesElm = document.getElementById("moduleList");
	if (lock.modules.length == 0) modulesElm.classList.add("lockInfo");

	if (lock.khId == null)
		document.getElementById("khReq").classList.remove("disabled");
}

let timerInterval;
function setProfileInfo(profile, lock) {
	const userAvatar = document.getElementById("userPicture");
	const userUsername = document.getElementById("userUsername");

	if (profile?.avatar?.length > 5) userAvatar.src = profile.avatar;
	userUsername.innerText = profile.username;

	if (userUsername.innerText.length > 10)
		userUsername.style.fontSize =
			userUsername.offsetWidth / (userUsername.innerText.length - 2) + "px";

	if (lock != 1) {
		updateLockTimer(lock);
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			updateLockTimer(lock);
		}, 1000);
		loadLockModules(lock);
	}
}

function updateLockTimer(lock) {
	const timer = document.getElementById("timer");
	let timerString = "";
	if (!lock.settings?.timerVisible)
		return (timer.innerHTML = "Timer is hidden!");

	let timestamp = lock.endsAt - Date.now();
	if (timestamp <= 0) {
		unlockState(true);
		return (timer.innerHTML = "Ready to unlock!");
	}
	if (lock.frozenAt) {
		console.log(lock.frozenAt);
		timestamp = lock.endsAt - lock.frozenAt;
		timerString = `<i class="fa-solid fa-snowflake"></i> `;
	}
	if (lock.timeLimit > 0 && Date.now() >= lock.timeLimit) {
		unlockState(true);
		return (timer.innerHTML = "Lock is ready to unlock!");
	}

	timerString += convertTimestamp(timestamp);
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
	if (!unlockable) return;
	blurPage(true);
	redirected = true;
	window.electronAPI.redirect("combo");
}

function unlockState(newState) {
	const unlockButton = document.getElementById("unlockBtn");
	if (newState) {
		unlockable = true;
		return (unlockButton.className = "");
	}
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
		redirected = true;
	}
	if (option == false) {
		page.style = "";
		enableScroll();
		redirected = false;
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

//New avatar
document.getElementById("imgupload").addEventListener("change", handleFile);

function handleFile(event) {
	const file = event.target.files[0];
	if (file && file.size / 1024 / 1024 < 2) {
		//Max file size == 2MB
		const reader = new FileReader();

		// The onload event is triggered when the file reading is complete
		reader.onload = async function (e) {
			// Save the base64-encoded image data to MongoDB
			await window.electronAPI.create("avatar", userID, e.target.result);

			// Display the image using the base64 string
			const imgElement = document.getElementById("userPicture");
			imgElement.src = e.target.result;
		};

		reader.readAsDataURL(file);
	}
}

async function request() {
	if (!lockID) return;
	const requestBtn = document.getElementById("khReq");
	if (requestBtn.className.includes("disabled")) return;
	const response = await window.electronAPI.create("khRequest", lockID);
	console.log(response._doc);
	await window.electronAPI.setClipboard(response._doc.token);

	requestBtn.innerText = "Copied!";
	setTimeout(() => {
		requestBtn.innerHTML = `<i class="fa-solid fa-key"></i> Request`;
	}, 500);
}

function addTime() {
	blurPage(true);
	window.electronAPI.set("actionLockID", lockID);
	window.electronAPI.redirect("addtime");
}
