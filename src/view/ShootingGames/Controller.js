import {Camera, Object3D, Quaternion, Raycaster, Vector3} from "three";
import { JoyStick } from '../../libs/JoyStick.js';


class Controller {
    constructor(game) {
        this.camera = game.camera
        this.clock = game.clock
        this.user = game.user
        this.target = game.user.root
        this.NavMesh = game.NavMesh
        this.game = game

        //射线
        this.raycaster = new Raycaster()

        this.move = {
            up: 0,
            right: 0
        }

        this.look = {
            up: 0,
            right: 0
        }

        this.tmpVec3 = new Vector3()
        //console.log(this.tmpVec3)

        this.tmpQuat = new Quaternion()

        //用于在look事件后将相机返回到其基本位置和方向
        this.cameraBase = new Object3D()
        this.cameraBase.position.copy(this.camera.position)
        this.cameraBase.quaternion.copy(this.camera.quaternion)
        this.target.attach(this.cameraBase)

        this.cameraHigh = new Camera()
        this.cameraHigh.position.copy(this.camera.position)
        this.cameraHigh.position.y += 10
        this.cameraHigh.lookAt(this.target.position)
        this.target.attach(this.cameraHigh)


        this.yAxis = new Vector3(0,1,0)
        this.xAxis = new Vector3(1,0,0)
        this.forward = new Vector3(0,0,1)
        this.down = new Vector3(0,-1,0)


        this.speed = 5

        this.checkForGamepad()


        if ('ontouchstart' in document.documentElement) {
            this.initOnscreenController()
        } else {
            this.initKeyboardControl()
        }

    }

    initOnscreenController() {
        const option1 = {
            left: true,
            app: this,
            onMove: this.onMove
        }

        const joystick1 = new JoyStick(option1)

        const option2 = {
            right: true,
            app: this,
            onMove: this.onLook
        }

        const joystick2 = new JoyStick(option2)

        const fireBtn = document.createElement('div')
        fireBtn.style.cssText = "position:absolute; bottom:55px; width:40px; height:40px; background:#FFFFFF; " +
                                "border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
        fireBtn.addEventListener('click',this.fire.bind(this))
        document.body.appendChild(fireBtn)

        this.touchController = {
            joystick1,
            joystick2,
            fireBtn
        }

    }

    initKeyboardControl() {
        document.addEventListener('keydown',this.keyDown.bind(this))
        document.addEventListener('keyup',this.keyUp.bind(this))
        document.addEventListener('mousedown',this.mouseDown.bind(this))
        document.addEventListener('mouseup',this.mouseUp.bind(this))
        document.addEventListener('mousemove',this.mouseMove.bind(this))


        this.keys = {
            w: false,
            a: false,
            d: false,
            s: false,
            mousedown: false,
            mouseorigin: {
                x: 0,
                y: 0
            }
        }
    }

    checkForGamepad() {
        const gamepads = {}

        const self = this

        function gamepadConnect(event,connecting) {
            const gamepad = event.gamepad

            if (connecting) {
                gamepads[gamepad.index] = gamepad
                self.gamepad = gamepad

                if (this.touchController) self.showTouchController(false)

            } else {
                delete self.gamepad
                delete gamepads[gamepad.index]
                self.showTouchController(true)
            }
        }

        window.addEventListener('gamepadconnected',(e) => gamepadConnect(e,true),false)
        window.addEventListener('gamepaddisconnected',(e) => gamepadConnect(e,false),false)

    }

    showTouchController(mode) {
        if (this.touchController == undefined) {
            return
        }

        this.touchController.joystick1.visable = mode
        this.touchController.joystick2.visable = mode
        this.touchController.fireBtn.style.display = mode ? 'block' : 'none'
    }

    keyDown(e) {
        switch (e.keyCode) {
            case 87:
                this.keys.w = true
                break;
            case 65:
                this.keys.a = true
                break;
            case 83:
                this.keys.s = true
                break;
            case 68:
                this.keys.d = true
                break;
            case 32:
                this.fire(true)
                break;
        }
    }

    keyUp(e) {
        switch(e.keyCode) {
            case 87:
                this.keys.w = false;
                if (!this.keys.s) this.move.up = 0
                break;
            case 65:
                this.keys.a = false
                if (!this.keys.d) this.move.right = 0
                break;
            case 83:
                this.keys.s = false
                if (!this.keys.w) this.move.up = 0
                break;
            case 68:
                this.keys.d = false
                if (!this.keys.a) this.move.right = 0
                break;
        }
    }

    mouseDown(e) {
        this.keys.mousedown = true
        this.keys.mouseorigin.x = e.offsetX
        this.keys.mouseorigin.y = e.offsetY
    }

