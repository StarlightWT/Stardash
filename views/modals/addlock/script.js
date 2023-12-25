async function addLock() {
	const input = document.getElementById("input");
	const errors = document.getElementById("errors");

	Array.from(errors.children).forEach((child) => {
		child.className = "";
	});

	const inputValue = input.value.replace(" ", "");
	if (inputValue != 32)
		return (document.getElementById("invalidToken").className = "show");
	const response = await window.electronAPI.lock("", "setKH", inputValue);

	let error;
	if (response == 1) error = document.getElementById("invalidToken");
	if (response == 2) error = document.getElementById("selfKH");
	if (response == 3) error = document.getElementById("alreadyused");

	if (error) error.className = "show";

	if (!error) window.close();
}
