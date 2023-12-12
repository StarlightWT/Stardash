const mongoose = require("mongoose");
const secret = require("../../secrets.json");
mongoose.connect(secret.DATABASE_URI);
var dbProfile, dbProfileId;

const userSchema = new mongoose.Schema({
	username: String,
	id: String,
	discordId: String,
	subscribed: Boolean,
	tier: String,
	role: String,
});

const lockSchema = new mongoose.Schema({
	id: String,
	userId: String,
	modules: Array,
});

const userModel = mongoose.model("User", userSchema, "users");
const lockModel = mongoose.model("Lock", lockSchema, "locks");

async function createNewUser(username, id, role) {
	if (!username || !id || !role) return;
	if (role == "unspecified") role = "switch";
	var user = new userModel({
		username: username,
		id: id,
		discordId: null,
		subscribed: false,
		tier: "Basic",
		role: role,
	});

	const search = await findUser(id);
	if (search.length > 0) {
		user.updateOne(search._id);
	} else {
		user.save();
	}
	return user;
}

async function findUser(_id) {
	dbProfileId = _id;
	const search = await userModel.find({ id: _id });
	return search;
}

setInterval(() => {
	if (!dbProfileId) return;
	dbProfile = findUser(dbProfileId);
}, 5000);

async function getUser(_id) {
	if (dbProfileId != _id) return findUser(_id);
	return dbProfile;
}

async function setUserRole(_id, role) {
	await userModel.findOneAndUpdate({ id: _id }, { role: role });
	return 1;
}

async function createLock(id, userId) {
	if ((await getLock({ id: id })) != -1) return 1;
	const lock = new lockModel({
		id: id,
		userId: userId,
	});
	lock.save();
	return lock;
}

async function getLock(searchObject) {
	const lock = await lockModel.find(searchObject).lean();
	if (lock.length > 0) {
		return lock;
	}
	return -1;
}

async function assignTask(lockId, taskTitle, action) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	let taskModule = lock.modules.find((obj) => obj.name == "Tasks");
	const task = taskModule.taskList.find((obj) => obj.title == taskTitle);

	let assignedTasks;

	if (action == "assign") {
		let taskList = [];
		assignedTasks = taskModule.assignedTasks;
		let taskListed = false;
		taskModule.taskList.forEach((task) => {
			if (task.title != taskTitle) taskList.push(task);
			else taskListed = true;
		});
		if (!taskListed) return 1;
	}
	if (action == "unassign") {
		assignedTasks = [];
		let taskAssigned = false;
		taskModule.assignedTasks.forEach((task) => {
			if (task.title != taskTitle) assignedTasks.push(task);
			else taskAssigned = true;
		});
		if (!taskAssigned) return 1;

		let taskList = taskModule.taskList;
		taskList.push(task);
	}

	assignedTasks.push(task);

	return await lockModel
		.findOneAndUpdate(
			{ id: lockId },
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

async function logTask(lockId, log) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	let taskModule = lock.modules.find((obj) => obj.name == "Tasks");
	await unassignTask(lockId, log.title);

	const taskLog = taskModule.taskLog;

	let newTaskLog = [log];
	for (let i = 1; i < 3; i++) {
		newTaskLog[i] = taskLog[i - 1] ?? {};
	}

	return await lockModel
		.findOneAndUpdate(
			{ id: lockId },
			{
				$set: {
					"modules.$[elem].taskLog": newTaskLog,
				},
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}

async function toggleModule(lockId, module) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	let moduleDB = lock.modules.find((obj) => obj.name == "Tasks");
	return await lockModel
		.findOneAndUpdate(
			{ id: lockId },
			{
				$set: { "modules.$[elem].enabled": !moduleDB.enabled },
			},
			{ arrayFilters: [{ "elem.name": module }], new: true }
		)
		.lean();
}

async function addTask(lockId, taskObj, action) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	let moduleDB = lock.modules.find((obj) => obj.name == "Tasks");

	let newTaskList;
	if (action == "add") {
		newTaskList = moduleDB.taskList;
		newTaskList.push(taskObj);
	}

	if (action == "remove" || action == "rem") {
		newTaskList = [];
		let removed = false;
		moduleDB.taskList.forEach((task) => {
			if (task.title != taskObj.title) newTaskList.push(task);
			else removed = true;
		});
		if (!removed) return 1;
	}

	return await lockModel
		.findOneAndUpdate(
			{ id: lockId },
			{
				$set: { "modules.$[elem].taskList": newTaskList },
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}

async function taskAction(action, options) {
	switch (action) {
		case "assign":
		case "unassign":
			return await assignTask(options.id, options.taskTitle, action);
		case "log":
			return await logTask(options.id, options.log);
		case "add":
		case "remove":
		case "rem":
			return await addTask(options.id, options.task, action);
	}
}

module.exports = {
	createNewUser,
	getUser,
	setUserRole,
	getLock,
	createLock,
	taskAction,
	toggleModule,
};
