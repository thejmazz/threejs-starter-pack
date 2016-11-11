'use strict'

import { Y_AXIS } from './constants.js'
import { randMaterial } from './material-utils.js'

export const getBBoxDimensions = (geometry) => {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox()
  }

  const { max, min } = geometry.boundingBox
  const bbox = {
    width: max.x - min.x,
    height: max.y - min.y,
    depth: max.z - min.z
  }

  return bbox
}

export const getBoundingRadius = (geometry) => {
  if (!geometry.boundingSphere) {
    geometry.computeBoundingSphere()
  }

  const radius = geometry.boundingSphere.radius

  return radius
}
