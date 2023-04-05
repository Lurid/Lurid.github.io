class PageScript {
	static pageLoaded;
	static DOMLoaded;

	static {
		this.DOMLoaded = new Promise((resolve) => {
			this.pageLoaded = resolve;
		});
	}

	static load(url) {
		return new Promise((resolve, reject) => {
			let x = new XMLHttpRequest();
			x.open('GET', url, true);
			x.onload = () => resolve(x.responseText);
			x.onerror = () => reject(false); //x.statusText
			x.send();
		});
	}
}

class PartLoader {
	static allPromises = [];
	//static cache = {};
	static allPromiseObj;

	static {
		PageScript.DOMLoaded.then(() => {
			let catchedElements = document.querySelectorAll("meta[-lp][src]");
			catchedElements.forEach(e => {
				let promise = PageScript.load(e.getAttribute('src'));
				promise.then((text) => {
					if (text != false) {
						//this.cache[e.getAttribute('src')] = text;
						if (e.parentNode.tagName == "HEAD") {
							var doc = new DOMParser().parseFromString(text, 'text/html');
							let length = doc.head.childElementCount;
							for (let i = 0; i < length; i++) {
								e.parentNode.appendChild(doc.head.children[0]);
							}
						} else {
							new DOMParser().parseFromString(text, 'text/html').body.childNodes.forEach(el => {
								e.parentNode.insertBefore(el, e);
							});
						}
						e.remove();
					}
				});
				this.allPromises.push(promise);
			});
			this.allPromiseObj = Promise.all(this.allPromises);
			this.allPromiseObj.then(() => {
				Language.init();
				Language.fillDictionary();
			});
		});
	}
}

class Language {
	static LangFolder = "/lang/";
	static LangSelectID = "select-lang";
	static localKeyLang = "language";
	static selectLangElement;

	static L;
	static cache = {};
	static promise;

	static {
		let gettedSavedLanguage = localStorage.getItem(this.localKeyLang);
		if (gettedSavedLanguage == undefined) {
			this.setLang("en");
		} else {
			this.setLang(gettedSavedLanguage);
		}
	}

	static init() {
		this.selectLangElement = document.getElementById(this.LangSelectID);
		this.selectLangElement.value = this.L;
	}

	static setLang(l, autoset = false) {
		//check value on massive
		this.L = l;
		localStorage.setItem(this.localKeyLang, l);
		if (this.cache.hasOwnProperty(l)) {
			this.L = l;
			if (autoset) this.fillDictionary();
		} else {
			this.promise = PageScript.load(this.LangFolder + this.L + ".json");
			this.promise.then((text) => {
				if (text != false)
					this.cache[this.L] = JSON.parse(text); // maybe this ?
				if (autoset) this.fillDictionary();
			});
		}
		document.documentElement.setAttribute("lang", this.L);
	}

	static async fillDictionary(elementDOM = document) {
		await this.promise;
		let catchedElements = elementDOM.querySelectorAll("*[-ld]");
		catchedElements.forEach(element => {
			element.innerText = this.cache[this.L].dictionary[element.getAttribute("-ld")];
			//element.removeAttribute("-ld");
		});
	}
}

{ // page
	window.addEventListener("DOMContentLoaded", (event) => {
		PageScript.pageLoaded();
	});

	function SetLanguage(el) {
		Language.setLang(el.value, true);
	}
}
