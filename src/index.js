'use strict'

const W = window.innerWidth
const H = window.innerHeight

window.THREE = require('three/three.js')
window.scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, W/H, 1, 1000)
camera.position.set(0,0,2)

const keyframes = []
const sceneGraph = require('./scene')
for (let obj3DKey of Object.keys(sceneGraph)) {
  const obj3D = sceneGraph[obj3DKey]

  if (obj3D.keyframe) {
    console.log(obj3D)
    keyframes.push(obj3D.keyframe)
  }

  scene.add(obj3D)
}

const renderer = new THREE.WebGLRenderer({antialias: false})
renderer.setSize(W, H)
document.body.appendChild(renderer.domElement)

const render = () => {
  requestAnimationFrame(render)

  for (let keyframe of keyframes) {
    keyframe()
  }

  renderer.render(scene, camera)
}

render()
