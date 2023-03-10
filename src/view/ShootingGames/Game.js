import * as THREE from "three"
import {LoadingBar} from "../../libs/LoadingBar";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import { Pathfinding } from '../../libs/pathfinding/Pathfinding.js'
import {NPCHandler} from './NPCHandler'
import {User} from "./User";
import { Controller } from './Controller.js'
import { BulletHandler } from './BulletHandler.js'
import {UI} from "./UI";
import {SFX} from "../../libs/SFX";

class Game {
    constructor() {
        const container = document.createElement('div')
        document.body.appendChild(container)

        this.clock = new THREE.Clock()

        this.loadingBar = new LoadingBar()
        this.loadingBar.visible = false

        this.assetsPath = 'src/assets/'
        this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,500)
        // this.camera.position.set(-11,1.5,-1.5)

        this.camera.position.set( -10.6, 1.6, -1.46 );
        this.camera.rotation.y = -Math.PI*0.5;

        // this.camera.position.set( -10.6, 1.6, -3.5 )
        // this.camera.rotation.y = -Math.PI*0.6;


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

        // const helper = new THREE.CameraHelper(light.shadow.camera)
        // this.scene.add(helper)

        this.renderer = new THREE.WebGLRenderer({antialias:true,alpha:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        container.appendChild(this.renderer.domElement)

        //const controls = new OrbitControls( this.camera, this.renderer.domElement )

        this.load()

        this.raycaster = new THREE.Raycaster()
        this.tmpVec = new THREE.Vector3()

        window.addEventListener('resize', this.resize.bind(this) )

    }

    startGame() {
        this.user.reset()
        this.npcHandler.reset()
        this.ui.ammo = 1
        this.ui.health = 1
        this.active = true
    }

    gameOver() {

    }

    seeUser(pos,seethrough = false) {

        if (this.seethrough) {
            this.seethrough.forEach( child => {
                child.material.transparent = false
                child.material.opacity = 1
            })
            delete this.seethrough
        }


        this.tmpVec.copy(this.user.position).sub(pos).normalize()
        this.raycaster.set(pos,this.tmpVec)

        const intersects = this.raycaster.intersectObjects(this.factory.children,true)

        let userVisiable = true

        if (intersects.length > 0) {
            const dist = this.tmpVec.copy(this.user.position).distanceTo(pos)

            if (seethrough) {
                this.seethrough = []

                intersects.some( intersect => {
                    if (intersect.distance < dist) {
                        this.seethrough.push(intersect.object)
                        intersect.object.material.transparent = true
                        intersect.object.material.opacity = 0.3
                    } else {
                        return true
                    }
                })
            } else {
                userVisiable = (intersects[0].distance > dist)
            }
        }
        return userVisiable
    }


    initPathfinding(navmesh) {

        this.waypoints = [
            new THREE.Vector3(17.73372016326552, 0.39953298254866443, -0.7466724607286782),
            new THREE.Vector3(20.649478054772402, 0.04232912113775987, -18.282935518174437),
            new THREE.Vector3(11.7688416798274, 0.11264635905666916, -23.23102176233945),
            new THREE.Vector3(-3.111551689570482, 0.18245423057147991, -22.687392486867505),
            new THREE.Vector3(-13.772447796604245, 0.1260277454451636, -23.12237117145656),
            new THREE.Vector3(-20.53385139415452, 0.0904175187063471, -12.467546107992108),
            new THREE.Vector3(-18.195950790753532, 0.17323640676321908, -0.9593366354062719),
            new THREE.Vector3(-6.603208729295872, 0.015786387893574227, -12.265553884212125)
        ]

        this.pathfinder = new Pathfinding();
        this.pathfinder.setZoneData('factory',Pathfinding.createZone(navmesh.geometry,0.02))
        if (this.npcHandler.gltf !== undefined) {
            this.npcHandler.initNPCs()
        }

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
        this.npcHandler = new NPCHandler(this)
        this.user = new User(this,new THREE.Vector3( -5.97, 0.021, -1.49),1.57)
        this.ui = new UI(this)

    }

    initSounds() {
        this.listener = new THREE.AudioListener()
        this.camera.add(this.listener)
        this.sfx = new SFX(this.camera,`${this.assetsPath}factory/sfx/`,this.listener)
        this.sfx.load('atmos',true,0.1)
        this.user.initSounds()
        this.npcHandler.npcs.forEach(npc => npc.initSounds())
    }


    startRendering() {
        if (this.npcHandler.ready && this.user.ready && this.bulletHandler === undefined) {
            this.controller = new Controller(this)
            this.bulletHandler = new BulletHandler(this)
            this.renderer.setAnimationLoop(this.render.bind(this))

            this.ui.visible = true
            this.initSounds()

        }

    }


    loadEnvironment() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}factory/`)
        this.loadingBar.visible = true


        //factory1.glb factory2.glb
        loader.load('factory2.glb',glft => {
            this.scene.add(glft.scene)
            this.factory = glft.scene
            this.fans = []

            const mergeObjects  = {elements2: [],elements5: [],terrain: []}

            glft.scene.traverse(child => {
                if (child.isMesh) {
                    if (child.name === 'NavMesh') {
                        this.NavMesh = child
                        this.NavMesh.geometry.rotateX(Math.PI/2)
                        this.NavMesh.quaternion.identity()
                        this.NavMesh.position.set(0,0,0)
                        child.material.transparent = true
                        //child.material.opacity = 0.6
                        child.material.opacity = 0
                    } else if (child.name.includes('fan')) {
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

            this.scene.add(this.NavMesh)
            this.initPathfinding(this.NavMesh)

            for(let prop in mergeObjects){
                const array = mergeObjects[prop];
                let material;
                array.forEach( object => {
                    if (material === undefined){
                        material = object.material;
                    }else{
                        object.material = material;
                    }
                });
            }


            this.loadingBar.visible = !this.loadingBar.loaded
            //this.renderer.setAnimationLoop(this.render.bind(this))

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

        if (this.npcHandler !== undefined) this.npcHandler.update(dt)

        if (this.user !== undefined)  this.user.update(dt)

        if (this.controller !== undefined)  this.controller.update(dt)

        if (this.bulletHandler !== undefined) this.bulletHandler.update(dt)

        this.renderer.render( this.scene, this.camera )
    }


}

export {Game}
