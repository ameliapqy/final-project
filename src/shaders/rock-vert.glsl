#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

uniform vec3 u_CameraPos;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

in vec4 vs_Transform1; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Transform2; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Transform3; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Transform4; // Another instance rendering attribute used to position each quad instance in the scene

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 ins_Pos;

const float bleeding_threshold = 0.025;
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
    float persistence = 0.5;
    int octaves = 5;

    float time = 0.0;//float(u_Time)*0.1;
    float shift = time;

    for(int i = 1; i <= octaves; i++) {
        float freq = pow(f, float(i));
        float amp = pow(persistence, float(i));

        total += interpNoise3D(p.x * freq + shift,
                               p.y * freq + shift,
                               p.z * freq + shift) * amp;
    }
    return total;
}

float angle(vec4 pos) {
    vec3 look = normalize(u_CameraAxes[2]);
	vec3 normal = normalize(fs_Nor.xyz);
	float d = (sqrt(look.x * look.x + look.y * look.y + look.z * look.z) * sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z));
	float angle = acos((look.x * normal.x + normal.y * look.y + normal.z * look.z) / d) / 3.14159;
    return angle;
}

vec4 getColor(vec4 pos, vec4 original, float b) {
	vec3 dir = vec3(40,100,150) - pos.xyz;
	float diffuseTerm = dot(normalize(fs_Nor.xyz), normalize(dir));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
	float ambientTerm = 0.5;
	
	float lightIntensity = 0.8 * diffuseTerm + ambientTerm;
	vec3 color = original.rgb;

	//darkening edge
	float angle = angle(pos);
	float edge = pow(angle + 0.25, 30.0);
	vec3 edge_color = 5.5 * original.rgb * edge;
    
    color = vec3(min(color.r, edge_color.r), min(color.g, edge_color.g), min(color.b, edge_color.b));
    float alpha = 1.0;
    
	return clamp(vec4(color * lightIntensity, alpha), 0.0, 1.0);
}

void main()
{
    // vec3 offset = vs_Translate;
    // offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    // vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
    
    mat4 transformation = mat4(vs_Transform1, vs_Transform2, vs_Transform3, vs_Transform4);
    vec4 instancedPos = transformation * vs_Pos;
    
    

    vec4 offset = vec4(0.0);
    float n = 1.0 - fbm(instancedPos.xyz, 0.8);
    n = pow(n, 6.0);
 
    //create tremor effect
    offset = 2.0 * transformation * vs_Nor * sin(0.2 * fbm(instancedPos.xyz, 0.8));
    

    fs_Pos = vs_Pos;
    fs_Nor = transformation * vs_Nor;
    gl_Position = u_ViewProj * (vec4(instancedPos.xyz, 1.0) + offset);
    ins_Pos = gl_Position;
    fs_Col = getColor(ins_Pos, vs_Col, n);
}
