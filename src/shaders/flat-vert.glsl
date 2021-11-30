#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

void main() {
  fs_Pos = vs_Pos;
  fs_Nor = vs_Nor;
  gl_Position = vs_Pos;
}
