
async function loadProfileInfo(){
  const profile = await window.electronAPI.getProfile();
  const usernameBox = document.getElementById("username");
  const avatar = document.getElementById("avatar");
  usernameBox.innerHTML = profile.username;
  avatar.setAttribute("src", profile.avatarUrl);
} 

loadProfileInfo();