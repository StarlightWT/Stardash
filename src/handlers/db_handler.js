const mongoose = require("mongoose");
const secret = require("../../secrets.json");

const userSchema = new mongoose.Schema({
	username: String,
	id: String,
	subscribed: Boolean,
	role: String,
});
var lastId;

const userModel = mongoose.model("User", userSchema, "users");

async function createNewUser(username, id, role) {
	var user = new userModel({
		username: username,
		id: id,
		subscribed: false,
		role: role,
	});

	await mongoose.connect(secret.DATABASE_URI);
	const search = findUser(id);
	if (search) {
		user.updateOne(search._id);
		console.log("found!");
	} else {
		user.save();
		console.log("not found!");
	}
}

async function findUser(_id) {
	lastId = _id;

	await mongoose.connect(secret.DATABASE_URI);

	const search = await userModel.find({ id: _id });
	return await search;
}

module.exports = {
	createNewUser,
	findUser,
};
