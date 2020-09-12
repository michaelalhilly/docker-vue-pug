import Vue from "vue"
import App from "@/components/App/App.vue"
import router from "@/router"
import store from "@/store"
import "@/services/service_worker"

Vue.config.productionTip = false

console.log(process.env.APP_DATA)

// Registers all components globally.

const files = require.context("../components", true, /\.vue$/i)

files.keys().map(file_path => {
    const file_name = file_path.split("/").pop().split(".").shift()
    Vue.component(files(file_path).default.name ?? file_name, files(file_path).default)
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app")
