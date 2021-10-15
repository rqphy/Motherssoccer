import './style.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

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
scene.background = new THREE.Color(0x000000)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const footBallTexture = textureLoader.load('/textures/football.jpeg')


const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg')


const bgTexture = textureLoader.load('/textures/bg.jpg', (texture) =>
{
    scene.background = texture
})
const fenceTexture = textureLoader.load('/textures/fence.png')
fenceTexture.wrapS = THREE.RepeatWrapping
fenceTexture.repeat.set( 10, 1 )


const floorTexture = textureLoader.load('/textures/floor.jpg')
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set( 30, 30 )


const wallTexture = textureLoader.load('/textures/wall.png')


/**
 * Variables
 */
const sizes = {
    width : window.innerWidth,
    height : window.innerHeight
}

let pannelSize = {
    width: sizes.width > 780 ? 60 : 40,
    height: sizes.height > 400 ? 20 : 10
}
let score = 0
let windPower = 0
const windPowerRange = 10
const easterEgg = 800
const targets = []
const targetSize = 3
const objectsToUpdate = []
let currentObjectBody
let remainingTime = 60
const walls = []
const impact = []
const scoreInput = document.querySelector('#score')
const resetBall = document.querySelector('.resetBall')
const postGameScreen = document.querySelector('.post')
const tryAgain = document.querySelector('.tryAgain')
const timer = document.querySelector('#timer')
const wind = document.querySelector('#wind')
const windCtn = document.querySelector('.wind')

/**
 * Timer
 */
window.addEventListener('load', () =>
{
    setInterval(() =>
    {
        if(remainingTime > 0)
        {
            timer.innerHTML = --remainingTime
        } else {
            endScore.innerHTML = score
            postGameScreen.classList.add('visible')
        }
    }, 1000)
})

/**
 * Events
 */

const mouse = new THREE.Vector2()

resetBall.addEventListener('click', () =>
{
    for(const object of objectsToUpdate)
    {
        scene.remove(object.mesh)
        world.removeBody(object.body)

    }

    
    createSphere(
        
        {
            x: 0,
            y: -4,
            z: 5,
        }
    )

})

