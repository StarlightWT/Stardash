async function getLock() {
	const lock = await window.electronAPI.lock("get");
	return lock;
}

async function setInfo() {
	const lock = await getLock();
}

function back() {
	window.close();
}

setInfo();
