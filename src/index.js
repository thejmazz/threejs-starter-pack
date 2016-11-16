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

const light = new THREE.PointLight(0xffffff, 1, 1000)
light.position.set(5, 10, 5)
scene.add(light)

const spotLight = new THREE.SpotLight(0xffffff)
spotLight.position.set(10, 10, 10)

spotLight.castShadow = true

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024

spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 10
// spotLight.shadow.camera.fov = 30

// scene.add(spotLight)
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
  const mat = new THREE.MeshLambertMaterial({ color: 0x6D6961, side: THREE.DoubleSide, wireframe: false })

  const plane = new THREE.Mesh(geom, mat)
  plane.rotation.x = - Math.PI/2

  return plane
}

let plane = planeMaker()
plane.receiveShadow = true
scene.add(plane)

// === PYRAMID ===

const pyramidMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/pyramid-frag.glsl'),
  lights: true
})

const coneGeometry = ({
  radius = 1,
  height = 1,
  radiusSegments = 3,
  heightSegments = 1,
  openEnded = false,
  thetaStart = 0,
  thetaLength = 2 * Math.PI
} = {}) => new THREE.ConeGeometry(radius, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength)

const pyramid = new THREE.Mesh(
  coneGeometry(),
  // new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
  pyramidMaterial
)

pyramid.position.set(0, 0.5, 0)
scene.add(pyramid)


// === LOOP ===

const update = (ts, delta) => {
  pyramidMaterial.uniforms.time.value += pyramidMaterial.uniforms.time.step

  // pyramid.rotation.y += delta * Math.PI / 16
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
