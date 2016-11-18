// simplex, son
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

// we gonna hijack diffuse
/* uniform vec3 diffuse; */
uniform vec3 emissive;
uniform float opacity;

uniform sampler2D noiseTexture;

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

/* vec4 smoothNoise(sampler2D texture, vec2 uv, float texScale) { */
/*     float fx = fract(uv.x); */
/*     float fy = fract(uv.y); */

/*     float a = int(uv.x); */

/*     /1* float x1 = mod(int(uv.x) + noiseWidth, noiseWidth); *1/ */


/*     return texture2D(texture, uv.xy * texScale); */
/* } */

vec4 smoothNoise(sampler2D texture, vec2 uv, float texscale) {
    float t = 0.1;
    float s = 0.5;

    uv *= texscale;

    vec4 x = mix(
        texture2D(noiseTexture, vec2(uv.x - t, uv.y)),
        texture2D(noiseTexture, vec2(uv.x + t, uv.y)),
        t
    );

    vec4 y = mix(
        texture2D(noiseTexture, vec2(uv.x, uv.y - t)),
        texture2D(noiseTexture, vec2(uv.x, uv.y + t)),
        t
    );

    vec4 sum;

    sum = mix(x, y, s);

    /* vec4 sum = mix( */
    /*         texture2D(noiseTexture, uv * texscale + t), */
    /*         texture2D(noiseTexture, uv * texscale - t), */
    /*         0.1 */
    /*         ); */

    /* sum += texture2D(noiseTexture, uv * texscale + t); */
    /* sum += texture2D(noiseTexture, uv * texscale - t); */

    return sum;
}

void main() {
    vec3 color;

    vec3 green = vec3(0.72, 0.88, 0.23);
    vec3 blue = vec3(46.0 / 255.0, 190.0 / 255.0, 245.0 / 255.0);

    float noise = snoise3(vec3(pos*16.0 + time * 0.05));
    float baseNoise = snoise4(vec4(pos * 0.5, time * 0.25)) * 0.25;

    if (noise > 0.5) {
        color = blue;
    } else {
        color = vec3(baseNoise) + green;
    }

    vec3 diffuse = color;

    vec4 texel;

    /* texel = texture2D(noiseTexture, pos.xy / 8.0); */
    texel = texture2D(noiseTexture, vUv.xy / 8.0);
    /* texel = texture2D(noiseTexture, vUv.xy / 4.0); */

    /* texel = smoothNoise(noiseTexture, pos.xy, 0.15); */
    /* texel = smoothNoise(noiseTexture, pos.xy / 8.0, 1.0); */

    /* texel = vec4(vec3(sin(pos.x * 0.01)), 1.0); */

    gl_FragColor = texel;
    /* gl_FragColor = vec4(pos * 20.0, 1.0); */

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

