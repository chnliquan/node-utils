import fs from 'fs'
import os from 'os'
import util from 'util'
import path from 'path'
import { v4 } from 'uuid'
import rimraf from 'rimraf'
import parseJSON from 'parse-json'
import mkdirp from 'mkdirp'
import requireFromString from 'require-from-string'
import ejs from 'ejs'

import { PLATFORM, TEMP_DIR } from './const'
import { EjsOptions } from './types'

export function readJSONSync(file: string): Record<string, any> {
  try {
    return parseJSON(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    return Object.create(null)
  }
}

export function writeJSONSync(file: string, data: Record<string, any>): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

export function safeWriteFileSync(file: string, data: string): void {
  const tmpFile = `${file}.${v4()}-tmp`

  try {
    fs.writeFileSync(tmpFile, data)
    fs.renameSync(tmpFile, file)
  } catch (err) {
    // 如果发生异常, 就将 tmpFile 删除掉
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile)
    }
  }
}

export function safeWriteJSONSync(file: string, data: Record<string, unknown>): void {
  const tmpFile = `${file}.${v4()}-tmp`

  try {
    writeJSONSync(tmpFile, data)
    fs.renameSync(tmpFile, file)
  } catch (err) {
    // 如果发生异常, 就将 tmpFile 删除掉
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile)
    }
  }
}

export function fstatSync(file: string, symlink?: boolean): fs.Stats | boolean {
  try {
    return symlink ? fs.lstatSync(file) : fs.statSync(file)
  } catch (err) {
    return false
  }
}

export function existsSync(file: string): boolean {
  return !!fstatSync(file)
}

export function getExecutableCmd(target: string, dirs?: string[]): string | null {
  if (!dirs) {
    dirs = (process.env.PATH || '').split(':')
  }

  for (const dir of dirs) {
    const p = path.join(dir, target)

    if (existsSync(p)) {
      return p
    }
  }

  return null
}

export function isFile(file: string): boolean {
  const stat = fstatSync(file) as fs.Stats
  return stat ? stat.isFile() : false
}

export function isDirectory(dir: string): boolean {
  const stat = fstatSync(dir) as fs.Stats
  return stat ? stat.isDirectory() : false
}

export function isSymlink(link: string): boolean {
  const stat = fstatSync(link, true) as fs.Stats
  return stat ? stat.isSymbolicLink() : false
}

export function removeSync(path: string): void {
  rimraf.sync(path)
}

export function moveSync(src: string, dest: string, overwrite?: boolean): void {
  if (overwrite) {
    removeSync(dest)
    fs.renameSync(src, dest)
    return
  }

  if (existsSync(dest)) {
    throw Error(`The dest ${dest} already exists`)
  } else {
    fs.renameSync(src, dest)
  }
}

export function mkdirSync(dir: string): void {
  if (!existsSync(dir)) {
    mkdirp.sync(dir)
  }
}

export function tmpdir(random?: boolean): string {
  let tmpdir

  if (process.platform === PLATFORM.WIN) {
    tmpdir = os.tmpdir()
  } else {
    tmpdir = path.join(process.env.HOME || os.homedir(), TEMP_DIR)

    try {
      mkdirSync(tmpdir)
    } catch (err) {
      tmpdir = os.tmpdir()
    }
  }

  if (random) {
    const name = util.format('cli-tmp-%s-%s', Date.now(), Math.ceil(Math.random() * 1000))

    tmpdir = path.join(tmpdir, name)
    mkdirSync(tmpdir)

    return tmpdir
  } else {
    return tmpdir
  }
}

export function loadTsFile(path: string): Record<string, any> {
  const content = require('@babel/core').transform(fs.readFileSync(path, 'utf8'), {
    babelrc: false,
    configFile: false,
    filename: path,
    presets: [
      [
        require('@babel/preset-env'),
        {
          targets: {
            node: 'current',
          },
        },
      ],
      require('@babel/preset-typescript'),
    ],
  })

  const m = requireFromString(content && content.code ? content.code : '', path)
  return m.default || m
}

export async function renderTemplate(
  content: string,
  data: Record<string, unknown>,
  options: EjsOptions = {}
): Promise<string> {
  const template = ejs.compile(content, options)
  return template(data)
}
