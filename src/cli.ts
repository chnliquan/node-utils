import readline from 'readline'
import inquirer from 'inquirer'
import ora from 'ora'
import { SpinOptions } from './types'

export function pause(message?: string): Promise<void> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    if (!message) {
      message = 'Press ENTER key to continue...'
    }

    rl.question(message, () => {
      resolve()
      rl.close()
    })
  })
}

export function confirm(message: string, preferNo?: boolean): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        message,
        name: 'confirm',
        default: !preferNo,
      },
    ])
    .then((answers: any) => {
      return answers.confirm
    })
}

export interface Choice {
  name: string
  value: any
}

export function select<T = string, U extends Choice = Choice>(
  message: string,
  choices: U[],
  defaultValue?: string
): Promise<T> {
  const fields = [
    {
      name: 'name',
      message,
      type: 'list',
      choices,
      default: defaultValue,
    },
  ]
  return inquirer.prompt(fields).then(answers => {
    return answers.name
  })
}

export function loopAsk(
  fields: Record<string, any>[],
  defaults: Record<string, any> = {}
): Promise<boolean> {
  return inquirer
    .prompt(
      fields.map(field => {
        const copied = Object.assign({}, field)
        copied.type = copied.type || 'input'
        const name = copied.name || ''

        if (defaults[name]) {
          copied.default = defaults[name]
        }
        return copied
      })
    )
    .then((answers: any) => {
      console.log('你输入的信息如下:')
      console.log(JSON.stringify(answers, null, 2))

      return confirm('如果信息无误, 请按 Y 确认; 如需重新输入, 请按 N').then(isOK => {
        if (isOK) {
          return answers
        } else {
          return loopAsk(fields, answers)
        }
      })
    })
}

export async function spin<T>(
  text: string,
  handler: (...args: any[]) => Promise<T>,
  options?: SpinOptions
): Promise<T> {
  const spinner = ora(text).start()
  const opts = Object.assign(
    {
      successText: text,
      failText: text,
      args: [],
    },
    options
  )

  try {
    const res = await handler(...opts.args)
    spinner.succeed(opts.successText)
    return res
  } catch (error) {
    spinner.fail(opts.failText)
    throw new Error(`Failed spin ${handler}, the error is ${error}`)
  }
}
