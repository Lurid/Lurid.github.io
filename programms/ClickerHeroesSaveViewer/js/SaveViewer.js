var ANTI_CHEAT_CODE = "Fe12NAfA3R6z4k0z", zlib = "7a990d405d2c6fb93aa8fbb0ec1a3b23", deflate = "7e8bb5a89f2842ac4af01b3b7e228592", dataJSON

function readSaveFile( event ) {
	let file = event.target.files[0]
	if ( !file ) return
	let reader = new FileReader()
	reader.onload = function ( event ) {
		decodeFieldElement.value = event.target.result
		decodeSaveFromField()
	}
	reader.readAsText( file )
}

function decodeSaveFromField() {
	let dataInput = decodeFieldElement.value
	if ( dataInput.indexOf( ANTI_CHEAT_CODE ) > -1 || dataInput.substring( 0, 32 ) == zlib || dataInput.substring( 0, 32 ) == deflate ) {
		if ( dataInput.substring( 0, 32 ) == zlib ) {
			let pako = window.pako
			dataJSON = JSON.parse( pako.inflate( atob( dataInput.substring( 32 ) ), { to: 'string' } ) )
		} else if ( dataInput.substring( 0, 32 ) == deflate ) {
			let pako = window.pako
			dataJSON = JSON.parse( pako.inflateRaw( atob( dataInput.substring( 32 ) ), { to: 'string' } ) )
		} else {
			let result = dataInput.split( ANTI_CHEAT_CODE )
			dataInput = ""
			for ( let i = 0; i < result[0].length; i += 2 )
				dataInput += result[0][i]
			dataJSON = JSON.parse( atob( dataInput ) )
		}
		//console.log( JSON.stringify( dataJSON ) )
		PutDataToPage()
	}
	else if ( dataInput ) {
		document.getElementById( "alive" ).innerHTML = "Not a valid save, try again."
		// ПЕРЕДЕЛАТЬ
	}
}

function encodeSaveLaunch() {
	if ( dataJSON != undefined ) {
		let pako = window.pako, dataOutput = btoa( pako.deflate( JSON.stringify( dataJSON ), { to: 'string' } ) )
		encodeFieldElement.value = zlib + dataOutput
	}
}

function encodeButtonClick() {
	encodeSaveLaunch()
}

function fillExampleButtonEvent() {
	decodeFieldElement.value = exampleSave
	decodeSaveFromField()
}

function copyButtonClick() {
	if ( encodeFieldElement.value == '' ) {
		encodeSaveLaunch()
	}
	encodeFieldElement.select()
	encodeFieldElement.setSelectionRange( 0, 99999 )
	document.execCommand( "copy" )
	/*
	navigator.clipboard.writeText( encodeFieldElement.value ).then(() => {
		alert("successfully copied");
	  })
	  .catch(() => {
		alert("something went wrong");
	  });
	*/
}

function SelectAll( event ) {
	event.target.setSelectionRange( 0, 99999 )
}

var decodeFieldElement, encodeFieldElement,
	customFieldSelectorElement, customFieldListElement, customFieldNameElement, customFieldValueElement,
	AchievementsElement, outsidersLabels,
	outJSONobj, inJSONobj

document.addEventListener( "DOMContentLoaded", function () {
	document.getElementById( "file-input" ).addEventListener( 'change', readSaveFile, false )
	decodeFieldElement = document.getElementById( "decodeField" )
	encodeFieldElement = document.getElementById( "encodeField" )

	AchievementsElement = document.getElementById( "AchievementsGrid" )
	let exceptionAchievementsNumbers = [112, 143]
	AchievementsElement.innerHTML = Array( 169 ).fill( '' )
		.map( ( value, index ) => index + 1 )
		.map( ( value ) => `<label><input type="checkbox" -sdv="achievements-${value}"${exceptionAchievementsNumbers.includes( value ) ? "" : " -sf-ae"}>${value}</label>` )
		.join( '' )

	customFieldListElement = document.getElementById( "customFieldList" )
	customFieldNameElement = document.getElementById( "customFieldName" )
	customFieldValueElement = document.getElementById( "customFieldValue" )
	customFieldValueElement.addEventListener( 'blur', SaveFieldValue1 )
	customFieldSelectorElement = document.getElementById( "customFieldSelector" )
	customFieldSelectorElement.addEventListener( 'input', onSelectCustomFieldName )

	outJSONobj = document.getElementById( "outJSON" )
	inJSONobj = document.getElementById( "inJSON" )

	InspectElement()
} )

