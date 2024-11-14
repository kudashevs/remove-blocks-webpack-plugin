const {describe, expect, it} = require('@jest/globals');
const {compileAll, compileAllWithEnv, compile, getCompiledFixture} = require('../helpers/compiler');
const FixtureKeeper = require('../helpers/fixture-keeper');

describe('default test suite', () => {
  const originalMode = process.env.NODE_ENV;

  beforeAll(() => {
    FixtureKeeper.open();
  });

  beforeEach(() => {
    process.env.NODE_ENV = originalMode;
  });

  afterAll(() => {
    FixtureKeeper.close();
  });

  it.each([
    ['production', '/* devblock:start */ any /* devblock:end */', ''],
    ['test', '/* devblock:start */ any /* devblock:end */', ''],
  ])('can proceed in %s environment', async (environment, input, expected) => {
    const output = (await compileAllWithEnv(environment, input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  // prettier-ignore
  it.each([
    ['development', '/* devblock:start */ any /* devblock:end */', '/* devblock:start */ any /* devblock:end */'],
  ])('can skip in %s environment', async (environment, input, expected) => {
    const output = (await compileAllWithEnv(environment, input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can skip development environment set with a webpack option', async () => {
    const input = '/* dev:start */ any /* dev:end */';
    const expected = '/* dev:start */ any /* dev:end */';

    const output = (
      await compileAll(
        input,
        {
          blocks: [
            {
              name: 'dev',
              prefix: '/*',
              suffix: '*/',
            },
          ],
        },
        {mode: 'development'},
      )
    ).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can handle a none mode option', async () => {
    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    const output = (await compileAll(input, {}, {mode: 'none'})).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can handle an empty blocks options', async () => {
    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    const output = (await compileAll(input, {}, {mode: 'none'})).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it.each([
    ['is of a wrong type', {blocks: 'wrong'}, 'blocks option must be an array'],
    ['has a wrong value', {blocks: [42]}, 'blocks.0 should be a string or a valid object'],
  ])('can validate blocks option when it %s', async (_, options, expected) => {
    try {
      await compileAll('any', options);
    } catch (e) {
      expect(e.message).toMatch(expected);
    }

    expect.assertions(1);
  });

  it('can remove a code block marked with the colon (default block representation)', async () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    const output = (await compileAll(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can use special characters in names', async () => {
    const input = 'visible <!-- *devblock!:start --> will be removed <!-- *devblock!:end -->';
    const expected = 'visible ';

    const output = (
      await compileAll(input, {
        blocks: [
          {
            name: '*devblock!',
            prefix: '<!--',
            suffix: '-->',
          },
        ],
      })
    ).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can remove a code block marked in lower case', async () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    const output = (await compileAll(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('cannot remove a code block marked in upper case with default options', async () => {
    const input = "visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */";
    const expected = `visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */`;

    const output = (await compileAll(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can remove a code block marked in upper case with the specific options', async () => {
    const input = 'visible /* DEVBLOCK:start */ will be removed /* DEVBLOCK:end */';
    const expected = 'visible ';

    const output = (
      await compileAll(input, {
        blocks: [
          {
            name: 'DEVBLOCK',
            prefix: '/*',
            suffix: '*/',
          },
        ],
      })
    ).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });
});
