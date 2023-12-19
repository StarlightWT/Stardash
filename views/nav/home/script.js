async function initialize() {
	const activities = await window.electronAPI.get("activities", {
		amount: 10,
		reset: true,
	});
	appendActivities(activities);
}

initialize();

function appendActivities(activities) {
	const activityFeed = document.getElementById("activity");
	activities.forEach((activity) => {
		const activityLi = document.createElement("li");

		const title = document.createElement("h1");
		title.innerHTML = activity.title;

		const description = document.createElement("h2");
		description.innerHTML =
			activity.description + activity.description + activity.description;

		const icon = document.createElement("i");
		icon.className = activity.icon;

		const Date = document.createElement("h3");
		activityLi.append(title, description, icon, Date);
		activityFeed.append(activityLi);
	});
	const loadMoreButton = document.createElement("li");
	loadMoreButton.id = "loadMoreBtn";
	loadMoreButton.innerHTML = "Load More...";
	loadMoreButton.onclick = async (e) => {
		const activitiesSearch = await window.electronAPI.get("activities", {
			amount: 10,
			reset: false,
		});
		loadMoreButton.remove();
		appendActivities(activitiesSearch);
	};
	if (activities.length == 10) activityFeed.append(loadMoreButton);
}
