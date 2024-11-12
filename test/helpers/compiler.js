const webpack = require('webpack');
const path = require('path');
const {createFsFromVolume, Volume} = require('memfs');
const RemoveBlocksWebpackPlugin = require('../../src/plugin');

function createCompiler(fixture, pluginOptions = {}, webpackOptions = {}) {
  const compiler = webpack({
    cache: false,
    entry: fixture,
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

function createCompilerWithEnv(environment, fixture = '', pluginOptions = {}, webpackOptions = {}) {
  process.env.NODE_ENV = environment;

  return createCompiler(fixture, pluginOptions, webpackOptions);
}

async function compile(compiler) {
  const isWebpack5 = compiler.webpack && compiler.webpack.version >= '5';

  const compileStats = await new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.toJson().errors));
      }

      if (isWebpack5) {
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
