import path from 'path'
import cp from 'child_process'
import which from 'which'

import { PLATFORM } from './const'

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
