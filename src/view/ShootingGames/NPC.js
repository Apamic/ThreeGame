import * as THREE from "three"

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

        if (options.animations) {
            //console.log(options.animations,'animations')
            //使用此选项可直接设置多个动画
            this.mixer = new THREE.AnimationMixer(options.object)
            options.animations.forEach((animations) => {
                this.animations[animations.name.toLowerCase()] = animations
            })
        }
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
            this.action = 'idle'

            if (this.pathfinder) {
                const closestPlayerNode = this.pathfinder.getClosestNode(player.position,this.ZONE,this.navMeshGroup)
                const clamped = new THREE.Vector3()
                this.pathfinder.clampStep(player.position,pt.clone(),closestPlayerNode,this.ZONE,this.navMeshGroup,clamped)
            }
            if (this.pathLines) this.app.scene.remove(this.pathLines)
        }

    }

    initSounds() {

    }

    set action(name) {
        if (this.actionName === name.toLowerCase()) return

        const cilp = this.animations[name.toLowerCase()]

        if (cilp !== undefined) {
            const action = this.mixer.clipAction(cilp)
            this.curAction = action

            if (name === 'shot') {
                action.clampWhenFinished = true
                action.setLoop( THREE.LoopOnce )
                this.dead = true
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

        }
    }

    get position(){
        return this.object.position
    }

    update(dt) {
        const speed = this.speed
        const player = this.object

        if (this.mixer) this.mixer.update(dt)

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

            } else {
                if (!this.dead && this.waypoints !== undefined) {
                    this.newPath(this.randomWaypoint)
                }
            }
        }
    }
}


export {NPC}
