import chalk from 'chalk'
import signale from 'signale'

export class Logger {
  info(...args: string[]): void {
    signale.info(...args)
  }

  success(...args: string[]): void {
    signale.success(...args)
  }

  warn(...args: string[]): void {
    signale.warn(...args)
  }

  error(...args: string[]): void {
    signale.error(...args)
    process.exit(1)
  }

  step(prefix: string, message: string): void {
    console.log(`${chalk.gray(`>>> ${prefix}:`)} ${chalk.magenta.bold(message)}`)
  }

  scope(scope: string): signale.Signale {
    return signale.scope(scope)
  }
}

export const logger = new Logger()
