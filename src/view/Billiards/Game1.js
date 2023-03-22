import * as THREE from "three"
import * as CANNON from '../../libs/cannon-es.js'
import { CannonHelper } from '../../libs/CannonHelper.js'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";


class Game1 {
    constructor() {
        this.initThree()
        this.initWorld()
        this.initScene()
    }

    initThree() {
        const container = document.createElement('div')
        document.body.appendChild(container)

        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,100)
        //this.camera.position.set(0,4,5)
        this.camera.position.set(-3,1.5,0)


        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3)
        this.scene.add(ambient)

        //const ambientHelper = new THREE.HemisphereLightHelper(ambient,5)
        //this.scene.add(ambientHelper)


        const light = new THREE.DirectionalLight()
        light.position.set( 0.2, 1, 1)

        //const lightHelper = new THREE.DirectionalLightHelper(light,5)
        //this.scene.add(lightHelper)

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
        const world = new CANNON.World()
        world.gravity.set(0,-10,0) //设置重力

        this.helper = new CannonHelper(this.scene,world)

        this.world = world
    }

    random(min,max) {
        const range = max - min
        return Math.random() * range + min
    }


    initScene() {
        const groundBody = new CANNON.Body({mass: 0}) //创建一个主体用于地面,质量设置为0,这意味着它是静态的,它被其他物体击中时不会移动,但它会起到限制其他物体运动的作用
        const groundShape = new CANNON.Plane()
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI/2,0,0) //旋转平面,至平面位于XZ轴
        this.world.addBody(groundBody)
        this.helper.addVisual(groundBody) //添加可视化方法，检查佳能体并构造一个等效的3D网格

        const size = 0.4
        const bodies = []

        setInterval( () => {
            const sphereBody = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(this.random(-0.1,0.1),4,this.random(-0.1,0.1))
            })

            const sphereShape = new CANNON.Sphere(size)
            sphereBody.addShape(sphereShape)
            this.world.addBody(sphereBody)
            this.helper.addVisual(sphereBody,0xff0000)
            bodies.push(sphereBody)

            if (bodies.length > 80) {
                const bodyToKiss = bodies.shift()
                this.helper.removeVisual(bodyToKiss)
                this.world.removeBody(bodyToKiss)
            }

        },300)

    }


    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth,window.innerHeight)
    }

    render() {

        this.world.step(0.0167) //步骤
        this.helper.update() //这将移动佳能体的所有3D视觉副本,以匹配他们的位置和方向
        this.renderer.render( this.scene, this.camera )
    }

}


export {Game1}
