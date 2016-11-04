'use strict'

// import THREE from 'three/three.js'
window.THREE = THREE

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x000000
})
window.scene = scene

// camera.position.set(0,4,2)
// camera.position.set(7, 3, 7)
// camera.position.set(0.1, 0.1, 0.1)
// camera.position.set(200, 100, 200)

camera.position.set(0, 1, 0)

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0,0,-0.1)
scene.add(camera)

camera.zoom = 40
camera.updateProjectionMatrix()

console.log(camera.zoom)

const ambientLight = new THREE.AmbientLight( 0x404040 )
scene.add(ambientLight)

const controls = new THREE.OrbitControls(camera, renderer.domElement)

import sceneGraphConstructor from './scene'

const meshes = sceneGraphConstructor()

console.log(meshes)


// const keyframes = []
// for (let obj3DKey of Object.keys(meshes)) {
//   const obj3D = meshes[obj3DKey]

//   if (obj3D.keyframe) {
//     keyframes.push(obj3D.keyframe)
//   }

//   scene.add(obj3D)
// }

const cube2 = meshes.cube.clone()

// const positions = [
//   [-5, 5],
//   [-4, -4]
// ]

const position = ({ x, y, z }) => new THREE.Vector3(x, y, z)
// const xyzBounds =

// const position = ({ minX = 0, minY = 0, minZ = 0 },  { maxX = 0, maxY = 0, maxZ = 0 }) => {
//   return [
//     new THREE.Vec
//   ]
// }

const positions = []

const minX = -10
const minZ = -10
const maxX = 5
const maxZ = 5
const minY = -5
const maxY = 5

const positionsXZ = []

const XZy = 2

for (let x = minX; x < maxX; x++) {
  if (positionsXZ[x] === undefined) {
    positionsXZ[x] = []
  }

  for (let z = minZ; z < maxZ; z++) {
    positionsXZ[x][z] = new THREE.Vector3(x, z, XZy)
  }
}

import { flatUIHexColors, generateShades, blues } from './lib/colour-utils.js'

const shades = generateShades('235', 10, 80, 90).map(color => new THREE.Color(color))
console.log(shades)

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const randomShade = () => shades[Math.floor(Math.random() * shades.length)]

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(500, 1, 500),
  new THREE.MeshLambertMaterial({ color: 0x78FFF3 })
)
floor.position.set(0, -7, 0)
// scene.add(floor)

const rand = (min, max) => Math.random() * (max - min) + min

const cubes = []
for (let x = minX; x < maxX; x++) {
  for (let z = minZ; z < maxZ; z++) {
    for (let y = minY; y < maxY; y++) {

      // const material = new THREE.MeshLambertMaterial({ color: flatUIHexColors[Math.floor(Math.random() * flatUIHexColors.length)] })
      // material.transparent = true
      // material.opacity = 0.5

      // const color = 0x0E50F2
      // const color = randomShade
      // const color = pick(blues)
      const color = pick(flatUIHexColors)
      const material = new THREE.MeshLambertMaterial({ color })
      // material.color = randomShade()

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        // new THREE.MeshLambertMaterial({ color: 0x0E50F2 })
        material
      )
      // cube.position.set(positionsXZ[x].x, positionsXZ[y].y, positionsXZ[z])
      cube.position.set(x, y, z)
      const amplitude = Math.random() * 10 + 1
      cubes.push({
        x, y, z,
        mesh: cube,
        amplitude: {
          x: rand(1, 10),
          y: rand(1, 10),
          z: rand(1, 10)
        }
      })

      if (Math.random() > 0.5) {
        scene.add(cube)
      }
    }
  }
}

const base = 0

const update = (delta) => {
  for (let cube of cubes) {
    // cube.position.y = 0 + Math.sin(delta/500) * 100
    const { x, y, z, mesh, amplitude } = cube
    mesh.position.y = y + Math.sin(delta/500) * amplitude.y
    mesh.position.x = x + Math.cos(delta/500) * amplitude.x
    mesh.position.z = z + Math.sin(delta/500) * Math.cos(delta/500) * amplitude.z

    // if (cube.dir === 'up') {
    //   amplitude.x += amplitudeStep
    //   amplitude.y += amplitudeStep
    //   amplitude.z += amplitudeStep
    // } else {
    //   amplitude.x -= amplitudeStep
    //   amplitude.y -= amplitudeStep
    //   amplitude.z -= amplitudeStep
    // }

    // if (amplitude.x > cube.amplitudeMax.x) {
    //   cube.dir = 'down'
    // } else if (amplitude.x < 0) {
    //   cube.dir = 'up'
    // }
  }
}

cube2.position.x = -3
cube2.position.z = -2

scene.add(cube2)

window.capturer = new CCapture( { format: 'png' } )
// capturer.start()

import { uniforms } from './materials/shadermaterial.js'

const stats = createStats()
const clock = new THREE.Clock()
const render = (ts) => {
  stats.begin()

  // for (let keyframe of keyframes) {
  //   keyframe()
  // }

  renderer.render(scene, camera)

  update(ts)
  uniforms.time.value += uniforms.time.step

  capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
