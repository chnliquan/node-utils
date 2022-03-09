const chalk = require('chalk')
const { logger } = require('@eljs/release')

const { resolveRoot, bin, run } = require('./utils')

main()

async function main() {
  const pkgJSONPath = resolveRoot('package.json')
  const pkg = require(pkgJSONPath)

  logger.step(`Watching ${chalk.cyanBright.bold(pkg.name)}`, 'Dev')
  await run(bin('rollup'), ['-c', '-w', '--environment', [`FORMATS:cjs`]])
}
