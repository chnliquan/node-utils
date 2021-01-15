import chalk from 'chalk'
import logSymbols from 'log-symbols'

export class Log {
  info(...args: string[]): void {
    this.log(chalk.cyanBright, [logSymbols.info].concat(args))
  }

  success(...args: string[]): void {
    this.log(chalk.greenBright, [logSymbols.success].concat(args))
  }

  warning(...args: string[]): void {
    this.log(chalk.yellowBright, [logSymbols.warning].concat(args))
  }

  warn(...args: string[]): void {
    this.log(chalk.yellowBright, [logSymbols.warning].concat(args))
  }

  error(...args: string[]): void {
    this.log(chalk.redBright, [logSymbols.error].concat(args))
  }

  private log(func: (...args: any[]) => void, args: string[]): void {
    console.log(func(...args))
  }
}

export const log = new Log()
