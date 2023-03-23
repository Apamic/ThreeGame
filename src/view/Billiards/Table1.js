import * as CANNON from '../../libs/cannon-es'
import { Ball } from './Ball.js'


let scene,world,debug,helper

function addCannonVisual(body,color= 0xAAAAAA) {
    if (!helper) return
    helper.addVisual(body,color)
}

class Arch {
    constructor(params) {
        this.body = new CANNON.Body({
            mass: 0,
            material: Table1.FLOOR_MATERIAL
        })

        params = params || {}
        //默认值
        this.position = params.position || {x:0,y:0,z: 0}

        //拱的实际半径略大
        this.radius = params.radius || Ball.RADIUS + 0.02

        this.box_autowidth = params.box_autowidth || false
        this.box_width = params.box_width || 2
        this.box_height = params.box_height || 5
        this.box_thickness = params.box_thickness || 2
        this.no_of_boxes = params.no_of_boxes || 5

        this.body.position.set(this.position.x,this.position.y,this.position.z)

        const y_axis = new CANNON.Vec3(0,1,0)

        this.body.quaternion.setFromAxisAngle(y_axis,Math.PI) //从由 axis（轴） 和 angle（角度）所给定的旋转来设置该四元数

        const box_increment_angle = Math.PI / (2 * this.no_of_boxes) //盒子中心到圆心的角度的基准值

        let x_len = this.radius * Math.tan(box_increment_angle)

        if (!this.box_autowidth) x_len = this.box_width

        //使用盒子形状作为子形状
        const shape = new CANNON.Box(new CANNON.Vec3(x_len,this.box_height,this.box_thickness))

        for (let i = 0; i < this.no_of_boxes;i++) {
            const angle = box_increment_angle + (i * Math.PI / this.no_of_boxes)
            let b_x = Math.cos(angle)
            let b_z = Math.sin(angle)

            b_x *= this.radius + this.box_thickness
            b_z *= this.radius + this.box_thickness

            this.body.addShape(shape,
                new CANNON.Vec3(b_x,0,b_z),
                helper.createQuaternionFromAxisAngle(y_axis,Math.PI / 2 - angle)
            )
        }
    }
}



//这是平行于x轴的壁段
class LongWall {
    constructor(x,y,z,width) {
        const height = 0.02
        const thickness = 0.025

        this.body = new CANNON.Body({
            mass: 0,
            material: Table1.WALL_MATERIAL
        })

        //调整x坐标以改变三角形形状的角度
        const vertices1 = [
            -0.028,height,-2 * thickness,//vertex 0
            0,height,0,// vertex 1
            0, height,-2 * thickness,//vertex 2
            -0.028,-height,-2 * thickness,//vertex 3
            0,-height,0, // vertex 4
            0, -height, -2 * thickness //vertex 5
        ]

        //台角
        const vertices2 = [
            0,height,-2 * thickness,//vertex 0
            0,height,0,// vertex 1
            0.08,  height, -2 * thickness, // vertex 2
            0, -height, -2 * thickness, // vertex 3
            0, -height,  0,  // vertex 4
            0.08, -height, -2 * thickness  // vertex 5
        ]

        const indices = [
            0, 1, 2,
            3, 4, 5,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ]

        const trimeshShape1 = new CANNON.Trimesh(vertices1,indices)
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices)

        this.body.position.set(x,y,z)
        this.body.addShape(trimeshShape1,new CANNON.Vec3(-width,0,0))
        this.body.addShape(trimeshShape2,new CANNON.Vec3(width,0,0))

        const boxshape = new CANNON.Box(new CANNON.Vec3(width,height,thickness))

        this.body.addShape(boxshape,new CANNON.Vec3(0,0,-thickness))


    }
}



//这是平行于z轴的壁段
class ShortWall{
    constructor(x, y, z, width) {
        const height = 0.02;
        const thickness = 0.04;

        this.body = new CANNON.Body({
            mass: 0,
            material: Table1.WALL_MATERIAL
        });

        // How to make a mesh with a single triangle
        const vertices1 = [
            -0.125,  height, -2 * thickness, // vertex 0
            0,  height,  0,             // vertex 1
            0,  height, -2*thickness,   // vertex 2
            -0.125, -height, -2*thickness,   // vertex 3
            0, -height,  0,             // vertex 4
            0, -height, -2*thickness    // vertex 5
        ];

        // Corner of table
        const vertices2 = [
            0,  height, -2 * thickness,  // vertex 0
            0,  height,  0,              // vertex 1
            0.125,  height, -2 * thickness,  // vertex 2
            0, -height, -2 * thickness,  // vertex 3
            0, -height,  0,              // vertex 4
            0.125, -height, -2 * thickness   // vertex 5
        ];

        const indices = [
            0, 1, 2,
            3, 4, 5,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ];

        const trimeshShape1 = new CANNON.Trimesh(vertices1, indices);
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices);

