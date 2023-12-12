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
			//Task list

			//Settings
			const settingsGrid = document.createElement("div");
			settingsGrid.className = "settingsGrid";
			// const settings = [
			// 	{
			// 		title: "Add a task",
			// 		input: `<i class="fa-solid fa-plus" style="color: #ffffff;" onclick=addtask()></i>`,
			// 	},
			// 	{
			// 		title: "Get tasks from",
			// 		input: `<select id="getTasksSelect">
			// 	<option value="0">No one</option>
			// 	<option value="1">Keyholder</option>
			// 	<option value="2">Everyone</option>
			// </select>`,
			// 	},
			// 	{ title: "AddTask", input: `<button onclick="addtask()"></button>` },
			// 	{ title: "AddTask", input: `<button onclick="addtask()"></button>` },
			// 	{ title: "AddTask", input: `<button onclick="addtask()"></button>` },
			// 	{ title: "AddTask", input: `<button onclick="addtask()"></button>` },
			// ];
			// settings.forEach((setting) => {
			// 	container.append(title);
			// 	container.innerHTML += setting.input;
			// 	settingsGrid.append(container);
			// });

			//Settings
			const addTaskContainer = document.createElement("div");
			addTaskContainer.className = "setting_container";
			const addTaskTitle = document.createElement("h2");
			addTaskTitle.innerHTML = "Add a task";

			const addTaskBtn = document.createElement("i");
			addTaskBtn.classList.add("fa-solid", "fa-plus");
			addTaskBtn.onclick = (e) => {
				window.electronAPI.lock(DBLock.id);
				window.electronAPI.redirect("addtask", true);
				redirected = true;
			};
			addTaskContainer.append(addTaskTitle, addTaskBtn);

			const getTasksFromContainer = document.createElement("div");
			getTasksFromContainer.className = "setting_container";
			const getTasksFromTitle = document.createElement("h2");
			getTasksFromTitle.innerHTML = "Get tasks from";

			const getTasksFromSelect = document.createElement("select");
			const noOne = document.createElement("option");
			noOne.value = 0;
			noOne.innerText = "No one";
			const KH = document.createElement("option");
			KH.value = 1;
			KH.innerText = "Keyholder";
			const Anyone = document.createElement("option");
			Anyone.value = 2;
			Anyone.innerText = "Anyone";

			getTasksFromSelect.append(noOne, KH, Anyone);

			getTasksFromContainer.append(getTasksFromTitle, getTasksFromSelect);

			settingsGrid.append(addTaskContainer, getTasksFromContainer);
			//Settings

			body.append(taskList, settingsGrid);
			break;
	}
}

async function remove(element) {
	const taskTitle = element.parentElement.innerText;
	DBLock = await window.electronAPI.taskAction("rem", {
		id: DBLock.id,
		task: { title: taskTitle },
	});
	console.log(DBLock);

	openModule(activeModule);
}

window.onfocus = async (e) => {
	if (redirected) {
		DBLock = await window.electronAPI.DBlock("get");
		openModule(activeModule);
	}
};
