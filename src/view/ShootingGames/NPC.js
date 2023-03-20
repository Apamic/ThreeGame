import * as THREE from "three"
import {SFX} from "../../libs/SFX";
import {Quaternion} from "three";

class NPC {
    constructor(options) {
        const fps = options.fps || 30; //默认帧
        this.name = options.name | 'NPC'

        this.animations = {}

        options.app.scene.add(options.object)

        this.object = options.object

        this.pathLines = new THREE.Object3D()
        this.pathColor = new THREE.Color(0xFFFFFF)

        options.app.scene.add(this.pathLines)

        this.showPath = options.showPath || false

        this.waypoints = options.waypoints

        this.dead = false

        this.speed = options.speed

        this.app =  options.app

        if (options.app.pathfinder) {
            this.pathfinder = options.app.pathfinder
            this.ZONE = options.zone
            this.navMeshGroup = this.pathfinder.getGroup(this.ZONE,this.object.position)
        }

        const pt = this.object.position.clone()
        pt.z += 10
        this.object.lookAt(pt)

        this.rifle = options.rifle
        this.aim = options.aim
        this.enemy = this.app.user.root
        this.isFiring = false
        this.raycaster = new THREE.Raycaster()
        this.forward = new THREE.Vector3(0,0,1)
        this.tmpVec = new THREE.Vector3()
        this.tmpQuat = new THREE.Quaternion()
        this.aggro = false  //如果true 就在范围内面对玩家

        if (options.animations) {
            //console.log(options.animations,'animations')
            //使用此选项可直接设置多个动画
            this.mixer = new THREE.AnimationMixer(options.object)
            options.animations.forEach((animations) => {
                this.animations[animations.name.toLowerCase()] = animations
            })
            //console.log(this.animations,'animations')
        }

        this.initRifleDirection()
    }

    get randomWaypoint() {
        const index = Math.floor(Math.random() * this.waypoints.length)
        return this.waypoints[index]
    }

    setTargetDirection(pt) {
        const player = this.object
        pt.y = player.position.y
        const quaternion = player.quaternion.clone()
        player.lookAt(pt)
        this.quaternion = player.quaternion.clone()
        player.quaternion.copy(quaternion)
    }

    newPath(pt) {
        const player = this.object

        if (this.pathfinder === undefined) {
            this.calculatedPath = [pt.clone()]
            // 计算目标方向
            this.setTargetDirection(pt.clone())
            this.action = 'walking'
            return
        }

        //console.log(`路径 ${pt.x.toFixed(1)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`)

        const targetGroup = this.pathfinder.getGroup(this.ZONE, pt)
        const closestTargetNode = this.pathfinder.getClosestNode(pt,this.ZONE,targetGroup)

        //计算到目标的路径并存储它
        this.calculatedPath = this.pathfinder.findPath(player.position,pt,this.ZONE,this.navMeshGroup)

        if (this.calculatedPath && this.calculatedPath.length) {
            this.action = 'walking'

            this.setTargetDirection(this.calculatedPath[0].clone())

            if (this.showPath) {
                if (this.pathLines) {
                    this.app.scene.remove(this.pathLines)
                }

                const material = new THREE.LineBasicMaterial({
                    color: this.pathColor,
                    linewidth: 2
                })

                const points = [player.position]

                // 绘制调试线
                this.calculatedPath.forEach((vertex) => {
                    points.push(vertex.clone())
                })

                let geometry = new THREE.BufferGeometry().setFromPoints(points)

                this.pathLines = new THREE.Line( geometry,material )
                this.app.scene.add(this.pathLines)

                //绘制除最后一个之外的调试球体。另外，添加球员位置
                const debugPath = [player.position].concat(this.calculatedPath)

                debugPath.forEach(vertex => {
                    geometry = new THREE.SphereGeometry(0.2)
                    const material = new THREE.MeshBasicMaterial({color: this.pathColor})
                    const node = new THREE.Mesh(geometry,material)
                    node.position.copy(vertex)
                    this.pathLines.add(node)
                })

            }
        } else {
            if (this.sfx) this.sfx.stop('footsteps')

            this.action = 'idle'

            if (this.pathfinder) {
                const closestPlayerNode = this.pathfinder.getClosestNode(player.position,this.ZONE,this.navMeshGroup)
                const clamped = new THREE.Vector3()
                this.pathfinder.clampStep(player.position,pt.clone(),closestPlayerNode,this.ZONE,this.navMeshGroup,clamped)
            }
            if (this.pathLines) this.app.scene.remove(this.pathLines)
        }

    }

