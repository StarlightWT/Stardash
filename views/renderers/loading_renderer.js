setInterval(async () => {
	if ((await window.electronAPI.loaded()) == 1)
		window.electronAPI.redirect("home");

	switch (i) {
		case 0:
			loadingText.innerHTML = "Loading.";
			i++;
			break;
		case 1:
			loadingText.innerHTML = "Loading..";
			i++;
			break;
		case 2:
			loadingText.innerHTML = "Loading...";
			i = 0;
			break;
	}
}, 1000);

const loadingText = document.getElementById("loadingText");
var i = 0;
