const { userModel } = require("../../schemas");
const { clearCache } = require("./db_get");

module.exports = {
	setRole,
};

async function setRole(id, role) {
	await userModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: {
					role: role,
				},
			},
			{ new: true }
		)
		.lean();

	clearCache();
}
