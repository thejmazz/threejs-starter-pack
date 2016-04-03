export default () => {
  const obj = new THREE.Object3D()
  const normalMat = new THREE.MeshNormalMaterial()

  const size = 1

  const main = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), normalMat)
  const top = new THREE.SceneUtils.createMultiMaterialObject(
    new THREE.BoxGeometry(size/2, size/2, size/2),
    [ new THREE.MeshBasicMaterial({color: 0xad3b87, wireframe: false}),
      new THREE.MeshBasicMaterial({color: 0x06b1e7, wireframe: true})]
  )
  const left = top.clone()
  const right = top.clone()
  const bottom = top.clone()
  const front = top.clone()
  const back = top.clone()

  const spacer = size/2 + size/4

  top.position.set(0, spacer, 0)
  left.position.set(-spacer, 0, 0)
  right.position.set(spacer, 0, 0)
  bottom.position.set(0, -spacer, 0)
  front.position.set(0, 0, spacer)
  back.position.set(0, 0, -spacer)


  obj.add(main)
  obj.add(top)
  obj.add(left)
  obj.add(right)
  obj.add(bottom)
  obj.add(front)
  obj.add(back)

  obj.keyframe = () => {
    obj.rotation.y += 0.005
    top.rotation.y -= 0.1
  }

  return({ obj })
}
