const chalk = require('chalk')

const { resolveRoot, bin, run, logger } = require('./utils')

const step = logger.step('Dev')

main()

async function main() {
  const pkgJSONPath = resolveRoot('package.json')
  const pkg = require(pkgJSONPath)

  step(`Watching ${chalk.green.bold(pkg.name)}`)
  await run(bin('rollup'), ['-c', '-w', '--environment', [`FORMATS:cjs`]])
}
