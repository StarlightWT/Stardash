//Update profile info
async function loadProfileInfo() {
	const profile = await window.electronAPI.getProfile();
	const usernameBox = document.getElementById("username");
	const avatar = document.getElementById("avatar");
	const discord = document.getElementById("discord");
	usernameBox.innerHTML = profile.username;
	avatar.setAttribute("src", profile.avatarUrl);
	discord.innerHTML = "@" + profile.discordUsername;

	const DBprofile = await window.electronAPI.getDBProfile(profile._id);
	switch (DBprofile[0]._doc.role) {
		case "lockee":
			//Lock dash
			break;
		case "keyholder":
			//KH dash
			break;
		case "switch":
			//Both dashes
			break;
	}
}

loadProfileInfo();

//Get buttons
const homeBtn = document.getElementById("nav_home");
const gamesBtn = document.getElementById("nav_games");
const settingstButton = document.getElementById("nav_settings");

//Send redirect requests
homeBtn.addEventListener("click", () => {
	window.electronAPI.redirect("home");
});
gamesBtn.addEventListener("click", () => {
	window.electronAPI.redirect("games");
});
//Get logout button, request logout
settingstButton.addEventListener("click", () => {
	console.log("Requesting settings page...");
	window.electronAPI.redirect("settings");
});
