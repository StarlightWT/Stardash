let lock;
let DBLock;
let lockeeProfile;

async function getLock() {
	return await window.electronAPI.lock("get");
}

async function getDBLock(lockId) {
	return await window.electronAPI.getDBLock(lockId);
}

async function initialize() {
	lock = await getLock();
	DBLock = await getDBLock(lock._id);
	DBLock = DBLock[0];
	lockeeProfile = await window.electronAPI.khaction("profile", {
		id: lock.user._id,
	});

	const description = document.getElementById("description");
	description.innerText = lockeeProfile.description;

	const moduleList = document.getElementById("moduleList");

	DBLock.modules.forEach((module) => {
		let moduleLi = document.createElement("li");
		moduleLi.id = module.name;
		moduleLi.innerHTML = module.name;

		moduleLi.onclick = (e) => {
			openModule(moduleLi.id);
		};
		moduleList.append(moduleLi);
	});

	setInfo();
	setInterval(() => {
		setInfo();
	}, 1000);
}

async function setInfo() {
	const profilePicture = document.getElementById("profilePicture");
	profilePicture.src = lockeeProfile.avatarUrl;

	const username = document.getElementById("username");
	username.innerText = lockeeProfile.username;
	let endDate = new Date(lock.endDate).getTime();
	let timeRemaining = endDate - Date.now();
	if (lock.isFrozen) {
		const frozenDate = new Date(lock.frozenAt).getTime();
		timeRemaining = endDate - frozenDate;
	}

	const timeLeft = document.getElementById("timeRemaining");
	timeLeft.innerHTML =
		`<i class="fa-regular fa-clock"></i> ` + timestampConvert(timeRemaining);

	const timeSpent = document.getElementById("timeLocked");

	timeSpent.innerHTML =
		`<i class="fa-solid fa-lock"></i> ` + timestampConvert(lock.totalDuration);

	const timeFrozen = document.getElementById("timeFrozen");
	timeFrozen.innerHTML =
		`<i class="fa-regular fa-snowflake"></i>` +
		timestampConvert(Date.now() - new Date(lock.frozenAt).getTime());
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
	const moduleDB = DBLock.modules.find((obj) => obj.name == module);
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
