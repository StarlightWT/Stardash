let DBLock;
let redirected = false;
let activeModule = null;
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
	body.innerHTML = "";
	const moduleDB = DBLock.modules.find((obj) => obj.name === module);

	activeModule = module;

	//Module active toggle

	const moduleActiveToggle = document.createElement("h4");
	moduleActiveToggle.id = "activeToggle";
	if (moduleDB.enabled) moduleActiveToggle.innerText = "Disable";
	else moduleActiveToggle.innerText = "Enable";
	moduleActiveToggle.onclick = async (e) => {
		DBLock = await window.electronAPI.toggleModule(DBLock.id, module);
		setModules(DBLock);
		openModule(module);
	};

	body.append(moduleActiveToggle);

	//Module active toggle

	switch (module) {
		case "Tasks":
			//Task list
			body.className = "tasks";
			const taskList = document.createElement("ul");
			const taskListTitle = document.createElement("h2");
			taskListTitle.innerText = "Tasks";
			taskListTitle.className = "elmTitle";
			taskList.append(taskListTitle);
			moduleDB.taskList.forEach((task) => {
				const taskElm = document.createElement("li");
				taskElm.innerHTML =
					task.title +
					`<i class="fa-solid fa-xmark" onclick="remove(this)"></i>`;

				taskList.append(taskElm);
			});
			const taskListAdd = document.createElement("i");
			taskListAdd.classList.add("fa-solid", "fa-plus", "addbutton");
			taskListAdd.onclick = (e) => {
				window.electronAPI.lock(DBLock.id);
				window.electronAPI.redirect("addtask", true);
				redirected = true;
			};
			taskList.append(taskListAdd);
			//Task list

			body.append(taskList);
			break;
	}
}

window.onfocus = async (e) => {
	if (redirected) {
		console.log("GETTING DB LOCK");
		DBLock = await window.electronAPI.DBlock("get");
		// console.log(DBLock);;
		openModule(activeModule);
	}
};
