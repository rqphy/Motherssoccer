import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'


/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xfffae8)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const tennisBallTexture = textureLoader.load('/textures/tennisball.jpeg')
const basketBallTexture = textureLoader.load('/textures/basket.jpeg')
const footBallTexture = textureLoader.load('/textures/football.jpeg')
const volleyBallTexture = textureLoader.load('/textures/volleyball.jpg')

/**
 * Mouse
 */

const mouse = new THREE.Vector2()

document.addEventListener('mousemove', (_event) => 
{

    mouse.x = ( _event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( _event.clientY / window.innerHeight ) * 2 + 1;

})

let powerStartTime = 0

document.addEventListener('mousedown', () =>
{
    if(!powerStartTime)
    {
        powerStartTime = Date.now()
    }
})


document.addEventListener('mouseup', () =>
{
    const power = Date.now() - powerStartTime
    powerStartTime = 0

    if(currentIntersect.length)
    {
        const bodyBall = objectsToUpdate.find(obj => obj.mesh.uuid === currentIntersect[0].object.uuid)
        const impactCoords = currentIntersect[0].point
        console.log(impactCoords.x, impactCoords.y, Math.abs(impactCoords.z))
        bodyBall.body.applyLocalForce(
            new CANNON.Vec3(0, power > 1000 ? 1000 : power, power > 1000 ? - 1000 : - power),
            new CANNON.Vec3(impactCoords.x, impactCoords.y, Math.abs(impactCoords.z))
        )
    }

    // for(const object of objectsToUpdate)
    // {
    //     object.body.applyLocalForce(
    //         new CANNON.Vec3(0, power > 2000 ? 2000 : power, 0),
    //         new CANNON.Vec3(0, 0, 0)
    //     )
    // }
})



// // Mobile gesture
// document.addEventListener('touchstart', () =>
// {
//     if(!powerStartTime)
//     {
//         powerStartTime = Date.now()
//     }
// })

// document.addEventListener('touchend', () =>
// {
//     const power = Date.now() - powerStartTime
//     powerStartTime = 0

//     console.log(power);

//     for(const object of objectsToUpdate)
//     {
//         object.body.applyLocalForce(
//             new CANNON.Vec3(0, power > 2000 ? 2000 : power, 0),
//             new CANNON.Vec3(0, 0, 0)
//         )
//     }
// })

// document.addEventListener('touchmove', (_event) => 
// {
//     const mouseX = ( _event.clientX / window.innerWidth ) * 2 - 1;
//     const mouseY = - ( _event.clientY / window.innerHeight ) * 2 + 1;


//     world.gravity.set(-mouseX / 20, mouseY / 20, 0)
// })



/**
 * Utils
 */
const objectsToUpdate = []

// Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereTennisMaterial = new THREE.MeshStandardMaterial({
    map: tennisBallTexture
})
const sphereFootMaterial = new THREE.MeshStandardMaterial({
    map: footBallTexture
})
const sphereVolleyMaterial = new THREE.MeshStandardMaterial({
    map: volleyBallTexture
})
const sphereBasketMaterial = new THREE.MeshStandardMaterial({
    map: basketBallTexture
})

const createSphere = (type, position) =>
{

    // Threejs mesh

    let material = sphereTennisMaterial
    let radius = 0.2

    switch (type)
    {
        case 'basket':
            material = sphereBasketMaterial
            radius = 1
            break
        case 'foot':
            material = sphereFootMaterial
            radius = 0.7
            break
        case 'volley':
            material = sphereVolleyMaterial
            radius = 0.8
            break
    }

    const mesh = new THREE.Mesh(
        sphereGeometry,
        material
    )



    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannonjs body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)

    // Save in object to update
    objectsToUpdate.push({
        mesh,
        body
    })
}

// Wall
const wallGeometry = new THREE.PlaneGeometry(10, 10)
const wallMaterial = new THREE.MeshPhysicalMaterial({
color: 0xffffff,
transparent: true,
opacity: 0.35,
roughness: 0.5,
reflectivity: 0.17,
side: THREE.DoubleSide
})


const createWall = (position, rotation) =>
{
    const [x, y, z] = position
    // Threejs mesh
    const mesh = new THREE.Mesh(
        wallGeometry,
        wallMaterial
    )
    mesh.receiveShadow = true
    mesh.rotation.x = rotation.x || 0
    mesh.rotation.y = rotation.y || 0
    mesh.position.set(x, y, z)
    scene.add(mesh)

    //Cannonjs body
    const glassDepth = 0.1
    const wallShape = new CANNON.Plane()
    const wallBody = new CANNON.Body()
    wallBody.mass = 0
    wallBody.addShape(wallShape)
    wallBody.position.set(
        x > 0 ? x - glassDepth : x + glassDepth,
        y > 0 ? y - glassDepth : y + glassDepth,
        z > 0 ? z - glassDepth : z + glassDepth
    )
    if(rotation.y)
    {
        wallBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(0, 1, 0),
            rotation.y
        )
    } else if(rotation.x)
    {
        wallBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0),
            rotation.x 
        )
    }

    world.addBody(wallBody)

}



/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// Material
const defaultMaterial = new CANNON.Material('concrete')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.4,
        restitution: 0.5
    }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

/**
 * Walls
 */
createWall([-5, 0, 0], {y: Math.PI * 0.5})
createWall([5, 0, 0], {y: - Math.PI * 0.5})
createWall([0, 0, -5], {y: 0})
createWall([0, 0, 5], {y: Math.PI})
createWall([0, -5, 0], {x: - Math.PI * 0.5})
createWall([0, 5, 0], {x: Math.PI * 0.5})


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.set(1024, 1024)
directionalLight2.shadow.camera.far = 15
directionalLight2.shadow.camera.left = - 7
directionalLight2.shadow.camera.top = 7
directionalLight2.shadow.camera.right = 7
directionalLight2.shadow.camera.bottom = - 7
directionalLight2.position.set(-5, 5, 5)
scene.add(directionalLight, directionalLight2)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 20)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


createSphere(
    'foot',
    // Math.random() * 0.5,
    {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
    }
)

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physic world

    // Wind
    // sphereBody.applyForce(new CANNON.Vec3(- 0.5, 0, 0), sphereBody.position)

    world.step(1 / 60, deltaTime, 3)

    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Cast a ray
    raycaster.setFromCamera(mouse, camera)
    currentIntersect = raycaster.intersectObject(objectsToUpdate[0].mesh)

    // Update sphere
    // sphere.position.copy(sphereBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()