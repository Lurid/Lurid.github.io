var ANTI_CHEAT_CODE = "Fe12NAfA3R6z4k0z"
var zlib = "7a990d405d2c6fb93aa8fbb0ec1a3b23"
var deflate = "7e8bb5a89f2842ac4af01b3b7e228592"

var dataField, dataInput, dataJSON, dataOutput

function readSaveFile( event ) {
	var file = event.target.files[0]
	if ( !file ) return
	var reader = new FileReader()
	reader.onload = function ( event ) {
		dataField.value = event.target.result
		readSaveFromField()
	}
	reader.readAsText( file )
}

function readSaveFromField() {
	dataInput = dataField.value
	if ( dataInput.indexOf( ANTI_CHEAT_CODE ) > -1 || dataInput.substring( 0, 32 ) == zlib || dataInput.substring( 0, 32 ) == deflate ) {
		if ( dataInput.substring( 0, 32 ) == zlib ) {
			var pako = window.pako
			dataJSON = JSON.parse( pako.inflate( atob( dataInput.substring( 32 ) ), { to: 'string' } ) )
		} else if ( dataInput.substring( 0, 32 ) == deflate ) {
			var pako = window.pako
			dataJSON = JSON.parse( pako.inflateRaw( atob( dataInput.substring( 32 ) ), { to: 'string' } ) )
		} else {
			var result = dataInput.split( ANTI_CHEAT_CODE )
			dataInput = ""
			for ( var i = 0; i < result[0].length; i += 2 )
				dataInput += result[0][i]
			dataJSON = JSON.parse( atob( dataInput ) )
		}
		//console.log( JSON.stringify( dataJSON ) )
		PutDataToPage()
	}
	else if ( dataInput )
		document.getElementById( "alive" ).innerHTML = "Not a valid save, try again."
}

function encodeSave() {
	if ( dataJSON != undefined ) {
		var pako = window.pako
		dataOutput = btoa( pako.deflate( JSON.stringify( dataJSON ), { to: 'string' } ) )
		encodesaveObj.value = zlib + dataOutput
	}
}

function SelectAll( event ) {
	event.target.setSelectionRange( 0, 99999 )
}

function CopySaveToBuffer() {
	if ( encodesaveObj.value == '' ) {
		encodeSave()
	}
	encodesaveObj.select()
	encodesaveObj.setSelectionRange( 0, 99999 )
	document.execCommand( "copy" )
	/*
	navigator.clipboard.writeText( encodesaveObj.value ).then(() => {
		alert("successfully copied");
	  })
	  .catch(() => {
		alert("something went wrong");
	  });
	*/
}

var tMercs, saveFieldsObj, FieldFinderObj, editFieldNameObj, editFieldValueObj, encodesaveObj, AchievementsGridObj

document.addEventListener( "DOMContentLoaded", function () {
	dataField = document.getElementById( "readgame" )
	dataField.value = mySave
	saveFieldsObj = document.getElementById( "saveFields" )
	encodesaveObj = document.getElementById( "encodesave" )


	document.getElementById( "file-input" ).addEventListener( 'change', readSaveFile, false )

	tMercs = document.getElementById( "mercenariesTablePrefab" )

	AchievementsGridObj = document.getElementById( "AchievementsGrid" )
	AchievementsGridObj.innerHTML = Array( 169 ).fill( '' ).map( ( value, index ) => {
		return `<label><input type="checkbox" -sdv="achievements-${index + 1}">${index + 1}</label>`
	} ).join( '' )

	editFieldNameObj = document.getElementById( "editFieldName" )
	editFieldValueObj = document.getElementById( "editFieldValue" )
	editFieldValueObj.addEventListener( 'blur', SaveFieldValue1 )
	FieldFinderObj = document.getElementById( "FieldFinder" )
	FieldFinderObj.addEventListener( 'input', onSelectFieldName )

	outJSONobj = document.getElementById( "outJSON" )
	inJSONobj = document.getElementById( "inJSON" )

	InspectElement()
} )

var typeChanger = { 'text': 'text', 'number': 'number', 'boolean': 'checkbox' },
	simpleKeysActive, listOfSimpleFields, simpleKeysAll,
	listOfDifficultFields

function InspectElement() {
	var elements = Array.from( document.querySelectorAll( "[-sv]" ) )

	listOfSimpleFields = {}
	elements.filter( ( value, index, array ) => { return array.indexOf( value ) === index } )
		.map( x => x.getAttribute( "-sv" ) )
		.forEach( ( key ) => { listOfSimpleFields[key] = elements.filter( ( element ) => ( element.getAttribute( "-sv" ) == key ) ) } )
	simpleKeysActive = Object.keys( listOfSimpleFields )

	listOfDifficultFields = Array.from( document.querySelectorAll( '[-sdv]' ) )
	listOfDifficultFields.forEach( element => {
		element.addEventListener( 'blur', SaveDifficultValue )
	} )
	outsidersLabels = Array( 11 ).fill().map( x => [] )
	Array.from( document.querySelectorAll( '[-sol]' ) ).forEach( element => {
		outsidersLabels[parseInt( element.getAttribute( '-sol' ) )].push( element )
	} )

	Array.from( document.querySelectorAll( "[-sa]" ) ).forEach( x => x.addEventListener( 'focus', SelectAll ) )
}

