var requestURL2 = 'lang/ru.json', request2, response2, lang2;
async function qwerf2() {
    request2 = new Request(requestURL2);
    response2 = await fetch(request2);
    lang2 = await response2.json();
    console.log(lang2);
}
window.addEventListener("DOMContentLoaded", (event) => {
    qwerf2();
});