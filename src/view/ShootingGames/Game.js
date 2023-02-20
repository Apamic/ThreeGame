import * as THREE from "three"
import {LoadingBar} from "../../libs/LoadingBar";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";



class Game {
    constructor() {
        const container = document.createElement('div')
        document.body.appendChild(container)

        this.clock = new THREE.Clock()

        this.loadingBar = new LoadingBar()
        this.loadingBar.visible = false

        this.assetsPath = 'src/assets/'
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,500)
        this.camera.position.set(-11,1.5,-1.5)

        let col = 0x201510
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(col)
        this.scene.fog = new THREE.Fog(col,100,200)

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
        this.scene.add(ambient)

        //添加光阴影
        const light = new THREE.DirectionalLight()
        light.position.set(4,20,20)
        light.castShadow = true
        light.shadow.mapSize.width = 1024
        light.shadow.mapSize.height = 512
        light.shadow.camera.near = 0.5
        light.shadow.camera.far = 60

        const d = 20
        light.shadow.camera.left = -d
        light.shadow.camera.bottom = -d*0.25
        light.shadow.camera.right = light.shadow.camera.top = d

        this.scene.add(light)
        this.light = light

        const helper = new THREE.CameraHelper(light.shadow.camera)
        this.scene.add(helper)

        this.renderer = new THREE.WebGLRenderer({antialias:true,alpha:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        container.appendChild(this.renderer.domElement)

        const controls = new OrbitControls( this.camera, this.renderer.domElement )

        this.load()

        window.addEventListener('resize', this.resize.bind(this) )

    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    setEnvironment() {
        const loader = new RGBELoader().setPath(this.assetsPath)
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer )
        pmremGenerator.compileEquirectangularShader()

        const self = this

        loader.load('hdr/factory.hdr',(texture ) => {
            const envMap = pmremGenerator.fromEquirectangular( texture ).texture
            pmremGenerator.dispose()

            self.scene.environment = envMap
        },undefined, (err) => {
            console.error( err.message )
        } )

    }

    load() {
        this.loadEnvironment()
    }

    loadEnvironment() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}factory/`)
        this.loadingBar.visible = true

        loader.load('factory2.glb',glft => {
            this.scene.add(glft.scene)
            this.factory = glft.scene
            this.fans = []

            const mergeObjects  = {elements2: [],elements5: [],terrain: []}

            glft.scene.traverse(child => {
                if (child.isMesh) {
                    if (child.name.includes('fan')) {
                        this.fans.push(child)
                    } else if (child.material.name.includes('elements2')) {
                        mergeObjects.elements2.push(child)
                        child.castShadow = true
                    } else if (child.material.name.includes('elements5')) {
                        mergeObjects.elements5.push(child)
                        child.castShadow = true
                    } else if (child.material.name.includes('terrain')) {
                        mergeObjects.terrain.push(child)
                        child.castShadow = true
                    } else if (child.material.name.includes('sand')) {
                        child.receiveShadow = true
                    } else if (child.material.name.includes('elements1')) {
                        child.castShadow = true
                        child.receiveShadow = true
                    } else if (child.parent.name.includes('main')) {
                        child.castShadow = true
                    }
                }
            })

            for(let prop in mergeObjects){
                const array = mergeObjects[prop];
                let material;
                array.forEach( object => {
                    if (material == undefined){
                        material = object.material;
                    }else{
                        object.material = material;
                    }
                });
            }
            this.loadingBar.visible = false
            this.renderer.setAnimationLoop( this.render.bind(this) )

        },xhr => {
            this.loadingBar.update('environment',xhr.loaded,xhr.total)
        },err => {
            console.log(err)
        })
    }

    render() {
        const dt = this.clock.getDelta()

        if (this.fans !== undefined) {
            this.fans.forEach(fan => {
                fan.rotateY(dt)
            })
        }

        this.renderer.render( this.scene, this.camera )
    }


}

export {Game}