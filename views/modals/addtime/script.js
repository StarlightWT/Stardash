let lockId, userLock;
async function setLockId() {
	lockId = await window.electronAPI.lockId("get");
}
async function setUsersLock() {
	userLock = await window.electronAPI.get("lock");
}
setLockId();
setUsersLock();

const weeks = document.getElementById("weeks");
const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");

window.onload = (e) => {
	if (lockId == userLock._id) {
		const remBtn = document.getElementById("rem");
		remBtn.remove();
	}
};

function done(type) {
	total =
		weeks.value * 7 * 24 * 60 * 60 +
		days.value * 24 * 60 * 60 +
		hours.value * 60 * 60 +
		minutes.value * 60;
	if (total == 0) return window.close();
	if ((total < 0 && type == "add") || (total > 0 && type == "rem")) total *= -1;

	window.electronAPI.khaction("time", { id: lockId, time: total });
	console.log(`[MODAL - ADDTIME] lockId: ${lockId}|||time:${total}`);

	window.close();
}

function back() {
	window.close();
}

// function check(element) {
// 	if (element.value != "number") element.value = "0";
// }
