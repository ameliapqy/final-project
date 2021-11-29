#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Pos;
out vec4 out_Col;


void main() {
  //float n = 1.0 - fbm(fs_Pos.x + 0.1 * sin(0.005 * float(u_Time)), fs_Pos.y + 0.1 * sin(0.005 * float(u_Time)), sin(0.005 * float(u_Time)) * fs_Pos.x);
  //n = fbm(n,n,n);
  //out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);
  out_Col = vec4(0.0, 0.0, 0.0, 1.0);
}