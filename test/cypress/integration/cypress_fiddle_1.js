/// <reference types="@cypress/fiddle" />

const helloTest = {
  html: `
    <div>Hello</div>
  `,
  test: `
    cy.get('div').should('be.contain', 'Hello')
  `
}

it('tests hello', () => {
  cy.runExample(helloTest)
})