var typeChanger = { 'text': 'text', 'number': 'number', 'boolean': 'checkbox' },
	simpleKeysList, listOfEditableFields


function InspectElement() {
	listOfEditableFields = Array.from( document.querySelectorAll( '[-sdv]' ) )
	listOfEditableFields.forEach( element => element.addEventListener( 'blur', element.hasAttribute( '-ssf' ) ? SaveFieldValue0 : SaveValue ) )
	outsidersLabels = Array( 11 ).fill().map( x => [] )
	Array.from( document.querySelectorAll( '[-sol]' ) ).forEach( element => {
		outsidersLabels[parseInt( element.getAttribute( '-sol' ) )][parseInt( element.getAttribute( '-slid' ) )] = element
	} )
	Array.from( document.querySelectorAll( "[-sa]" ) ).forEach( x => x.addEventListener( 'focus', SelectAll ) )
}

function PutDataToPage() {
	//console.log( dataJSON )
	simpleKeysList = Object.keys( dataJSON ).filter( x => typeof ( dataJSON[x] ) != 'object' )
	customFieldListElement.innerHTML = simpleKeysList.map( x => ( '<option value="' + x + '">' ) ).join( '' )
	listOfEditableFields.forEach( element => {
		let path = element.getAttribute( '-sdv' ).split( '-' ), l = path.length - 1, obj = dataJSON
		for ( let i = 0; i < l; i++ ) obj = obj[path[i]]

		if ( ( ( obj != undefined ) && obj.hasOwnProperty( path[l] ) ) || ( element.hasAttribute( '-sf-ae' ) && ( obj != undefined ) && ( !obj.hasOwnProperty( path[l] ) ) ) ) {
			element.disabled = false
			if ( obj.hasOwnProperty( path[l] ) ) {
				element.setAttribute( 'type', typeChanger[typeof obj[path[l]]] )
				element.title = obj[path[l]]
				element[( typeof obj[path[l]] == 'boolean' ) ? 'checked' : 'value'] = obj[path[l]]
				if ( element.hasAttribute( '-svt' ) ) {
					switch ( parseInt( element.getAttribute( '-svt' ) ) ) {
						case 0:
							ChangeOutsiderLevel( path[l - 1], obj[path[l]] )
							break
					}
				}
			} else {
				if ( element.getAttribute( 'type' ) == 'checkbox' ) {
					element.checked = false
				}
			}
		} else {
			element.disabled = true
		}
	} )

	SelectCustomFieldName( customFieldSelectorElement.value )
}

function onSelectCustomFieldName( event ) {
	if ( dataJSON != undefined ) {
		if ( ( event.inputType == undefined ) || ( simpleKeysList.indexOf( customFieldSelectorElement.value ) != -1 ) ) {
			SelectCustomFieldName( customFieldSelectorElement.value )
		}
	}
}

function SelectCustomFieldName( key ) {
	if ( key != '' ) {
		customFieldNameElement.innerText = key
		customFieldValueElement.setAttribute( 'type', typeChanger[typeof dataJSON[key]] )
		customFieldValueElement[( customFieldValueElement.type == 'checkbox' ) ? 'checked' : 'value'] = dataJSON[key]
		customFieldValueElement.title = dataJSON[key]
	}
}

function SaveFieldValue0( event ) {
	SyncKeys( event.target.getAttribute( '-sdv' ), event.target[( event.target.getAttribute( 'type' ) == 'checkbox' ) ? 'checked' : 'value'], 0 )
}

