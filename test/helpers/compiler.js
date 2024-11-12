const webpack = require('webpack');
const path = require('path');
const Fixture = require('../helpers/keeper');
const {createFsFromVolume, Volume} = require('memfs');
const RemoveBlocksWebpackPlugin = require('../../src/plugin');

function createCompiler(input, pluginOptions = {}, webpackOptions = {}) {
  Fixture.write(input);
  const compiler = webpack({
    cache: false,
    entry: Fixture.path(),
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
          use: 'raw-loader',
        },
      ],
    },
    plugins: [new RemoveBlocksWebpackPlugin(pluginOptions)],
    ...webpackOptions,
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return compiler;
}

function createCompilerWithEnv(environment, input = '', pluginOptions = {}, webpackOptions = {}) {
  process.env.NODE_ENV = environment;

  return createCompiler(input, pluginOptions, webpackOptions);
}

async function compile(compiler) {
  const compileStats = await new Promise((resolve, reject) => {
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

  return getCompiled(compiler, compileStats);
}

function getCompiled(compiler, stats) {
  const asset = stats.toJson({source: true}).assets[0].name;
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;

  let data = '';
  let targetFile = asset;

  const queryStringIdx = targetFile.indexOf('?');

  if (queryStringIdx >= 0) {
    targetFile = targetFile.slice(0, queryStringIdx);
  }

  try {
    data = usedFs.readFileSync(path.join(outputPath, targetFile)).toString();
  } catch (error) {
    data = error.toString();
  }

  return data;
}

module.exports = {createCompiler, createCompilerWithEnv, compile};
