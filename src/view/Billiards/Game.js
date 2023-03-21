import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";


class Game {
    constructor() {

    }

    initThree() {
        const container = document.createElement('div')
        document.body.appendChild(container)

        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1,20)
        this.camera.position.set(0,4,5)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3)
        this.scene.add(ambient)

        const ambientHelper = new THREE.HemisphereLightHelper(ambient,5)
        this.scene.add(ambientHelper)


        const light = new THREE.DirectionalLight()
        light.position.set( 0.2, 1, 0)

        const lightHelper = new THREE.DirectionalLightHelper(light,5)
        this.scene.add(lightHelper)

        light.castShadow = true
        light.shadow.mapSize.width = 1024
        light.shadow.mapSize.height = 1024
        const size = 10
        light.shadow.camera.top = size
        light.shadow.camera.right = size
        light.shadow.camera.bottom = -size
        light.shadow.camera.left = -size
        light.shadow.camera.near = 0.2
        light.shadow.camera.far = 10
        this.scene.add(light)

        this.renderer = new THREE.WebGLRenderer({antialias:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth,window.innerHeight)
        container.appendChild(this.renderer.domElement)

        const controls = new OrbitControls(this.camera,this.renderer.domElement)

        this.renderer.setAnimationLoop(this.render.bind(this))

        window.addEventListener('resize',this.resize.bind(this))
    }

    initWorld() {

    }

    random(min,max) {
        const range = max - min
        return Math.random() * range + min
    }


    initScene() {

    }


    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth,window.innerHeight)
    }

    render() {
        this.renderer.render( this.scene, this.camera )
    }

}


export {Game}
