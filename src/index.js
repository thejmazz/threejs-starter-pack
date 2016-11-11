import { createScene, createStats } from './lib/create.js'

const glslify = require('glslify')

const loader = new THREE.OBJLoader()
const jsonLoader = new THREE.JSONLoader()

const { scene, camera, renderer } = createScene({
  clearColor: 0x3C4248
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
window.scene = scene

camera.position.set(0,4,4)

const controls = new THREE.OrbitControls(camera, renderer.domElement)

// === LIGHT ===

// const light = new THREE.PointLight(0xffffff, 1, 1000)
// light.position.set(5, 10, 5)
// scene.add(light)

const spotLight = new THREE.SpotLight(0xffffff)
spotLight.position.set(10, 10, 10)

spotLight.castShadow = true

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024

spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 10
// spotLight.shadow.camera.fov = 30

scene.add(spotLight)
// scene.add(new THREE.SpotLightHelper(spotLight))


// === PLANE ===

const planeMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/floor-frag.glsl'),
  lights: true
})

const planeMaker = () => {
  const geom = new THREE.PlaneGeometry(100, 100, 10, 10)
  // const mat = new THREE.MeshLambertMaterial({ color: 0x6D6961, side: THREE.DoubleSide, wireframe: false })
  const mat = planeMaterial

  const plane = new THREE.Mesh(geom, mat)
  plane.rotation.x = - Math.PI/2

  return plane
}

let plane = planeMaker()
plane.receiveShadow = true
// scene.add(plane)

// === CARBON METAL OXIDE ===

let cmo = null

const carbonMetalOxideMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/cmo-frag.glsl'),
  lights: true
})

jsonLoader.load('models/cmo.json', (geometry) => {
  const mesh = new THREE.Mesh(geometry, carbonMetalOxideMaterial)
  cmo = mesh
  mesh.position.set(0, 1.25, 0)

  mesh.castShadow = true

  // scene.add(mesh)
})

// === OXYGEN ===

const oxygen = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 2),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x9f9f9f,
    roughness: 0,
    metalness: 0.1
  })
)

// === HYDROGEN ===

const hydrogen = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 2),
  new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xc00000,
    roughness: 0,
    metalness: 0.1
  })
)

// === PYRAMID ===

const coneGeometry = {
  radius: 6.6,
  height: 10,
  radiusSegments: 3,
  heightSegments: 1,
  openEnded: false,
  thetaStart: 0,
  thetaLength: 2 * Math.PI
}

const pyramidMaker = () => {
  return new THREE.Mesh(
    // new THREE.ConeGeometry(coneGeometry),
    new THREE.BoxGeometry(),
    new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
  )
}

const pyramid = pyramidMaker()
pyramid.position.set(0, 0, 0)
console.log(pyramid)

// scene.add(pyramid)



var geometry = new THREE.ConeGeometry( 5, 20, 32 );
var material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
var cone = new THREE.Mesh( geometry, material );
scene.add( cone );


// === WATER ===

const waterMaker = ([x, y, z], scale) => {
  const o = oxygen.clone()
  const h1 = hydrogen.clone()
  const h2 = hydrogen.clone()

  const hToOScale = 0.6
  const xOff = 0.7
  const yOff = 0.3

  h1.scale.set(hToOScale, hToOScale, hToOScale)
  h1.position.set(x + scale * xOff, y - scale * yOff, z)

  h2.scale.set(hToOScale, hToOScale, hToOScale)
  h2.position.set(x - scale * xOff, y - scale * yOff, z)

  o.position.set(x, y, z)

  o.add(h1)
  o.add(h2)

  return o
}


// === LOOP ===

const update = (ts, delta) => {
  carbonMetalOxideMaterial.uniforms.time.value += carbonMetalOxideMaterial.uniforms.time.step

  if (cmo) {
    cmo.rotation.y += delta * Math.PI / 16
  }
}

// === RENDER ===

const clock = new THREE.Clock()
const stats = createStats()
const render = (ts) => {
  stats.begin()

  renderer.render(scene, camera)
  update(ts, clock.getDelta())

  stats.end()

  requestAnimationFrame(render)
}

render()