    mouseUp(e){
        this.keys.mousedown = false
        this.look.up = 0
        this.look.right = 0
    }

    mouseMove(e) {
        if (!this.keys.mousedown) return
        let offsetX = e.offsetX - this.keys.mouseorigin.x
        let offsetY = e.offsetY - this.keys.mouseorigin.y
        if (offsetX < - 100) offsetX = -100
        if (offsetX > 100) offsetX = 100
        offsetX /= 100
        if (offsetY < -100) offsetY = -100
        if (offsetY > 100) offsetY = 100
        offsetY /= 100
        this.onLook(-offsetY,offsetX)
    }

    fire(mode) {
        console.log("Fire")
        // if (this.game.active)

        this.user.firing = mode

    }

    onMove(up, right) {
        this.move.up = up
        this.move.right = - right
    }

    onLook(up, right) {
        this.look.up = up * 0.5
        //this.look.up = up
        this.look.right = -right
    }

    gamepadHandler() {
        const gamepads = navigator.getGamepads()
        const gamepad = gamepads[this.gamepad.index]
        const leftStickX = gamepad.axes[0]
        const leftStickY = gamepad.axes[1]
        const rightStickX = gamepad.axes[2]
        const rightStickY = gamepad.axes[3]
        const fire = gamepad.buttons[7].pressed
        this.onMove(-leftStickY,leftStickX)
        this.onLook(-rightStickY,rightStickX)
        if (fire) this.fire(fire)
    }

    keyHandler() {
        if (this.keys.w) this.move.up += 0.1
        if (this.keys.s) this.move.up -= 0.1
        if (this.keys.a) this.move.right += 0.1
        if (this.keys.d) this.move.right -= 0.1

        if (this.move.up > 1) this.move.up = 1
        if (this.move.up < -1) this.move.up = -1
        if (this.move.right > 1) this.move.right = 1
        if (this.move.right < -1) this.move.right = -1

    }

    update(dt=0.0167) {

        let playerMoved = false
        let speed

        if (this.gamepad) {
            this.gamepadHandler()
        } else if (this.keys) {
            this.keyHandler()
        }

        if (this.move.up != 0) {
            const forward = this.forward.clone().applyQuaternion(this.target.quaternion)

            speed = this.move.up > 0 ? this.speed * dt : this.speed * dt * 0.3
            speed *= this.move.up
            const pos = this.target.position.clone().add(forward.multiplyScalar(speed))
            pos.y += 2

            this.raycaster.set(pos,this.down)

            const intersects = this.raycaster.intersectObject(this.NavMesh)

            if (intersects.length > 0) {
                this.target.position.copy(intersects[0].point)
                playerMoved = true
            }
        }

        if (Math.abs(this.move.right) > 0.1) {
            const theta = dt * (this.move.right - 0.1) * 1
            this.target.rotateY(theta)
            playerMoved = true
        }

        if (playerMoved) {
            //console.log( this.tmpVec3,'坐标')
            this.cameraBase.getWorldPosition(this.tmpVec3)

            this.camera.position.lerp(this.tmpVec3,0.7)

            let run = false

            if (speed > 0.03) {
                if (this.overRunSpeedTime) {
                    const elapsedTime = this.clock.elapsedTime - this.overRunSpeedTime
                    run = elapsedTime > 0.5
                } else {
                    this.overRunSpeedTime = this.clock.getElapsedTime()
                }
            } else {
                delete this.overRunSpeedTime
            }

            if (run) {
                this.user.action = 'run'
            } else {
                this.user.action = 'walk'
            }

            this.user.isFiring = false

        } else {
            if (this.user !== undefined && !this.user.isFiring) this.user.action = 'idle'
        }

        if (this.look.up == 0 && this.look.right == 0) {
            let lerpSpeed = 0.7
            this.cameraBase.getWorldPosition(this.tmpVec3)

            if (this.game.seeUser(this.tmpVec3,true)) {
                this.cameraBase.getWorldQuaternion(this.tmpQuat)

            } else {
                this.cameraHigh.getWorldPosition(this.tmpVec3)
                this.cameraHigh.getWorldQuaternion(this.tmpQuat)
            }

            this.camera.position.lerp(this.tmpVec3,lerpSpeed)
            this.camera.quaternion.slerp(this.tmpQuat,lerpSpeed)
        } else {
            const delta = 1 * dt
            this.camera.rotateOnWorldAxis(this.yAxis,this.look.right * delta)
            const cameraXAxis = this.xAxis.clone().applyQuaternion(this.camera.quaternion)
            this.camera.rotateOnWorldAxis(cameraXAxis,this.look.up * delta)

        }

    }

}


export { Controller }
