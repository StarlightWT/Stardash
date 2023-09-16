const pingButton = document.getElementById("ping");
pingButton.addEventListener("click", () => {
  console.log("Redirect to dashboard...");
  window.electronAPI.redirect();
});
