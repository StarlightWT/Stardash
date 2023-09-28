function showDashboard(win) {
    win.loadFile("./views/dashboard.html").then(() => {
      win.show();
    });
}
function showGames(win) {
    win.loadFile("./views/games.html").then(() => {
      win.show();
    });
}

//Casino redirects
function blackJack(win){
  win.loadFile("./views/casino/blackjack.html").then(() => {
    win.show();
  })
}

function showLoading(win){
  win.loadFile("./views/loading.html").then(() => {
    win.show
  })
}


module.exports = {
    showDashboard,
    showGames,
    blackJack,
    showLoading
}