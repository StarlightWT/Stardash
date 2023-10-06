const tokenCopy = document.getElementById("tokenInput");
const versionCopy = document.getElementById("versionInput");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logout");
const body = document.getElementById("body");
const devTrigger = document.getElementById("dev_mode_trigger");
const devTriggerBtn = document.getElementById("devModeTrigger");
const devTools = document.getElementById("dev_tools");
const checkUpdateBtn = document.getElementById("checkUpdate");
var devMode = false;

async function loadsettings() {
	//Get token
	const chasterProfile = await window.electronAPI.getProfile();
	var dbProfile = await window.electronAPI.getDBProfile(chasterProfile._id);
	if (dbProfile) dbProfile = dbProfile[0]._doc;
	console.log(chasterProfile);
	console.log(dbProfile);

	tokenCopy.value = dbProfile.id; //Set token into field
	//Check for dev mode
	if (dbProfile.role == "developer") devTrigger.style = "display: flex";

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
}

loadsettings();

function checkUpdate() {
	window.electronAPI.checkUpdate();
}

// checkUpdateBtn.addEventListener("click", () => {
// 	window.electronAPI.checkUpdate()
// })

tokenCopy.addEventListener("click", () => {
	window.electronAPI.setClipboard(tokenCopy.value);
});

versionCopy.addEventListener("click", () => {
	window.electronAPI.setClipboard(versionCopy.value);
});

backBtn.addEventListener("click", () => {
	window.electronAPI.redirect("home");
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
