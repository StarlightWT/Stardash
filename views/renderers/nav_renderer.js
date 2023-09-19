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

loadProfileInfo();


const homeBtn = document.getElementById("nav_home");
const gamesBtn = document.getElementById("nav_games");

homeBtn.addEventListener("click", () => {
  window.electronAPI.redirect("home");
});
gamesBtn.addEventListener("click", () => {
  window.electronAPI.redirect("games");
});