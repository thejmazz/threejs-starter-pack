'use strict'

import THREE from 'three/three.js'
window.THREE = THREE

import { createScene, createStats } from './create.js'

const { scene, camera, renderer } = createScene({})
window.scene = scene

camera.position.set(0,0,2)

const keyframes = []
// import sceneGraph from './scene'
const sceneGraph = require('./scene')
for (let obj3DKey of Object.keys(sceneGraph)) {
  const obj3D = sceneGraph[obj3DKey]

  if (obj3D.keyframe) {
    console.log(obj3D)
    keyframes.push(obj3D.keyframe)
  }

  scene.add(obj3D)
}

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  renderer.render(scene, camera)

  stats.end()

  requestAnimationFrame(render)
}

render()
