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

const userModel = mongoose.model("User", userSchema, "users");

async function createNewUser(username, id, role, network) {
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
}

async function findUser(_id) {
	dbProfileId = _id;
	await mongoose.connect(secret.DATABASE_URI);

	const search = await userModel.find({ id: _id });
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
	console.log(dbProfile);
	await userModel.findOneAndUpdate({ id: _id }, { role: role });
	return 1;
}

module.exports = {
	createNewUser,
	getUser,
	setUserRole,
};
