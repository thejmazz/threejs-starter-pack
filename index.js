'use strict'

window.THREE = require('three/three.js')

const W = window.innerWidth
const H = window.innerHeight

window.scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, W/H, 1, 1000)
camera.position.set(0,0,2)

const boxGeom = new THREE.BoxGeometry(1, 1, 1)
const normalMat = new THREE.MeshNormalMaterial()

const box = new THREE.Mesh(boxGeom, normalMat)
scene.add(box)

const renderer = new THREE.WebGLRenderer({antialias: false})
renderer.setSize(W, H)
document.body.appendChild(renderer.domElement)

const animate = () => {
  requestAnimationFrame(animate)

  box.rotation.x += 0.01
  box.rotation.y += 0.02

  renderer.render(scene, camera)
}

animate()
