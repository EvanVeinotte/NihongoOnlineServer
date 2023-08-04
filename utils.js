function getKeyByValue(map, searchValue){
    for(let [key, value] of map){
        if(value === searchValue){
            return(key);
        }
    }
}

function removeFromArray(valuetoremove, arraytoremovefrom){
    let index = arraytoremovefrom.indexOf(valuetoremove);
    if(index > -1){
        arraytoremovefrom.splice(index, 1);
    }
    else{
        return false
    }
    return arraytoremovefrom
}

module.exports = { getKeyByValue, removeFromArray};