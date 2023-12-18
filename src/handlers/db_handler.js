const { connect } = require("mongoose");
const { DATABASE_URI } = require("../../secrets.json");

connect(DATABASE_URI);

var actions = 0,
	limit = 30;

module.exports = {
	tasks,
	get,
	create,
	lock,
};

const {
	assignTask,
	logTask,
	addTask,
	giveTask,
} = require("./database/db_tasks");
async function tasks(action, options) {
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
	return 2;
}

const { toggleModule, lockModel } = require("./database/db_modules");
async function module(action, lockId, module) {
	switch (action) {
		case "toggle":
			var response = await toggleModule(lockId, module);
			if (response === 3) removeDuplicates();
			return response;
		case "lock":
			var response = await lockModel(lockId, module);
			if (response === 3) removeDuplicates();
			return response;
	}
	return 2;
}

const { createNewUser, createLock } = require("./database/db_create");
async function create(what, option, option2) {
	switch (what) {
		case "user":
			return await createNewUser(option, option2);
		case "lock":
			return await createLock(option);
	}
	return 2;
}

const {
	getUser,
	getLock,
	getLockHistory,
	getCombination,
	getKHLocks,
} = require("./database/db_get");
async function get(what, option) {
	switch (what) {
		case "user":
			return await getUser(option);
		case "lock":
			return await getLock(option);
		case "history":
			return await getLockHistory(option);
		case "combination":
			return await getCombination(option);
		case "locks":
			return await getKHLocks(option);
	}
	return 2;
}

const { modifyTime, timerVisibility } = require("./database/db_action");

async function lock(id, what, option) {
	switch (what) {
		case "time":
			return await modifyTime(id, option);
		case "timer":
			return await timerVisibility(id, option);
		case "timeLog":
			return await timeLogVisibility(id, option);
		case "freeze":
			return await setFreeze(id, option);
		case "history":
			return await history(id, option);
	}
	return 2;
}

setInterval(() => {
	actions = 0;
}, 60000);

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
