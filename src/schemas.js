const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	username: String,
	id: String,
	chasterId: String,
	token: String,
	discordId: String,
	subscribed: Boolean,
	stats: {
		totalLockedTime: 0,
		longesLockedTime: 0,
	},
	tier: { type: String, default: "Basic" },
	role: { type: String, default: "switch" },
});
const taskSchema = new Schema({
	name: { type: String, default: "Tasks" },
	enabled: { type: Boolean, default: false },
	locked: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	taskList: [],
	assignedTasks: [],
	taskLog: [],
	giveTasks: { type: Number, default: 0 },
});

const ruleSchema = new Schema({
	name: { type: String, default: "Rules" },
	enabled: { type: Boolean, default: false },
	locked: { type: Boolean, default: false },
	premium: { type: Boolean, default: true },
	public: { type: Boolean, default: false },
	rules: [],
});

const lockSchema = new Schema({
	id: String,
	user: userSchema,
	khId: { type: String, default: null },
	modules: [], // Array of modules
});

const lockHistorySchema = new Schema({
	lockID: String,
	history: [],
});

const userModel = model("User", userSchema, "users");
const lockModel = model("Lock", lockSchema, "locks");
const taskModel = model("Tasks", taskSchema);
const ruleModel = model("Rules", ruleSchema);
const lockHistoryModel = model("lockHistory", lockHistorySchema, "History");

module.exports = {
	lockModel,
	userModel,
	taskModel,
	ruleModel,
	lockHistoryModel,
};
