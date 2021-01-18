import read from 'read'
import cp from 'child_process'

import { MB } from './const'
import { getExecutableCmd } from './file'

export interface Output {
  stdout: string
  stderr: string
}

export function run(cmd: string, options?: cp.ExecOptions, output?: Output): Promise<string> {
  const opts = options || {}
  const op = output || ({} as Output)

  if (!opts.maxBuffer) {
    opts.maxBuffer = 2 * MB
  }

  return new Promise((resolve, reject) => {
    cp.exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        op.stdout = stdout.toString()
        op.stderr = stderr.toString()
        resolve(stdout.toString())
      }
    })
  })
}

export function spawn(cmd: string, args: string[], opts: cp.SpawnOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(cmd, args, opts)

    // child 出现 error 事件时, exit 可能会触发, 也可能不会
    let hasError = false

    child.once('error', err => {
      hasError = true
      reject(err)
    })

    child.once('exit', code => {
      if (hasError) {
        return
      }

      if (code) {
        reject(new Error(`Failed Spawn Command ${cmd}, errorCode is ${code}`))
      } else {
        resolve()
      }
    })
  })
}

export function getPid(cmd: string): Promise<number | null> {
  const parse = (data: string, cmd: string): number | null => {
    const reg = new RegExp('/' + cmd + '$')
    const lines = data.trim().split('\n')

    for (const line of lines) {
      const fields = line.trim().split(/\s+/, 2)

      if (fields.length !== 2) {
        continue
      }

      const [pid, cmdName] = fields

      if (cmdName === cmd || reg.test(cmdName)) {
        return parseInt(pid, 10)
      }
    }

    return null
  }

  return new Promise((resolve, reject) => {
    run('ps -eo pid,comm')
      .then(stdout => {
        const pid = parse(stdout, cmd)
        resolve(pid)
      })
      .catch(reject)
  })
}

export interface SudoOptions {
  spawnOpts?: cp.SpawnOptions
  password?: string
  cachePassword?: boolean
  prompt?: string
}

let cachedPassword: string

export function sudo(args: string[], opts?: SudoOptions): void {
  const NEED_PASSWORD = '#node-sudo-passwd#'
  const { spawnOpts = {}, password, cachePassword, prompt = 'sudo requires your password' } =
    opts || {}
  const bin = getExecutableCmd('sudo')

  args = ['-S', '-p', NEED_PASSWORD].concat(args)
  spawnOpts.stdio = 'pipe'

  const child = cp.spawn(bin!, args, spawnOpts)

  child.stdout!.on('data', chunk => {
    console.log(chunk.toString().trim())
  })

  child.stderr!.on('data', chunk => {
    const lines = chunk.toString().trim().split('\n')

    lines.forEach((line: string) => {
      if (line === NEED_PASSWORD) {
        if (password) {
          child.stdin!.write(password + '\n')
        } else if (cachePassword && cachedPassword) {
          child.stdin!.write(cachedPassword + '\n')
        } else {
          read({ prompt, silent: true }, (err, answer) => {
            child.stdin!.write(answer + '\n')

            if (cachePassword) {
              cachedPassword = answer
            }
          })
        }
      } else {
        console.log(line)
      }
    })
  })
}