    initRifleDirection(){
        this.rifleDirection = {};

        this.rifleDirection.idle = new THREE.Quaternion(-0.044, -0.061, 0.865, 0.495);
        this.rifleDirection.firing = new THREE.Quaternion(-0.147, -0.040, 0.784, 0.600);
        this.rifleDirection.walking = new THREE.Quaternion( 0.046, -0.017, 0.699, 0.712);
        this.rifleDirection.shot = new THREE.Quaternion(-0.133, -0.144, -0.635, 0.747);
    }


    initSounds() {
        const assetsPath = `${this.app.assetsPath}factory/sfx/`
        this.sfx = new SFX(this.app.camera,assetsPath,this.app.listener)
        this.sfx.load('footsteps',true,0.6,this.object)
        this.sfx.load('groan',false,0.6,this.object)
        this.sfx.load('shot',false,0.6,this.object)
    }


    reset() {
        this.dead = false
        this.object.position.copy(this.randomWaypoint)
        let pt = this.randomWaypoint
        let count = 0
        while (this.object.position.distanceToSquared(pt < 1) && count < 10) {
            pt = this.randomWaypoint
            count++
        }
        this.newPath(pt)
    }


    set action(name) {
        if (this.actionName === name.toLowerCase()) return

        const cilp = this.animations[name.toLowerCase()]

        if (cilp !== undefined) {
            const action = this.mixer.clipAction(cilp)

            if (name === 'shot') {
                action.clampWhenFinished = true
                action.setLoop( THREE.LoopOnce )
                this.dead = true
                if (this.sfx) {
                    this.sfx.stop('footsteps')
                    this.sfx.play('groan')
                }
                delete this.calculatedPath
            }

            action.reset()
            const nofade = this.actionName == 'shot'
            this.actionName = name.toLowerCase()
            action.play()

            if (this.curAction) {
                if (nofade) {
                    this.curAction.enabled = false
                } else {
                    this.curAction.crossFadeTo(action, 0.5)
                }
            }
            this.curAction = action
        }

        if (this.rifle && this.rifleDirection) {
            const q = this.rifleDirection[name.toLowerCase()]

            if (q !== undefined) {
                const start = new THREE.Quaternion()
                start.copy(this.rifle.quaternion)

                this.rifle.quaternion.copy(q)
                this.rifle.rotateX(1.57)

                const end = new THREE.Quaternion()
                end.copy(this.rifle.quaternion)
                this.rotateRifle = {start,end,time: 0}
                this.rifle.quaternion.copy(start)

            }
        }

    }

    get position(){
        return this.object.position
    }

    set firing(mode){
        this.isFiring = mode;
        if (mode){
            this.action = "firingwalk";
            this.bulletTime = this.app.clock.getElapsedTime();
        }else{
            this.newPath(this.randomWaypoint);
        }
    }

    shoot() {
        if (this.bulletHandler === undefined) this.bulletHandler = this.app.bulletHandler;
        this.aim.getWorldPosition(this.tmpVec);
        this.aim.getWorldQuaternion(this.tmpQuat);
        this.bulletHandler.createBullet( this.tmpVec, this.tmpQuat, true );
        this.bulletTime = this.app.clock.getElapsedTime();
        this.sfx.play('shot');
    }

    withinAggroRange() {
        const distSq = this.object.position.distanceToSquared(this.enemy.position)

        //console.log('范围内')

        return distSq < 400
    }

    withinFOV(fov) {
        const rad = fov / 360 * Math.PI
        const v1 = this.forward.clone().applyQuaternion(this.object.quaternion)
        const v2 = this.enemy.position.clone().sub(this.object.position).normalize()
        const theta = Math.abs(v1.angleTo(v2)) //以弧度返回该向量v1与向量v2之间的角度
        return theta < rad
    }

