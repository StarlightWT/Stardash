module.exports = {
	createNewUser,
	createLock,
	createActivity,
};
const { lockHistoryModel, activityModel } = require("../../schemas");
const { userModel, lockModel, taskModel, ruleModel } = require("../../schemas");
const { getLock, getUser, clearCache } = require("./db_get");
/**
 *
 * @param {String} username User's username
 * @param {String} id User's id
 * @returns new user record
 */
async function createNewUser(username, id) {
	if (!username) return;

	let token = await checkUniqueToken(makeid(32));

	var user = new userModel({
		username: username,
		id: id,
		token: token,
		stats: {
			totalLockedTime: 0,
			longestLockedTime: 0,
		},
		discordId: null,
		subscribed: false,
		tier: "Basic",
		role: "switch",
		achievements: [],
	});

	user.save();
	return user;
}

/**
 *
 * @param {String} token
 * @returns a unique token that has not been used in the database yet
 */
async function checkUniqueToken(token) {
	let search = await userModel.find({ token: token });
	if (search.length == 0) return token;
	else token = makeid(32);
	return checkUniqueToken(token);
}

async function checkUniqueID(id) {
	let search = await lockModel.find({ id: id });
	if (search.length == 0) return id;
	else id = makeid(32);
	return checkUniqueID(id);
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
/**
 *
 * @param {Object} options Data
 * @returns a new lock database record, 1 = User already has a lock
 */
async function createLock(options) {
	if ((await getLock(options.id)) != 1) return 1;
	const user = await getUser(options.id);
	let lockID = await checkUniqueID(makeid(32));
	const lock = new lockModel({
		id: lockID,
		user: user,
		endsAt: options.endsAt,
		timeLimit: options.limit,
		combination: {
			type: options.comboType,
			combination: options.comboObj,
		},
		modules: options.modules, // Array of modules
	});
	await lock.save();
	const lockHistory = new lockHistoryModel({
		lockID: lockID,
		history: [],
	});
	await lockHistory.save();
	clearCache();
	return lock.id;
}

async function createActivity(activity) {
	const title = activity.title;
	const icon = activity.icon;
	switch (activity) {
		case "newLock":
			break;
	}
	const record = new activityModel({
		title: title,
		icon: icon,
		userID: activity.userID,
		lockID: activity.lockID,
		Date: Date.now(),
		interactions: [],
	});
	return await record.save();
}
