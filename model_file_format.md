## MODEL FILE FORMAT

extension: .m  
type: JSON  

Describes a model as a set of materials and meshes.  

##### e.g.: a spaceship engine:  
The engine has two parts: the casing, and the light emissive part  
_Note: the emissive part could just be a part of the casing, and could use an emission map. This example is overkill._
```
{
  name: "SpaceshipEngine",
  materials: [
  {
    name: "EngineLight",
    shader: {
      path: "lightEmitter.glsl",
      defines: ["FLAT_COLOR"]
    },
    properties: {
      color: [1,1,1],
    }
  },
  {
    name: "EngineCasing",
    shader: {
      path: "pbrBase.glsl",
    },
    properties: {
      ...
    }
  }
  ],
  meshes: [
    {
      name: "EngineLight",
      materialIndex: 0,
      buffers: {
        vertex: [... packed vertices],
        index: [... ]
      }
    },
    {
      name: "EngineCasing",
      materialIndex: 1,
      buffers: {
        ...
      }
    }
  ],
}
```
