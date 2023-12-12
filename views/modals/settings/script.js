let DBLock;

async function initialize() {
	lock = await window.electronAPI.get("lock");
	lock = lock[0];
	DBLock = await window.electronAPI.getDBLock(lock._id);
	DBLock = DBLock[0];

	setModules(DBLock);
}

function setModules(DBLock) {
	const moduleList = document.getElementById("moduleList");
	moduleList.innerHTML = "";
	DBLock.modules.forEach((module) => {
		let moduleLi = document.createElement("li");
		let active = "nochange";
		if (module.enabled) active = "active";
		else active = "inactive";
		moduleLi.innerHTML =
			module.name + `<i class="fa-solid fa-circle activeStatus ${active}"></i>`;
		if (!module.locked) {
			moduleLi.innerHTML += `<i class="fa-solid fa-lock-open lockStatus"></i>`;

			moduleLi.onclick = (e) => {
				openModule(moduleLi.innerText);
			};
		} else {
			moduleLi.className = "locked";
			moduleLi.innerHTML += `<i class="fa-solid fa-lock lockStatus"></i>`;
		}
		moduleList.append(moduleLi);
	});
}

initialize();

function back() {
	window.electronAPI.redirect("home");
}

function openModule(module) {
	const body = document.getElementById("container");
	body.classList.remove("hidden");
	body.innerHTML = "";
	const moduleDB = DBLock.modules.find((obj) => obj.name === module);

	//Module active toggle

	const moduleActiveToggle = document.createElement("input");
	moduleActiveToggle.type = "checkbox";
	moduleActiveToggle.value = moduleDB.enabled;
	moduleActiveToggle.onclick = async (e) => {
		DBLock = await window.electronAPI.toggleModule(DBLock.id, module);
		setModules(DBLock);
	};

	body.append(moduleActiveToggle);

	//Module active toggle

	switch (module) {
		case "Tasks":
			//Task list
			const taskList = document.createElement("ul");
			const taskListTitle = document.createElement("h2");
			taskListTitle.innerText = "Task list";
			taskListTitle.class = "elmTitle";
			taskList.append(taskListTitle);
			moduleDB.taskList.forEach((task) => {
				const taskElm = document.createElement("li");
				taskElm.innerHTML = task.title;

				taskList.append(taskElm);
			});
			//Task list

			body.append(taskList);
			break;
	}
}
