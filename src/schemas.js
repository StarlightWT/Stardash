const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	username: String,
	id: String,
	chasterId: String,
	token: String,
	discordId: String,
	subscribed: Boolean,
	stats: {
		totalLockedTime: String,
		longestLockedTime: String,
	},
	tier: { type: String, default: "Basic" },
	role: { type: String, default: "switch" },
	achievements: [],
	avatar: { data: Buffer, contentType: String },
});

const lockSchema = new Schema({
	id: String,
	user: userSchema,
	khId: { type: String, default: null },
	createdAt: { type: String, default: Date.now() },
	frozenAt: { type: String, default: null },
	endsAt: { type: String, required: true },
	timeLimit: { type: String, default: null }, //Max lock time
	unlockedAt: { type: String, default: null }, //When temporary unlocked
	settings: {
		timerVisible: { type: Boolean, default: true },
		timeLogsVisible: { type: Boolean, default: true },
	},
	combination: {
		type: { type: String, required: true },
		combination: { type: Object, required: true },
	},
	modules: [], // Array of modules
});

const lockHistorySchema = new Schema({
	lockID: String,
	history: [],
});

const activitySchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: false },
	icon: { type: String, required: false },
	userID: { type: String, required: true },
	lockID: { type: String, required: true },
	Date: { type: String, required: true },
	interactions: [],
});

const khRequestSchema = new Schema({
	lockID: { type: String, required: true },
	token: { type: String, required: true },
});

const userModel = model("User", userSchema, "users");
const lockModel = model("Lock", lockSchema, "locks");
const lockHistoryModel = model("lockHistory", lockHistorySchema, "histories");
const activityModel = model("activity", activitySchema, "activities");
const requestModel = model("khRequest", khRequestSchema, "requests");

module.exports = {
	lockModel,
	userModel,
	lockHistoryModel,
	activityModel,
	requestModel,
};
