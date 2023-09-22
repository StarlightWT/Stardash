console.log("Loaded api calling!");

async function getProfile(token) {
    const response = await fetch("https://api.chaster.app/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const myJson = await response.json();
    return myJson;
  }
  
  async function getLock(token) {
    const response = await fetch("https://api.chaster.app/locks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const myJson = await response.json();
    return myJson;
  }
  
  async function getLockHistory(token, lockID) {
    const response = await fetch(
      `https://api.chaster.app/locks/${lockID}/history`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const myJson = await response.json();
    return myJson;
  }

async function getExtension(token){
  const response = await fetch(
    `https://api.chaster.app/api/extensions/sessions/search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        "status": "locked",
        "extensionSlug": "stardash-connect",
        "limit": 15,
      }
    }
  );
  const myJson = await response.json();
  return myJson;
}

module.exports = {
    getProfile,
    getLock,
    getLockHistory,
    getExtension,
}