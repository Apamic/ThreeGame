import {
    AnimationMixer,
    BufferGeometry,
    Group, Line,
    LoopOnce, Mesh,
    MeshBasicMaterial,
    Quaternion,
    Raycaster,
    SphereGeometry, Vector3
} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {SFX} from "../../libs/SFX";


class User {
    constructor(game,pos,heading) {
        this.root = new Group()
        this.root.position.copy(pos)
        this.root.rotation.set(0,heading,0,'XYZ')

        this.game = game

        this.camera = game.camera
        this.raycaster = new Raycaster()

        game.scene.add(this.root)

        this.loadingBar = game.loadingBar

        this.load()

        this.tmpVec = new Vector3()
        this.tmpQuat = new Quaternion()

        this.speed = 0
        this.isFiring = false

        this.ready = false

        //this.initMouseHandler()
        this.initRifleDirection()

    }


    initRifleDirection() {
        this.rifleDirection = {}

        this.rifleDirection.idle = new Quaternion(-0.178, -0.694, 0.667, 0.203)
        this.rifleDirection.walk = new Quaternion(0.044, -0.772, 0.626, -0.102)
        this.rifleDirection.firingwalk = new Quaternion(-0.025, -0.816, 0.559, -0.147)
        this.rifleDirection.firing = new Quaternion( -0.054, -0.750, 0.633, -0.184)
        this.rifleDirection.run = new Quaternion( 0.015, -0.793, 0.595, -0.131)
        this.rifleDirection.shot = new Quaternion(-0.082, -0.789, 0.594, -0.138)


    }


