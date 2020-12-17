import { KDLexer } from '../lib/KDLexer';

describe('KDLexer', () => {
	let subject: KDLexer;

	const scenarios: Array<[string, string, string[]]> = [
		['string and number', 'foo 2010', ['foo', '2010']],
		['string and url', 'foo http://cnn.com', ['foo', 'http://cnn.com']],
		['date', '2006/5/23', ['2006/5/23']],
		['date and string', '2006/5/23 foo', ['2006/5/23', 'foo']],
		['string and date', 'foo 2018/5/23', ['foo', '2018/5/23']],
	];

	describe.each(scenarios)('when input is %s', (_, input, expected) => {
		beforeEach(() => {
			subject = new KDLexer(input);
		});

		it(`should match: ${expected}`, () => {
			expect(subject.tokens.map(token => token.text)).toEqual(expect.arrayContaining(expected));
		});
	});
});
