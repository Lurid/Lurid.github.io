class Language {
	author;
	dictionary;
	constructor(object) {
		this.author = object.author;
		this.width = object.dictionary;
	}
}
class PageSettings {
	#language;
	#localKeyLang = "language";
	get langActive() { return this.#language; }
	set langActive(x) { this.#language = `hello ${x}`; }
	get langSaved() { return localStorage.getItem(this.#localKeyLang); }
	set langSaved(x) { localStorage.setItem(this.#localKeyLang, x); }

	//langScriptElement;
	init = async function () {
		let gettedSavedLanguage = this.langSaved;
		if (gettedSavedLanguage == undefined) {
			this.language = this.langSaved = "en";
		} else {
			this.language = gettedSavedLanguage;
		}

		document.documentElement.setAttribute("lang", gettedSavedLanguage);
		//let langScriptElement = document.head.getElementsByTagName("script")[0];
		//langScriptElement.src = "lang/" + this.language + ".json";

		/*
		const requestURL = "//lang/" + this.language + ".json";
		const request = new Request(requestURL);

		const response = await fetch(request);
		const lang = await response.json();
		*/
		/*
		window.addEventListener("DOMContentLoaded", (event) => {
			document.head.appendChild(langScriptElement);
			console.log(lang);
			dictionary = lang["dictionary"];
			console.log(dictionary);
		});
		*/



	}

	dictionary;
}

const pageSettings = new PageSettings();
pageSettings.init();


window.addEventListener("DOMContentLoaded", (event) => {
	let catchedElements = document.querySelectorAll("*[-LD]");
	//catchedElements.forEach
	//console.log(catchedElements);
});



function getActualLanguage() {

}

function setActualLanguage() {

}