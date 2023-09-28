function select(id){
    console.log(`Selecting game ${id}`);
    window.electronAPI.gameSelect(id);
    //request redirect to specific game
};

console.log("Hi!");