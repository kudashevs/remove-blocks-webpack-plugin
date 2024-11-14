const {describe, expect, it} = require('@jest/globals');
const {createCompiler, createCompilerWithEnv, getCompiledFixture} = require('../helpers/compiler');
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
    ['production', '/* devblock:start */ any /* devblock:end */'],
    ['test', '/* devblock:start */ any /* devblock:end */'],
  ])('can proceed in %s environment', async (environment, input) => {
    const webpackWithEnv = createCompilerWithEnv(environment, input);

    const output = await getCompiledFixture(webpackWithEnv);

    expect(output).toEqual(expect.not.stringContaining(input));
  });

  // prettier-ignore
  it.each([
    ['development', '/* devblock:start */ any /* devblock:end */'],
  ])('can skip in %s environment', async (environment, input) => {
    const webpackWithEnv = createCompilerWithEnv(environment, input);

    const output = await getCompiledFixture(webpackWithEnv);

    expect(output).toEqual(expect.stringContaining(input));
  });

  it('can skip development environment set with a webpack option', async () => {
    const input = '/* dev:start */ any /* dev:end */';
    const webpack = createCompiler(
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
    );

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(input));
  });

  it('can handle a none mode option', async () => {
    const input = '/* devblock:start */ any /* devblock:end */';
    const webpack = createCompiler(input, {}, {mode: 'none'});

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.not.stringContaining(input));
  });

  it('can handle an empty blocks options', async () => {
    const input = '/* devblock:start */ any /* devblock:end */';
    const webpack = createCompiler(input, {blocks: []});

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.not.stringContaining(input));
  });

  it.each([
    ['is of a wrong type', {blocks: 'wrong'}, 'blocks option must be an array'],
    ['has a wrong value', {blocks: [42]}, 'blocks.0 should be a string or a valid object'],
  ])('can validate blocks option when it %s', async (_, options, expected) => {
    const webpack = createCompiler('any', options);

    try {
      await getCompiledFixture(webpack);
    } catch (e) {
      expect(e.message).toMatch(expected);
    }

    expect.assertions(1);
  });

  it('can remove a code block marked with the colon (default block representation)', async () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const webpack = createCompiler(input);

    const expected = 'visible ';
    const unexpected = '/* devblock:start */ "will be removed" /* devblock:end */';

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(expected));
    expect(output).toEqual(expect.not.stringContaining(unexpected));
  });

  it('can use special characters in names', async () => {
    const input = 'visible <!-- *devblock!:start --> will be removed <!-- *devblock!:end -->';
    const webpack = createCompiler(input, {
      blocks: [
        {
          name: '*devblock!',
          prefix: '<!--',
          suffix: '-->',
        },
      ],
    });

    const expected = 'visible ';
    const unexpected = '<!-- *devblock!:start --> will be removed <!-- *devblock!:end -->';

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(expected));
    expect(output).toEqual(expect.not.stringContaining(unexpected));
  });

  it('can remove a code block marked in lower case', async () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const webpack = createCompiler(input);

    const expected = 'visible ';
    const unexpected = '/* devblock:start */ will be removed /* devblock:end */';

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(expected));
    expect(output).toEqual(expect.not.stringContaining(unexpected));
  });

  it('cannot remove a code block marked in upper case with default options', async () => {
    const input = "visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */";
    const webpack = createCompiler(input);

    const expected = `visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */`;

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(expected));
  });

  it('can remove a code block marked in upper case with the specific options', async () => {
    const input = 'visible /* DEVBLOCK:start */ will be removed /* DEVBLOCK:end */';
    const webpack = createCompiler(input, {
      blocks: [
        {
          name: 'DEVBLOCK',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    });

    const expected = 'visible ';
    const unexpected = '/* DEVBLOCK:start */ will be removed /* DEVBLOCK:end */';

    const output = await getCompiledFixture(webpack);

    expect(output).toEqual(expect.stringContaining(expected));
    expect(output).toEqual(expect.not.stringContaining(unexpected));
  });
});
