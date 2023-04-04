var requestURL2, request2, response2, lang2;
async function qwerf2() {
    requestURL2 = "/lang/ru.json";
    request2 = new Request(requestURL2);

    response2 = await fetch(request2);
    lang2 = await response2.json();
}