function SaveFieldValue1() {
	SyncKeys( customFieldNameElement.innerText, customFieldValueElement.type == 'checkbox' ? customFieldValueElement.checked : customFieldValueElement.value, 1 )
}

function SyncKeys( key, value, origin ) {
	switch ( origin ) {
		case 0:
			if ( customFieldNameElement.innerText == key ) customFieldValueElement[( typeof value == 'boolean' ) ? 'checked' : 'value'] = value
			break
		case 1:
			Array.from( document.querySelectorAll( `[-sdv="${key}"]` ) ).forEach( element => element[( typeof value == 'boolean' ) ? 'checked' : 'value'] = value )
			break
	}
	if ( dataJSON.hasOwnProperty( key ) ) {
		//console.log( `[${key}] = (${value})` )
		dataJSON[key] = value
	}
}

function SaveValue( event ) {
	if ( dataJSON != undefined ) {
		let element = event.target
		if ( element.value == '' ) element.value = 0
		let path = element.getAttribute( '-sdv' ).split( '-' ), l = path.length - 1, obj = dataJSON, newValue
		newValue = element[( element.getAttribute( 'type' ) == 'checkbox' ) ? 'checked' : 'value']
		for ( let i = 0; i < l; i++ ) obj = obj[path[i]]
		if ( ( ( obj != undefined ) && obj.hasOwnProperty( path[l] ) ) || ( element.hasAttribute( '-sf-ae' ) && ( obj != undefined ) && ( !obj.hasOwnProperty( path[l] ) ) ) ) {
			obj[path[l]] = newValue
			if ( element.hasAttribute( '-svt' ) ) {
				switch ( parseInt( element.getAttribute( '-svt' ) ) ) {
					case 0:
						ChangeOutsiderLevel( path[l - 1], newValue )
						break
				}
			}
		}
	}
}

function ChangeOutsiderLevel( id, level ) {
	if ( typeof id == 'string' ) id = parseInt( id )
	if ( typeof level == 'string' ) level = parseInt( level )
	let val1, val2, val3
	switch ( id ) {
		case 1:
			val1 = ( Math.pow( 1.5, level ) - 1 ) * 100
			break
		case 2:
			if ( level > 150 ) level = 150
			val1 = 100 - ( ( Math.pow( 0.95, ( level == 0 ) ? 0 : level - 1 ) ) * 100 )
			break
		case 3:
			val1 = level * 100
			break
		case 5:
			val1 = Math.pow( level, 2 ) * 1000
			break
		case 6:
			val1 = 12.5 * level
			val2 = 8 + 1 * level
			break
		case 7:
			val1 = 25 * level
			val2 = 75 + 18.75 * level
			break
		case 8:
			val1 = 50 * level
			val2 = 5 + 2.5 * level
			break
		case 9:
			val1 = 75 * level
			val2 = 30 + 22.5 * level
			break
		case 10:
			val1 = 100 * level
			val2 = 1 + 99 * ( level + 1 )
			break
	}
	if ( id == 3 ) {
		val3 = level
	} else {
		val3 = ( level * ( level + 1 ) ) / 2
	}
	outsidersLabels[id][0].innerText = ( ( val1 < 100000 ) ? val1.toFixed( 2 ).replace( /\.?0+$/, '' ) : val1.toExponential( 2 ).replace( '+', '' ).replace( /\.?0+(e\d+)$/, "$1" ) )
	if ( id > 5 ) {
		outsidersLabels[id][1].innerText = val2.toFixed( 2 ).replace( /\.?0+$/, '' )
	}
	outsidersLabels[id][2].innerText = val3
}

function ConvertDataToJSON() {
	if ( dataJSON != undefined ) {
		outJSONobj.value = JSON.stringify( dataJSON )
	}
}

function ConvertJSONtoData() {
	if ( inJSONobj.value != '' ) {
		dataJSON = JSON.parse( inJSONobj.value )
		PutDataToPage()
	}
}

function ClearTranscensions() {
	dataJSON.stats.transcensions = {}
}