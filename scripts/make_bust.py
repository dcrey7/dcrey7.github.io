"""Cut a passport bust from the avatar, for the INTRO icon.

The other six props are made things. This one is him, taken from the same
model that stands in the middle of the ABOUT screens.

Run: uv run --no-project --with bpy python scripts/make_bust.py

Three things have to happen before the cut, and each one was got wrong once.

1. The face. The model carries five face shapes (blink left, blink right,
   jaw open, mouth wide, mouth round) and the file has every one of them
   switched fully on. That is what gave him shut eyes and a hanging jaw.
   All of them go to zero: eyes open, mouth closed.
2. The eyes. The eyeballs are a separate object. Deleting it as "inner
   geometry" left two holes. It stays, along with the mouth parts, which sit
   behind closed lips and are never seen.
3. The arms. The model is stored with the arms straight out. A bust cut from
   that has no shoulders, only two flat stumps. So the upper arm bones are
   turned down first and the pose is baked into the mesh, and then one
   horizontal cut under the collarbone gives a normal pair of shoulders.
"""
import math
from pathlib import Path

import bpy
import bmesh   # only importable once bpy has initialised
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/avatar/avatar/facial-rigged.glb'
OUT = ROOT / 'assets/props/about.glb'
CUT = 0.695         # share of his height where he is cut. Measured: he is
                    # 0.947 tall, the head bone sits at 0.714, the collarbone
                    # at 0.654. This is just under the collarbone, so the
                    # shoulders are in and the chest is not.
ARM_DROP = 78       # degrees the upper arms turn down from straight out.
                    # Not the full 90, so they hang a little away from the body.
TEXTURE = 256       # the same as the other six


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SRC))

meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
print('meshes:', [o.name for o in meshes])

# 1. A neutral face. Zero every shape, then drop the shapes: the mesh keeps
#    the base shape, and the exporter has nothing to switch back on.
for o in meshes:
    if o.data.shape_keys:
        for k in o.data.shape_keys.key_blocks:
            k.value = 0.0
        o.shape_key_clear()

# 3. Arms down. The arms run along Y, so a turn about X swings them down in
#    the plane of the body. The sign follows the side: each arm turns toward
#    the ground, whichever way it points.
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='POSE')
for pb in rig.pose.bones:
    b = pb.bone
    if 'Upperarm' not in b.name or b.parent is None or 'Clavicle' not in b.parent.name:
        continue
    side = 1 if (b.tail_local.y - b.head_local.y) > 0 else -1
    pivot = Matrix.Translation(b.head_local)
    turn = pivot @ Matrix.Rotation(-side * math.radians(ARM_DROP), 4, 'X') @ pivot.inverted()
    pb.matrix = turn @ pb.matrix
    bpy.context.view_layer.update()
    print(f'turned {b.name} down, side {side:+d}')
bpy.ops.object.mode_set(mode='OBJECT')

# Bake the pose. The body is skinned, so its armature modifier is applied.
# The eyes and mouth parts hang off bones, so clearing the parent with the
# transform kept puts them where the posed bones hold them.
for o in meshes:
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        if m.type == 'ARMATURE':
            bpy.ops.object.modifier_apply(modifier=m.name)
        else:
            o.modifiers.remove(m)
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def bounds(o):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for v in o.data.vertices:
        p = o.matrix_world @ v.co
        lo = Vector((min(lo[i], p[i]) for i in range(3)))
        hi = Vector((max(hi[i], p[i]) for i in range(3)))
    return lo, hi


lo, hi = bounds(obj)
height = hi.z - lo.z
z_cut = lo.z + height * CUT
print(f'height {height:.3f}, width {hi.y - lo.y:.3f} with the arms down, cut at z {z_cut:.3f}')

# One clean slice under the collarbone; everything below it goes.
me = obj.data
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                       plane_co=(0, 0, z_cut), plane_no=(0, 0, 1),
                       clear_inner=False, clear_outer=False)
gone = [v for v in bm.verts if v.co.z < z_cut - 1e-6]
bmesh.ops.delete(bm, geom=gone, context='VERTS')
# The cut stays open. Filling it takes whatever part of the texture the new
# faces land on and puts black shards across the chest. Open, the hole is at
# the very bottom where nothing looks into it.
bm.to_mesh(me)
bm.free()
me.calc_loop_triangles()
print('triangles after the cut:', len(me.loop_triangles))

bpy.data.objects.remove(rig, do_unlink=True)

for img in bpy.data.images:
    if img.size[0] > TEXTURE or img.size[1] > TEXTURE:
        img.scale(TEXTURE, TEXTURE)

# Same cube as the rest of the set, so one camera frames them all alike.
lo, hi = bounds(obj)
centre = (lo + hi) / 2
span = max(hi[i] - lo[i] for i in range(3)) or 1.0
print(f'bust {hi.x - lo.x:.3f} deep, {hi.y - lo.y:.3f} wide, {hi.z - lo.z:.3f} tall')
obj.location -= centre
bpy.ops.object.transform_apply(location=True)
obj.scale = (2.0 / span,) * 3
bpy.ops.object.transform_apply(scale=True)

bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.export_scene.gltf(filepath=str(OUT), export_format='GLB',
                          export_image_format='WEBP', export_image_quality=80,
                          export_yup=True, use_selection=True)
print(f'wrote {OUT.name}: {OUT.stat().st_size // 1024} KB')
