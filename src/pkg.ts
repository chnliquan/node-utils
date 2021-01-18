import path from 'path'
import { readJSONSync } from './file'

export function resolvePkg(context: string): Record<string, any> {
  const pkgPath = path.join(context, 'package.json')
  return readJSONSync(pkgPath)
}
