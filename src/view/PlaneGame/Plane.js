import {Group, Vector3} from "three"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

class Plane {
    constructor(game) {
        this.assetsPath = game.assetsPath
        this.loadingBar = game.loadingBar
        this.game = game
        this.scene = game.scene
        this.load()
        this.tmpPos = new Vector3()

    }

    get position() {
        if (this.plane !== undefined) {
            this.plane.getWorldPosition(this.tmpPos)
        }
        return this.tmpPos
    }

    set visible(mode) {
        this.plane.visible = mode
    }

    load() {
        const loader = new GLTFLoader().setPath(`${ this.assetsPath}plane/`)
        this.ready = false

        loader.load('microplane.glb',gltf => {
            this.scene.add(gltf.scene)
            this.plane = gltf.scene
            this.velocity = new Vector3(0,0,0.1)

            console.log(this.plane,'plane')

            this.propeller = this.plane.getObjectByName('propeller')

            //console.log(this.propeller,'propeller')

            this.ready = true

        },xhr => {
            this.loadingBar.update('plane',xhr.loaded,xhr.total)
        },err => {
            console.log(err)
        })

    }

    reset() {
        this.plane.position.set(0,0,0)
        this.velocity.set(0,0,0.1)
    }

    update(time) {
        if (this.propeller !== undefined) this.propeller.rotateZ(1)

        if (this.game.active) {
            if (this.game.spaceKey) {
                 this.velocity.y += 0.001
            } else {
                this.velocity.y -= 0.001
            }

            this.plane.translateZ(this.velocity.z)
            this.plane.translateY(this.velocity.y)
            this.plane.rotation.set(0,0,Math.sin(time*3)*0.2,'XYZ')

        } else {
            this.plane.rotation.set(0,0,Math.sin(time*3)*0.2,'XYZ')
            this.plane.position.y = Math.cos(time) * 1.5
        }
    }

}

export {Plane}

