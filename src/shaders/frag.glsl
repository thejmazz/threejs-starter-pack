uniform float time;

void main() {
    float g = sin(time);
    float r = cos(time);
    float b = tan(time);
    gl_FragColor = vec4(r, g, b, 1.0);
}