    pointAtEnemy() {
        this.object.getWorldQuaternion(this.tmpQuat)
        this.tmpVec.copy(this.enemy.position)
        this.tmpVec.y = this.object.position.y
        this.object.lookAt( this.tmpVec)
        this.object.quaternion.slerp(this.tmpQuat,0.9) //将网格旋转到目标四元数
    }

    seeEnemy() {
        const enemyVec = this.enemy.position.clone().sub(this.object.position)
        const enemyDistance = enemyVec.length()
        enemyVec.normalize()

        this.aim.getWorldPosition(this.tmpVec)
        this.raycaster.set(this.tmpVec,enemyVec)

        const intersects = this.raycaster.intersectObjects(this.app.factory.children)

        if (intersects.length > 0) {}
            return intersects[0].distance > enemyDistance

    }

    update(dt) {
        const speed = this.speed
        const player = this.object

        if (this.mixer) this.mixer.update(dt)

        if (this.rotateRifle !== undefined){
            this.rotateRifle.time += dt;
            if (this.rotateRifle.time > 0.5){
                this.rifle.quaternion.copy( this.rotateRifle.end );
                delete this.rotateRifle;
            }else{
                this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start, this.rotateRifle.end, this.rotateRifle.time * 2);
            }
        }



        //勾引仇恨代码
        if (!this.dead && this.app.active && this.enemy && !this.enemy.userData.dead) {
            if (!this.aggro) {
                if (this.withinAggroRange()) {
                    if (this.withinFOV(120)) {
                        this.aggro = true
                        const v = this.enemy.position.clone().sub(this.object.position)
                        const len = v.length()

                        if (len > 10) {
                            this.newPath(this.enemy.position)
                        } else {
                            delete this.calculatedPath
                            this.active = 'idle'
                        }
                    }
                }
            } else {
                if (this.withinAggroRange()) {
                    const v = this.enemy.position.clone().sub(this.object.position)
                    const len = v.length()

                    if (!this.isFiring) {
                        if (len < 10) {
                            delete this.calculatedPath
                            this.firing = true
                            this.active = 'firing'
                        } else if (this.withinFOV(10)) {
                            this.firing = true
                        }
                    } else {
                        if (!this.calculatedPath) {
                            this.pointAtEnemy()
                        } else if (!this.withinFOV(10)) {
                            this.isFiring = false
                            this.active = 'walking'
                        }
                        if (this.isFiring && this.seeEnemy()) {
                            const elapsedTime = this.app.clock.getElapsedTime() - this.bulletTime

                            if (elapsedTime > 0.6) {
                                this.shoot()
                            }


                        }

                    }
                } else {
                    this.firing = false
                    this.eggro = false
                }
            }
        } else if (this.isFiring) {
            this.firing = false
            this.aggro = false
        }

        if (this.calculatedPath && this.calculatedPath.length) {
            const targetPosition = this.calculatedPath[0]

            const vel = targetPosition.clone().sub(player.position)

            let pathLegComplete = (vel.lengthSq() < 0.01)

            if (!pathLegComplete) {
                //在移动之前，获取到目标的距离
                const prevDistanceSq = player.position.distanceToSquared(targetPosition)
                vel.normalize()

                //转身速率
                if (this.quaternion) {
                    player.quaternion.slerp(this.quaternion,0.1)
                }

                player.position.add(vel.multiplyScalar(dt * speed))
                //移动后保持距离，如果距离太大，我们就超越了，这条腿就完成了
                const newDistanceSq = player.position.distanceToSquared(targetPosition)
                pathLegComplete = newDistanceSq > prevDistanceSq
            }

            if (pathLegComplete) {
                //从我们计算的路径中移除节点
                this.calculatedPath.shift()

                if (this.calculatedPath.length === 0) {

                    if (this.waypoints !== undefined) {
                        this.newPath(this.randomWaypoint)
                    } else {
                        player.position.copy(targetPosition)
                        this.action = 'idle'
                    }

                } else {
                    this.setTargetDirection(this.calculatedPath[0].clone())
                }

            }

        } else {
            if (!this.dead && this.waypoints !== undefined) {
                this.newPath(this.randomWaypoint)
            }
        }

    }
}


export {NPC}
