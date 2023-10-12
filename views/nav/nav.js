//Update profile info
async function loadProfileInfo() {
	const profile = await window.electronAPI.get("profile");
	const usernameBox = document.getElementById("username");
	const avatar = document.getElementById("avatar");
	const discord = document.getElementById("discord");
	usernameBox.innerHTML = profile.username;
	avatar.setAttribute("src", profile.avatarUrl);
	discord.innerHTML = "@" + profile.discordUsername;
}

loadProfileInfo();

//Get buttons
const homeBtn = document.getElementById("nav_home");
const gamesBtn = document.getElementById("nav_games");
const settingstButton = document.getElementById("nav_settings");

function redirect(location) {
	window.electronAPI.redirect(location);
}
