let user, lock;
const comboElm = document.getElementById("combo");

async function initialize() {
	user = await window.electronAPI.get("user");
	lock = await window.electronAPI.get("lock", user.id);
	comboElm.innerHTML += lock.combination.combination.code;
}
initialize();
