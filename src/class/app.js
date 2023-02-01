import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { LoadingBar } from "@/libs/LoadingBar";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"


class App {
    constructor() {
        this.container = document.createElement('div')
        document.body.appendChild( this.container)

        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,100)
        this.camera.position.set( 0,0,5)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)


        const ambient = new THREE.HemisphereLight(0xFFFFFF,0xBBBBFF,0.3)
        this.scene.add(ambient)

        const light = new THREE.DirectionalLight()
        light.position.set(0.2,1,1)
        this.scene.add(light)



        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth,window.innerHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.setEnvironment()


        this.container.appendChild( this.renderer.domElement)

        this.renderer.setAnimationLoop(this.render.bind(this))

        //const geometry = new THREE.BoxGeometry()
        //const geometry = new THREE.CircleGeometry(1,32,0,Math.PI * 2)
        // const geometry = new THREE.IcosahedronGeometry()

        //const geometry = this.createStarGeometry()
        //const geometry = this.createPolygonGeometry()
        // const material = new THREE.MeshStandardMaterial({color: 0xFF0000})
        //
        // this.mesh = new THREE.Mesh(geometry,material)
        // this.scene.add( this.mesh)

        const controls = new OrbitControls(this.camera,this.renderer.domElement)


        this.LoadingBar = new LoadingBar()
        this.loadGlTF()



        window.addEventListener('resize',this.resize.bind(this))
    }


    createStarGeometry(innerRadius=0.4,outerRadius=0.8,point=5) {
        const shape = new THREE.Shape()
        const PI2 = Math.PI * 2
        const inc = PI2 / (point * 2)

        shape.moveTo(outerRadius,0)
        let inner = true

        for(let theta = inc; theta < PI2; theta+=inc) {
            const radius = (inner) ? innerRadius : outerRadius
            shape.lineTo(Math.cos(theta)*radius,Math.sin(theta)*radius)
            inner = !inner
        }

        const extrudeSettings = {
            steps: 1,
            depth: 1,
            bevelEnabled: false
        }

        return new THREE.ExtrudeGeometry(shape,extrudeSettings)
    }

    createPolygonGeometry(radius=1,sides=6) {
        const shape = new THREE.Shape()
        const PI2 = Math.PI * 2
        const inc = PI2 / sides

        shape.moveTo(radius,0)

        for(let theta = inc; theta < PI2; theta+=inc) {

            shape.lineTo(Math.cos(theta)*radius,Math.sin(theta)*radius)

        }

        const extrudeSettings = {
            steps: 1,
            depth: radius * 0.25,
            bevelEnabled: false
        }

        return new THREE.ExtrudeGeometry(shape,extrudeSettings)
    }

    setEnvironment() {
        const loader = new RGBELoader()
        //const loader = new RGBELoader().setDataType(THREE.UnsignedByteType) //加了THREE.UnsignedByteType会报错
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer)

        pmremGenerator.compileEquirectangularShader()

        const self = this
        loader.load('src/assets/hdr/venice_sunset_1k.hdr',(texture) => {

            //console.log(texture,'texture')

            const envMap = pmremGenerator.fromEquirectangular(texture).texture
            pmremGenerator.dispose()

            self.scene.environment = envMap

        },undefined,(err) => {
            console.log('An error occurred setting the environment')
        })


    }

    loadGlTF() {
        const loader = new GLTFLoader().setPath('src/assets/plane/')
        loader.load('microplane.glb',glft => {
            this.scene.add(glft.scene)

            const bbox = new THREE.Box3().setFromObject(glft.scene)

            console.log(bbox,'bbox')


            this.LoadingBar.visible = false

            this.renderer.setAnimationLoop(this.render.bind(this))

            this.plane = glft.scene

        },xhr => {

            this.LoadingBar.progress = (xhr.loaded/xhr.total)

        },err => {
            console.log(err)
        })
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    render() {
        //this.mesh.rotateY(0.01)
        //this.mesh.rotateX(0.01)
        this.renderer.render(this.scene,this.camera)
    }

    // remove() {
    //     this.container.remove(this.container)
    // }


}

export {
    App
}