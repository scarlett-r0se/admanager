function goBack() {
    window.history.back();
};

function sendRequest(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
};

function getRandomInt(max, min) {
    return Math.floor(Math.random() * max) + min;
};

function createUserJson(firstname, lastname, password, group) {
    userProfile = {
        "Username": firstname[0].toUpperCase() + lastname[0].toUpperCase() + getRandomInt(8999, 1000),
        "FName": firstname,
        "LName": lastname,
        "Password": password,
        'Group': group,
    }
    return userProfile;
};
