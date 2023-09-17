async function loadProfileInfo() {
  const profile = await window.electronAPI.getProfile();
  const usernameBox = document.getElementById("username");
  const avatar = document.getElementById("avatar");
  const discord = document.getElementById("discord");
  usernameBox.innerHTML = profile.username;
  avatar.setAttribute("src", profile.avatarUrl);
  discord.innerHTML = "@" + profile.discordUsername;

  console.log(profile);
}

async function loadLockInfo() {
  //Update all information upon page load
  var lock = await updateLock();
  updateLockTime(lock.endDate);
  updateLockHistory(lock._id);
  //Setup intervals to keep info up to date
  setInterval(async () => {
    lock = await updateLock();
  }, 5000);

  setInterval(async () => {
    updateLockTime(lock.endDate);
  }, 1000);

  setInterval(async () => {
    updateLockHistory(lock._id);
  }, 5000);
}

const homeBtn = document.getElementById("nav_home");
const gamesBtn = document.getElementById("nav_games");

homeBtn.addEventListener("click", () => {
  window.electronAPI.redirect("home");
});
gamesBtn.addEventListener("click", () => {
  window.electronAPI.redirect("games");
});

loadProfileInfo();
loadLockInfo();

async function updateLock() {
  console.log("Updating lockObject...");
  lockObject = await window.electronAPI.getLock();
  lock = lockObject[0];

  return lock;
}

async function updateLockTime(endDateTimestamp) {
  console.log("Updating time...");
  const endDate = new Date(endDateTimestamp).getTime(); //Is UTC
  const currentDate = Date.now(); //Is also UTC
  if (currentDate > endDate) return;
  var timeLeft = endDate - currentDate;
  // Translate current date to endDate counterpart
  var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  daysElement.innerHTML = ("0" + days).slice(-2);
  hoursElement.innerHTML = ("0" + hours).slice(-2);
  minutesElement.innerHTML = ("0" + minutes).slice(-2);
  secondsElement.innerHTML = ("0" + seconds).slice(-2);
}

async function updateLockHistory(lockID) {
  //Getting lock history
  console.log("Updating lock history...");
  const lockHistory = await window.electronAPI.getLockHistory(lockID);
  const lastLogs = lockHistory.results.slice(0, 10);
  const logList = await document.getElementById("logList");
  var i = 0;
  logList.innerHTML = "";
  lastLogs.forEach(async (log) => {
    const entry = document.createElement("li");
    const entryTitle = document.createElement("h1");
    const entryDescription = document.createElement("p");
    await logList.append(entry);
    await entry.append(entryTitle);
    await entry.append(entryDescription);

    var title = lastLogs[i].title;
    if (lastLogs[i].title.includes("%USER%") && lastLogs[i].user)
      title = lastLogs[i].user.username + lastLogs[i].title.slice(6);
    else if (lastLogs[i].title.includes("%USER%")) {
      var extensionTitle =
        lastLogs[i].extension.charAt(0).toUpperCase() +
        lastLogs[i].extension.slice(1);
      title = extensionTitle + lastLogs[i].title.slice(6);
    }

    entryTitle.innerHTML = title;
    entryDescription.innerHTML = log.description;
    i++;
  });
}
