module.exports = {
	modifyTime,
	timerVisibility,
	timeLogVisibility,
	setFreeze,
	history,
	unlockLock,
	setKH,
};

const { lockModel, lockHistoryModel, requestModel } = require("../../schemas");
const { createActivity } = require("./db_create");
const { getLock, getLockHistory, getUser, clearCache } = require("./db_get");

/**
 *
 * @param {String} id Lock's ID
 * @param {Int} time Timestamp negative values remove time, positive add
 * @returns an updated lock schema
 */
async function modifyTime(id, time) {
	const lock = await getLock(id);
	let newLockTime = parseInt(lock.endsAt);
	if (!time) return 1;
	newLockTime += time;
	const response = await lockModel
		.findOneAndUpdate({ id: lock.id }, { endsAt: newLockTime }, { new: true })
		.lean();

	clearCache();
	return await response;
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New timer's visiblity (true = visible)
 * @returns updated lock record
 */
async function timerVisibility(id, state) {
	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{ $set: { "settings.timerVisible": state } },
			{ new: true }
		)
		.lean();
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New lock's time log visiblity (true = visible)
 * @returns updated lock record
 */
async function timeLogVisibility(id, state) {
	return await lockModel.findOneAndUpdate(
		{ id: id },
		{ $set: { "settings.timeLogsVisible": state } },
		{ new: true }
	);
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Boolean} state New lock's frozen state (true = frozen)
 * @returns updated lock record
 */
async function setFreeze(id, option) {
	if (option.state == false) {
		let newEnd = Date.now() + (option.endsAt - option.frozenAt);
		return await lockModel
			.findOneAndUpdate(
				{ id: id },
				{ $set: { frozenAt: null, endsAt: newEnd.toString() } },
				{ new: true }
			)
			.lean();
	} else
		return await lockModel
			.findOneAndUpdate(
				{ id: id },
				{ $set: { frozenAt: Date.now().toString() } },
				{ new: true }
			)
			.lean();
}

/**
 *
 * @param {String} id Lock's ID
 * @param {Object} log New log
 * @returns updated history record
 */
async function history(id, log) {
	const History = await getLockHistory(id);
	let newLogs = History.history;
	if (!log) return 4;
	newLogs.append(log);
	return await lockHistoryModel.findOneAndUpdate(
		{ id: id },
		{ $set: { history: newLogs } },
		{ new: true }
	);
}

async function unlockLock(id) {
	const lock = await getLock(id);
	if (!lock) return 1;
	const user = await getUser(lock.user.id);

	let lockedTime = Date.now() - lock.createdAt;

	user.stats.totalLockedTime = user.stats.totalLockedTime + lockedTime;
	if (user.stats.longestLockedTime < lockedTime)
		user.stats.longestLockedTime = lockedTime;

	var months = 0,
		weeks = 0,
		days = 0,
		hours = 0,
		minutes = 0;

	const MONTH = 2629800000;
	const WEEK = 604800000;
	const DAY = 86400000;
	const HOUR = 3600000;
	const MINUTE = 60000;

	while (lockedTime >= MONTH) {
		months++;
		lockedTime -= MONTH;
	}
	while (lockedTime >= WEEK) {
		weeks++;
		lockedTime -= WEEK;
	}
	while (lockedTime >= DAY) {
		days++;
		lockedTime -= DAY;
	}
	while (lockedTime >= HOUR) {
		hours++;
		lockedTime -= HOUR;
	}
	while (lockedTime >= MINUTE) {
		minutes++;
		lockedTime -= MINUTE;
	}

	let resultString = "";
	if (months > 0) resultString += `${months} months, `;
	if (weeks > 0) resultString += `${weeks} weeks, `;
	if (days > 0) resultString += `${days} days, `;
	if (hours > 0) resultString += `${hours} hours, `;
	if (minutes > 0) resultString += `${minutes} minutes`;
	if (resultString == "") resultString = "error";
	await createActivity({
		title: `${user.username} unlocked!`,
		icon: `<i class="fa-solid fa-unlock"></i>`,
		description: `Total locked time:<br>${resultString}`,
		userID: user.id,
		lockID: lock.id,
	});

	await lockModel.findOneAndDelete({ id: id });
	await lockHistoryModel.findOneAndDelete({ lockID: id });
	await requestModel.findOneAndDelete({ lockID: id });
	clearCache();

	return 0;
}

async function setKH(token, khID) {
	const search = await requestModel.findOne({ token: token });
	if (!search) return 1; //Not found
	const lockSearch = await lockModel.findOne({ id: search.lockID });

	if (lockSearch.user.id === khID) return 2; //Can't be your own KH
	if (lockSearch.khId != null) return 3; //Already Taken
	const result = await lockModel.findOneAndUpdate(
		{ id: search.lockID },
		{
			$set: {
				khId: khID,
			},
		},
		{ new: true }
	);

	await requestModel.findOneAndDelete({ lockID: search.lockID });

	return await result.lean();
}
