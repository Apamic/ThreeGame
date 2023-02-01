import {Group, Vector3} from "three"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

class Obstacles {
    constructor(game) {
        this.assetsPath = game.assetsPath
        this.loadingBar = game.loadingBar
        this.game = game
        this.scene = game.scene
        this.loadBomb()
        this.loadStar()

        this.tmpPos = new Vector3()
    }


    loadStar() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`)
        this.ready = false

        loader.load('star.glb',gltf => {

            this.star = gltf.scene.children[0]

            this.star.name = 'star'

            if (this.bomb !== undefined) this.initialize()

        },xhr => {
            this.loadingBar.update('star',xhr.loaded,xhr.total)
        },err => {
            console.log(err)
        })

    }

    update(pos) {

    }

    reset() {
        this.obstacleSpawn = {pos: 20,offset: 5}
        this.obstacles.forEach( obstacle => this.respawnObstacle(obstacle) )
    }

    respawnObstacle(obstacle) {
        this.obstacleSpawn.pos += 30
        const offset = (Math.random()*2 - 1) * this.obstacleSpawn.offset
        this.obstacleSpawn.offset += 0.2
        obstacle.position.set(0,offset,this.obstacleSpawn.pos)
        obstacle.children[0].rotation.y = Math.random() * Math.PI * 2
        obstacle.userData.hit = false
        obstacle.children.forEach( child => {
            child.visible = true
        })
    }

    hit(obj) {

    }

    initialize() {
        this.obstacles = []

        const obstacle = new Group()

        obstacle.add(this.star)

        this.bomb.rotation.x = -Math.PI * 0.5
        this.bomb.position.y = 7.5
        obstacle.add(this.bomb)

        let rotate = true

        for (let y=7.5;y>-8;y-=2.5) {
            rotate = !rotate
            if (y == 0) continue
            const bomb = this.bomb.clone()
            bomb.rotation.x = rotate ? -Math.PI * 0.5 : 0
            bomb.position.y = y
            obstacle.add(bomb)
        }

        this.obstacles.push(obstacle)
        //console.log(this.obstacles,'obstacles')
        this.scene.add(obstacle)

        for(let i=0;i<3;i++) {
            const obstacle1 = obstacle.clone()

            this.scene.add(obstacle1)
            this.obstacles.push(obstacle1)

        }

        this.reset()
        this.ready = true
    }


    loadBomb() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`)

        loader.load('bomb.glb',gltf => {

            //console.log(gltf,'bomb')
            this.bomb = gltf.scene.children[0]

            this.bomb.name = 'bomb'

            if (this.star !== undefined) this.initialize()

        },xhr => {
            this.loadingBar.update('bomb',xhr.loaded,xhr.total)
        },err => {
            console.log(err)
        })


    }

}

export {Obstacles}