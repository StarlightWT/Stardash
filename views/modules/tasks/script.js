let lock;

function back() {
	window.electronAPI.redirect("home");
}

async function getLock() {
	return await window.electronAPI.get("lock");
}

async function getDBLock(lockId) {
	return await window.electronAPI.getDBLock(lockId);
}

async function initialize() {
	lock = await getLock();
	lock = lock[0];
	console.log(lock);
	let DBlock = await getDBLock(lock._id);
	DBlock = DBlock[0];

	start(DBlock);
}

function start(DBlock) {
	const taskList = document.getElementById("assignedTasks");
	const DBmodule = DBlock.modules.find((obj) => obj.name == "Tasks");
	console.log(DBmodule);
	DBmodule.assignedTasks.forEach((task) => {
		const li = document.createElement("li");

		li.innerHTML =
			task.title +
			`<div><i class="fa-solid fa-check" onclick="complete(this)"></i><i class="fa-solid fa-xmark" onclick="fail(this)"></i></div>`;

		taskList.append(li);
	});
}

async function complete(element) {
	const task = element.parentElement.parentElement.innerText;
	const date = new Date(Date.now());
	let hours = date.getHours();
	let minutes = date.getMinutes();
	if (hours.toString().length < 2) hours = `0${hours}`;
	if (minutes.toString().length < 2) minutes = `0${minutes}`;
	let currentDate = `${hours}:${minutes} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
	let log = {
		title: task,
		completedAt: currentDate,
		status: "Completed",
	};
	lock = await window.electronAPI.taskAction("log", { id: lock._id, log: log });
	window.location.reload();
}
async function fail(element) {
	const task = element.parentElement.parentElement.innerText;
	const date = new Date(Date.now());
	let hours = date.getHours();
	let minutes = date.getMinutes();
	if (hours.toString().length < 2) hours = `0${hours}`;
	if (minutes.toString().length < 2) minutes = `0${minutes}`;
	let currentDate = `${hours}:${minutes} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
	let log = {
		title: task,
		completedAt: currentDate,
		status: "Failed",
	};
	lock = await window.electronAPI.taskAction("log", { id: lock._id, log: log });
	window.location.reload();
}

initialize();
