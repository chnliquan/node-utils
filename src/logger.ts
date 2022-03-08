import chalk from 'chalk'

export class Logger {
  info(message: string): void {
    // console.log(`${chalk.blueBright('[info]')}      ${chalk.gray(message)}`)
    console.log(`${chalk.blueBright(message)}`)
  }

  success(message: string): void {
    // console.log(`${chalk.greenBright('[success]')}   ${message}`)
    console.log(`${chalk.greenBright(message)}`)
  }

  warn(message: string): void {
    // console.log(`${chalk.yellowBright('[warning]')}   ${message}`)
    console.log(`${chalk.yellowBright(message)}`)
  }

  error(message: string): void {
    // console.log(`${chalk.redBright('[error]')}     ${message}`)
    console.log(`${chalk.redBright(message)}`)
  }

  step(prefix: string): (message: string) => void
  step(prefix: string, message: string): void
  step(prefix: string, message?: string): any {
    if (prefix && message) {
      console.log(`${chalk.gray(`>>> ${prefix}:`)} ${chalk.magenta.bold(message)}`)
    } else {
      return (message: string) => {
        console.log(`${chalk.gray(`>>> ${prefix}:`)} ${chalk.magenta.bold(message)}`)
      }
    }
  }

  printErrorAndExit(message: string): void {
    this.error(message)
    process.exit(1)
  }
}

export const logger = new Logger()

logger.info('this is info')
logger.success('this is success')
logger.warn('this is warn')
logger.error('this is error')
