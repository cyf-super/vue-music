import { createRouter, createWebHashHistory } from 'vue-router'
const Recommend = () => import('@/views/Recommend'/* webpackChunkName: "recommend" */)
const Search = () => import('@/views/Search'/* webpackChunkName: "recommend" */)
const Singer = () => import('@/views/Singer'/* webpackChunkName: "recommend" */)
const TopList = () => import('@/views/TopList'/* webpackChunkName: "recommend" */)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommend
  },
  {
    path: '/search',
    component: Search
  },
  {
    path: '/singer',
    component: Singer
  },
  {
    path: '/topList',
    component: TopList
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
