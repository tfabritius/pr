import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import HomePage from '../views/Home.vue'
import LoginPage from '../views/Login.vue'
import store from '../store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () =>
      import(/* webpackChunkName: "register" */ '../views/Register.vue'),
    meta: { public: true },
  },
]

const router = new VueRouter({
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.public || store.getters.loggedIn) {
    next()
  } else {
    next({ path: '/login' })
  }
})

export default router
