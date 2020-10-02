import * as cmd from "../my-cmd.js"
import * as lib from "../my-lib.js"
const mailAddressA = "a@example.com";
const mailAddressB = "b@example.com";
const httpOrigin = lib.env('HttpOrigin')

describe('Users', () => {
	it( 'test of test', () => {

		for (const i  of  [
			{
				id: 0,
				mailAddress: mailAddressA,
			}, {
				id: 1,
				mailAddress: mailAddressB,
			},
		]) {
			cmd.visitSync( httpOrigin + "?mail=" + i.mailAddress,  undefined, {timeout: 5000} )


			cmd.log('ユーザーのメールアドレスをチェックする')
			cy.get('[data-test="user-info"]').click()
			cmd.waitForAnimation('[data-test="user-mail-address"]')
			cy.get('[data-test="user-mail-address"]').should('have.value', i.mailAddress)
			cmd.clickCloseModalButton('', '[data-test="close-user-info"]')


			cmd.log('ファイルを選択する')
			cmd.uploadFile( cy.get('[data-test="file-selector"]'), '申請書.docx')
			cy.get('[data-test="file-selector"]').trigger('change')
			cy.get('[data-test="signed-user-list"]').should('be.visible')


			cmd.log('署名を追加する')
			cy.get('button[data-test="sign"]').click()
			cmd.waitForAnimation('button[data-test="ok"]')
			cy.get('button[data-test="ok"]').click()
			cy.get('p[data-test="guide"]', {timeout: 20000}).should('contains.text', '署名しました')
			cmd.clickCloseModalButton('', '[data-test="close-confirmation"]')
			cy.get(`[data-test="signer-${i.id}"]`).should('have.text', i.mailAddress)
			cy.get(`[data-test="signer-${i.id}"]`).should('not.have.class', 'strikethrough-line')
			let now = new Date()
			cmd.isAboutTheSameTimeInJapanese( cy.get(`[data-test="date-${i.id}"]`), now, 5 )


			cmd.log('署名を取り消す')
			cy.get('button[data-test="delete-signature"]').click()
			cmd.waitForAnimation('button[data-test="ok"]')
			cy.get('button[data-test="ok"]').click()
			cy.get('p[data-test="guide"]', {timeout: 20000}).should('contains.text', '取り消しました')
			cmd.clickCloseModalButton('', '[data-test="close-confirmation"]')
			cy.get(`[data-test="signer-${i.id}"]`).should('have.class', 'strikethrough-line')
			cy.get(`[data-test="signer-${i.id}"]`).should('have.text', i.mailAddress)
			now = new Date()
			cmd.isAboutTheSameTimeInJapanese( cy.get(`[data-test="date-${i.id}"]`), now, 5 )
		}
		const anyTarget = cy.get('[data-test="signer-0"]')

		anyTarget.then( () => {
			cmd.log('現在選択中のファイルに関するデータベースのレコードを削除してから再実行してください。')
		})
	})
})

