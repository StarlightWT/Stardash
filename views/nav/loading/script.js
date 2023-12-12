window.electronAPI.active("loading");

let network;
const networkStatus = document.getElementById("network");
setInterval(async () => {
	if (navigator.onLine) {
		network = true;
		networkStatus.classList.add("hidden");
	} else {
		network = false;
		networkStatus.classList.remove("hidden");
	}
	if (network && (await window.electronAPI.loaded()) == 1)
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
var i = 0,
	j = 0;
