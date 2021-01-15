export interface Repo {
  href: string
  group: string
  project: string
}

export interface GitInfo extends Repo {
  url: string
  branch: string
}

export interface SpinOptions {
  args?: any[]
  successText?: string
  failText?: string
}

export interface ChangelogOptions {
  changelog?: string
  latestLog?: string
  basedir?: string
}

export interface EjsOptions {
  /**
   * Log the generated JavaScript source for the EJS template to the console.
   *
   * @default false
   */
  debug?: boolean

  /**
   * Include additional runtime debugging information in generated template
   * functions.
   *
   * @default true
   */
  compileDebug?: boolean

  /**
   * Whether or not to use `with () {}` construct in the generated template
   * functions. If set to `false`, data is still accessible through the object
   * whose name is specified by `ejs.localsName` (defaults to `locals`).
   *
   * @default true
   */
  _with?: boolean

  /**
   * Whether to run in strict mode or not.
   * Enforces `_with=false`.
   *
   * @default false
   */
  strict?: boolean

  /**
   * An array of local variables that are always destructured from `localsName`,
   * available even in strict mode.
   *
   * @default []
   */
  destructuredLocals?: string[]

  /**
   * Remove all safe-to-remove whitespace, including leading and trailing
   * whitespace. It also enables a safer version of `-%>` line slurping for all
   * scriptlet tags (it does not strip new lines of tags in the middle of a
   * line).
   *
   * @default false
   */
  rmWhitespace?: boolean

  /**
   * Whether or not to compile a `ClientFunction` that can be rendered
   * in the browser without depending on ejs.js. Otherwise, a `TemplateFunction`
   * will be compiled.
   *
   * @default false
   */
  client?: boolean

  /**
   * The escaping function used with `<%=` construct. It is used in rendering
   * and is `.toString()`ed in the generation of client functions.
   *
   * @default ejs.escapeXML
   */
  escape?: (markup?: any) => string

  /**
   * The filename of the template. Required for inclusion and caching unless
   * you are using `renderFile`. Also used for error reporting.
   *
   * @default undefined
   */
  filename?: string

  /**
   * The path to the project root. When this is set, absolute paths for includes
   * (/filename.ejs) will be relative to the project root.
   *
   * @default undefined
   */
  root?: string

  /**
   * The opening delimiter for all statements. This allows you to clearly delinate
   * the difference between template code and existing delimiters. (It is recommended
   * to synchronize this with the closeDelimiter property.)
   *
   * @default ejs.openDelimiter
   */
  openDelimiter?: string

  /**
   * The closing delimiter for all statements. This allows to to clearly delinate
   * the difference between template code and existing delimiters. (It is recommended
   * to synchronize this with the openDelimiter property.)
   *
   * @default ejs.closeDelimiter
   */
  closeDelimiter?: string

  /**
   * Character to use with angle brackets for open/close
   * @default '%'
   */
  delimiter?: string

  /**
   * Whether or not to enable caching of template functions. Beware that
   * the options of compilation are not checked as being the same, so
   * special handling is required if, for example, you want to cache client
   * and regular functions of the same file.
   *
   * Requires `filename` to be set. Only works with rendering function.
   *
   * @default false
   */
  cache?: boolean

  /**
   * The Object to which `this` is set during rendering.
   *
   * @default this
   */
  context?: any

  /**
   * Whether or not to create an async function instead of a regular function.
   * This requires language support.
   *
   * @default false
   */
  async?: boolean

  /**
   * Make sure to set this to 'false' in order to skip UglifyJS parsing,
   * when using ES6 features (`const`, etc) as UglifyJS doesn't understand them.
   * @default true
   */
  beautify?: boolean

  /**
   * Name to use for the object storing local variables when not using `with` or destructuring.
   *
   * @default ejs.localsName
   */
  localsName?: string

  /** Set to a string (e.g., 'echo' or 'print') for a function to print output inside scriptlet tags. */
  outputFunctionName?: string
}
