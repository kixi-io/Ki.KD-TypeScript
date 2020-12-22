import { KDate } from '../lib/KDate';
import { Quantity } from '../lib/Quantity';
import { KD, listOf } from '../lib/_internal';

describe('KD', () => {
	describe('Numbers', () => {
		const scenarios: Array<[string, number]> = [
			['5', 5],
			['-5', -5],
			['5.5', 5.5],
			['.5', 0.5],
			['-.5', -0.5],
			['0xFF', 255],
		];

		describe.each(scenarios)('when input is: %s', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.value(input)).toEqual(expected);
			});
		});
	});

	describe('Basic', () => {
		const scenarios: Array<[string, string]> = [
			['foo 12 bill `hi` true false nil', `foo 12 "bill" "hi" true false nil`],
			['foo:nugget 12_000 bill `hi` true false nil', `foo:nugget 12000 "bill" "hi" true false nil`],
		];

		describe.each(scenarios)('when input is: %s', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.eval(input).toString()).toEqual(expected);
			});
		});
	});

	describe('Comments', () => {
		const scenarios: Array<[string, string]> = [
			[
				`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com // comment`,
				`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
			],
			[
				`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com # comment`,
				`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
			],
			[
				'foo:nugget 12 /* name=`john` */ horses= 2 cool = true url=http://cnn.com',
				`foo:nugget 12 horses=2 cool=true url=http://cnn.com/`,
			],
		];

		describe.each(scenarios)('when input is: %s', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.eval(input).toString()).toEqual(expected);
			});
		});
	});

	describe('String block', () => {
		it('should match: Foo\\n Bar', () => {
			expect(
				KD.eval(
					`multiline \`
      Foo
      Bar
     \``
				).value()
			).toEqual(' Foo\n Bar');
		});
	});

	describe('Anonymous Tags', () => {
		it('should match toString', () => {
			expect(KD.eval(`"Aloha"`).toString()).toEqual(`"Aloha"`);
		});

		it('should match multiple values', () => {
			expect(KD.eval(`"Aloha" 808 https://lemur.duke.edu`).toString()).toEqual(`"Aloha" 808 https://lemur.duke.edu/`);
		});

		it(`should match single quoted value`, () => {
			expect(KD.eval(`"Hola"`).value()).toEqual('Hola');
		});

		it(`should match multiple string values`, () => {
			expect(KD.eval(`"Hola" "Alejandro"`).values).toEqual(expect.arrayContaining(listOf('Hola', 'Alejandro')));
		});

		it(`should match nested values`, () => {
			const actual = KD.eval(`
      greetings {
          "Bula"
          "Aloha"
          "Hola"
      }
      `).children;
			const { values } = listOf(KD.eval('"Bula"'), KD.eval('"Aloha"'), KD.eval('"Hola"'));

			expect(actual).toHaveLength(3);
			expect(actual).toMatchObject({ values });
		});
	});

	describe('String with \\ continuation', () => {
		it('should match: continue 1 2 3', () => {
			expect(
				KD.eval(
					`continue 1 2 \
        3
        `
				).toString()
			).toEqual('continue 1 2 3');
		});
	});

	describe('Tags with children', () => {
		it('should match', () => {
			const tag = KD.eval(`
    Foo 1 2
    Bar 3 4 /* foo */ greet="hi" # foo

    fancy 5 6 url=https://www.nist.gov yellow=0xff00ff {

        child1 "hi" { "anon child" }
        child2 "foo" favcolors=[red, green] {
            Hi test=true

        }
    }
    `);

			const expected = `root {
  Foo 1 2
  Bar 3 4 greet="hi"
  fancy 5 6 url=https://www.nist.gov/ yellow=16711935 {
    child1 "hi" {
      "anon child"
    }
    child2 "foo" favcolors=["red", "green"] {
      Hi test=true
    }
  }
}`;

			// log(tag.getChild('fancy'));
			expect(tag.toString()).toEqual(expected);
		});
	});

	describe('Dates', () => {
		const scenarios: Array<[string]> = [
			['2020/5/11'],
			// ISO version
			['2024-05-11'],
		];

		describe.each(scenarios)('when input is: %s', input => {
			it('should match', () => {
				const { day, month, year } = KDate.parse(input);

				expect(KD.value(input)).toMatchObject({ day, month, year });
			});
		});
	});

	describe('Lists', () => {
		const scenarios: Array<[string, string]> = [
			['[1,2,3]', `[1, 2, 3]`],
			['[1 2 3]', `[1, 2, 3]`],
			['[1,2,[3]]', `[1, 2, [3]]`],
			['[1,2,[3,4]]', `[1, 2, [3, 4]]`],
			['[1,2,[3,4], 5]', `[1, 2, [3, 4], 5]`],
		];

		describe.each(scenarios)('when input is: %o', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.stringify(KD.value(input))).toEqual(expected);
			});
		});

		const singleValueScenarios: Array<[string, string]> = [['[]', `[]`]];

		describe.each(singleValueScenarios)('when input is: %o', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.stringify(KD.eval(input).value())).toEqual(expected);
			});
		});

		const multiValueScenarios: Array<[string, string]> = [
			['[1,2,[3,4], 5, 6] foo', `[[1, 2, [3, 4], 5, 6], "foo"]`],
			['nums [1,2,[3,4,[5, 6]], 7] foo', `[[1, 2, [3, 4, [5, 6]], 7], "foo"]`],
		];

		describe.each(multiValueScenarios)('when input is: %o', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.stringify(KD.eval(input).values)).toEqual(expected);
			});
		});
	});

	describe('Lists w/ newline separated items', () => {
		it('should match', () => {
			expect(
				KD.stringify(
					KD.value(`[
            fee
            fi
            foe
            fum
        ]`)
				)
			).toEqual(`["fee", "fi", "foe", "fum"]`);
		});
	});

	describe('Maps', () => {
		const scenarios: Array<[string, string]> = [
			['[=]', '[=]'],
			['[name=`Mika`]', `["name"="Mika"]`],
			['[5=`num`]', `[5="num"]`],
			['[[2, 3]=`num`]', `[[2, 3]="num"]`],
		];

		describe.each(scenarios)('when input is: %s', (input, expected) => {
			it(`should match: ${expected}`, () => {
				expect(KD.stringify(KD.value(input))).toEqual(expected);
			});
		});
	});

	describe('Calls', () => {
		const singleValueScenarios: Array<[string, string]> = [
			['color()', 'color()'],
			['num(1)', 'num(1)'],
		];

		describe.each(singleValueScenarios)('when input is: %s', (input, expected) => {
			it('should match', () => {
				expect('' + KD.eval(input).value()).toEqual(expected);
			});
		});

		const multiValueScenarios: Array<[string, string]> = [
			[' rgb(1, 2, 3)', 'rgb(1, 2, 3)'],
			// no commas
			['rgb(1 2 3)', 'rgb(1, 2, 3)'],
			['rgb(1 2 3 a=1)', 'rgb(1, 2, 3, a=1)'],
			// anonymous tag with Call value
			['rgb(1, 2, 3)', 'rgb(1, 2, 3)'],
		];

		describe.each(multiValueScenarios)('when input is: %s', (input, expected) => {
			it('should match', () => {
				expect('' + KD.value(input)).toEqual(expected);
			});
		});
	});

	describe('Quantities', () => {
		beforeAll(() => {
			Quantity.registerUnits('vh', 'vw', 'em', 'rem', 'px', '%');
		});

		const parseScenarios: Array<[string, number, string]> = [
			['2vh', 2, 'vh'],
			['-2px', -2, 'px'],
			['.5vw', 0.5, 'vw'],
			['-.5vw', -0.5, 'vw'],
			['1.5vw', 1.5, 'vw'],
		];

		describe.each(parseScenarios)('when input is: %s', (input, value, unit) => {
			it('should match', () => {
				expect(Quantity.parse(input).toString()).toEqual(new Quantity(value, unit).toString());
			});
		});

		const valueScenarios: Array<[string, number, string]> = [
			['1.5vw', 1.5, 'vw'],
			['25%', 25, '%'],
			['5px', 5, 'px'],
			['foo 23rem', 23, 'rem'],
		];

		describe.each(valueScenarios)('when input is: %s', (input, value, unit) => {
			it('should match', () => {
				const { value: qValue, unit: qUnit } = new Quantity(value, unit);

				expect(KD.value(input)).toMatchObject({ value: qValue, unit: qUnit });
			});
		});

		const errorScenarios: Array<[number, string, string]> = [
			[2, '', 'Quantity requires a value and a unit.'],
			[2, 'eon', 'eon is not a registered unit.'],
		];

		describe.each(errorScenarios)('when input is: %o', (value, unit, expectedError) => {
			expect(() => {
				new Quantity(value, unit);
			}).toThrowError(expectedError);
		});
	});
});
