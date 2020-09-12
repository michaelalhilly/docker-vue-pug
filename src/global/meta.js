module.exports = {
  title: "Bizee Management App",
  subtitle: "Awesome business management solution.",
  url: "https://app.bizee.dev",
  author: "Michael Alhilly",
  copyright: "© Bizee 2016",
  distribution: "IU",
  generator: "Node.js",
  language: "English",
  timezone: "America/Los_Angeles",
  robots: "noindex,nofollow",
  web_author: "Michael Alhilly",
  designer: "Michael Alhilly",
  equiv_lang: "en-us",
  keywords: "business pos scheduling timeclock e-commerce restaurant retail",
  gua: "UA-00000000-0",
}

if (process.env.NODE_ENV === "prod") {
  module.exports.url = "https://app.bizee.com"
  module.exports.gua = "UA-00000000-1"
}