        this.body.position.set(x,y,z);
        this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0));
        this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0));

        const boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness));

        this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness));

        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    }
}


class Hole {
    constructor(x,y,z,rotation) {
        //墙拱
        this.arch1 = new Arch({
            position: {x, y, z},
            no_of_boxes: 6, //多少个方框
            box_height: 0.06,
            box_autowidth: true,
            box_thickness: 0.01 //厚度
        })

        //底拱
        this.arch2 = new Arch({
            position: {x, y: y - 0.01, z},
            no_of_boxes: 6,
            box_height: 0.01,
            box_width: 0.025,
            box_thickness: 0.03
        })

        this.arch1.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI - rotation) //在Y轴旋转
        this.arch2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotation)

        world.addBody(this.arch1.body)
        world.addBody(this.arch2.body)

        if (debug) {
            addCannonVisual(this.arch1.body, 0x3333FF, false, false)
            addCannonVisual(this.arch2.body, 0x33FFFF, false, false)
        }
    }
}


class Table1 {
    static LENGTH = 2.7432;
    static WIDTH = 1.3716;
    static HEIGHT = 0.06;
    static FLOOR_MATERIAL = new CANNON.Material('floorMaterial')
    static WALL_MATERIAL = new CANNON.Material('wallMaterial')

    constructor(game) {
        world = game.world
        scene = game.scene
        debug = game.debug
        helper = game.helper

        this.createRigidBodies()

    }

    createRigidBodies() {
        this.felt = this.createFelt()
        this.holes = this.createHoles()
        this.walls = this.createWalls()
    }

    createFelt() {
        const narrowStripWidth = 0.02
        const narrowStripLength = Table1.WIDTH / 2 - 0.05
        const floorThickness = 0.01
        const mainAresX = Table1.LENGTH / 2 - 2 * narrowStripWidth

        const floorBox = new CANNON.Box(new CANNON.Vec3(mainAresX,floorThickness,Table1.WIDTH / 2))
        const floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth,floorThickness,narrowStripLength))

        const body = new CANNON.Body({
            mass: 0,
            material: Table1.FLOOR_MATERIAL
        })

        body.addShape(floorBox,new CANNON.Vec3(0,-floorThickness,0))
        body.addShape(floorBoxSmall,new CANNON.Vec3(-mainAresX - narrowStripWidth,-floorThickness,0))
        body.addShape(floorBoxSmall,new CANNON.Vec3(mainAresX + narrowStripWidth,-floorThickness,0))

        if (debug) {
            addCannonVisual(body,0x00ff00,false,true)
        }

        world.addBody(body)

        return body
    }

    createHoles() {
        const corner = {x: Table1.LENGTH / 2 + 0.015,z: Table1.WIDTH /2 + 0.015,PIby4: Math.PI / 4}

        const middleZ = Table1.WIDTH / 2 + 0.048

        const holes = [
            //-z表边的角
            new Hole(corner.x, 0, -corner.z,  corner.PIby4),
            new Hole(-corner.x, 0, -corner.z, -corner.PIby4),
            //中洞
            new Hole(0, 0, -middleZ, 0),
            new Hole(0, 0,  middleZ, Math.PI),
            //+z表边角
            new Hole( corner.x, 0, corner.z,  3 * corner.PIby4 ),
            new Hole(-corner.x, 0, corner.z, -3 * corner.PIby4 )
        ]

        return holes
    }



    createWalls() {
        const pos = {x: Table1.LENGTH / 4 - 0.008,y:0.02,z:Table1.WIDTH / 2}
        //-z的墙
        const wall1 = new LongWall(pos.x,pos.y,-pos.z,0.61)
        const wall2 = new LongWall(-pos.x,pos.y,-pos.z,0.61)
        wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI)

        //+z的墙
        const wall3 = new LongWall( pos.x, pos.y, pos.z, 0.61);
        const wall4 = new LongWall(-pos.x, pos.y, pos.z, 0.61);
        wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0),  Math.PI);
        wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);


        //+x的墙
        pos.x = Table1.LENGTH/2;
        const wall5 = new ShortWall(pos.x, pos.y, 0, 0.605);

        //-x的墙
        const wall6 = new ShortWall(-pos.x, pos.y, 0, 0.605);
        wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5 * Math.PI)


        const walls = [wall1, wall2, wall3, wall4, wall5, wall6]

        walls.forEach( wall => {
            world.addBody(wall.body);
            if (debug) {
                addCannonVisual(wall.body, 0x00DD00, false, false);
            }
        });


    }


}

export {Table1}