document.addEventListener('mousedown', (_event) => 
{

    mouse.x = ( _event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( _event.clientY / window.innerHeight ) * 2 + 1;

})

document.addEventListener('mouseup', (_event) =>
{
    const currentMouse = {
        x: ( _event.clientX / window.innerWidth ) * 2 - 1,
        y: - ( _event.clientY / window.innerHeight ) * 2 + 1
    }

    if(currentIntersect.length)
    {
        const bodyBall = objectsToUpdate.find(obj => obj.mesh.uuid === currentIntersect[0].object.uuid)
        currentObjectBody = bodyBall.body
        const windowHeight = window.innerHeight > 1200 ? window.innerHeight : 1200
        bodyBall.body.applyLocalForce(
            new CANNON.Vec3((- currentMouse.x - mouse.x) * window.innerWidth * 1.8 , (- currentMouse.y - mouse.y) * windowHeight, -1000),
            new CANNON.Vec3(0, 0, 0)
        )
            
        currentIntersect = null

        // Create new ball
        setTimeout(() =>
        {
            createSphere(
                
                {
                    x: 0,
                    y: -4,
                    z: 5,
                }
            )
        }, 1000)
        
        currentIntersect = raycaster.intersectObject(objectsToUpdate[objectsToUpdate.length - 1].mesh)
        
    }
})

document.addEventListener('touchstart', (_event) => 
{

    mouse.x = ( _event.touches[0].clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( _event.touches[0].clientY / window.innerHeight ) * 2 + 1;

})

document.addEventListener('touchend', (_event) =>
{
    const currentMouse = {
        // x: 0,
        // y: 0
        x: ( _event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1,
        y: - ( _event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1
    }



    if(currentIntersect.length)
    {
        const bodyBall = objectsToUpdate.find(obj => obj.mesh.uuid === currentIntersect[0].object.uuid)
        currentObjectBody = bodyBall.body
        const windowHeight = window.innerHeight > 1200 ? window.innerHeight : 1200
        bodyBall.body.applyLocalForce(
            new CANNON.Vec3((- currentMouse.x - mouse.x) * window.innerWidth * 1.8 , (- currentMouse.y - mouse.y) * windowHeight, -1000),
            new CANNON.Vec3(0, 0, 0)
        )
            
        currentIntersect = null
        setTimeout(() =>
        {
            createSphere(
                
                {
                    x: 0,
                    y: -4,
                    z: 5,
                }
            )
        }, 1000)

        currentIntersect = raycaster.intersectObject(objectsToUpdate[objectsToUpdate.length - 1].mesh)
        
    }
})

tryAgain.addEventListener('click', () =>
{
    location.reload()
})

/**
 * Sound
 */
const targetSound = new Audio('/sounds/target.mp3')
const playTargetHitSound = () =>
{
    targetSound.volume = 0.5
    targetSound.currentTime = 0.5
    targetSound.play()
}

const wallSound = new Audio('/sounds/bounce.mp3')
const playWallHitSound = () =>
{
    wallSound.volume = 0.5
    wallSound.currentTime = 3.2
    wallSound.play()
}

const winSound = new Audio('/sounds/win.mp3')
const playWinSound = () =>
{
    winSound.volume = 0.5
    winSound.currentTime = 0
    winSound.play()
}


/**
 * Utils
*/
const detectCollisionWithTarget = (object1, object2) =>
{
    if(object1.position.z + object1.scale.z <= object2.position.z + object2.scale.z)
    {
        if(
            object1.position.x + object1.scale.x >= object2.position.x - object2.scale.x
            && object1.position.x - object1.scale.x <= object2.position.x + object2.scale.x
            && object1.position.y + object1.scale.y >= object2.position.y - object2.scale.y
            && object1.position.y - object1.scale.y <= object2.position.y + object2.scale.y
        )
        {
            scene.remove(object2)
            createTarget(targetSize, generateRandomTargetCoords())
            score += 100
            scoreInput.innerHTML = score
            playTargetHitSound()
            

            if(score === easterEgg)
            {
                playWinSound()
            }

            // Update wind
            if(score >= 200)
            {
                windPower = Math.floor((0.5 - Math.random()) * windPowerRange)
                wind.innerHTML = windPower
                windCtn.classList.add('visible')
            }

        } else
        {
            playWallHitSound()
        }
    }

    
}

const detectCollisionWithWall = (object1, wall) =>
{
    if(object1.position.z + object1.scale.z <= wall.position.z + wall.scale.z + 1)
    {
        createImpact([object1.position.x, object1.position.y, object1.position.z])
    }
}

// Impact

const createImpact = (position) =>
{
    const [x, y, z] = position

    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 20, 20),
        new THREE.MeshStandardMaterial({ 
            color: new THREE.Color('#000000'),
            transparent: true,
            opacity: 0.7
        })
    )

    mesh.position.set(x, y, -29.95)
    scene.remove(impact[0])
    impact[0] = mesh
    scene.add(impact[0])


}

const generateRandomTargetCoords = () =>
{
    return [(Math.random() - 0.5) * (pannelSize.width - 20), Math.random() * (pannelSize.height - 10), -29.90]
}

// Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereFootMaterial = new THREE.MeshStandardMaterial({
    map: footBallTexture
})

const createSphere = (position) =>
{

    // Threejs mesh

    let material = sphereFootMaterial
    let radius = 0.7

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

// Target
const targetGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32)
const targetMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
})

const createTarget = (size, position) =>
{
    // Threejs mesh
    const [x, y, z] = position
    const scale = size || 1
    const mesh = new THREE.Mesh(
        targetGeometry,
        targetMaterial
    )
    mesh.scale.set(scale, 0.2, scale)
    mesh.rotation.x = Math.PI / 2
    mesh.position.set(x, y, z)
    scene.add(mesh)

    targets.push(mesh)
}

// Wall
const wallGeometry = new THREE.PlaneGeometry(1, 1)



