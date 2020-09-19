import * as cmd from "../my-cmd.js"
import * as lib from "../my-lib.js"
const mailAddressA = "a@example.com";
const testQueryParameter = "?mail=" + mailAddressA;
const httpOrigin = lib.env('HttpOrigin') + testQueryParameter

describe('Location', () => {
	before(() => {
		cmd.visitSync( httpOrigin,  httpOrigin, {timeout: 5000} )
	})

	it( 'test of test', () => {


		cmd.log('ファイルを選択する')
		cmd.uploadFile( cy.get('[data-test="file-selector"]'), '申請書.docx')
		cy.get('[data-test="file-selector"]').trigger('change')
		cy.get('[data-test="signed-user-list"]').should('be.visible')


		cmd.log('署名を追加する')
		cy.get('button[data-test="sign"]').click()
		cy.get('button[data-test="ok"]').click()
		cy.get('p[data-test="guide"]', {timeout: 20000}).should('contains.text', '署名しました')
		cy.get('button[data-test="cancel"]').click()
		cy.get('[data-test="signer-0"]').should('have.text', mailAddressA)
		cy.get('[data-test="signer-0"]').should('not.have.class', 'strikethrough-line')


		cmd.log('署名を取り消す')
		cy.get('button[data-test="delete-signature"]').click()
		cy.get('button[data-test="ok"]').click()
		cy.get('p[data-test="guide"]', {timeout: 20000}).should('contains.text', '取り消しました')
		cy.get('button[data-test="cancel"]').click()
		cy.get('[data-test="signer-0"]').should('have.class', 'strikethrough-line')
		cy.get('[data-test="signer-0"]').should('have.text', mailAddressA)

		.then( () => {
			cmd.log('現在選択中のファイルに関するデータベースのレコードを削除してから再実行してください。')
		})
	})
})

