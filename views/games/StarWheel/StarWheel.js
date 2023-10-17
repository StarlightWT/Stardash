function scrollList() {
	const list = document.getElementById("spinner");
	const listItems = list.querySelectorAll("li");
	let scrollSpeed = 25; // Initial scroll speed
	const deceleration = 0.9; // Rate of deceleration
	let currentItem = 0;
	let targetItem = Math.floor(Math.random() * listItems.length);
	let = false;

	function scroll() {
		if (!slowingDown) {
			list.scrollTop += scrollSpeed;

			if (list.scrollTop >= list.scrollHeight - list.clientHeight) {
				list.scrollTop = 0; // Reset to the top when reaching the end
			}
		} else {
			if (list.scrollTop >= listItems[targetItem].offsetTop) {
				clearInterval(scrollInterval);
			} else {
				list.scrollTop += scrollSpeed;
				scrollSpeed -= deceleration;

				if (scrollSpeed < 0) {
					scrollSpeed = 0; // Ensure it doesn't become negative
				}
			}
		}

		if (
			!slowingDown &&
			list.scrollTop >=
				listItems[currentItem].offsetTop + listItems[currentItem].clientHeight
		) {
			currentItem++;
			if (currentItem === listItems.length) {
				currentItem = 0;
			}
		}

		if (currentItem === targetItem) {
			slowingDown = true;
		}
	}

	// Change the scroll speed by adjusting the second argument (e.g., 20 for faster)
	const scrollInterval = setInterval(scroll, 20);
}

// Call the scrollList function to start scrolling
scrollList();
