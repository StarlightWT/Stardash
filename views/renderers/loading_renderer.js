setInterval(async () => {
	if ((await window.electronAPI.loaded()) == 1)
		window.electronAPI.redirect("home");
}, 1000);
