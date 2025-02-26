#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Pos;
out vec4 out_Col;

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

float fbm(float x, float y, float z) {
    float time = float(u_Time)*0.002;

    float total = 0.0;
    float persistence = 0.5;
    int octaves = 6;
    float shift = time-0.5;

    for(int i = 1; i <= octaves; i++) {
        float freq = pow(2.0, float(i));
        float amp = pow(persistence, float(i));

        total += interpNoise3D(x * freq + shift,
                               y * freq + shift,
                               z * freq + shift) * amp;
    }
    return total;
}

vec4 circle(vec2 pos, vec2 center, float rad, vec3 color) {

  float n = fbm(fs_Pos.y, fs_Pos.x, fs_Pos.z);
  color -= 0.3 * vec3(n, n, n);

  vec2 pos1 = (pos + 1.0) / 2.0;
  pos1 = vec2(pos1.x * u_Dimensions.x, pos1.y * u_Dimensions.y);

  vec2 pos2 = (pos + vec2(0.0, 0.2 * rad) + 1.0) / 2.0;
  pos2 = vec2(pos2.x * u_Dimensions.x, pos2.y * u_Dimensions.y);

  center = (center +1.0) /2.0;
  center = vec2(center.x * u_Dimensions.x, center.y * u_Dimensions.y);

  rad = rad * u_Dimensions.x;

  float t = 1.0 - length(pos1 - center) / rad;
  t = clamp(t, 0.0, 1.0);

  vec3 render = color * t * 1.5;

  if(length(pos2 - center) < rad * 0.75) {
    render = color * 0.8; 
  }
  return vec4(render, 0.0);
}


void main()
{
  vec4 color1 = vec4(232.0, 230.0, 255.0, 1.0) / 255.0;
  float n = 1.0 - fbm(fs_Pos.x, fs_Pos.y, fs_Pos.x);
//   float n = 1.0 - fbm(fs_Pos.x + 0.1 * sin(0.005 * float(u_Time)), fs_Pos.y + 0.1 * sin(0.005 * float(u_Time)), sin(0.005 * float(u_Time)) * fs_Pos.x);
  n = fbm(n,n,n);
  out_Col += vec4(n, n, n, 1.0) * 0.5 + vec4(0.65,0.65,0.7,1.0);
  out_Col = clamp(out_Col, vec4(0), vec4(1));
  out_Col = mix(color1, out_Col, 0.7);

  //add water

  float w = fbm(fs_Pos.y + n * 0.5, fs_Pos.y + n * 0.55, fs_Pos.z + n * 0.45);
  w = w * fs_Pos.y * 1.5;
  w = clamp(w, -1.0, 0.0);
  vec4 sun = circle(fs_Pos.xy, vec2(-0.55, 0.45), 0.05, vec3(138.0 / 255.0, -0.25, -0.25));
  out_Col += vec4(w , w, w, 1.0);
  out_Col += sun;
  // plain background for comparison
  // out_Col = vec4(0.9,0.9,0.9,1.0);
}

