#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

#define LAMBERT
varying vec3 vLightFront;
uniform float time;

#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
#endif

// send xyz position to fragment shader
varying vec3 pos;

varying vec2 vUv;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
    pos = position;
    vUv = uv;

    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <lights_lambert_vertex>
    #include <shadowmap_vertex>

    float sum = 0.;
    float t = time * 0.05;

    // turbulence: accumulate noise at different frequencies with corresponding weights
    // little fizzles
    sum += snoise4(vec4(position * 0.25, t)) * 1.;
    // big womps
    sum += snoise4(vec4(position * 0.01, t)) * 4.;
    // medium chubs
    sum += snoise4(vec4(position * 0.1, t)) * 3.;

    // sum += snoise4(vec4(position * 0.25, t)) * 0.1;

    vec4 displacedPosition = vec4(position.x, position.y, position.z + sum, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * displacedPosition;
}