function PutDataToPage() {
	console.log( dataJSON )
	simpleKeysActive.forEach( element => { element[2].value = element[2].title = dataJSON[element[0]] } )
	simpleKeysAll = Object.keys( dataJSON ).filter( x => typeof ( dataJSON[x] ) != 'object' )
	saveFieldsObj.innerHTML = simpleKeysAll.map( x => ( '<option value="' + x + '">' ) ).join( '' )

	simpleKeysActive.forEach( ( key ) => {
		if ( dataJSON[key] != undefined ) {
			listOfSimpleFields[key].forEach( ( element ) => {
				element.setAttribute( 'type', typeChanger[typeof dataJSON[key]] )
				element.value = element.title = dataJSON[key]
				element.addEventListener( 'blur', SaveFieldValue0 )
			} )
		}
	} )
	listOfDifficultFields.forEach( element => {
		var path = element.getAttribute( '-sdv' ).split( '-' ), l = path.length - 1, obj = dataJSON
		for ( let i = 0; i < l; i++ ) obj = obj[path[i]]
		if ( obj != undefined && obj.hasOwnProperty( path[l] ) ) {
			element.setAttribute( 'type', typeChanger[typeof obj[path[l]]] )
			element.title = obj[path[l]]
			if ( typeof obj[path[l]] == 'boolean' )
				element.checked = obj[path[l]]
			else
				element.value = obj[path[l]]
			element.disabled = false
			if ( element.hasAttribute( '-svt' ) ) {
				switch ( parseInt( element.getAttribute( '-svt' ) ) ) {
					case 0:
						ChangeOutsiderLevel( path[l - 1], obj[path[l]] )
						break
				}
			}
		} else {
			element.disabled = true
		}
	} )

	SelectCustomField( FieldFinderObj.value )
}

function onSelectFieldName( event ) {
	// console.log( event.inputType )
	if ( dataJSON != undefined ) {
		if ( ( event.inputType == undefined ) || ( simpleKeysAll.indexOf( FieldFinderObj.value ) != -1 ) ) {
			SelectCustomField( FieldFinderObj.value )
		}
	}
}

function SelectCustomField( key ) {
	if ( key != '' ) {
		editFieldNameObj.innerText = key
		editFieldValueObj.setAttribute( 'type', typeChanger[typeof dataJSON[key]] )
		if ( editFieldValueObj.type == 'checkbox' )
			editFieldValueObj.checked = dataJSON[key]
		else
			editFieldValueObj.value = dataJSON[key]
		editFieldValueObj.title = dataJSON[key]
	}
}

function SaveFieldValue0( element ) {
	SyncKeys( element.target.getAttribute( '-sv' ), element.target.value, 0 )
}

function SaveFieldValue1() {
	SyncKeys( editFieldNameObj.innerText, editFieldValueObj.type == 'checkbox' ? editFieldValueObj.checked : editFieldValueObj.value, 1 )
}

function SyncKeys( key, value, origin ) {
	switch ( origin ) {
		case 0:
			if ( editFieldNameObj.innerText == key ) editFieldValueObj.value = value
			break
		case 1:
			if ( listOfSimpleFields.hasOwnProperty( key ) ) listOfSimpleFields[key].forEach( ( element ) => element.value = value )
			break
	}
	if ( dataJSON.hasOwnProperty( key ) ) {
		//console.log( `[${key}] = (${value})` )
		dataJSON[key] = value
	}
}

function SaveDifficultValue( event ) {
	if ( dataJSON != undefined ) {
		var path = event.target.getAttribute( '-sdv' ).split( '-' ), l = path.length - 1, obj = dataJSON, newValue = event.target.value
		console.log( `${path} = ${newValue}` )
		for ( let i = 0; i < l; i++ ) obj = obj[path[i]]
		if ( obj != undefined && obj.hasOwnProperty( path[l] ) ) {
			obj[path[l]] = newValue
			if ( event.target.hasAttribute( '-svt' ) ) {
				switch ( parseInt( event.target.getAttribute( '-svt' ) ) ) {
					case 0:
						ChangeOutsiderLevel( path[l - 1], newValue )
						break
				}
			}
		}
	}
}

var outsidersLabels

function ChangeOutsiderLevel( id, level ) {
	if ( typeof id == 'string' ) id = parseInt( id )
	if ( typeof level == 'string' ) level = parseInt( level )
	var val1, val2
	switch ( id ) {
		case 1:
			val1 = ( Math.pow( 1.5, level ) - 1 ) * 100
			break
		case 2:
			if ( level > 150 ) level = 150
			val1 = 100 - ( ( Math.pow( 0.95, level - 1 ) ) * 100 )
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
	outsidersLabels[id][0].innerText = ( ( val1 < 100000 ) ? val1.toFixed( 2 ).replace( /\.?0+$/, '' ) : val1.toExponential( 2 ).replace( '+', '' ).replace( /\.?0+(e\d+)$/, "$1" ) )
	if ( id > 5 ) {
		outsidersLabels[id][1].innerText = val2.toFixed( 2 ).replace( /\.?0+$/, '' )
	}
}

var outJSONobj, inJSONobj

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