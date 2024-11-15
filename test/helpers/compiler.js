const webpack = require('webpack');
const path = require('path');
const Fixture = require('../helpers/fixture-keeper');
const {createFsFromVolume, Volume} = require('memfs');
const RemoveBlocksWebpackPlugin = require('../../src/plugin');

function createWebpack(pluginOptions = {}, webpackOptions = {}) {
  const compiler = webpack({
    cache: false,
    entry: {
      fixture: Fixture.path(),
    },
    optimization: {
      minimize: false,
    },
    output: {
      pathinfo: false,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tmp$/i,
          use: [
            {
              loader: path.resolve(__dirname, './raw-emitter.js'),
              options: {},
            },
          ],
        },
      ],
    },
    plugins: [new RemoveBlocksWebpackPlugin(pluginOptions)],
    ...webpackOptions,
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return {
    async compile(input) {
      const compileStats = await compile(input, compiler);
      return {
        getCompiledOutput() {
          return retrieveCompiledOutput(compiler, compileStats);
        },
        getCompiledFixture() {
          return retrieveCompiledFixture(compiler, compileStats);
        },
      };
    },
  };
}

function createWebpackWithEnv(environment, pluginOptions = {}, webpackOptions = {}) {
  process.env.NODE_ENV = environment;

  return createWebpack(pluginOptions, webpackOptions);
}

async function compile(input, compiler) {
  Fixture.write(input);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.toJson().errors));
      }

      if (compiler.close) {
        compiler.close(() => {
          resolve(stats);
        });
      } else {
        resolve(stats);
      }
    });
  });
}

function retrieveCompiledFixture(compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  const targetFile = path.basename(compiler.options.entry.fixture.import[0]);

  let data = '';

  try {
    data = usedFs.readFileSync(path.join(outputPath, targetFile)).toString();
  } catch (error) {
    data = error.toString();
  }

  return data;
}

function retrieveCompiledOutput(compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  const asset = stats.toJson({source: true}).assets[0].name;

  let data = '';

  try {
    data = usedFs.readFileSync(path.join(outputPath, asset)).toString();
  } catch (error) {
    data = error.toString();
  }

  return data;
}

module.exports = {createWebpack, createWebpackWithEnv};
