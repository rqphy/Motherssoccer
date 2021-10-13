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
let aimHelper

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
        'foot',
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

    createAimHelper()

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
                'foot',
                {
                    x: 0,
                    y: -4,
                    z: 5,
                }
            )
        }, 1000)
        
        currentIntersect = raycaster.intersectObject(objectsToUpdate[objectsToUpdate.length - 1].mesh)
        
    }

    // remove helper
    scene.remove(aimHelper)
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
                'foot',
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

// Helper

const helperGeometry = new THREE.BoxGeometry(0.25, 0.1, 2)
const helperMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000
})
const createAimHelper = () =>
{
    const mesh = new THREE.Mesh(
        helperGeometry,
        helperMaterial
    )

    
    aimHelper = mesh
    scene.add(mesh)
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
const wallMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    roughness: 0.5,
    reflectivity: 0.17,
    side: THREE.DoubleSide
})


const createWall = (position, rotation, size) =>
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
    mesh.scale.set(size.x, size.y, 1)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    walls.push(mesh)

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
    'foot',
    {
        x: 0,
        y: -4,
        z: 5,
    }
)

/**
 * Walls
 */

// front
createWall([0, 10, -30], {y: 0}, {x: pannelSize.width, y: pannelSize.height})
// floor
createWall([0, -5, 5], {x: - Math.PI * 0.5}, {x: 10, y: 10})

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