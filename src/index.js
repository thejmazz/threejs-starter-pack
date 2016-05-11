'use strict'

// import THREE from 'three/three.js'
window.THREE = THREE

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x000000
})
window.scene = scene


camera.position.set(0,0,2)

const controls = new THREE.OrbitControls(camera, renderer.domElement)

import sceneGraphConstructor from './scene'
const sceneGraph = sceneGraphConstructor()

const keyframes = []
for (let obj3DKey of Object.keys(sceneGraph)) {
  const obj3D = sceneGraph[obj3DKey]

  if (obj3D.keyframe) {
    keyframes.push(obj3D.keyframe)
  }

  scene.add(obj3D)
}

window.capturer = new CCapture( { format: 'png' } )
// capturer.start()

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  renderer.render(scene, camera)
  capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
