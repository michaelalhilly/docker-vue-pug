import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home.vue"

Vue.use(VueRouter)

const router = new VueRouter({
  // Sets router to SPA mode so all routes are sent to the entry point.

  mode: "history",
  base: process.env.BASE_URL,

  // Returns scroll position to the top when the route changes.

  scrollBehavior: () => ({
    x: 0,
    y: 0,
  }),

  // Sets route level code-splitting which generates a separate
  // chunk (about.[hash].js) and is lazy-loaded when the route is visited.

  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/about",
      name: "About",
      component: () => import("@/views/About.vue"),
    },
    {
      path: "*",
      redirect: "/",
    },
  ],
})

export default router
