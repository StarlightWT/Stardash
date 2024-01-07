let lock,
	redirected = false,
	lockeeProfile,
	activeModule;

async function initialize() {
	lockID = await window.electronAPI.tempGet("actionLockID");
	lock = await window.electronAPI.get("lock", lockID);

	const moduleList = document.getElementById("moduleList");

	lock.modules.forEach((module) => {
		let moduleLi = document.createElement("li");
		moduleLi.id = module.name;
		moduleLi.innerHTML = module.name;

		moduleLi.onclick = (e) => {
			openModule(moduleLi.id);
		};
		moduleList.append(moduleLi);
	});

	setInfo();
	openModule("General");
	setInterval(() => {
		setInfo();
	}, 1000);
}

async function setInfo() {
	const profilePicture = document.getElementById("profilePicture");
	console.log(lock.user);
	if (lock.user.avatar) profilePicture.src = lock.user.avatar;
	else profilePicture.src = "../../../photos/blank.png";

	const username = document.getElementById("username");
	username.innerText = lock.user.username;
	let endDate = lock.endsAt;
	let timeRemaining = endDate - Date.now();
	if (lock.frozenAt != null) timeRemaining = endDate - lock.frozenAt;
	const timeLeft = document.getElementById("timeRemaining");
	timeLeft.innerHTML =
		`<i class="fa-regular fa-clock"></i> ` + timestampConvert(timeRemaining);

	const timeSpent = document.getElementById("timeLocked");

	timeSpent.innerHTML =
		`<i class="fa-solid fa-lock"></i> ` +
		timestampConvert(Date.now() - lock.createdAt);

	const timeFrozen = document.getElementById("timeFrozen");
	if (lock.frozenAt)
		timeFrozen.innerHTML =
			`<i class="fa-regular fa-snowflake"></i> ` +
			timestampConvert(Date.now() - lock.frozenAt);
	else timeFrozen.innerHTML = ``;

	const timeUnlocked = document.getElementById("timeUnlocked");
	if (lock.unlockedAt)
		timeUnlocked.innerHTML = `<i class="fa-solid fa-unlock"></i> ${timestampConvert(
			Date.now() - lock.unlockedAt
		)}`;
}

function back() {
	window.close();
}

initialize();

function timestampConvert(timestamp) {
	var days = Math.floor(timestamp / (1000 * 60 * 60 * 24));
	if (days < 10) days = "0" + `${days}`;
	var hours = Math.floor(
		(timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	if (hours < 10) hours = "0" + `${hours}`;
	var minutes = Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60));
	if (minutes < 10) minutes = "0" + `${minutes}`;
	var seconds = Math.floor((timestamp % (1000 * 60)) / 1000);
	if (seconds < 10) seconds = "0" + `${seconds}`;

	return `${days}:${hours}:${minutes}:${seconds}`;
}

