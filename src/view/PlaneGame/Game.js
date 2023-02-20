import * as THREE from "three"
import { LoadingBar } from "@/libs/LoadingBar";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import { Plane } from './Plane.js';
import {Obstacles} from './Obstacles.js'



class Game {
    constructor() {
        const container = document.createElement( 'div' )

        document.body.appendChild(container)

        this.loadingBar = new LoadingBar()
        this.loadingBar.visible = false

        this.clock = new THREE.Clock()

        this.assetsPath = 'src/assets/'

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
        this.camera.position.set( -4.37, 0, -4.75 )
        this.camera.lookAt(0, 0, 6)

        this.cameraController = new THREE.Object3D()
        this.cameraController.add(this.camera)
        this.cameraTarget = new THREE.Vector3(0,0,6)

        this.scene = new THREE.Scene()
        this.scene.add(this.cameraController)

        // const helper = new THREE.CameraHelper( this.camera )
        // this.scene.add( helper )

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
        this.scene.add(ambient)

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } )
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.renderer.outputEncoding = THREE.sRGBEncoding
        container.appendChild( this.renderer.domElement )
        this.setEnvironment()

        this.load()


        document.addEventListener('keydown',this.keyDown.bind(this))
        document.addEventListener('keyup',this.keyUp.bind(this))

        document.addEventListener('touchstart',this.mouseDown.bind(this))
        document.addEventListener('touchend',this.mouseUp.bind(this))

        document.addEventListener('mousedown',this.mouseDown.bind(this))
        document.addEventListener('mouseup',this.mouseUp.bind(this))

        this.spaceKey = false
        this.active = false

        const btn = document.getElementById('playBtn')
        btn.addEventListener('click',this.startGame.bind(this))
        window.addEventListener('resize', this.resize.bind(this) )

    }

    startGame() {

        const gameover = document.getElementById('gameover')
        const instructions = document.getElementById('instructions')
        const btn = document.getElementById('playBtn')

        gameover.style.display = 'none'
        instructions.style.display = 'none'
        btn.style.display = 'none'

        this.score = 0
        this.lives = 3

        let elm = document.getElementById('score')
        elm.innerHTML = this.score

        elm = document.getElementById('lives')
        elm.innerHTML = this.lives

        this.plane.reset()
        this.obstacles.reset()

        this.active = true

    }


    mouseDown(evt) {
        this.spaceKey = true
    }

    mouseUp(evt) {
        this.spaceKey = false
    }

    keyDown(evt) {

        switch (evt.keyCode) {
            case 32:
                this.spaceKey = true
                break;
        }
    }

    keyUp(evt) {

        switch (evt.keyCode) {
            case 32:
                this.spaceKey = false
                break;
        }
    }

    setEnvironment() {
        const loader = new RGBELoader()
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer)

        pmremGenerator.compileEquirectangularShader()

        loader.load('src/assets/hdr/venice_sunset_1k.hdr',(texture) => {

            const envMap = pmremGenerator.fromEquirectangular(texture).texture
            pmremGenerator.dispose()

            this.scene.environment = envMap


        },undefined,(err) => {
            console.log('An error occurred setting the environment')
        })

    }

    load() {
        this.loading = true
        this.loadingBar.visible = true

        this.loadSkybox()
        this.plane = new Plane(this)
        this.obstacles = new Obstacles(this)
    }

    loadSkybox() {

        this.scene.background = new THREE.CubeTextureLoader()
            .setPath(`${this.assetsPath}plane/paintedsky/`)
            .load([
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
            ],() => {
                this.renderer.setAnimationLoop(this.render.bind(this))
            })
    }


    gameOver() {
        this.active = false

        const gameover = document.getElementById('gameover')
        const btn = document.getElementById('playBtn')

        gameover.style.display = 'block'
        btn.style.display = 'block'
    }


    incScore() {
        this.score++

        const elm = document.getElementById('score')
        elm.innerHTML = this.score

    }


    decLives() {
        this.lives--

        const elm = document.getElementById('lives')

        elm.innerHTML = this.lives

        if (this.lives == 0) {
            this.gameOver()
        }

    }


    updateCamera() {
        this.cameraController.position.copy(this.plane.position)
        this.cameraController.position.y = 0
        this.cameraTarget.copy(this.plane.position)
        this.cameraTarget.z += 6
        this.camera.lookAt(this.cameraTarget)
    }


    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    render() {

        if (this.loading) {
            if (this.plane.ready) {
                this.loading = false
                this.loadingBar.visible = false
            } else {
                return
            }
        }

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.active) this.obstacles.update(this.plane.position,dt)

        this.plane.update(time)

        this.updateCamera()
        this.renderer.render( this.scene, this.camera );

    }


}

export {Game}
