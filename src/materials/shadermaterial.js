import vert from '../shaders/vert.glsl'
import frag from '../shaders/frag.glsl'

console.log('vert: ', vert)

const uniforms = {
    time:       { value: 1.0 },
    resolution: { value: new THREE.Vector2() }
}

export const shaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vert,
  fragmentShader: frag
})
