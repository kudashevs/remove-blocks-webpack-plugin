const {describe, expect, it} = require('@jest/globals');
const converter = require('../helpers/converter.js');
const {createWebpack} = require('../helpers/compiler');
const FixtureKeeper = require('../helpers/entry-keeper');
const RemoveBlocksWebpackPlugin = require('../../src');

describe('README example test suite', () => {
  const input = `function makeFoo(bar, baz) {
    /* debug:start */ console.log('creating Foo'); /* debug:end */
    // development:start
    if (bar instanceof Bar !== true) {
        throw new Error('makeFoo: bar param must be an instance of Bar');
    }
    // development:end
    // development:start
    if (baz instanceof Baz !== true) {
        throw new Error('makeFoo: baz param must be an instance of Baz');
    }
    // development:end
    // This code will remain
    return new Foo(bar, baz);
}`;

  const expected = `function makeFoo(bar, baz) {
    // This code will remain
    return new Foo(bar, baz);
}`;

  beforeAll(() => {
    FixtureKeeper.open('example.tmp');
  });

  afterAll(() => {
    FixtureKeeper.close();
  });

  it('can process the example from README.md', async () => {
    const webpack = createWebpack(
      {},
      {
        plugins: [
          new RemoveBlocksWebpackPlugin({
            blocks: [
              'debug',
              {
                name: 'development',
                prefix: '//',
                suffix: '',
              },
            ],
          }),
        ],
      },
    );

    const output = (await webpack.compile(input)).getCompiledOutput();

    expect(converter(output)).toMatch(converter(expected));
  });
});
