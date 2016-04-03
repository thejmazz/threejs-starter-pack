export default () => {
  const boxGeom = new THREE.BoxGeometry(1, 1, 1)
  const normalMat = new THREE.MeshNormalMaterial()

  const box = new THREE.Mesh(boxGeom, normalMat)

  box.keyframe = () => {
    box.rotation.x += 0.01
    box.rotation.y += 0.01
  }

  return({ box })
}
