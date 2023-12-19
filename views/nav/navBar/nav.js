const repNav = document.getElementById("replace_nav");
fetch("../navBar/nav.html").then(async (nav) => {
	var newBar = document.createElement("nav");
	newBar.innerHTML = await nav.text();
	repNav.replaceWith(newBar);
	document.body.scrollTop = document.documentElement.scrollTop = 0; //Scroll to the top so new bar is visible
});

function redirect(location) {
	window.electronAPI.redirect(location);
}
