import vert from '../shaders/vert.glsl'
import frag from '../shaders/frag.glsl'

console.log('vert: ', vert)

export const uniforms = {
    time: { type: 'f', value: 0.0, step: 0.03 }
}

export const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vert,
  fragmentShader: frag
})
