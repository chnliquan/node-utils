const path = require('path')
const chalk = require('chalk')
const execa = require('execa')

class Logger {
  info(...args) {
    console.log(...args)
  }

  success(...args) {
    console.log(chalk.greenBright(...args))
  }

  warn(...args) {
    console.log(chalk.yellowBright(...args))
  }

  error(...args) {
    console.log(chalk.redBright(...args))
  }

  step(prefix, message) {
    if (prefix && message) {
      console.log(`${chalk.gray(`>>> ${prefix}:`)} ${chalk.magenta.bold(message)}`)
    } else {
      return message =>
        console.log(`${chalk.gray(`>>> ${prefix}:`)} ${chalk.magenta.bold(message)}`)
    }
  }

  printErrorAndExit(message) {
    this.error(message)
    process.exit(1)
  }
}

function resolveRoot(p) {
  return path.resolve(__dirname, '..', p)
}

function bin(name) {
  return path.resolve(__dirname, '../node_modules/.bin/' + name)
}

function run(bin, args, opts = {}) {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

module.exports = {
  resolveRoot,
  bin,
  run,
  logger: new Logger(),
}
