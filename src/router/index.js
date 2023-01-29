import {createRouter, createWebHashHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/view/home.vue')
    }
]


export default createRouter({
    history: createWebHashHistory(),
    routes
})
