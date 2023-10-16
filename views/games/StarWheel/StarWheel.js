function scrollAndStopRandomly() {
	console.log("Trying to spin...");
	const ul = document.getElementById("spinner");
	const listItems = ul.getElementsByTagName("li");
	let currentIndex = 0;

	const scrollInterval = setInterval(function () {
		// Scroll to the current list item's position
		const offsetTop = listItems[currentIndex].offsetTop;
		ul.scrollTop = offsetTop;

		// Increment the current index for the next iteration
		currentIndex = (currentIndex + 1) % listItems.length;
	}, 100); // Adjust the scroll speed (in milliseconds) as needed

	// After a certain time (e.g., 5000ms or 5 seconds), stop scrolling
	setTimeout(function () {
		clearInterval(scrollInterval);

		// Choose a random index
		const randomIndex = Math.floor(Math.random() * listItems.length);

		// Get the top offset of the selected list item
		const offsetTop = listItems[randomIndex].offsetTop;

		// Scroll to the selected list item's position
		ul.scrollTop = offsetTop;
	}, 2000); // Adjust the stop time (in milliseconds) as needed
}
