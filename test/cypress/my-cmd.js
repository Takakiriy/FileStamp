// Functions having cypress commands
import * as lib from "./my-lib.js"

// visitSync
export function  visitSync( targetURL, watiForURL, option ) {
	if ( ! watiForURL ) {
		watiForURL = targetURL
	}

	cy.visit( targetURL )
	cy.location('href', option).should('eq', watiForURL)
}

// log
export function  log( label,  value ) {
	if (typeof value === 'object') {
		expect( label ).to.not.eq( lib.recursiveAssign( {}, value ) )
	} else if ( label === value ) {
		expect( label ).to.eq( value )
	} else {
		expect( label ).to.not.eq( value )
	}
}

// visitNewTab
// Example: cmd.visitNewTab( cy.get('a').contains('次へ'))
// Reference: https://docs.cypress.io/guides/references/trade-offs.html#Multiple-tabs
export function  visitNewTab( aTag, targetURL, watiForURL ) {
	if ( ! watiForURL ) {
		watiForURL = targetURL
	}

	aTag.should('have.attr', 'target', '_blank')
	aTag.should('have.attr', 'href', targetURL)

	visitSync( targetURL, watiForURL )
}

// saveLogInToken
export function  saveLogInToken() {
	if ( lib.env( 'LogInToken' ) == 'InCookie' ) {
		saveLogInCookie()
	} else {
		saveLogInLocalStorage()
	}
}

// restoreLogInToken
export function  restoreLogInToken() {
	if ( lib.env( 'LogInToken' ) == 'InCookie' ) {
		restoreLogInCookie()
	} else {
		restoreLogInLocalStorage()
	}
}

// restoreLogInTokenAndMore
export function  restoreLogInTokenAndMore(afterFunction) {
	lib.share = {}  // for stateless

	restoreLogInToken()

	readTemporaryFile( (storage) => {
		tmp = storage
		if (afterFunction) {
			afterFunction()
		}
	})
}

// tmp
//jp: cmd.tmp は、"_temporary.json" ファイルの内容です。
//jp: restoreLogInToken の afterFunction が呼ばれてから参照できます。
//jp: updateTemporaryFile で "_temporary.json" ファイルの内容を更新できます。
export var tmp = {}

// saveLogInCookie
export function  saveLogInCookie() {
	cy.getCookies().then((cookies) => {
		cy.writeFile("_logInCookie.json", cookies)  //jp: cypress を起動したときのカレント フォルダーからの相対パス
	})
}

// restoreLogInCookie
export function  restoreLogInCookie() {
	cy.clearCookies()
	cy.readFile("_logInCookie.json").then( (cookies) => {  //jp: cypress を起動したときのカレント フォルダーからの相対パス
		for (const cookie of cookies ) {

			cy.setCookie(cookie.name, cookie.value, {
				path:     cookie.path,
				// domain:   cookie.domain,  //jp: これを指定すると設定されない
				secure:   cookie.secure,
				httpOnly: cookie.httpOnly,
				expiry:   cookie.expiry,
			})
		}
	})
}

// saveLogInLocalStorage
// Example: cmd.saveLogInLocalStorage()
export function  saveLogInLocalStorage() {
	cy.writeFile("_logInLocalStorage.json",  getLocalStorage() )
}

// restoreLogInLocalStorage
// Example: cmd.restoreLogInLocalStorage()
export function  restoreLogInLocalStorage() {
	cy.clearLocalStorage()
	cy.readFile("_logInLocalStorage.json").then( (storage) => {  //jp: cypress を起動したときのカレント フォルダーからの相対パス
		setLocalStorage( storage )
	})
})

// setLocalStorage
export function  setLocalStorage(keyValue) {
	for (const key of Object.keys(keyValue)) {
		localStorage.setItem( key, keyValue[key] )
	}
}

// getLocalStorage
export function  getLocalStorage() {
	const  storage = {}
	for (var i = 0; i < localStorage.length; i++) {
		const  key = localStorage.key(i)
		const  item = localStorage.getItem( key )
		storage[ key ] = item
	}
	return  storage
}

// readTemporaryFile
// Example: cmd.readTemporaryFile( (s) => { cmd.log( s.myUUID ) } )
export function  readTemporaryFile(readFieldsFunction) {
	const filePath = "_temporary.json"

	cy.task("readFile", filePath).then( (storage) => {
		readFieldsFunction(storage)
	})
}

