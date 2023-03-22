import * as THREE from 'three'
import * as CANNON from '../../libs/cannon-es'

class Ball {
    static RADIUS = 0.05715 / 2 //半径
    static MASS = 0.17 //质量
    static MATERIAL = new CANNON.Material('ballMaterial')

    constructor(game,x,z,id = 0) {
        this.id = id

        this.startPosition = new THREE.Vector3(x,Ball.RADIUS,z)

        this.world = game.world
        this.game = game

        this.rigidBody = this.createBody(x,Ball.RADIUS,z)
        this.world.addBody(this.rigidBody)

        const color = (id == 0) ? 0xFFFFFF : 0xFF0000
        this.mesh = game.helper.addVisual(this.rigidBody,color)

        this.name = `ball${id}`

        this.forward = new THREE.Vector3(0,0,-1)
        this.up = new THREE.Vector3(0,1,0)
        this.tmpVec = new THREE.Vector3()
        this.tmpQuat = new THREE.Quaternion()

    }

    hit(strength = 0.6) {
        this.rigidBody.wakeUp() //唤醒

        const theta = this.game.controls.getAzimuthalAngle() //获得当前的水平旋转，单位为弧度
        this.tmpQuat.setFromAxisAngle(this.up,theta)

        const forward = this.forward.clone().applyQuaternion(this.tmpQuat)

        const force = new CANNON.Vec3()
        force.copy(forward)
        force.scale(strength,force)

        this.rigidBody.applyImpulse(force,new CANNON.Vec3())
    }

    createBody(x,y,z) {
        const body = new CANNON.Body({
            mass: Ball.MASS,
            position: new CANNON.Vec3(x,y,z),
            shape: new CANNON.Sphere(Ball.RADIUS),
            material: Ball.MATERIAL
        })

        body.linearDamping = body.angularDamping = 0.5  //阻尼系数(惯性)
        body.allowSleep = true

        body.sleepSpeedLimit = 2
        body.sleepTimeLimit = 0.1

        return body
    }




}

export {Ball}
