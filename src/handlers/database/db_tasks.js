module.exports = {
	changeTasks,
	logTask,
	setTask,
	taskSettings,
};

const { lockModel } = require("../../schemas");
const { getLock } = require("./db_get");
/**
 *
 * @param {String} id Lock's ID
 * @param {Object} Task Task to be removed/added
 * @param {String} Action Add/Remove a task
 * @returns updated lock record, 1 = Task was not found
 */
async function changeTasks(id, Task, Action) {
	const lock = getLock(id);
	let moduleDB = lock.modules.find((obj) => obj.name == "Tasks");

	let newTaskList;
	if (Action == "add") {
		newTaskList = moduleDB.taskList;
		newTaskList.push(Task);
	}

	if (Action == "remove") {
		newTaskList = [];

		let removed = false; //Add a check that a record was removed

		moduleDB.taskList.forEach((task) => {
			if (task.title != Task.title) newTaskList.push(task);
			else removed = true;
		});
		if (!removed) return 1;
	}

	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: { "modules.$[elem].taskList": newTaskList },
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}
/**
 *
 * @param {String} id Lock's ID
 * @param {Object} Settings {giveTasks, public}
 * @returns an updated lock record
 */
async function taskSettings(id, Settings) {
	const lock = getLock(id);
	let { giveTasks, public } = Settings;
	if (!giveTasks) giveTasks = lock.tasks.giveTasks;
	if (!public) public = lock.tasks.public;
	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: {
					"modules.$[elem].giveTasks": giveTasks,
					"modules.$[elem].public": public,
				},
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}
/**
 *
 * @param {String} id Lock's ID
 * @param {String} TaskTitle Task's title to set
 * @param {String} Action assing/unassing a task
 * @returns
 */
async function setTask(id, TaskTitle, Action) {
	const lock = await getLock(id);
	let taskModule = lock.modules.find((obj) => obj.name == "Tasks");

	let assignedTasks, taskList;

	if (Action == "assign") {
		const task = taskModule.taskList.find((obj) => obj.title == TaskTitle);
		taskList = [];
		assignedTasks = taskModule.assignedTasks;
		let taskListed = false;
		taskModule.taskList.forEach((task) => {
			console.log(task.title != TaskTitle);
			if (task.title != TaskTitle) taskList.push(task);
			else taskListed = true;
		});
		if (!taskListed) return 1;
		assignedTasks.push(task);
	}
	if (Action == "unassign") {
		const task = taskModule.assignedTasks.find((obj) => obj.title == TaskTitle);

		assignedTasks = [];
		let taskAssigned = false;
		taskList = taskModule.taskList;
		taskModule.assignedTasks.forEach((task) => {
			if (task.title != TaskTitle) assignedTasks.push(task);
			else taskAssigned = true;
		});
		if (!taskAssigned) return -1;
		taskList.push(task);
	}

	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: {
					"modules.$[elem].assignedTasks": assignedTasks,
					"modules.$[elem].taskList": taskList,
				},
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}

/**
 *
 * @param {String} id  Lock's ID
 * @param {Object} log Log object
 * @returns an updated lock record
 */
async function logTask(id, log) {
	const lock = await getLock(id);
	let taskModule = lock.modules.find((obj) => obj.name == "Tasks");
	await setTask(id, log.title, "unassign");

	const taskLog = taskModule.taskLog;

	let newTaskLog = [log];
	for (let i = 1; i < 3; i++) {
		newTaskLog[i] = taskLog[i - 1] ?? {};
	}

	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: {
					"modules.$[elem].taskLog": newTaskLog,
				},
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}
