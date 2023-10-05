const tokenCopy = document.getElementById("tokenInput");
const versionCopy = document.getElementById("versionInput");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logout");
const body = document.getElementById("body");

async function loadsettings() {
	//Get token
	const chasterProfile = await window.electronAPI.getProfile();
	var dbProfile = await window.electronAPI.getDBProfile(chasterProfile._id);
	if (dbProfile) dbProfile = dbProfile[0]._doc;
	console.log(chasterProfile);
	console.log(dbProfile);

	tokenCopy.value = dbProfile.id; //Set token into field

	//Get verison
	const version = await window.electronAPI.getVersion();
	// const loaded = await window.electronAPI.updActive();
	versionCopy.value = version;

	const text = document.createElement("textarea");
	text.innerHTML = await window.electronAPI.updActive();
	body.append(text);
}

loadsettings();

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
