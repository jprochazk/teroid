__VERTEX__
#version 300 es
in vec3 a_position;

out vec3 v_position;

void main()
{
    v_position = a_position;
    gl_Position = vec4(a_position, 1.0);
}

__FRAGMENT__
#version 300 es
precision mediump float;

in vec3 v_position;

out vec4 o_fragColor;

void main()
{
    o_fragColor = vec4(v_position, 1.0);
}