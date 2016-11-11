import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x000000
})
window.scene = scene

const light = new THREE.PointLight(0xffffff, 1, 1000)
light.position.set(5, 10, 5)
scene.add(light)

camera.position.set(0,0,2)

const controls = new THREE.OrbitControls(camera, renderer.domElement)

const planeMaker = () => {
  const geom = new THREE.PlaneGeometry(10, 10, 10, 10)
  const mat = new THREE.MeshLambertMaterial({ color: 0x6D6961, side: THREE.DoubleSide, wireframe: false })

  const plane = new THREE.Mesh(geom, mat)
  plane.rotation.x = - Math.PI/2

  return plane
}

let plane = planeMaker()
scene.add(plane)

const stats = createStats()
const render = (ts) => {
  stats.begin()

  // for (let keyframe of keyframes) {
  //   keyframe()
  // }

  renderer.render(scene, camera)

  // update(ts)
  // uniforms.time.value += uniforms.time.step

  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
