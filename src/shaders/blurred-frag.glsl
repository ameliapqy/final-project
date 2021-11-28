#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

in vec4 vs_Transform1;

uniform vec2 u_Dimensions;
uniform sampler2D u_RenderedTexture;

const float weights[81] = float[81](
            0.010989,	0.011474,	0.011833,	0.012054,	0.012129,	0.012054,	0.011833,	0.011474,	0.010989,
            0.011474,	0.01198,	0.012355,	0.012586,	0.012664,	0.012586,	0.012355,	0.01198,	0.011474,
            0.011833,	0.012355,	0.012742,	0.01298,	0.01306,	0.01298,	0.012742,	0.012355,	0.011833,
            0.012054,	0.012586,	0.01298,	0.013222,	0.013304,	0.013222,	0.01298,	0.012586,	0.012054,
            0.012129,	0.012664,	0.01306,	0.013304,	0.013386,	0.013304,	0.01306,	0.012664,	0.012129,
            0.012054,	0.012586,	0.01298,	0.013222,	0.013304,	0.013222,	0.01298,	0.012586,	0.012054,
            0.011833,	0.012355,	0.012742,	0.01298,	0.01306,	0.01298,	0.012742,	0.012355,	0.011833,
            0.011474,	0.01198,	0.012355,	0.012586,	0.012664,	0.012586,	0.012355,	0.01198,	0.011474,
            0.010989,	0.011474,	0.011833,	0.012054,	0.012129,	0.012054,	0.011833,	0.011474,	0.010989
            );


void main()
{
  //lambert
  vec3 dir = vec3(10,100,10) - fs_Pos.xyz;
	float diffuseTerm = dot(normalize(fs_Nor.xyz), normalize(dir));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
	float ambientTerm = 0.5;

	float lightIntensity = diffuseTerm + ambientTerm;
	vec4 color =  clamp(vec4(fs_Col.rgb * lightIntensity, 1.0), 0.0, 1.0);
	
	float unitx = 1.0 / (u_Dimensions.x);
  float unity = 1.0 / (u_Dimensions.y);
	float uvx = 0.5 * (fs_Pos.x + 1.0);
  float uvy = 0.5 * (fs_Pos.y + 1.0);

	vec4 avg = vec4(0.0);
	for(int y = -4; y <= 4; y++){
			for(int x = -4; x <= 4; x++){
					vec2 uv = vec2(uvx + unitx * float(x), uvy + unity * float(y));
					avg += texture(u_RenderedTexture, uv) * weights[ (y+4) + 9 * (x+4) ];
					avg += color * weights[ (y+4) + 9 * (x+4) ];
			}
	}
	out_Col = avg;
}



