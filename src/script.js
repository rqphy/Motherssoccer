import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";

import * as JSONscore from "./score.json";
const scoresList = [];

for (const scoreIndex in JSONscore) {
  if (scoreIndex.length < 2) {
    scoresList.push(JSONscore[scoreIndex]);
  }
}

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

/**
 * Fonts
 */

const fontLoader = new THREE.FontLoader();

let font = null;
fontLoader.load("./fonts/BigNoodleTitling_Oblique.json", (loadedFont) => {
  font = loadedFont;
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const footBallTexture = textureLoader.load("./textures/football.jpeg");

const fenceTexture = textureLoader.load("./textures/bg.jpg");
fenceTexture.wrapS = fenceTexture.wrapT = THREE.RepeatWrapping;
fenceTexture.repeat.set(1, 1);

const floorTexture = textureLoader.load('./textures/floor.png')
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(5, 4.6)

const targetTexture = textureLoader.load("./textures/target.png");

const wallTexture = textureLoader.load("./textures/wall.png");

// Goalkeepers texture

const goal1Texture = textureLoader.load("./textures/goal1.png");
goal1Texture.wrapS = goal1Texture.wrapT = THREE.RepeatWrapping;
goal1Texture.repeat.set(1, 1);

const goal2Texture = textureLoader.load("./textures/goal2.png");
goal2Texture.wrapS = goal2Texture.wrapT = THREE.RepeatWrapping;
goal2Texture.repeat.set(1, 1);

const goal3Texture = textureLoader.load("./textures/goal3.png");
goal3Texture.wrapS = goal3Texture.wrapT = THREE.RepeatWrapping;
goal3Texture.repeat.set(1, 1);

const goal4Texture = textureLoader.load("./textures/goal4.png");
goal4Texture.wrapS = goal4Texture.wrapT = THREE.RepeatWrapping;
goal4Texture.repeat.set(1, 1);

const goalTextures = [goal1Texture, goal2Texture, goal3Texture, goal4Texture];

/**
 * Variables
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let pannelSize = {
  width: sizes.width > 780 ? 60 : 40,
  height: sizes.height > 400 ? 20 : 10,
};
let loaded = false;
const particlesSpeed = 0.03;
let scoreIndicator = null;
let removeBodies = [];
let particlesMesh;
let score = 0;
const hitPoints = 100;
let windPower = 0;
const windPowerRange = 10;
const windMinScore = 300;
const easterEgg = 1000;
const targets = [];
let targetSize = 8;
const balls = [];
let currentObjectBody;
let remainingTime = 600;
const obstacles = [];
let obstacleSpeed = 0.1;
const obstaclesDuration = 6000;
const obstaclesInterval = 2000;

const scoreInput = document.querySelector("#score");
const resetBall = document.querySelector("#reset");
const postGameScreen = document.querySelector(".post");
const tryAgain = document.querySelector(".tryAgain");
const timer = document.querySelector("#timer");
const wind = document.querySelector("#wind");
const scoreboard = document.querySelector("#scoreboard");

/**
 * Events
 */

const mouse = new THREE.Vector2();

resetBall.addEventListener("click", () => {
  for (const ball of balls) {
    scene.remove(ball.mesh);
    world.removeBody(ball.body);
  }

  createBall({
    x: 0,
    y: -4,
    z: 5,
  });
});

document.addEventListener("mousedown", (_event) => {
  mouse.x = (_event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(_event.clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener("mouseup", (_event) => {
  const currentMouse = {
    x: (_event.clientX / window.innerWidth) * 2 - 1,
    y: -(_event.clientY / window.innerHeight) * 2 + 1,
  };

  if (currentIntersect.length) {
    const bodyBall = balls.find(
      (obj) => obj.mesh.uuid === currentIntersect[0].object.uuid
    );
    currentObjectBody = bodyBall.body;
    const windowHeight = window.innerHeight > 1200 ? window.innerHeight : 1200;
    bodyBall.body.applyLocalForce(
      new CANNON.Vec3(
        (-currentMouse.x - mouse.x) * window.innerWidth * 1.8,
        (-currentMouse.y - mouse.y) * windowHeight * 0.8,
        -1250
      ),
      new CANNON.Vec3(0, 0, 0)
    );

    currentIntersect = null;

    // Create new ball
    setTimeout(() => {
      createBall({
        x: 0,
        y: -4,
        z: 5,
      });
    }, 1000);

    currentIntersect = raycaster.intersectObject(balls[balls.length - 1].mesh);
  }
});

document.addEventListener("touchstart", (_event) => {
  mouse.x = (_event.touches[0].clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(_event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener("touchend", (_event) => {
  const currentMouse = {
    // x: 0,
    // y: 0
    x: (_event.changedTouches[0].clientX / window.innerWidth) * 2 - 1,
    y: -(_event.changedTouches[0].clientY / window.innerHeight) * 2 + 1,
  };

  if (currentIntersect.length) {
    const bodyBall = balls.find(
      (obj) => obj.mesh.uuid === currentIntersect[0].object.uuid
    );
    currentObjectBody = bodyBall.body;
    const windowHeight = window.innerHeight > 1200 ? window.innerHeight : 1200;
    bodyBall.body.applyLocalForce(
      new CANNON.Vec3(
        (-currentMouse.x - mouse.x) * window.innerWidth * 1.8,
        (-currentMouse.y - mouse.y) * windowHeight * 0.8,
        -1250
      ),
      new CANNON.Vec3(0, 0, 0)
    );

    currentIntersect = null;
    setTimeout(() => {
      createBall({
        x: 0,
        y: -4,
        z: 5,
      });
    }, 1000);

    currentIntersect = raycaster.intersectObject(balls[balls.length - 1].mesh);
  }
});

tryAgain.addEventListener("click", () => {
  location.reload();
});

/**
 * Sound
 */
const targetSound = new Audio("./sounds/target.mp3");
const playTargetHitSound = () => {
  targetSound.volume = 0.5;
  targetSound.currentTime = 0.5;
  targetSound.play();
};

const wallSound = new Audio("./sounds/bounce.mp3");
const playWallHitSound = () => {
  wallSound.volume = 0.5;
  wallSound.currentTime = 3.2;
  wallSound.play();
};

const winSound = new Audio("./sounds/win.mp3");
const playWinSound = () => {
  winSound.volume = 0.5;
  winSound.currentTime = 0;
  winSound.play();
};

/**
 * Utils
 */

const updateObstaclesSpeed = () => {
  obstacleSpeed = (score + 1) / (score * 4);
};

const generateRandomTargetCoords = () => {
  return [
    (Math.random() - 0.5) * (pannelSize.width - 20),
    Math.random() * (pannelSize.height - 10),
    -29.9,
  ];
};

const generateObstacles = () => {
  createObstacle(
    Math.random() > 0.5 ? -obstacleSpeed : obstacleSpeed,
    obstaclesDuration
  );
  setInterval(() => {
    createObstacle(
      Math.random() > 0.5 ? -obstacleSpeed : obstacleSpeed,
      obstaclesDuration
    );
  }, obstaclesInterval);
};

const createObstacle = (direction, autoDestruct) => {
  const size = {
    x: 6,
    y: 7,
    z: 0.1,
  };

  const position = {
    x: direction > 0 ? -20 : 20,
    y: -4 + size.y / 2,
    z: Math.floor(Math.random() * -5),
  };

  // Threejs
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z / 10);
  const material = new THREE.MeshStandardMaterial({
    map: goalTextures[Math.floor(Math.random() * goalTextures.length)],
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannonjs
  const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z));
  const body = new CANNON.Body();
  body.mass = 0;
  body.addShape(shape);
  body.material = defaultMaterial;
  body.position.copy(position);

  world.addBody(body);

  obstacles.push({
    mesh,
    body,
    direction,
  });

  setTimeout(() => {
    scene.remove(mesh);
    world.removeBody(body);
  }, autoDestruct);
};

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 8000;

const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  posArray[i3 + 0] = (Math.random() - 0.5) * (particlesSpeed * 2.2) * 3600;
  posArray[i3 + 1] = Math.random() * particlesSpeed * 4000;
  posArray[i3 + 2] = Math.random() * 6 + 10;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  transparent: true,
});

const createParticles = () => {
  const mesh = new THREE.Points(particlesGeometry, particlesMaterial);

  scene.add(mesh);
  particlesMesh = mesh;
};

// Score indicator

const scoreTextMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6c6c,
});

const createScoreIndicator = (score, position) => {
  const [x, y, z] = position;
  const geometry = new THREE.TextGeometry(score, {
    font,
    fontFamily: "Arial, Helvetica, sans-serif",
    size: 5,
    height: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 4,
  });

  geometry.computeBoundingBox();
  geometry.center();

  const mesh = new THREE.Mesh(geometry, scoreTextMaterial);

  mesh.position.set(x, y, z);
  scene.add(mesh);

  scoreIndicator = mesh;
};

// Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereFootMaterial = new THREE.MeshStandardMaterial({
  map: footBallTexture,
});

const createBall = (position) => {
  // Threejs mesh

  let material = sphereFootMaterial;
  let radius = 0.7;

  const mesh = new THREE.Mesh(sphereGeometry, material);

  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannonjs body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  world.addBody(body);

  body.name = "ball";

  // Save in balls
  balls.push({
    mesh,
    body,
  });
};

// Target
const targetGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
const targetMaterial = new THREE.MeshBasicMaterial({
  map: targetTexture,
  transparent: true,
});

const createTarget = (size, position) => {
  // Threejs mesh
  const [x, y, z] = position;
  const scale = size || 1;
  const mesh = new THREE.Mesh(targetGeometry, targetMaterial);
  mesh.scale.set(scale, 0.2, scale);
  mesh.rotation.x = Math.PI / -2;
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // Cannonjs body

  const depth = 0.1;
  const targetShape = new CANNON.Cylinder(scale, scale, depth, 32);
  const targetBody = new CANNON.Body();
  targetBody.mass = 0;
  targetBody.addShape(targetShape);
  targetBody.position.set(x, y, z);
  targetBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

  world.addBody(targetBody);

  // Target collider

  targetBody.addEventListener("collide", (_event) => {
    if ((_event.body.name = "ball")) {
      const targetPosition = [
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
      ];
      const ballMesh = balls[balls.length - 2].mesh;
      const currentTargetSize = targetSize;

      if (targetSize > 3) {
        targetSize--;
      }

      scene.remove(mesh);
      scene.remove(ballMesh);

      targets[0] = null;

      setTimeout(() => {
        if (!targets[0]) {
          createTarget(targetSize, generateRandomTargetCoords());
        }
      }, 500);

      const distance =
        (Math.sqrt(
          Math.pow(Math.abs(mesh.position.x - ballMesh.position.x), 2) +
            Math.pow(Math.abs(mesh.position.y - ballMesh.position.y), 2)
        ) /
          currentTargetSize) *
        100;

      let addScore = 0;

      if (distance <= 25) {
        addScore = Math.round(1 * hitPoints + Math.random() * 10);
      } else if (distance <= 50) {
        addScore = Math.round(0.8 * hitPoints + Math.random() * 10);
      } else {
        addScore = Math.round(0.6 * hitPoints + Math.random() * 10);
      }

      updateObstaclesSpeed();

      score += addScore;
      scoreInput.innerHTML = score;

      createScoreIndicator(`+${addScore}`, targetPosition);

      setTimeout(() => {
        scene.remove(scoreIndicator);
        scoreIndicator = null;
      }, 1000);

      playTargetHitSound();

      if (score === easterEgg) {
        playWinSound();
      }

      // Update wind
      if (score >= windMinScore) {
        windPower = Math.floor((0.5 - Math.random()) * windPowerRange);
        wind.innerHTML = windPower;
      }

      removeBodies.push(_event.body, targetBody);
    }
  });

  targets[0] = [mesh, targetBody];
};

// Wall
const wallGeometry = new THREE.PlaneGeometry(1, 1);

const createWall = (position, rotation, size, material) => {
  const [x, y, z] = position;
  // Threejs mesh
  const mesh = new THREE.Mesh(wallGeometry, material);
  mesh.receiveShadow = true;
  mesh.rotation.x = rotation.x || 0;
  mesh.rotation.y = rotation.y || 0;
  mesh.scale.set(size.x, size.y, 1);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  //Cannonjs body
  const glassDepth = 0.1;
  const wallShape = new CANNON.Box(
    new CANNON.Vec3(size.x / 2, size.y / 2, glassDepth / 2)
  );
  const wallBody = new CANNON.Body();
  wallBody.mass = 0;
  wallBody.addShape(wallShape);
  wallBody.position.set(x, y, z);
  if (rotation.y) {
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation.y);
  } else if (rotation.x) {
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), rotation.x);
  }

  world.addBody(wallBody);
};

