const mongoose = require("mongoose");
const secret = require("../../secrets.json");
const { userModel, lockModel, taskModel, ruleModel } = require("../schemas");

mongoose.connect(secret.DATABASE_URI);
var dbProfile, dbProfileId;
var actions = 0,
	limit = 30;

async function createNewUser(username, chasterId, role) {
	if (!username || !chasterId || !role) return;
	if (role == "unspecified") role = "switch";
	let search = await findUser(chasterId);
	if (search.length > 0) return 1;

	let token = await checkUniqueToken(makeid(32));
	let id = await checkUniqueId(makeid(32));

	var user = new userModel({
		username: username,
		id: id,
		token: token,
		chasterId: chasterId,
		discordId: null,
		subscribed: false,
		tier: "Basic",
		role: role,
	});

	user.save();
	return user;
}

async function checkUniqueToken(token) {
	let search = await userModel.find({ token: token });
	if (search.length == 0) return token;
	else token = makeid(32);
	return checkUniqueToken(token);
}
async function checkUniqueId(id) {
	let search = await userModel.find({ id: id });
	if (search.length == 0) return id;
	else id = makeid(32);
	return checkUniqueId(id);
}

function makeid(length) {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

async function findUser(_id) {
	dbProfileId = _id;
	const search = await userModel.find({ chasterId: _id });
	return search;
}

setInterval(() => {
	if (!dbProfileId) return;
	dbProfile = findUser(dbProfileId);
}, 5000);

async function getUser(_id) {
	if (dbProfileId != _id) return await findUser(_id);
	return dbProfile;
}

async function setUserRole(chasterId, role) {
	await userModel.findOneAndUpdate({ chasterId: chasterId }, { role: role });
	return 1;
}

async function createLock(id, userId) {
	if ((await getLock({ id: id })) != -1) return 1;
	if (
		(await getLock({
			$or: [{ "user.chasterId": userId }, { "user.id": userId }],
		})) != -1
	)
		return 1;

	const user = await userModel.findOne({
		$or: [{ chasterId: userId }, { id: userId }],
	});
	const lock = new lockModel({
		id: id,
		user: user,
		modules: [new taskModel(), new ruleModel()],
	});
	lock.save();
	return lock;
}

async function getLock(searchObject) {
	const lock = await lockModel.find(searchObject).lean();
	if (lock.length == 1) {
		return lock;
	}
	if (lock.length > 1) {
		await removeDuplicates();
		return lock;
	}
	return -1;
}

async function removeDuplicates() {
	try {
		const duplicates = await lockModel.aggregate([
			{
				$group: {
					_id: { fieldToCheck: "user.id" },
					count: { $sum: 1 },
					docs: { $push: "$_id" },
				},
			},
			{
				$match: {
					count: { $gt: 1 },
				},
			},
		]);

		const deletionPromises = duplicates.map(async (duplicate) => {
			const [keepDocId, ...deleteDocIds] = duplicate.docs;

			// Keep the first document and delete the rest
			await lockModel.deleteMany({ _id: { $in: deleteDocIds } });
		});

		await Promise.all(deletionPromises);
	} catch (error) {}
}

async function assignTask(lockId, taskTitle, action) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	let taskModule = lock.modules.find((obj) => obj.name == "Tasks");
	let assignedTasks;
	let taskList;

	if (action == "assign") {
		const task = taskModule.taskList.find((obj) => obj.title == taskTitle);
		taskList = [];
		assignedTasks = taskModule.assignedTasks;
		let taskListed = false;
		taskModule.taskList.forEach((task) => {
			console.log(task.title != taskTitle);
			if (task.title != taskTitle) taskList.push(task);
			else taskListed = true;
		});
		if (!taskListed) return 1;
		assignedTasks.push(task);
	}
	if (action == "unassign") {
		const task = taskModule.assignedTasks.find((obj) => obj.title == taskTitle);

		assignedTasks = [];
		let taskAssigned = false;
		taskList = taskModule.taskList;
		taskModule.assignedTasks.forEach((task) => {
			if (task.title != taskTitle) assignedTasks.push(task);
			else taskAssigned = true;
		});
		if (!taskAssigned) return -1;
		taskList.push(task);
	}

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
	await assignTask(lockId, log.title, "unassign");

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
	let moduleDB = lock.modules.find((obj) => obj.name == module);
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
async function lockModule(lockId, module) {
	let lock = await lockModel.find({ id: lockId });
	lock = lock[0];
	return await lockModel
		.findOneAndUpdate(
			{ id: lockId },
			{
				$set: { "modules.$[elem].locked": true },
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

async function giveTask(id, state) {
	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: { "modules.$[elem].giveTasks": state },
			},
			{ arrayFilters: [{ "elem.name": "Tasks" }], new: true }
		)
		.lean();
}

async function taskAction(action, options) {
	if (actions > limit) return 2; //Error 2 -> Too many requests
	actions++;
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
		case "giveTask":
			return await giveTask(options.id, options.state);
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
	lockModule,
};

setInterval(() => {
	actions = 0;
}, 60000);
