const {getOptions} = require('loader-utils');
const loader = require('../../src/index');

jest.mock('loader-utils');

describe('default test suite', () => {
  const originalMode = process.env.NODE_ENV;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    ['production', '/* devblock:start */ any /* devblock:end */', ''],
    ['test', '/* devblock:start */ any /* devblock:end */', ''],
  ])('can proceed in %s environment', (environment, input, expected) => {
    process.env.NODE_ENV = environment;

    expect(process.env.NODE_ENV).toBe(environment);
    expect(loader.call({}, input)).toBe(expected);

    process.env.NODE_ENV = originalMode;
  });

  it.each([
    ['development', '/* devblock:start */ any /* devblock:end */', '/* devblock:start */ any /* devblock:end */'],
  ])('can skip in %s environment', (environment, input, expected) => {
    process.env.NODE_ENV = environment;

    expect(process.env.NODE_ENV).toBe(environment);
    expect(loader.call({}, input)).toBe(expected);

    process.env.NODE_ENV = originalMode;
  });

  it('can skip in development from the webpack mode option', () => {
    getOptions.mockReturnValueOnce({
      blocks: [
        {
          name: 'dev',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    });

    const input = '/* dev:start */ any /* dev:end */';
    const expected = '/* dev:start */ any /* dev:end */';

    expect(loader.call({mode: 'development'}, input)).toBe(expected);
  });

  it('can handle an empty mode option', () => {
    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    expect(loader.call({mode: ''}, input)).toBe(expected);
  });

  it('can handle an empty blocks options', () => {
    getOptions.mockReturnValueOnce({
      blocks: [],
    });

    const input = '/* devblock:start */ any /* devblock:end */';
    const expected = '';

    expect(loader.call({}, input)).toBe(expected);
  });

  it.each([
    ['is of a wrong type', {blocks: 'wrong'}, 'blocks option must be an array'],
    ['has a wrong value', {blocks: [42]}, 'blocks.0 should be a string or a valid object'],
  ])('can validate blocks option when it %s', (_, options, expected) => {
    getOptions.mockReturnValueOnce(options);

    try {
      const input = '/* devblock:start */ any /* devblock:end */';

      loader.call({}, input);
    } catch (e) {
      expect(e.message).toBe(expected);
    }
    expect.assertions(1);
  });

  it('can remove a code block marked through the colon (default label)', () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    expect(loader.call({}, input)).toBe(expected);
  });

  it('can use special characters in labels', () => {
    getOptions.mockReturnValueOnce({
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

    expect(loader.call({}, input)).toBe(expected);
  });

  it('can remove a code block marked in lower case', () => {
    const input = 'visible /* devblock:start */ will be removed /* devblock:end */';
    const expected = 'visible ';

    expect(loader.call({}, input)).toBe(expected);
  });

  it('cannot remove a code block marked in upper case with default settings', () => {
    const input = "visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */";
    const expected = "visible /* DEVBLOCK:START */ won't be removed /* DEVBLOCK:END */";

    expect(loader.call({}, input)).toBe(expected);
  });

  it('can remove a code block marked in upper case with provided settings', () => {
    getOptions.mockReturnValueOnce({
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

    expect(loader.call({}, input)).toBe(expected);
  });
});
