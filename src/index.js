import { createScene, createStats } from './lib/create.js'

const glslify = require('glslify')

const loader = new THREE.OBJLoader()
const jsonLoader = new THREE.JSONLoader()
const textureLoader = new THREE.TextureLoader()

const { scene, camera, renderer } = createScene({
  clearColor: 0x3C4248
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
window.scene = scene

// camera.position.set(0,4,4)
// camera.position.set(0,0,1.3)
camera.position.set(0,2,3)
// camera.position.set(0,0.01,0)
// camera.updateProjectionMatrix()

const controls = new THREE.OrbitControls(camera, renderer.domElement)
// controls.enableZoom = false
// controls.enablePan = false

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
  // const mat = new THREE.MeshLambertMaterial({ color: 0x6D6961, side: THREE.DoubleSide, wireframe: false })
  const mat = planeMaterial

  const plane = new THREE.Mesh(geom, mat)
  plane.rotation.x = - Math.PI/2

  return plane
}

let plane = planeMaker()
plane.receiveShadow = true
scene.add(plane)

// === PYRAMID ===

const noiseTextureRGB = (noiseSize) => {
  const size = noiseSize * noiseSize
  const datalength = 4 * size // rgba
  const data = new Uint8Array(datalength)

  for (let i = 0; i < datalength; i++) {
    data[i] = Math.random() * 255 | 0
  }

  const dt = new THREE.DataTexture(data, noiseSize, noiseSize, THREE.RGBAFormat)
  dt.wrapS = THREE.RepeatWrapping
  dt.wrapT = THREE.RepeatWrapping
  dt.needsUpdate = true

  return dt
}

const noiseTextureMonochrome = (noiseSize) => {
  const size = noiseSize * noiseSize
  const dataLength = size * 4
  const data = new Uint8Array(dataLength)

  for (let i = 0; i < dataLength; i += 4) {
    const value = Math.random() * 255 | 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    data[i + 3] = 1
  }

  const dt = new THREE.DataTexture(data, noiseSize, noiseSize, THREE.RGBAFormat)
  dt.wrapS = THREE.RepeatWrapping
  dt.wrapT = THREE.RepeatWrapping
  dt.needsUpdate = true

  return dt
}

const pyramidMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    noiseTexture: { type: 't', value: noiseTextureMonochrome(256) }
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/pyramid-frag.glsl'),
  lights: true
})

const noiseTexture = noiseTextureMonochrome(256)

const noiseMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    noiseTexture: { type: 't', value: noiseTexture }
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/pyramid-frag.glsl'),
  lights: true
})

function params () {
  this.t = 0.1
  this.weightX = 0.5
  this.weightY = 0.5
  this.s = 0.5

  this.baboon = false
  this.zoom = 0.15

  this.turbulenceSize = 16
  this.refreshNoise = refreshNoise
  this.smooth = true
  this.timeFactor = 0.1
  this.hue = 169
}

const p = new params()

const baboonTexture = textureLoader.load('textures/baboon.png')

const baboonMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    // noiseTexture: { type: 't', value: noiseTexture },
    // noiseTexture: { type: 't', value: baboonTexture },
    noiseTexture: { type: 't', value: p.baboon ? baboonTexture : noiseTexture },
    zoom: { type: 'f', value: p.zoom }
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/pyramid-frag.glsl'),
  lights: true
})

const noiseSmoothMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    t: { type: 'f', value: p.t },
    weightX: { type: 'f', value: p.weightX },
    weightY: { type: 'f', value: p.weightY },
    s: { type: 'f', value: p.s },
    // noiseTexture: { type: 't', value: noiseTexture },
    // noiseTexture: { type: 't', value: baboonTexture },
    noiseTexture: { type: 't', value: p.baboon ? baboonTexture : noiseTexture },
    zoom: { type: 'f', value: p.zoom },
    size: { type: 'f', value: p.turbulenceSize },
    isSmooth: { type: 'b', value: p.smooth },
    seed: { type: 'f', value: Math.random() },
    timeFactor: { type: 'f', value: p.timeFactor },
    hue: { type: 'f', value: p.hue }
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/pyramid-frag-smooth.glsl'),
  lights: true
})

const marbleMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    t: { type: 'f', value: p.t },
    weightX: { type: 'f', value: p.weightX },
    weightY: { type: 'f', value: p.weightY },
    s: { type: 'f', value: p.s },
    // noiseTexture: { type: 't', value: noiseTexture },
    // noiseTexture: { type: 't', value: baboonTexture },
    noiseTexture: { type: 't', value: p.baboon ? baboonTexture : noiseTexture },
    zoom: { type: 'f', value: p.zoom },
    size: { type: 'f', value: p.turbulenceSize },
    isSmooth: { type: 'b', value: p.smooth },
    seed: { type: 'f', value: Math.random() },
    timeFactor: { type: 'f', value: p.timeFactor },
    hue: { type: 'f', value: p.hue }
  }),
  vertexShader: glslify('./shaders/cmo-vert.glsl'),
  fragmentShader: glslify('./shaders/marble.glsl'),
  lights: true
})

function refreshNoise() {
  // const newNoiseTexture = noiseTextureMonochrome(256)
  // noiseSmoothMaterial.uniforms.noiseTexture.value = newNoiseTexture;
  // baboonMaterial.uniforms.noiseTexture.value = newNoiseTexture;

  noiseSmoothMaterial.uniforms.seed.value = Math.random()
}

// const gui = new dat.GUI()
// const tChange = gui.add(p, 't', 0, 1, 0.01)
// const weightXChange = gui.add(p, 'weightX', 0, 1, 0.01)
// const weightYChange = gui.add(p, 'weightY', 0, 1, 0.01)
// const sChange = gui.add(p, 's', 0, 1, 0.01)
// const zoomChange = gui.add(p, 'zoom', 0, 1, 0.01)
// const baboonChange = gui.add(p, 'baboon')
// const sizeChange = gui.add(p, 'turbulenceSize', 0, 256, 1)
// const smoothChange = gui.add(p, 'smooth')
// const timeFactorChange = gui.add(p, 'timeFactor', 0, 1, 0.1)
// const hueChange = gui.add(p, 'hue', 0, 255, 1)
// gui.add(p, 'refreshNoise')

// tChange.onChange(t => noiseSmoothMaterial.uniforms.t.value = t)
// weightXChange.onChange(weightX => noiseSmoothMaterial.uniforms.weightX.value = weightX)
// weightYChange.onChange(weightY => noiseSmoothMaterial.uniforms.weightY.value = weightY)
// sChange.onChange(s => noiseSmoothMaterial.uniforms.s.value = s)

// zoomChange.onChange((zoom) => {
//   baboonMaterial.uniforms.zoom.value = zoom
//   noiseSmoothMaterial.uniforms.zoom.value = zoom
// })
// baboonChange.onChange(c => {
//   baboonMaterial.uniforms.noiseTexture.value = c ? baboonTexture : noiseTexture
//   noiseSmoothMaterial.uniforms.noiseTexture.value = c ? baboonTexture : noiseTexture
// })
// sizeChange.onChange(size => noiseSmoothMaterial.uniforms.size.value = size)
// smoothChange.onChange(isSmooth => noiseSmoothMaterial.uniforms.isSmooth.value = isSmooth)
// timeFactorChange.onChange(timeFactor => noiseSmoothMaterial.uniforms.timeFactor.value = timeFactor)
// hueChange.onChange(hue => noiseSmoothMaterial.uniforms.hue.value = hue)

const screenGeometry = new THREE.PlaneGeometry(1, 1, 1, 1)
console.log(screenGeometry)

const screen = new THREE.Mesh(
  screenGeometry,
  baboonMaterial
)
screen.position.set(-1, 0, 0)
// scene.add(screen)

const screen2 = new THREE.Mesh(
  screenGeometry,
  noiseSmoothMaterial
)
screen2.position.set(1, 0, 0)

// scene.add(screen2)

const screen3 = new THREE.Mesh(screenGeometry, marbleMaterial)
screen3.position.set(0, 4, 0)
scene.add(screen3)

const skyboxMaterials = [
  noiseSmoothMaterial,
  noiseSmoothMaterial,
  noiseSmoothMaterial,
  noiseSmoothMaterial,
  noiseSmoothMaterial,
  noiseSmoothMaterial
]

const skyBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshFaceMaterial(skyboxMaterials))
// invert faces
skyBox.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1))
// scene.add(skyBox)

// === PYRAMID ===

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
  marbleMaterial
)

pyramid.position.set(0, 0.5, 0)
scene.add(pyramid)


// === LOOP ===

const update = (ts, delta) => {
  // noiseSmoothMaterial.uniforms.time.value += pyramidMaterial.uniforms.time.step

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
