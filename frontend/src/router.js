import Vue from "vue";
import Router from "vue-router";
import store from "./store/index.js";

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: "/",
      redirect: '/discover'
    },
    {
      path: "/index",
      redirect: '/discover'
    },
    {
      path: "/discover",
      name: "Discover",
      component: () => import("./components/Discover.vue")
    },
    {
      path: "/home",
      name: "Home",
      component: () => import("./components/Home.vue"),
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/friends",
      name: "Friends",
      component: () => import("./components/Friends.vue"),
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/message/:mId",
      name: "Message",
      component: () => import("./components/MessageDetail.vue")
    },
    {
      path: "/signin",
      name: "Signin",
      component: () => import("./components/Signin.vue"),
      beforeEnter: (to, from, next) => {
        if(store.getters.authenticated) next({name: 'Discover'})
        else next()
      }
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("./components/Login.vue"),
      beforeEnter: (to, from, next) => {
        if(store.getters.authenticated) next({name: 'Discover'})
        else next()
      }
    },
    {
      path: "/passwordResetLink",
      name: "PasswordResetLink",
      component: () => import("./components/PasswordResetLink.vue")
    },
    {
      path: "/reset-password/:token",
      name: "ResetPassword",
      component: () => import("./components/PasswordReset.vue")
    },
    {
      path: "/profile/:pId",
      name: "Profile",
      component: () => import("./components/Profile.vue")
    },
    {
      path: "/profile",
      redirect: function() { return "/profile/" + store.state.userId},
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/follow/:pId",
      name: "Follow",
      component: () => import("./components/Follow.vue")
    },
    {
      path: "/follow",
      redirect: function() { return "/follow/" + store.state.userId},
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/follower/:pId",
      name: "Follower",
      component: () => import("./components/Follower.vue")
    },
    {
      path: "/follower",
      redirect: function() { return "/follower/" + store.state.userId},
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/logout",
      name: "Logout",
      component: () => import("./components/Logout.vue"),
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("./components/Settings.vue"),
      beforeEnter: (to, from, next) => {
        if(!store.getters.authenticated) next({name: 'Login'})
        else next()
      }
    },



    {
      path: '*',
      name: "not Found",
      component: () => import("./components/404.vue")
    }
  ]
});