// updateTemporaryFile
// Example: cmd.updateTemporaryFile( (s) => { s.myUUID = "" } )
export function  updateTemporaryFile(updateFieldsFunction) {
	const filePath = "_temporary.json"

	cy.task("readFile", filePath).then( (storage) => {
		updateFieldsFunction(storage)

		cy.writeFile(filePath, storage)
	})
}

// writeToManual
export function  writeToManual(text) {
	var  option
	if (firstWriteToManual) {
		option = undefined
		firstWriteToManual = false
	} else {
		option = {flag: "a+"}
	}

	cy.writeFile("_manual.md",  text + "\n",  option)
	cy.log(text)
}

var  firstWriteToManual = true

// typeToInput
// Example: cmd.typeToInput("  - 「売上金額」に${value}と入力します。", "99,999,999", cy.get("#uriage"))
export function  typeToInput(manual, value, target) {
	if (value) {
		target.clear({force: true}).type(value)
	} else {
		target.clear({force: true})  // type("") will raise an error
	}
	writeToManual( manual.replace("${value}", " `" + value + "` " )
}

// clickButton
// Example: cmd.clickButton("  - ${value} ボタンを押します。", "一覧",  cy.get("button"))
export function  clickButton(manual, buttonLabel, target) {
	writeToManual( manual.replace("${value}", "[ " + buttonLabel + " ]" )
	target.contains(buttonLabel).click()
}

// click
// Example: cmd.click("  - [ オプション ] にチェックを入れます。",  cy.get("#check-0"))
export function  click(manual, target) {
	target.click()
	writeToManual( manual )
}

// select
// Example: cmd.select("  - 「区分」の${value}を選択します。", "特殊", cy.get("#kubun"))
export function  select(manual, value, target) {
	target.select(value)
	writeToManual( manual.replace("${value}", " `" + value + "` " )
}

// clickRadioButton
export function  clickRadioButton(manual, value, target) {
	target.click()
	writeToManual( manual.replace("${value}", " `" + value + "` " )
}

// getRowIndex
export function  getRowIndex(cellElement, index) {
	if (!index) {
		index = 0
	}

	return  cellElement.eq(index).parentsUntil("tbody").last().invoke("index")
}

// typeToInputInTable
// Example: cmd.typeToInputInTable('「${contain} >> 電話番号」に${value}と入力します。', '太郎', '0120-000-000',
//    '[data-test="table-phone-${iRow}"]')
// Example: cmd.typeToInputInTable('${contain+1}行目の「電話番号」に${value}と入力します。', 0, '0120-000-000',
//    '[data-test="table-phone-${iRow}"]')
export function  typeToInputInTable(manual, containOrIndexedIt, value, getParameter) {
	if (typeof containOrIndexedIt === 'string') {
		const  containArray = parseArrayCode(containOrIndexedIt)
		const  contain = containArray.array

		getRowIndex(cy.get(`input[title="${contain}"]`), containArray.index).then((iRow) => {
			typeToInput(
				manual.replace('${contain}', contain).replace('${value}', value),
				value,
				cy.get(getParameter.replace('${iRow}', iRow).replace('${iRow+1}', iRow + 1))
		})
	} else {
		const iRow = containOrIndexedIt
		typeToInput(
			manual.replace('${contain}', iRow).replace('${contain+1}', iRow + 1).replace('${value}', value),
			value,
			cy.get(getParameter.replace('${iRow}', iRow).replace('${iRow+1}', iRow + 1))
	}
}

// parseArrayCode
// Example: const  arr = parseArrayCode("arr[1]");  arr.array === "arr";  arr.index === 1;
function  parseArrayCode(arrayCode) {
	const  match = /\[[0-9]+\]/g.exec(arrayCode)  // [n]
	if (match) {
		const  first = 0
		const  beforeIndex = arrayCode.substr( 0,  match.index )
		const  afterIndex = arrayCode.substr( match.index + match[first].length )
		const  index = match[first].substr( 1,  match[first].length - 2 )

		return {
			array: beforeIndex + afterIndex,
			index: parseInt(index, 10),
		}
	} else {
		return {
			array: arrayCode,
			index: 0,
		}
	}
}

// uploadFile
// Example: cmd.uploadFile( cy.get('#input-file'), 'README.txt')
export function  uploadFile(target, fileName, fileType) {
	target.then( (subject) => {
		cy.fixture(fileName, 'base64')
			.then(Cypress.Blob.base64StringToBlob)
			.then( (blob) => {
				cy.log(blob);
				const el = subject[0];
				const testFile = new File([blob], fileName, { type: fileType });
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(testFile);
				el.files = dataTransfer.files;
			});
	});
}
