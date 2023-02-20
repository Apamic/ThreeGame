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
    {
        path: '/shooting',
        name: 'shooting',
        component: () => import('@/view/ShootingGames/shooting.vue')
    },
    {
        path: '/videoSwitch',
        name: 'videoSwitch',
        component: () => import('@/view/VideoSwitch/videoSwitch.vue')
    }
]


export default createRouter({
    history: createWebHashHistory(),
    routes
})
