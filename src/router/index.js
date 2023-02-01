import {createRouter, createWebHashHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/view/home.vue')
    },
    {
        path: '/plane',
        name: 'plane',
        component: () => import('@/view/PlaneGame/plane.vue')
    },
]


export default createRouter({
    history: createWebHashHistory(),
    routes
})
