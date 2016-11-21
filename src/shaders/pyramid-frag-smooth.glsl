// simplex, son
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)
#pragma glslify: random = require(glsl-random)

// we gonna hijack diffuse
/* uniform vec3 diffuse; */
uniform vec3 emissive;
uniform float opacity;
uniform float zoom;

uniform sampler2D noiseTexture;
uniform float t;
uniform float weightX;
uniform float weightY;
uniform float s;
uniform float seed;

uniform float size;
uniform bool isSmooth;

// add time for noise
uniform float time;
// and take xyz pos from vertex shader
varying vec3 pos;

varying vec2 vUv;

varying vec3 vLightFront;

#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
#endif

#include <common>
#include <packing>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <bsdfs>
#include <lights_pars>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

int noiseWidth = 256;

vec4 smoothy (sampler2D texture, float texSize, vec2 uv) {
    uv = uv * texSize - 0.5;

    float x = floor(uv.x);
    float y = floor(uv.y);

    float dx = uv.x - x;
    float dy = uv.y - y;
    float omdx = 1.0 - dx;
    float omdy = 1.0 - dy;

    /* vec4 sum; */

    /* sum = omdx * omdy * texture2D(texture, vec2(x, y) / texSize) + */
    /*     omdx * dy * texture2D(texture, vec2(x, y + 1.0) / texSize) + */
    /*     dx * omdy * texture2D(texture, vec2(x + 1.0, y) / texSize) + */
    /*     dx * dy * texture2D(texture, vec2(x + 1.0, y + 1.0) / texSize); */

    /* return sum; */

    /* float t = time * 0.0001; */
    vec2 t = vec2(time * 0.01);

    /* vec2 seed = vec2(12345); */
    /* float seed = 0.5; */

    float sum = omdx * omdy * random((vec2(x, y) + seed) / texSize) +
        omdx * dy * random((vec2(x, y + 1.0) + seed) / texSize) +
        dx * omdy * random((vec2(x + 1.0, y) + seed) / texSize) +
        dx * dy * random((vec2(x + 1.0, y + 1.0) + seed) / texSize);

    return vec4(sum);
}

vec2 zoomUV (vec2 uv, float zoomLevel) {
    return uv * zoomLevel + (1.0 - zoomLevel) / 2.0;
}


/**
  * size is x^2
  */
vec4 turbulence (vec2 uv, float size, bool isSmooth) {
    vec4 sum = vec4(0);
    float initialSize = size;

    int iterations = int(log2(size));
    for (int i = 0; i < 100; i++) {
        if (isSmooth) {
            sum += smoothy(noiseTexture, 256.0, zoomUV(uv, 1.0 / size)) * size;
        } else {
            sum += texture2D(noiseTexture, zoomUV(uv, 1.0 / size)) * size;
        }
        size /= 2.0;

        if (i == iterations) break;
    }

    /* while (size >= 1.0) { */
    /*     sum += smoothy(noiseTexture, 256.0, zoomUV(uv, 1.0 / size)) * size; */
    /*     size /= 2.0; */
    /* } */

    return sum / ( 2. * initialSize );
}

void main() {
    vec3 diffuse;
    vec4 texel;

    /* texel = smoothy(noiseTexture, 512.0, zoomUV(vUv, zoom)); */

    float z = 8.0;
    float zoomba = 1.0 / z;

    vec4 t1 = smoothy(noiseTexture, 256.0, zoomUV(vUv, 1.0 / 16.0)) * 16.0;
    vec4 t2 = smoothy(noiseTexture, 256.0, zoomUV(vUv, 1.0 / 8.0)) * 8.0;
    vec4 t3 = smoothy(noiseTexture, 256.0, zoomUV(vUv, 1.0 / 4.0)) * 4.0;
    vec4 t4 = smoothy(noiseTexture, 256.0, zoomUV(vUv, 1.0 / 2.0)) * 2.0;
    vec4 t5 = smoothy(noiseTexture, 256.0, zoomUV(vUv, 1.0 / 1.0)) * 1.0;
    vec4 tSum = t1 + t2 + t3 + t4 + t5;
    tSum /= 32.0;

    texel = tSum;

    /* texel = smoothy(noiseTexture, 256.0, zoomUV(vUv, zoomba)); */

    /* gl_FragColor = texel; */

    vec4 turb = turbulence(vUv, size, isSmooth);
    float lightness = 192. + (turb.r * 255.) / 4.;
    lightness /= 255.;
    vec3 color = hsl2rgb(169./255., 255./255., lightness);

    /* gl_FragColor = turbulence(vUv, size, isSmooth); */
    gl_FragColor = vec4(color, 1.0);

    /* gl_FragColor = vec4(vec3(sin((vUv.x + vUv.y) * 128.)), 1.0); */

    // === lambert shader code ===

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <emissivemap_fragment>

    reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );

    #include <lightmap_fragment>

    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

    #ifdef DOUBLE_SIDED
            reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
    #else
            reflectedLight.directDiffuse = vLightFront;
    #endif

    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();

    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    #include <normal_flip>
    #include <envmap_fragment>

    /* gl_FragColor = vec4( outgoingLight, diffuseColor.a ); */

    #include <premultiplied_alpha_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
}

