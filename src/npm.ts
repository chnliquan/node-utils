import path from 'path'
import fs from 'fs'
import cp from 'child_process'
import inquirer from 'inquirer'
import semver from 'semver'
import chalk from 'chalk'
import urllib from 'urllib'
import which from 'which'

import { PLATFORM } from './const'
import { log } from './log'
import { existsSync, readJSONSync } from './file'

export function getNodePrefix(): string {
  if (process.env.GLOBAL_PREFIX) {
    return process.env.GLOBAL_PREFIX
  } else {
    let prefix = 'usr/local'

    if (process.platform === PLATFORM.WIN) {
      try {
        prefix = cp.execSync('npm prefix -g').toString().trim()
      } catch (err) {
        // ignore
      }
    } else {
      try {
        prefix = path.join(which.sync('node'), '../../')
      } catch (err) {
        // ignore
      }
    }
    process.env.GLOBAL_PREFIX = prefix
    return prefix
  }
}

export interface NpmInfo {
  version: string
  name: string
  bin: string
  main: string
  repository: {
    type: string
    url: string
  }
  [propName: string]: any
}

export function getNpmInfo(pkgName?: string, version?: string): Promise<NpmInfo | null> {
  if (!pkgName) {
    return Promise.resolve(null)
  }

  version = version || 'latest'
  const url = `https://npm.corp.kuaishou.com/-/verdaccio/sidebar/${pkgName}`

  return urllib.request(url, { timeout: 30000, dataType: 'json' }).then(({ data }) => {
    if (version === 'latest') {
      return data.latest || null
    } else {
      return data.versions[version!] || null
    }
  })
}

async function getRemoteVersion(name: string): Promise<string> {
  const url = `https://npm.corp.kuaishou.com/-/verdaccio/sidebar/${name}`

  const { data } = await urllib.request(url, {
    dataType: 'json',
  })

  return data ? data['dist-tags'].latest : '0.0.0'
}

const VERSION_MAJOR = 'major'
const VERSION_FEATURE = 'feature'
const VERSION_PATCH = 'patch'

/**
 * 根据 part 升级版本
 * @param {number} currentVersion
 * @param {string} part
 */
function updateVersion(currentVersion: string, part: string): string {
  const partChoices = [VERSION_MAJOR, VERSION_FEATURE, VERSION_PATCH]
  const versions = currentVersion.split('.').map(value => {
    return parseInt(value, 10)
  })

  if (versions.length === 2) {
    versions.push(0)
  }

  // 选中位版本号加一
  const increasePosition = partChoices.indexOf(part)
  versions[increasePosition]++

  // 选中位后面的版本号清零
  for (let i = increasePosition + 1; i < versions.length; i++) {
    versions[i] = 0
  }

  return versions.join('.')
}

export async function getNextVersion(pkgPath: string, version?: string): Promise<string> {
  if (!pkgPath || !existsSync(pkgPath)) {
    throw new Error(`指定的 package.json 文件 ${pkgPath} 不存在`)
  }

  const pkg = readJSONSync(pkgPath)

  if (!pkg || !pkg.name || !pkg.version) {
    throw new Error(`指定的 package.json 文件 ${pkgPath} 是无效的`)
  }

  const localVersion = version || pkg.version
  const remoteVersion = await getRemoteVersion(pkg.name)

  log.info(`[本地版本: ${localVersion}] => [远程版本: ${remoteVersion}] \n`)

  if (!semver.gt(localVersion, remoteVersion)) {
    const suggestions = {
      [VERSION_MAJOR]: updateVersion(version || remoteVersion, VERSION_MAJOR),
      [VERSION_FEATURE]: updateVersion(version || remoteVersion, VERSION_FEATURE),
      [VERSION_PATCH]: updateVersion(version || remoteVersion, VERSION_PATCH),
    }
    const choices = [
      {
        short: suggestions[VERSION_PATCH],
        name: `${VERSION_PATCH}   (${suggestions[VERSION_PATCH]})${chalk.grey(
          '  - 递增修订版本号(用于 bug 修复)'
        )}`,
        value: suggestions[VERSION_PATCH],
      },
      {
        short: suggestions[VERSION_FEATURE],
        name: `${VERSION_FEATURE} (${suggestions[VERSION_FEATURE]})${chalk.grey(
          '  - 递增特性版本号(用于向下兼容的特性新增, 递增位的右侧位需要清零)'
        )}`,
        value: suggestions[VERSION_FEATURE],
      },
      {
        short: suggestions[VERSION_MAJOR],
        name: `${VERSION_MAJOR}   (${suggestions[VERSION_MAJOR]})${chalk.grey(
          '  - 递增主版本号  (用于断代更新或大版本发布，递增位的右侧位需要清零)'
        )}`,
        value: suggestions[VERSION_MAJOR],
      },
    ]

    const nextVersion = await inquirer.prompt({
      name: 'value',
      type: 'list',
      message: '请选择要升级的版本号：',
      choices,
    })

    pkg.version = nextVersion.value

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

    log.success(`回写版本号 ${nextVersion.value} 到 ${pkgPath} 成功 \n`)
  }

  return pkg.version
}
