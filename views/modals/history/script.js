async function updateLockHistory() {
	//Request lock history from api
	const lockHistory = await window.electronAPI.get("history");
	//Get only latest 10 logs
	const logs = lockHistory.results;
	//Get the log list and clear it
	const logList = await document.getElementById("list");
	logList.innerHTML = "";
	//Add each log to the list
	var i = 0;
	logs.forEach((log) => {
		console.log(i);
		console.log(logs[i]);
		const entry = document.createElement("li");
		const entryTitle = document.createElement("h1");
		const entryLine = document.createElement("div");
		const entryDescription = document.createElement("p");
		const entryTime = document.createElement("h2");
		logList.append(entry);
		entry.append(entryTitle);
		entryLine.append(entryDescription);
		entryLine.append(entryTime);
		entry.append(entryLine);

		var title = logs[i].title;
		//Translate %USER% tag to username
		if (logs[i]?.title?.includes("%USER%") && logs[i].user)
			title = logs[i].user.username + logs[i].title.slice(6);
		//Translate %USER% tag to extension if not made by user
		else if (logs[i].title.includes("%USER%")) {
			var extensionTitle =
				logs[i].extension.charAt(0).toUpperCase() + logs[i].extension.slice(1);
			var temp = extensionTitle.split("-");
			extensionTitle = temp.join(" ");
			title = extensionTitle + logs[i].title.slice(6);
		}
		var logTime =
			logs[i].createdAt.slice(8, 10) +
			"/" +
			logs[i].createdAt.slice(5, 7) +
			" " +
			logs[i].createdAt.slice(11, 16);

		let logDesc = log.description;
		if (logDesc.includes("%USER%"))
			logDesc = logDesc.replace("%USER%", log.user.username);

		entryTitle.innerHTML = title;
		entryDescription.innerHTML = logDesc;
		entryTime.innerHTML = logTime;
		i++;
	});
}

updateLockHistory();

function back() {
	window.close();
}
