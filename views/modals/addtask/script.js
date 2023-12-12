const taskElm = document.getElementById("task");
async function done() {
	let task = taskElm.value;
	if (task.length < 5) return;
	task = { title: task };
	const lockId = await window.electronAPI.lock("get");
	let newLock = await window.electronAPI.addTask(lockId, task);
	window.electronAPI.DBlock(newLock);
	goback();
}

taskElm.addEventListener("keyup", (e) => {
	if (e.key == "Enter") done();
});

function goback() {
	window.close();
}
