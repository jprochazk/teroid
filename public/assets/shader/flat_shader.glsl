__VERTEX__
#version 300 es
in vec3 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main()
{
    gl_Position = u_projection * u_view * u_model * vec4(a_position.xyz, 1.0);
}

__FRAGMENT__
#version 300 es
precision mediump float;

uniform vec3 u_color;

out vec4 o_fragColor;

void main()
{
    o_fragColor = vec4(u_color, 1.0);
}