const tokenCopy = document.getElementById("tokenInput");
const versionCopy = document.getElementById("versionInput");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logout");
const body = document.getElementById("body");
const devTrigger = document.getElementById("dev_mode_trigger");
const devTriggerBtn = document.getElementById("devModeTrigger");
const devTools = document.getElementById("dev_tools");
const checkUpdateBtn = document.getElementById("checkUpdate");
const roleSelect = document.getElementById("role");
const startOnBootSelect = document.getElementById("startOnBoot");
var devMode = false;
var change = false;
async function loadsettings() {
	const user = await window.electronAPI.get("user");

	tokenCopy.value = user.token; //Set token into field
	//Check for dev mode
	console.log(user.tier);
	if (user.tier.toLowerCase() == "developer")
		devTrigger.style = "display: flex";

	//Get verison
	const version = await window.electronAPI.getVersion();

	const bootOnStart = await window.electronAPI.bootOnStart("get");
	startOnBootSelect.checked = bootOnStart;
	startOnBootSelect.onclick = () => {
		window.electronAPI.bootOnStart(startOnBootSelect.checked);
	};
	// const loaded = await window.electronAPI.updActive();
	versionCopy.value = version;
	if (devMode) {
		devTools.style = "display: flex";
		const text = document.getElementById("UpdateStatus");
		setInterval(async () => {
			text.innerHTML = await window.electronAPI.getStatus();
		}, 500);
	} else {
		devTools.style = "display: none";
	}

	roleSelect.value = user.role;
}

loadsettings();

function checkUpdate() {
	window.electronAPI.checkUpdate();
}

function select(selection) {
	change = true;
	window.electronAPI.setUserRole(tokenCopy.value, selection);
}

logoutBtn.addEventListener("click", () => {
	window.electronAPI.logout();
});

devTriggerBtn.addEventListener("click", () => {
	switch (devTriggerBtn.value) {
		case "activate":
			devMode = true;
			devTriggerBtn.value = "disable";
			loadsettings();
			break;
		case "disable":
			devMode = false;
			devTriggerBtn.value = "activate";
			loadsettings();
			break;
	}
});

var saving = false;
async function saveAndExitSettings() {
	if (saving) return;
	saving = true;
	if (!change) window.electronAPI.redirect("home");
	const updatingInfoElement = document.getElementById("updatingInfo");
	updatingInfoElement.classList.add("show");
	window.electronAPI.redirect("home");
}

function copy(what) {
	const copiedInfoElement = document.getElementById("copiedInfo");
	copiedInfoElement.classList.add("show");
	window.electronAPI.setClipboard(what);
	setTimeout(() => {
		copiedInfoElement.classList.remove("show");
	}, 1000);
}
