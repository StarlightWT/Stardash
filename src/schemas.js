const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	username: String,
	id: String,
	chasterId: String,
	token: String,
	discordId: String,
	subscribed: Boolean,
	tier: { type: String, default: "Basic" },
	role: { type: String, default: "switch" },
});
const taskSchema = new Schema({
	name: { type: String, default: "Tasks" },
	enabled: { type: Boolean, default: false },
	locked: { type: Boolean, default: false },
	taskList: [],
	assignedTasks: [],
	taskLog: [],
	giveTasks: { type: Number, default: 0 },
});

const ruleSchema = new Schema({
	name: { type: String, default: "Rules" },
	enabled: { type: Boolean, default: false },
	locked: { type: Boolean, default: false },
	public: { type: Boolean, default: false },
	rules: [],
});

const lockSchema = new Schema({
	id: String,
	user: userSchema,
	khId: { type: String, default: null },
	modules: [taskSchema], // Array of modules
});

const userModel = model("User", userSchema, "users");
const lockModel = model("Lock", lockSchema, "locks");

module.exports = {
	lockModel,
	userModel,
};
