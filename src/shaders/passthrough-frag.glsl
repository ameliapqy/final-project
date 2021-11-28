#version 300 es
precision highp float;

out vec4 out_Col;

uniform vec2 u_Dimensions;
uniform sampler2D u_RenderedTexture;

void main()
{ 
    out_Col = texture(u_RenderedTexture, u_Dimensions);
    out_Col += vec4(1,1,1,0);
}