function openModule(module) {
	const moduleCase = document.getElementById("moduleCase");
	const moduleTitle = document.getElementById("title");
	let moduleDB;
	if (module != "General")
		moduleDB = lock.modules.find((obj) => obj.name == module);
	moduleTitle.innerHTML = `Module - ${module}`;
	moduleCase.innerHTML = "";
	switch (module) {
		case "Tasks":
			const assigningDiv = document.createElement("div");

			const taskList = document.createElement("ul");
			const allTasks = document.createElement("ul");
			taskList.id = "assignedTasks";
			allTasks.id = "unassignedTasks";
			const taskListTitle = document.createElement("h2");
			const allTasksTitle = document.createElement("h2");
			taskListTitle.innerHTML = "Assigned";
			allTasksTitle.innerHTML = "Not Assigned";
			taskList.append(taskListTitle);
			allTasks.append(allTasksTitle);
			moduleDB.assignedTasks.forEach((task) => {
				let li = document.createElement("li");
				li.innerHTML =
					task.title +
					`<i class="fa-solid fa-arrow-right" onclick="selectTask(this)">`;
				taskList.append(li);
			});
			moduleDB.taskList.forEach((task) => {
				let li = document.createElement("li");
				li.innerHTML =
					task.title +
					`<i class="fa-solid fa-arrow-left" onclick="selectTask(this)"></i>`;

				allTasks.append(li);
			});

			const taskLog = document.createElement("ul");
			const taskLogTitle = document.createElement("h2");
			taskLogTitle.innerHTML = "Tasks log";
			taskLog.className = "log";

			taskLog.append(taskLogTitle);
			moduleDB.taskLog.forEach((log) => {
				const li = document.createElement("li");
				const title = document.createElement("h3");
				const completionDate = document.createElement("h3");

				if (!log.title) li.classList.add("hidden");
				title.innerHTML = log.title ?? ".";
				completionDate.innerHTML = log.completedAt ?? ".";

				if (log.status == "Completed") li.classList.add("Completed");
				if (log.status == "Failed") li.classList.add("Failed");

				li.append(title, completionDate);
				taskLog.append(li);
			});

			assigningDiv.append(taskList, allTasks);
			moduleCase.append(assigningDiv);
			moduleCase.append(taskLog);

			break;
		case "General":
			activeModule = "General";
			const quickActions = document.createElement("ul");
			quickActions.style.display = "flex";
			quickActions.style.width = "90%";
			quickActions.style.marginInline = "auto";

			const addTime = document.createElement("li");
			addTime.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Add time`;
			addTime.onclick = async (e) => {
				await window.electronAPI.set("actionLockID", lock.id);
				window.electronAPI.redirect("addtime");
				redirected = true;
			};
			addTime.className = "buttonInput";
			const remTime = document.createElement("li");
			remTime.innerHTML = `<i class="fa-solid fa-circle-minus"></i> Remove time`;
			remTime.onclick = async (e) => {
				await window.electronAPI.set("actionLockID", lock.id);
				window.electronAPI.redirect("remtime");
				redirected = true;
			};
			remTime.className = "buttonInput";

			const freezeTime = document.createElement("li");
			freezeTime.className = "buttonInput";
			if (lock.frozenAt == null) {
				freezeTime.innerHTML = `<i class="fa-solid fa-snowflake"></i> Freeze`;
				freezeTime.onclick = async (e) => {
					freezeTime.innerHTML = `<i class="fa-solid fa-snowflake"></i> Un-Freeze`;
					await window.electronAPI
						.lock(lock.id, "freeze", {
							state: true,
						})
						.then((data) => {
							lock = data;
							openModule("General");
						});
				};
			} else {
				freezeTime.innerHTML = `<i class="fa-solid fa-snowflake"></i> Un-Freeze`;
				freezeTime.onclick = async (e) => {
					freezeTime.innerHTML = `<i class="fa-solid fa-snowflake"></i> Freeze`;
					await window.electronAPI
						.lock(lock.id, "freeze", {
							state: false,
							endsAt: lock.endsAt,
							frozenAt: lock.frozenAt,
						})
						.then((data) => {
							lock = data;
							openModule("General");
						});
				};
			}

			const tempUnlock = document.createElement("li");
			tempUnlock.className = "buttonInput";
			if (lock.unlockedAt) tempUnlock.className = "disabled buttonInput";
			tempUnlock.onclick = (e) => tempUnlockFunc(e.target);
			tempUnlock.innerHTML = `<i class="fa-solid fa-clock"></i> Tem. unlock`;

			quickActions.append(addTime, remTime, freezeTime, tempUnlock);

			moduleCase.append(quickActions);
			break;
	}
}

async function selectTask(elem) {
	const task = elem.parentElement.innerText;
	let taskType = elem.parentElement.parentElement.id;
	console.log(lock._id);
	if (taskType.startsWith("as"))
		DBLock = await window.electronAPI.unassignTask(lock._id, task);
	else DBLock = await window.electronAPI.assignTask(lock._id, task);
	openModule("Tasks");
}

function sendError() {
	const ErrorMessage = document.createElement("h1");
	ErrorMessage.innerHTML = "Unable to find lock information for this user!";
	ErrorMessage.className = "ERROR";
	const body = document.getElementById("body");
	body.innerHTML = "";
	body.append(ErrorMessage);
	setTimeout(() => {
		window.close();
	}, 1500);
}

window.onfocus = (e) => {
	if (!redirected) return;
	console.log("RELOADING");
	location.reload().then(() => {
		openModule(activeModule);
	});
};

async function tempUnlockFunc(element) {
	if (element.className == "disabled buttonInput") return;
	element.className = "disabled buttonInput";
	element.innerHTML = `<i class="fa-solid fa-clock"></i> Unlocking...`;
	lock = await window.electronAPI.lock(lock.id, "tempUnlock");
	element.innerHTML = `<i class="fa-solid fa-clock"></i> Tem. unlock`;
}
