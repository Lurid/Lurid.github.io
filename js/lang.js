const LangFolder = "/lang/", LangSelectID = "select-lang", localKeyLang = "language";
var selectLangElement;

class Language {
	L;
	cache = {};
	
	constructor() {
		let gettedSavedLanguage = localStorage.getItem(localKeyLang);
		if (gettedSavedLanguage == undefined) {
			this.setLang("en");
		} else {
			this.setLang(gettedSavedLanguage);
		}
	}	

	setLang = function (l) {
		//check by massive
		this.L = l;
		localStorage.setItem(localKeyLang, l);
		if (this.cache.hasOwnProperty(l)) {
			this.L = l;
			this.fillDictionary();
		} else {
			var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
			xobj.open('GET', LangFolder + this.L + ".json", true);
			xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					language.cache[language.L] = JSON.parse(xobj.responseText);
					language.fillDictionary();
				}
			};
			xobj.send(null);
		}
		document.documentElement.setAttribute("lang", this.L);
	}

	fillDictionary = function (elementDOM = document) {
		let catchedElements = elementDOM.querySelectorAll("*[-LD]");
		catchedElements.forEach(element => {
			element.innerText = this.cache[this.L].dictionary[element.getAttribute("-LD")];
		});
	}	
}
const language = new Language();

window.addEventListener("DOMContentLoaded", (event) => {
	selectLangElement = document.getElementById(LangSelectID);
	selectLangElement.value = language.L;
});

function SetLanguage(el) {
	language.setLang(el.value);
}