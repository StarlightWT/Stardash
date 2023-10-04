function showDashboard(win) {
	win.loadFile("./views/dashboard/dashboard.html").then(() => {
		win.show();
	});
}
function showGames(win) {
	win.loadFile("./views/games/games.html").then(() => {
		win.show();
	});
}

//Casino redirects
function blackJack(win) {
	win.loadFile("./views/blackjack/blackjack.html").then(() => {
		win.show();
	});
}

function showLoading(win) {
	win.loadFile("./views/loading.html").then(() => {
		win.show;
	});
}

function showSettings(win) {
	win.loadFile("./views/settings/settings.html").then(() => {
		win.show;
	});
}

module.exports = {
	showDashboard,
	showGames,
	blackJack,
	showLoading,
	showSettings,
};
