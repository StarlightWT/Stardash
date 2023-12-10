const mongoose = require("mongoose");
const secret = require("../../secrets.json");
const api = require("./api_handler");

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

	await mongoose.connect(secret.DATABASE_URI);
	const search = await findUser(id);
	if (search.length > 0) {
		user.updateOne(search._id);
	} else {
		user.save();
	}
	mongoose.disconnect();
	return user;
}

async function findUser(_id) {
	dbProfileId = _id;
	await mongoose.connect(secret.DATABASE_URI);

	const search = await userModel.find({ id: _id });
	mongoose.disconnect();
	return await search;
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
	await mongoose.connect(secret.DATABASE_URI);
	await userModel.findOneAndUpdate({ id: _id }, { role: role });
	mongoose.disconnect();
	return 1;
}

async function createLock(id, userId) {
	const lock = new lockModel({
		id: id,
		userId: userId,
	});
}

async function getLock(searchObject) {
	await mongoose.connect(secret.DATABASE_URI);
	const lock = await lockModel.find(searchObject);
	mongoose.disconnect();
	if (lock.length > 0) {
		return lock;
	} else return 1;
}

module.exports = {
	createNewUser,
	getUser,
	setUserRole,
};
