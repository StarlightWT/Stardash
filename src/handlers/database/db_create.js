module.exports = {
	createNewUser,
	createLock,
};

const { lockHistoryModel } = require("../../schemas");
const { userModel, lockModel, taskModel, ruleModel } = require("../schemas");
const { getLock, getUser } = require("./db_get");
/**
 *
 * @param {String} username User's username
 * @returns new user record
 */
async function createNewUser(username) {
	if (!username) return;

	let token = await checkUniqueToken(makeid(32));
	let id = await checkUniqueId(makeid(32));

	var user = new userModel({
		username: username,
		id: id,
		token: token,
		discordId: null,
		subscribed: false,
		tier: "Basic",
		role: "switch",
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
/**
 *
 * @param {String} id
 * @returns a unique id that has not been used in the database yet
 */
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
/**
 *
 * @param {String} id User's ID
 * @returns a new lock database record, 1 = User already has a lock
 */
async function createLock(id) {
	if ((await getLock(id)) != 1) return 1;
	const user = await getUser(id);
	let lockID = makeid(32);
	const lock = new lockModel({
		id: lockID,
		user: user,
		modules: [new taskModel(), new ruleModel()],
	});
	lock.save();

	const lockHistory = new lockHistoryModel({
		id: lockID,
		history: [],
	});
	lockHistory.save();
	return lock;
}
