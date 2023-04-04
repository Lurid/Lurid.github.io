var requestURL = 'lang/ru.json';
function loadJSON() {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', requestURL, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            //callback(xobj.responseText);
            console.log("json loaded!");
        }
    };
    xobj.send(null);
}