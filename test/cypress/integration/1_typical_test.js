import * as cmd from "../my-cmd.js"
import * as lib from "../my-lib.js"
const testQueryParameter = "?mail=a@example.com"
const httpOrigin = lib.env('HttpOrigin') + testQueryParameter

describe('Location', () => {
	before(() => {
		cmd.visitSync( httpOrigin,  httpOrigin, {timeout: 5000} )
	})

	it( 'test of test', () => {


		cmd.log('署名を追加する')
		cmd.uploadFile( cy.get('[data-test="file-selector"]'), '申請書.docx')
		cy.get('[data-test="file-selector"]').trigger('change')
		cy.get('button[data-test="sign"]').click()
		cy.get('button[data-test="ok"]').click()
		cy.get('p[data-test="guide"]').should('contains.text', '署名しました')
		cy.get('button[data-test="cancel"]').click()


		cmd.log('署名を取り消す')
		cy.get('button[data-test="delete-signature"]').click()
		cy.get('button[data-test="ok"]').click()
		cy.get('p[data-test="guide"]').should('contains.text', '取り消しました')
		cy.get('button[data-test="cancel"]').click()
	})
})

