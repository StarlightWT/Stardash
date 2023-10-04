const tokenCopy = document.getElementById("tokenInput");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logout");

async function loadsettings() {
	//Get token
	const chasterProfile = await window.electronAPI.getProfile();
	var dbProfile = await window.electronAPI.getDBProfile(chasterProfile._id);
	if (dbProfile) dbProfile = dbProfile[0]._doc;
	console.log(chasterProfile);
	console.log(dbProfile);
	tokenCopy.value = dbProfile.id; //Set token into field
}

loadsettings();

tokenCopy.addEventListener("click", () => {
	window.electronAPI.setClipboard(tokenCopy.value);
});

backBtn.addEventListener("click", () => {
	window.electronAPI.redirect("home");
});

logoutBtn.addEventListener("click", () => {
	window.electronAPI.logout();
});
