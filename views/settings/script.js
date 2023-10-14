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
var devMode = false;

async function loadsettings() {
	//Get token
	const profile = await window.electronAPI.get("profile");
	const dbprofileObject = await window.electronAPI.get("dbprofile");
	const dbprofile = dbprofileObject[0]._doc;
	console.log(profile);
	console.log(dbprofile);

	tokenCopy.value = dbprofile.id; //Set token into field
	//Check for dev mode
	if (dbprofile.role == "developer") devTrigger.style = "display: flex";

	//Get verison
	const version = await window.electronAPI.getVersion();
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

	roleSelect.value = dbprofile.role;
}

loadsettings();

function checkUpdate() {
	window.electronAPI.checkUpdate();
}

function select(selection) {
	window.electronAPI.setUserRole(tokenCopy.value, selection);
}

tokenCopy.addEventListener("click", () => {
	window.electronAPI.setClipboard(tokenCopy.value);
});

versionCopy.addEventListener("click", () => {
	window.electronAPI.setClipboard(versionCopy.value);
});

backBtn.addEventListener("click", () => {
	window.electronAPI.updateSettings().then(() => {
		window.electronAPI.redirect("home");
	});
});

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