    initMouseHandler() {
        this.game.renderer.domElement.addEventListener('click',raycast,false)

        const self = this
        const mouse = {x:0,y:0}


        function raycast(e) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

            //从相机位置和鼠标坐标设置挑选射线
            self.raycaster.setFromCamera(mouse, self.game.camera)

            //计算焦点
            const intersects = self.raycaster.intersectObject(self.game.NavMesh)

            if (intersects.length > 0) {
                const pt = intersects[0].point
                //console.log(pt)

                self.root.position.copy(pt)
                //console.log(self.camera.quaternion,'quaternion')
            }
        }
    }

    set position(pos) {
        this.root.position.copy(pos)
    }

    get position(){
        return this.root.position
    }

    set firing(mode) {

        //console.log(mode)

        this.isFiring = mode

        if (mode) {
            //this.action = "firingwalk"
            this.action = (Math.abs(this.speed) == 0) ? "firing" : "firingwalk"

            this.bulletTime = this.game.clock.getElapsedTime()
        } else {

            this.action = 'idle'
        }

    }

    addSphere() {
        const geometry = new SphereGeometry(0.1,8,8)
        const material = new MeshBasicMaterial( { color: 0xFF0000 })
        const mesh = new Mesh(geometry,material)
        this.root.add(mesh)
    }


    load() {
        const loader = new GLTFLoader().setPath(`${this.game.assetsPath}factory/`)
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/')
        loader.setDRACOLoader(dracoLoader)

        loader.load('eve2.glb',gltf => {
            this.root.add(gltf.scene)
            this.object = gltf.scene

            const scale = 1.2
            this.object.scale.set(1.2,1.2,1.2)

            this.object.traverse( child => {
                if ( child.isMesh ) {
                    child.castShadow = true

                    if (child.name.includes('Rifle')) this.rifle = child
                }
            })

            if (this.rifle) {
                const geometry = new BufferGeometry().setFromPoints([
                    new Vector3(0,0,0),
                    new Vector3(1,0,0)
                ])

                const line = new Line(geometry)
                line.name = 'aim'
                line.scale.x = 50
                line.position.set(0,0,0.5)
                //line.translateZ(0.5)

                this.aim = line
                line.visible = true

                this.rifle.add(line)

            }

            this.animations = {}

            gltf.animations.forEach(animation => {
                this.animations[animation.name.toLowerCase()] = animation
            })

            //console.log(this.animations)

            this.mixer = new AnimationMixer(gltf.scene)

            this.action = 'idle'

            this.ready = true

            this.game.startRendering()
        },xhr => { // 加载正在进行时调用
            this.loadingBar.update( 'user', xhr.loaded, xhr.total )
        },err => { //加载有错误时调用
            console.error( err )
        })

    }


    initSounds() {
        const assetsPath = `${this.game.assetsPath}factory/sfx/`
        this.sfx = new SFX(this.game.camera,assetsPath,this.game.listener)
        this.sfx.load('footsteps',true,0.8,this.object)
        this.sfx.load('eve-groan',false,0.8,this.object)
        this.sfx.load('shot',false,0.8,this.object)
    }


    set action(name) {

        name = name.toLowerCase()

        if (this.actionName === name.toLowerCase() ) {
            return
        }

        console.log(`User action:${name}`)

        if (name === 'shot') {
            this.health -= 25

            if (this.health > 0) {
                name = 'hit'
                //暂时禁用控制器
                this.game.active = false
                setTimeout(() => {
                    this.game.active = true
                },1000)
            }

            this.game.ui.health = Math.max(0,Math.min(this.health/100,1))
            if (this.sfx) this.sfx.play('eve-groan')
        }

        if (this.sfx){
            if (name === 'walk' || name === 'firingwalk' || name === 'run') {
                this.sfx.play('footsteps')
            } else {
                this.sfx.stop('footsteps')
            }
        }



        const clip = this.animations[name.toLowerCase()]

        if (clip !== undefined) {
            const action = this.mixer.clipAction(clip)

            if (name === 'shot') {
                action.clampWhenFinished = true
                action.setLoop(LoopOnce)
            }

            action.reset()
            const nofade = this.actionName === 'shot'
            this.actionName = name.toLowerCase()
            action.play()

            if (this.curAction) {
                if (nofade) {
                    this.curAction.enabled = false
                } else {
                    this.curAction.crossFadeTo(action,0.5)
                }
            }

            this.curAction = action

            if (this.rifle && this.rifleDirection) {
                const q = this.rifleDirection[name.toLowerCase()]

                if (q !== undefined) {
                    const start = new Quaternion()
                    start.copy(this.rifle.quaternion)

                    this.rifle.quaternion.copy(q)
                    this.rifle.rotateX(1.57)

                    const end = new Quaternion()
                    end.copy(this.rifle.quaternion)
                    this.rotateRifle = {start,end,time: 0}
                    this.rifle.quaternion.copy(start)

                }
            }

        }
    }

    shoot() {
        if (this.ammo < 1) return

        if (this.bulletHandler === undefined) this.bulletHandler = this.game.bulletHandler

        this.aim.getWorldPosition(this.tmpVec)
        this.aim.getWorldQuaternion(this.tmpQuat)

        this.bulletHandler.createBullet(this.tmpVec,this.tmpQuat)
        this.bulletTime = this.game.clock.getElapsedTime()

        this.ammo--
        this.game.ui.ammo = Math.max(0,Math.min(this.ammo/100,1))
        this.sfx.play('shot')

    }

    update(dt) {
        if (this.mixer) {
            this.mixer.update(dt)
        }

        if (this.isFiring) {
            const elapsedTime = this.game.clock.getElapsedTime() - this.bulletTime
            if (elapsedTime > 0.6) {
                this.shoot()
            }
        }

        if (this.rotateRifle !== undefined) {
            this.rotateRifle.time += dt

            if (this.rotateRifle.time > 0.5) {
                this.rifle.quaternion.copy(this.rotateRifle.end)
                delete this.rotateRifle
            } else {
                this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start,this.rotateRifle.end,this.rotateRifle.time * 2)
            }
        }
    }


    reset() {

    }
}


export {User}
