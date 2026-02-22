# 3D Rendering Roadmap

Ajout progressif d'un pipeline 3D (style Quake 1 / Half-Life 1) au framework Perky.

## Progression

| # | Etape | Fichiers | Tests | Statut |
|---|-------|----------|-------|--------|
| 1 | Matrix4 | `math/matrix4.js` | 42 | Done |
| 2 | Quaternion | `math/quaternion.js` | 38 | Done |
| 3 | Geometry | `render/geometry.js` | 14 | Done |
| 4 | Mesh | `render/mesh.js` | 6 | Done |
| 5 | Mesh Shader | `render/shaders/builtin/mesh_shader.js` | 19 | Done |
| 6 | Camera3D | `render/camera_3d.js` | 14 | Done |
| 7 | Object3D | `render/object_3d.js` | 17 | Done |
| 8 | MeshInstance | `render/mesh_instance.js` | 7 | Done |
| 9 | WebGLMeshRenderer | `render/webgl/webgl_mesh_renderer.js` | 12 | Done |
| 10 | Integration | Branchement dans le pipeline existant | - | En cours |

## Details

### Etape 1-2 : Math (Matrix4 + Quaternion)
- Matrix4 : Float32Array(16), column-major, chainable API
- Quaternion : rotation, slerp, euler conversion, axis-angle
- Fonctions : perspective, lookAt, compose/decompose, transformPoint

### Etape 3-4 : Geometry + Mesh
- Geometry : donnees brutes (positions, normals, uvs, indices)
- Factories : `createBox(w,h,d)`, `createPlane(w,h,segW,segH)`
- Mesh : VAO + VBO + IBO, layout (pos=0, normal=1, uv=2)

### Etape 5 : Mesh Shader
- GLSL 300 es, vertex + fragment
- Diffuse lighting directionnel + ambient
- Fog distance (near/far/color)
- Tint color

### Etape 6-8 : Scene Graph 3D
- Camera3D : perspective projection, lookAt, lazy evaluation
- Object3D : position/rotation/scale, parent-child, dirty flag, world matrix
- MeshInstance : Object3D + mesh + texture + tint

### Etape 9 : WebGLMeshRenderer
- Extends WebGLObjectRenderer, handles MeshInstance
- Depth test enable/disable (cohabitation 2D/3D)
- Setup uniforms + draw loop

### Etape 10 : Integration
- `webgl_renderer.js` modifie pour passer `shaderRegistry` au context
- Object3D a `opacity` pour compatibilite avec traverse.js
- Prochain : exemple visuel (cube texture + camera perspective)
