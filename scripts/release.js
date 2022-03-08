const { step, release } = require('@eljs/release')

const { bin, run, logger } = require('./utils')

const args = require('minimist')(process.argv.slice(2))
const skipTests = args.skipTests
const skipBuild = args.skipBuild

main()

async function main() {
  const { stdout } = await run('git', ['status', '--porcelain'], {
    stdio: 'pipe',
  })

  if (stdout) {
    logger.printErrorAndExit('Your git status is not clean. Aborting.')
  }

  // run tests before release
  step('Running tests ...')
  if (!skipTests) {
    await run(bin('jest'), ['--clearCache'])
    await run('pnpm', ['test:once'])
  } else {
    console.log(`(skipped)`)
  }

  // build packages with types
  step('Building package ...')
  if (!skipBuild) {
    await run('pnpm', ['run', 'build', '--', '--release'])
  } else {
    console.log(`(skipped)`)
  }

  release({
    checkGitStatus: false,
  })
}