const createWall = (position, rotation, size, material) =>
{
    const [x, y, z] = position
    // Threejs mesh
    const mesh = new THREE.Mesh(
        wallGeometry,
        material
    )
    mesh.receiveShadow = true
    mesh.rotation.x = rotation.x || 0
    mesh.rotation.y = rotation.y || 0
    mesh.scale.set(size.x, size.y, 1)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    walls.push(mesh)

    //Cannonjs body
    const glassDepth = 0.1
    const wallShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, glassDepth / 2))
    const wallBody = new CANNON.Body()
    wallBody.mass = 0
    wallBody.addShape(wallShape)
    wallBody.position.set(x, y, z)
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

const createFence = (position, size) => {
    const [x, y, z] = position

    // Three js 
    const fenceGeometry = new THREE.BoxGeometry(1, 1)
    const fenceMaterial = new THREE.MeshStandardMaterial({
        map: fenceTexture,
        transparent: true
    })
    const mesh = new THREE.Mesh(
        fenceGeometry,
        fenceMaterial
    )
    mesh.receiveShadow = true
    mesh.scale.set(size.x, size.y)
    mesh.position.set(x, y, z)
    scene.add(mesh)

    // Cannon js
    const fenceShape = new CANNON.Plane()
    const fenceBody = new CANNON.Body()
    fenceBody.mass = 0
    fenceBody.addShape(fenceShape)
    fenceBody.position.set(x, y, z)

    world.addBody(fenceBody)

}

const createFloor = (position) =>
{
    const [x, y, z] = position

    // Three js
    const floorGeometry = new THREE.BoxGeometry(500, 500)
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture
    })
    const mesh = new THREE.Mesh(
        floorGeometry,
        floorMaterial
    )
    mesh.receiveShadow = true
    mesh.position.set(x, y - 1, z)
    mesh.rotation.x = Math.PI * 0.5
    scene.add(mesh)

    // Cannon js
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.position.set(x, y, z)
    floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(-1, 0, 0),
        Math.PI * 0.5
    )

    world.addBody(floorBody)

}


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
// world.allowSleep = true
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
 * Ball
 */
createSphere(
    {
        x: 0,
        y: -4,
        z: 5,
    }
)

/**
 * Walls
 */

// front wall
// const wallMaterial = new THREE.MeshPhysicalMaterial({
//     map: bricksColorTexture,
//     aoMap: bricksAmbientOcclusionTexture,
//     normalMap: bricksNormalTexture,
//     roughnessMap: bricksRoughnessTexture
// })
const wallMaterial = new THREE.MeshPhysicalMaterial({
    map: wallTexture,
    transparent: true,
    // opacity: 0.4
})
createWall([0, 5, -30], {y: 0}, {x: pannelSize.width, y: pannelSize.height}, wallMaterial)
// carpet
const carpetMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x660066,
    transparent: true,
    opacity: 0.2
})
createWall([0, -5, 5], {x: - Math.PI * 0.5}, {x: 10, y: 10}, carpetMaterial)

// Fence
createFence([0, -5, -70], {x: 500, y: 40})

// floor
createFloor([0, -5, 5])

/**
 * Targets
 */

createTarget(targetSize, generateRandomTargetCoords())

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

    world.step(1 / 60, deltaTime, 3)

    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)

    }


    // Cast a ray
    raycaster.setFromCamera(mouse, camera)
    currentIntersect = raycaster.intersectObject(objectsToUpdate[objectsToUpdate.length  -1].mesh)

    // apply wind
    if(currentObjectBody)
    {
        currentObjectBody.applyForce(
            new CANNON.Vec3(windPower, 0, 0),
            currentObjectBody.position
        )

    }

    // Check collisions

    if(
        objectsToUpdate[objectsToUpdate.length  - 2]
        && targets[targets.length - 1]
    )
    {

        detectCollisionWithTarget(objectsToUpdate[objectsToUpdate.length  - 2].mesh, targets[targets.length - 1])
    }

    if(
        objectsToUpdate[objectsToUpdate.length - 2]
        && walls[0]
    )
    {
        detectCollisionWithWall(objectsToUpdate[objectsToUpdate.length  - 2].mesh, walls[0])
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()