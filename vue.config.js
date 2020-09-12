const path = require("path")
const fs = require("fs")
const sass = require("sass")

// Returns a file name without it's extension.

const get_file_name = (file_path) =>
  file_path
    .split("/")
    .pop()
    .split(".")
    .shift()

// Returns a page options object for each pug template in src/pages.
// @note Each pug template has to have a corresponding JS entry file.
// @see https://cli.vuejs.org/config/#pages

const pages_dir = path.resolve("./src/pages")
const pages = fs
  .readdirSync(pages_dir)
  .map((file) =>
    Object.assign(
      {},
      {
        key: get_file_name(file),
        value: {
          entry: path.resolve(`src/entries/${get_file_name(file)}.js`),
          template: path.resolve(`src/pages/${get_file_name(file)}.pug`),
          filename: `${get_file_name(file)}.html`,
        },
      }
    )
  )
  .reduce((items, item) => {
    items[item.key] = item.value
    return items
  }, {})

// Returns a single global object from all exported objects
// in the src/data directory which will be passed to all files
// including JS, Pug, and SASS.

const data_dir = path.resolve("./src/global")
const data_files = fs.readdirSync(data_dir)
const global_data =
  data_files.length === 0
    ? {}
    : data_files
        .map((file) => {
          // Gets the file name and absolute file path.

          const name = get_file_name(file)
          const file_path = path.resolve(`${data_dir}/${file}`)

          // Deletes the file from cache in case it already exists.

          delete require.cache[file_path]

          // Stores the file name and exported file object.

          const file_data = Object.assign(
            {},
            { key: name, value: require(file_path) }
          )

          // Deletes the file from cache as it is no longer needed.

          delete require.cache[file_path]

          // Returns the file name and data.

          return file_data
        })
        .reduce((data, item) => {
          // Merges all file data into a single global object.

          data[item.key] = item.value
          return data
        }, {})

// Returns requested dot notation global as a SASS type.
// @usage In sass/scss file get("colors.primary") returns SASS string #89A8BB
// @see https://sass-lang.com/documentation/js-api#value-types

const get_sass_global = (keys) => {
  let value = global_data

  keys
    .getValue()
    .split(".")
    .forEach((key) => {
      value = value[key]
    })

  if (typeof value === "string") return new sass.types.String(value)
  else if (typeof value === "number") return new sass.types.Number(value)
  else if (typeof value === "boolean") return new sass.types.Boolean(value)
  else if (typeof value === "object" && value instanceof Array)
    return new sass.types.List(value)
  else if (typeof value === "object" && !(value instanceof Array))
    return new sass.types.Map(value)
  else return new sass.types.String(value)
}

// Sets up Webpack Dev Server to host on custom domain and SSL.
// Gets paths to SSL key and cert if serving this app
// over a custom domain and SSL.
// @see README.md for instructions on how to generate key and cert.

let dev_server = {}

if (process.argv.includes("--https")) {
  const ssl_key = path.resolve(process.env.LOCAL_KEY)
  const ssl_cert = path.resolve(process.env.LOCAL_CERT)

  dev_server = {
    port: 443,
    host: "0.0.0.0",
    https: true,
    key: fs.readFileSync(ssl_key),
    cert: fs.readFileSync(ssl_cert),

    // This sets the public domain that webpack's dev server client
    // script uses to communicate with the dev server in Docker.
    // Without this it will try to communicate on 0.0.0.0 which will
    // prevent it from detecting updates.
    // @see https://webpack.js.org/configuration/dev-server/#devserverpublic

    public: process.env.LOCAL_URL,
  }
}

module.exports = {
  // Dev Server

  devServer: dev_server,

  // Compiles pug files in ./src/pages.

  pages: pages,

  // Loader and plugin adjustments.

  chainWebpack: (config) => {
    // Adds global to js files in process.env.
    // using Webpack's definePlugin.
    // @see https://webpack.js.org/plugins/define-plugin/

    config.plugin("define").tap((args) => {
      args[0] = Object.assign({}, args[0], {
        "process.env": Object.assign({}, args[0]["process.env"], {
          APP_DATA: JSON.stringify(global_data),
        }),
      })
      return args
    })

    // Adds global data to pug and sass loaders.
    // @see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader

    /*
     * Adds global to pug rule.
     */

    config.module
      .rule("pug")

      // Adds global to vue files.

      .oneOf("pug-vue")
      .use("pug-plain-loader")
      .loader("pug-plain-loader")
      .tap((args) => {
        return {
          data: global_data,
        }
      })
      .end()
      .end()

      // Adds global to Pug templates.

      .oneOf("pug-template")
      .use("pug-plain-loader")
      .loader("pug-plain-loader")
      .tap((args) => {
        return {
          data: global_data,
        }
      })
      .end()
      .end()

    /*
     * Adds global to scss rule.
     */

    config.module
      .rule("scss")

      // Adds global to scss in Vue modules.

      .oneOf("vue-modules")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to scss in Vue files.

      .oneOf("vue")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to scss in normal modules files.

      .oneOf("normal-modules")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to scss in normal files.

      .oneOf("normal")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

    /*
     * Adds global to sass rule.
     */

    config.module
      .rule("sass")

      // Adds global to sass in Vue modules.

      .oneOf("vue-modules")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to sass in Vue files.

      .oneOf("vue")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to sass in normal modules files.

      .oneOf("normal-modules")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()

      // Adds global to sass in normal files.

      .oneOf("normal")
      .use("sass-loader")
      .loader("sass-loader")
      .tap((args) => {
        return Object.assign({}, args, {
          sassOptions: {
            functions: {
              "get($keys)": (keys) => get_sass_global(keys),
            },
          },
        })
      })
      .end()
      .end()
  },
}
