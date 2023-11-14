//Update profile info
async function loadProfileInfo() {
	const profile = await window.electronAPI.get("profile");
	const usernameBox = document.getElementById("username");
	const avatar = document.getElementById("avatar");
	const discord = document.getElementById("discord");
	usernameBox.innerHTML = profile.username;
	avatar.setAttribute("src", profile.avatarUrl);
	// discord.innerHTML = "@" + profile.discordUsername;
}

function toggleDropdown() {
	document.getElementById("dropdown").classList.toggle("show");
	console.log("Showing...");
}

const repNav = document.getElementById("replace_nav");
fetch("../nav.html").then(async (nav) => {
	var newBar = document.createElement("nav");
	newBar.className = "dash";
	newBar.innerHTML = await nav.text();
	repNav.replaceWith(newBar);
	document.body.scrollTop = document.documentElement.scrollTop = 0; //Scroll to the top so new bar is visible
	loadProfileInfo();
	setActive(await window.electronAPI.active("get"));
});

//Get buttons

function redirect(location, modal) {
	window.electronAPI.redirect(location, modal);
}

function setActive(location) {
	const activePage = document.getElementById(location);
	activePage.classList.add("active");
}

const internetStatus = document.getElementById("internetStatus");
window.addEventListener("load", function (event) {
	detectInternet();
});
window.addEventListener("online", function (event) {
	detectInternet();
});
window.addEventListener("offline", function (event) {
	detectInternet();
});

function detectInternet() {
	if (navigator.onLine) {
		console.log("online");
		window.electronAPI.network("online");
	} else {
		console.log("offline");
		window.electronAPI.network("offline");
	}
}
