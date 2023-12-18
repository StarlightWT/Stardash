const { lockModel } = require("../../schemas");

module.exports = {
	toggleModule,
	lockModule,
};
/**
 *
 * @param {String} id Lock's ID
 * @param {String} module Module's title
 * @returns updated database record, 3 = Multiple locks found
 */
async function toggleModule(id, module) {
	let lock = await lockModel.find({ id: id });
	if (lock.length > 1) return 3;
	lock = lock[0];
	let moduleDB = lock.modules.find((obj) => obj.name == module);
	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: { "modules.$[elem].enabled": !moduleDB.enabled },
			},
			{ arrayFilters: [{ "elem.name": module }], new: true }
		)
		.lean();
}
/**
 *
 * @param {String} id lock's ID
 * @param {String} module Modules name
 * @returns updated database record, 3 = Multiple locks found
 */
async function lockModule(id, module) {
	let lock = await lockModel.find({ id: id });
	if (lock.length > 1) return 3;
	lock = lock[0];
	return await lockModel
		.findOneAndUpdate(
			{ id: id },
			{
				$set: { "modules.$[elem].locked": true },
			},
			{ arrayFilters: [{ "elem.name": module }], new: true }
		)
		.lean();
}
