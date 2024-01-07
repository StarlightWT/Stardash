let user, lock;
const comboElm = document.getElementById("combo");

async function initialize() {
	user = await window.electronAPI.get("user");
	lock = await window.electronAPI.get("lock", user.id);
	console.log(lock);
	comboElm.innerHTML = lock.combination.combination.code;
}
initialize();

async function finish() {
	await window.electronAPI.lock(lock.id, "unlock").then(() => {
		window.close();
	});
}
