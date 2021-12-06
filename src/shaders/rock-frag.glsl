#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 ins_Pos;

out vec4 out_Col;

in vec4 vs_Transform1;
uniform vec3 u_CameraPos;
uniform mat3 u_CameraAxes;
uniform vec2 u_Dimensions;
float rand3D(vec3 p) {
    return fract(sin(dot(p, vec3(dot(p,vec3(127.1, 311.7, 456.9)),
                          dot(p,vec3(269.5, 183.3, 236.6)),
                          dot(p, vec3(420.6, 631.2, 235.1))
                    ))) * 438648.5453);
}

float interpNoise3D(float x, float y, float z) {
    int intX = int(floor(x));
    float fractX = fract(x);
    int intY = int(floor(y));
    float fractY = fract(y);
    int intZ = int(floor(z));
    float fractZ = fract(z);

    float v1 = rand3D(vec3(intX, intY, intZ));
    float v2 = rand3D(vec3(intX + 1, intY, intZ));
    float v3 = rand3D(vec3(intX, intY + 1, intZ));
    float v4 = rand3D(vec3(intX + 1, intY + 1, intZ));

    float v5 = rand3D(vec3(intX, intY, intZ + 1));
    float v6 = rand3D(vec3(intX + 1, intY, intZ + 1));
    float v7 = rand3D(vec3(intX, intY + 1, intZ + 1));
    float v8 = rand3D(vec3(intX + 1, intY + 1, intZ + 1));

    float i1 = mix(v1, v2, fractX);
    float i2 = mix(v3, v4, fractX);

    float i3 = mix(v5, v6, fractX);
    float i4 = mix(v7, v8, fractX);

    float i5 = mix(i1, i2, fractY);
    float i6 = mix(i3, i4, fractY);

    float i7 = mix(i5, i6, fractZ);

    return i7;
}

float fbm(vec3 p, float f) {
    float total = 0.0;
    float persistence = 0.15;
    int octaves = 8;

    for(int i = 1; i <= octaves; i++) {
        float freq = pow(f, float(i));
        float amp = pow(persistence, float(i));

        total += interpNoise3D(p.x * freq,
                               p.y * freq,
                               p.z * freq) * amp;
    }
    return total;
}

void main()
{
	float n = clamp(0.4 * fbm(fs_Pos.zxy, 2.0) + 0.4 * fbm(fs_Pos.xzy, 2.0) + 0.4 * fbm(fs_Pos.yxz, 2.0), 0.0, 0.5);
    vec4 noise = vec4(n, n, n, 1.0);
    vec3 color = (fs_Col.rgb + noise.rgb);

	out_Col = vec4(color * clamp(fs_Col.a, 0.0, 1.0), fs_Col.a);
}




