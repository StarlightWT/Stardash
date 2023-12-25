module.exports = {
	createNewUser,
	createLock,
	createActivity,
	createAvatar,
	createKhRequest,
};
const {
	lockHistoryModel,
	activityModel,
	requestModel,
} = require("../../schemas");
const { userModel, lockModel } = require("../../schemas");
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

	let endTimestamp = lock.endsAt - Date.now();
	let endTime = 0,
		type = "days";
	const DAY = 86400000;
	const HOUR = 3600000;
	const MINUTE = 60000;

	while (endTimestamp >= DAY) {
		endTime++;
		endTimestamp -= DAY;
	}
	if (endTime == 0) {
		while (endTimestamp >= HOUR) {
			endTime++;
			endTimestamp -= HOUR;
		}
		type = "hours";
	}
	if (endTime == 0) {
		while (endTimestamp >= MINUTE) {
			endTime++;
			endTimestamp -= MINUTE;
		}
		type = "minutes";
	}

	await createActivity({
		title: `${user.username} started a lock!`,
		icon: `<i class="fa-solid fa-user-lock"></i>`,
		description: `Starting duration:<br>${endTime} ${type}...`,
		userID: user.id,
		lockID: lock.id,
	});

	return lock.id;
}

async function createActivity(activity) {
	const title = activity.title;
	const icon = activity.icon;
	const record = new activityModel({
		title: title,
		icon: icon,
		description: activity.description ?? null,
		userID: activity.userID,
		lockID: activity.lockID,
		Date: Date.now(),
		interactions: [],
	});
	return await record.save();
}

async function createAvatar(avatarData) {
	return await userModel
		.findOneAndUpdate(
			{ id: "3UBLSrQKwv7Y4CKbucMrQZcNM0Eoorhj" },
			{
				$set: {
					avatar: avatarData,
				},
			},
			{
				new: true,
			}
		)
		.lean();
}

async function createKhRequest(lockID) {
	if (!lockID) return;
	const search = await requestModel.findOne({ lockID: lockID });

	if (search) return search;

	const request = new requestModel({
		lockID: lockID,
		token: await uniqueToken(makeid(32)),
	});

	await request.save();
	return request;
}

async function uniqueToken(token) {
	let search = await requestModel.find({ token: token });
	if (search.length == 0) return token;
	else token = makeid(32);
	return uniqueToken(token);
}
