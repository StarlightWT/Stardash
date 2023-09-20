function select(id){
    console.log(`Selecting casino ${id}`);
    window.electronAPI.casinoSelect(id);
    //request redirect to specific game
};

console.log("Hi!");