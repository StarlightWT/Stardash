const mongoose = require("mongoose");
const secret = require("../../secrets.json");

const userSchema = new mongoose.Schema({
	username: String,
	id: String,
	discordId: String,
	subscribed: Boolean,
	tier: String,
	role: String,
});

const userModel = mongoose.model("User", userSchema, "users");

async function createNewUser(username, id, role) {
	var user = new userModel({
		username: username,
		id: id,
		discordId: null,
		subscribed: false,
		tier: "none",
		role: role,
	});

	await mongoose.connect(secret.DATABASE_URI);
	const search = await findUser(id);
	if (search.length > 0) {
		user.updateOne(search._id);
		console.log("found!");
	} else {
		user.save();
		console.log("not found!");
	}
}

async function findUser(_id) {
	await mongoose.connect(secret.DATABASE_URI);

	const search = await userModel.find({ id: _id });
	return await search;
}

module.exports = {
	createNewUser,
	findUser,
};
