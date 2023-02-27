import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {Raycaster} from "three";
import {NPC} from "./NPC"


class NPCHandler {
    constructor(game) {
        this.game = game
        this.loadingBar = this.game.loadingBar
        // this.waypoints = game.waypoints
        this.load()
        this.initMouseHandler()
    }

    initMouseHandler() {
        const raycaster = new Raycaster()
        this.game.renderer.domElement.addEventListener('click',raycast,false)

        const self = this;
        const mouse = { x:0, y:0 };

        function raycast(e) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.y = - (e.clientY /  window.innerHeight) * 2 + 1

            //从相机位置和鼠标坐标设置挑选射线
            raycaster.setFromCamera(mouse,self.game.camera)

            //计算焦点
            const intersects = raycaster.intersectObject( self.game.NavMesh )

            if (intersects.length > 0) {
                const pt = intersects[0].point
                console.log(pt)
                self.npcs[0].newPath(pt,true)
            }

        }

    }


    load() {
        const loader = new GLTFLoader().setPath(`${this.game.assetsPath}factory/`)

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath( '/src/libs/three128/draco/' );
        loader.setDRACOLoader( dracoLoader );

        this.loadingBar.visible = true

        loader.load(`swat-guy.glb`,gltf => {
            if (this.game.pathfinder) {
                this.initNPCs(gltf)
            } else {
                this.gltf = gltf
            }


        },xhr => {
            this.loadingBar.update( 'swat-guy', xhr.loaded, xhr.total )
        },err => {
            console.error( err )
        })
    }


    initNPCs(gltf = this.gltf) {
        const gltfs = [gltf]

        // this.waypoints = this.game.waypoints

        this.npcs = []

        gltfs.forEach(gltf => {
            const object = gltf.scene

            object.traverse( child => {
                if (child.isMesh){
                    child.castShadow = true;
                }
            })

            const options = {
                object,
                speed: 0.8,
                animations: gltf.animations,
                app: this.game,
                showPath: true,
                zone: 'factory',
                name: 'swat-guy',
            }

            const npc = new NPC(options)

            npc.object.position.set(-7.607,0.017,-7.713)

            this.npcs.push(npc)

        })

        this.loadingBar.visible = !this.loadingBar.loaded

        this.game.startRendering()
    }


    update(dt) {
        if (this.npcs) {
            this.npcs.forEach(npc => npc.update(dt))
        }
    }


}

export {NPCHandler}
