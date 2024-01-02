function select(id) {
	console.log(`Selecting game ${id}`);
	window.electronAPI.redirect(id);
	//request redirect to specific game
}
