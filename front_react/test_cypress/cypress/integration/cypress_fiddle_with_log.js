/// <reference types="@cypress/fiddle" />

const helloTest = {
  html: `
    <div>Hello</div>
  `,
  test: `
	function  main() {
		cy.get('div').then( (element) => {
			log(element)         // <div>
			log(element.text())  // Hello
		})
	}

	// log
	function  log( label,  value ) {
		if (typeof value === 'object') {
			expect( label ).to.not.eq( lib.recursiveAssign( {}, value ) )
		} else if ( label === value ) {
			expect( label ).to.eq( value )
		} else {
			expect( label ).to.not.eq( value )
		}
	}

	// recursiveAssign is nested Object.assign
	function  recursiveAssign(a, b) {
		const bIsObject = (Object(b) === b);
		if (!bIsObject) {
			return b;
		}

		const aIsObject = (Object(a) === a);
		if (!aIsObject) {
			if (b instanceof Array) {
				a = [];
			} else {
				a = {};
			}
		}
		for (const key of Object.keys(b)) {
			a[key] = recursiveAssign(a[key], b[key]);
		}
		return a;
	}

	main()
  `
}

it('tests hello', () => {
  cy.runExample(helloTest)
})