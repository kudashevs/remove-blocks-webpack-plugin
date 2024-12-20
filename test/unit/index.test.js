const {describe, expect, it} = require('@jest/globals');
const {createWebpack, createWebpackWithEnv} = require('../helpers/compiler');
const EntryKeeper = require('../helpers/entry-keeper');

describe('default test suite', () => {
  const originalMode = process.env.NODE_ENV;
  const keeper = new EntryKeeper();

  beforeAll(() => {
    keeper.open('default.tmp');
  });

  beforeEach(() => {
    process.env.NODE_ENV = originalMode;
  });

  afterAll(() => {
    keeper.close();
  });

  it.each([
    ['production', '/* devblock:start */ any /* devblock:end */', ''],
    ['test', '/* devblock:start */ any /* devblock:end */', ''],
  ])('can proceed in %s environment', async (environment, input, expected) => {
    const webpack = createWebpackWithEnv(keeper, environment);

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  // prettier-ignore
  it.each([
    ['development', '/* devblock:start */ any /* devblock:end */', '/* devblock:start */ any /* devblock:end */'],
  ])('can skip in %s environment', async (environment, input, expected) => {
    const webpack = createWebpackWithEnv(keeper, environment);

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can skip development environment set with a webpack option', async () => {
    const webpack = createWebpack(keeper, {}, {mode: 'development'});

    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '/* devblock:start */ any /* devblock:end */';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can handle a none mode option', async () => {
    const webpack = createWebpack(keeper, {}, {mode: 'none'});

    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can handle an empty blocks options', async () => {
    const webpack = createWebpack(keeper, {blocks: []});

    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it.each([
    ['is of a wrong type', {blocks: 'wrong'}, 'blocks option must be an array'],
    ['has a wrong value', {blocks: [42]}, 'blocks.0 should be a string or a valid object'],
  ])('can validate blocks option when it %s', async (_, options, expected) => {
    const webpack = createWebpack(keeper, options);

    try {
      await webpack.compile('any');
    } catch (e) {
      expect(e.message).toMatch(expected);
    }

    expect.assertions(1);
  });

  it('can remove a code block marked with the colon (default block representation)', async () => {
    const webpack = createWebpack(keeper);

    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can use special characters in names', async () => {
    const webpack = createWebpack(keeper, {
      blocks: [
        {
          name: '*devblock!',
          prefix: '<!--',
          suffix: '-->',
        },
      ],
    });

    const input = 'visible <!-- *devblock!:start --> will be removed <!-- *devblock!:end -->';
    const expected = 'visible ';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can remove a code block marked in lower case', async () => {
    const webpack = createWebpack(keeper);

    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('cannot remove a code block marked in upper case with default options', async () => {
    const webpack = createWebpack(keeper);

    const input = "visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */";
    const expected = `visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */`;

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can remove a code block marked in upper case with the specific options', async () => {
    const webpack = createWebpack(keeper, {
      blocks: [
        {
          name: 'DEVBLOCK',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    });

    const input = 'visible /* DEVBLOCK:start */ will be removed /* DEVBLOCK:end */';
    const expected = 'visible ';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });

  it('can replace a code block with a replacement', async () => {
    const webpack = createWebpack(keeper, {
      blocks: [
        {
          name: 'devblock',
          prefix: '<!--',
          suffix: '-->',
          replacement: '<!-- replaced -->',
        },
      ],
    });

    const input = 'visible <!-- devblock:start --> will be replaced <!-- devblock:end -->';
    const expected = 'visible <!-- replaced -->';

    const output = (await webpack.compile(input)).getCompiledFixture();

    expect(output).toStrictEqual(expected);
  });
});
