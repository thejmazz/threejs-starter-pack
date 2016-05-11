// import cubulousCreator from './cubulous'
// import lightsCreator from './lights'

export default () => {
  // const { obj } = cubulousCreator()
  // const { pLight } = lightsCreator()

  const planeGeom = new THREE.PlaneGeometry(100, 100, 10, 10)
  const plane = new THREE.Mesh(planeGeom, new THREE.MeshLambertMaterial({side: THREE.DoubleSide}))

  plane.rotation.x = Math.PI/2

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
  )

  return({ plane, cube })
}