const createFence = (position, size) => {
    const [x, y, z] = position

    // Three js 
    const fenceGeometry = new THREE.BoxGeometry(1, 1)
    const fenceMaterial = new THREE.MeshStandardMaterial({
        map: fenceTexture,
        transparent: true
        // opacity: 0
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
    mesh.rotation.z = Math.PI // Rotate background
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
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
// world.allowSleep = true
world.gravity.set(0, -9.82, 0);

// Material
const defaultMaterial = new CANNON.Material("concrete");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.4,
    restitution: 0.5,
  }
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

/**
 * Ball
 */
createBall({
  x: 0,
  y: -4,
  z: 5,
});

/**
 * Obstacles
 */
generateObstacles();

/**
 * Particles
 */
createParticles();

/**
 * Walls
 */
const wallMaterial = new THREE.MeshPhysicalMaterial({
  map: wallTexture,
  transparent: true,
  // opacity: 0.4
});
createWall(
  [0, 5, -30],
  { y: 0 },
  { x: pannelSize.width, y: pannelSize.height },
  wallMaterial
);

// carpet
const carpetMaterial = new THREE.MeshPhysicalMaterial({
  // map: carpetTexture,
  transparent: true,
  opacity: 0,
});
createWall([0, -5, 5], { x: -Math.PI * 0.5 }, { x: 10, y: 10 }, carpetMaterial);

// Fence
createFence([0, 0, -70], { x: 280, y: 140 });

// floor
createFloor([0, -5, 5]);

/**
 * Targets
 */

createTarget(targetSize, generateRandomTargetCoords());

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight2.castShadow = true;
directionalLight2.shadow.mapSize.set(1024, 1024);
directionalLight2.shadow.camera.far = 15;
directionalLight2.shadow.camera.left = -7;
directionalLight2.shadow.camera.top = 7;
directionalLight2.shadow.camera.right = 7;
directionalLight2.shadow.camera.bottom = -7;
directionalLight2.position.set(-5, 5, 5);
scene.add(directionalLight, directionalLight2);

/**
 * Sizes
 */

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 20);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

let currentIntersect = null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  world.step(1 / 60, deltaTime, 3);
  if (removeBodies) {
    for (const body of removeBodies) {
      world.removeBody(body);
    }

    removeBodies = [];
  }

  for (const ball of balls) {
    ball.mesh.position.copy(ball.body.position);
    ball.mesh.quaternion.copy(ball.body.quaternion);
  }

  for (const obstacle of obstacles) {
    obstacle.body.position.x += obstacle.direction;

    obstacle.mesh.position.copy(obstacle.body.position);
  }

  // Anim particles
  if (particlesMesh) {
    particlesMesh.position.y -= particlesSpeed;


    if (windPower) {
      particlesMesh.position.x +=
        ((windPower / Math.abs(windPower)) * particlesSpeed) /
        (1 + (5 - Math.abs(windPower)));
    }
  }

  // Cast a ray
  raycaster.setFromCamera(mouse, camera);
  currentIntersect = raycaster.intersectObject(balls[balls.length - 1].mesh);

  // apply wind
  if (currentObjectBody) {
    currentObjectBody.applyForce(
      new CANNON.Vec3(windPower, 0, 0),
      currentObjectBody.position
    );
  }

  // Score indicator update
  if (scoreIndicator) {
    const scale = scoreIndicator.scale;
    const scaleCoef = 0.01;
    scoreIndicator.scale.set(
      scale.x - scaleCoef,
      scale.y - scaleCoef,
      scale.z - scaleCoef
    );
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};


let startClickCount = 0;
const startBtn = document.querySelector('#next');
const prevGame = document.querySelector('.prev');
const prevBg = document.querySelector('.prev-bg');
const page1 = document.querySelector('.page-1');
const page2 = document.querySelector('.page-2');

startBtn.addEventListener('click', () =>
{
  startClickCount++;
  
  if(startClickCount === 1)
  {
    page1.classList.add('hidden');
    page2.classList.remove('hidden');

    startBtn.innerHTML = 'Jouer';
  }

  if(startClickCount === 2)
  {
    prevGame.classList.add('hidden');
    prevBg.classList.add('hidden');
    loaded = true;
    tick();

    const interval = setInterval(() => {
      if (remainingTime > 0) {
        timer.innerHTML = --remainingTime;
      } else {
        endScore.innerHTML = score;
        postGameScreen.classList.add("visible");
        canvas.classList.add("hidden");
        
        if (score > scoresList[scoresList.length - 1].score) {
          console.log("goodjob");
        }
        
        for (const line of scoresList) {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${line.name}</td> <td>${line.score}</td>`;
          scoreboard.appendChild(tr);
          clearInterval(interval);
        }
      }
    }, 1000);
  }
  
})