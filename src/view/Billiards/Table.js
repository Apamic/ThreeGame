import * as CANNON from '../../libs/cannon-es'


class Table {
    static LENGTH = 2.7432
    static WIDTH = 1.3716
    static HEIGHT = 0.2
    static FLOOR_MATERIAl = new CANNON.Material('floorMaterial')

    constructor(game) {
        const shape = new CANNON.Box(new CANNON.Vec3(Table.LENGTH/2,Table.HEIGHT/2,Table.WIDTH/2))

        const body = new CANNON.Body({
            mass: 0, //使身体静止
            material: Table.FLOOR_MATERIAl,
            shape
        })

        body.position.y = - Table.HEIGHT/2
        game.world.addBody(body)
        game.helper.addVisual(body,0x00ff00,false,true)
    }


}
export {Table}
