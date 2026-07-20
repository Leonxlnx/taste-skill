# Gap visual-effect sources

Checked: 2026-07-20

Scope: additional open-source React visual-effect components not already selected in shortlist.md or the existing component inventories. Page sections, layouts, templates, effect presets, parameter variants, thin wrappers, and generic decorative blobs, grids, gradients, shimmers, and particles are excluded.

Status: research only. No source, package, asset, registry item, preview, or dependency was imported.

## Decision

The current Visual Effects shortlist contains 38 candidates against a target of 70, leaving a gap of 32. This pass found **17 distinct conditional candidates** across four permissively licensed repositories. None is import-ready: every candidate still needs local source-copy, provenance, build, runtime, fallback, reduced-motion, and cleanup verification.

| Source | Pinned revision | Accepted now | Conditional | Decision |
| --- | --- | ---: | ---: | --- |
| [pmndrs/drei](https://github.com/pmndrs/drei/tree/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae) | c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae, 2026-01-30 | 0 | **13** | Strongest new pool. Keep only authored 3D material, lighting, shadow, outline, and object-trail contracts. |
| [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing/tree/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c) | 90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c, 2025-02-20 | 0 | **2** | Keep the two implementations that add substantial behavior or shader code; reject its ordinary postprocessing wrappers. |
| [fand/vfx-js](https://github.com/fand/vfx-js/tree/d1bbb602a55e063e722d8cd07bc8406e1784f105) | d1bbb602a55e063e722d8cd07bc8406e1784f105, 2026-07-07 | 0 | **1** | Count the React DOM/media shader surface as one family. Its 33 bundled effect definitions are presets, not 33 components. |
| [nagelflorian/react-duotone](https://github.com/nagelflorian/react-duotone/tree/9bf7088faba573214877a14f443ac1fc5e373135) | 9bf7088faba573214877a14f443ac1fc5e373135, 2026-07-16 | 0 | **1** | Small, dependency-free static image effect, conditional on image-loading and pixel-budget repairs. |
| [woltapp/react-blurhash](https://github.com/woltapp/react-blurhash/tree/c248bac1508099dff783fb9f51469ca7b0fe4e3e) | c248bac1508099dff783fb9f51469ca7b0fe4e3e, 2023-01-09 | 0 | 0 | Reject: no repository license artifact and primarily a loading placeholder rather than an effect contract. |
| [Stanko/react-image-filter](https://github.com/Stanko/react-image-filter/tree/0930a4c5bde8248e6bfbf730e8bbb80e79b22e81) | 0930a4c5bde8248e6bfbf730e8bbb80e79b22e81, 2025-01-02 | 0 | 0 | Reject/merge: weaker legacy duplicate of the duotone/color-matrix family. |
| **Total** |  | **0** | **17** | The best-case remaining gap becomes 15 only after all 17 pass release QA. The present shortlist count remains 38. |

There are **22 explicitly named rejected or merged units** below, plus the ordinary wrapper and preset pools that are excluded source-wide rather than inflated into candidate counts.

## Gates shared by every conditional candidate

- Import from the pinned commit and exact paths recorded here. A mutable package release or documentation snippet is not canonical source.
- Copy the smallest reachable source closure. Do not copy demos, stories, documentation shells, sample scenes, fonts, photos, videos, environment maps, models, or brand assets.
- Preserve the root license plus every upstream-derived notice identified below. A permissive repository license does not cure an incompatible or unverified shader origin.
- Lazy-load Canvas/WebGL previews, render at most one expensive preview continuously, stop work while hidden or offscreen, and cap device-pixel ratio at 1.5 on desktop and 1 on constrained/mobile devices.
- Every WebGL candidate needs a deterministic no-WebGL/static fallback. Reduced motion must stop time-based loops, trails, camera following, and temporal accumulation rather than merely slowing them.
- Dispose render targets, depth textures, materials, geometries, listeners, observers, animation frames, and media decoders on replacement and unmount. Repeated mount/unmount is a release gate.
- Presets, colors, directions, sample counts, resolutions, geometry choices, target types, and animated/static modes do not create more components.
- The React Three Fiber candidates should share one pinned Three/R3F stack. Do not introduce independent Three runtimes per registry item.
- Drei's selected files import two raw GLSL files. Inline those exact shaders with provenance or use the catalog's existing shader transform; do not add a project-wide loader solely for these components.

## pmndrs/drei — 13 conditional candidates

| Field | Value |
| --- | --- |
| Repository | [pmndrs/drei](https://github.com/pmndrs/drei) |
| Pinned commit | [c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae](https://github.com/pmndrs/drei/tree/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae) |
| Commit date | 2026-01-30 |
| License | [MIT, copyright 2020 react-spring](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/LICENSE) |
| Declared host/runtime | React 19, React DOM 19, @react-three/fiber 9, Three 0.159 or newer |
| Selected dependency subset | Three, @react-three/fiber, three-stdlib 2.35.x, three-mesh-bvh 0.8.x, meshline 3.3.x, glsl-noise, and the type-only utility-types helper where named below |
| Assets | None shipped. Environment maps, textures, meshes, and scene content are caller-owned inputs and need separate asset records. |

All paths in this section are relative to the pinned Drei tree. Shared helpers such as src/helpers/ts-utils.tsx, src/helpers/constants.ts, and src/core/shaderMaterial.tsx are anatomy, not extra components.

| # | Candidate and canonical source | Distinct contract and source closure | Dependencies/assets | Mandatory performance, fallback, and reduced-motion gates |
| ---: | --- | --- | --- | --- |
| 1 | [MeshDistortMaterial](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshDistortMaterial.tsx) | Vertex-space simplex deformation of a real 3D mesh. Closure: src/helpers/glsl/distort.vert.glsl and src/helpers/ts-utils.tsx. | R3F, Three, glsl-noise; no assets. | Stop its clock with speed 0 for reduced motion and while offscreen. Cap mesh complexity. Fallback to the same mesh with its base material. |
| 2 | [MeshWobbleMaterial](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshWobbleMaterial.tsx) | Sinusoidal vertex wobble tied to mesh position, not a full-canvas noise preset. Closure: src/helpers/ts-utils.tsx. | R3F and Three; no assets. | Set speed 0 for reduced motion/offscreen, cap geometry, and fall back to the unmodified base material. |
| 3 | [MeshReflectorMaterial](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshReflectorMaterial.tsx) | Planar scene reflection with depth-aware blur. Closure: src/materials/BlurPass.tsx, src/materials/ConvolutionMaterial.tsx, src/materials/MeshReflectorMaterial.tsx, src/helpers/constants.ts, and src/helpers/ts-utils.tsx. | R3F, Three, three-stdlib; no assets. | The pinned source allocates reflection and blur render targets without a complete local disposal path; add and test cleanup. Use low fixed resolution, pause rendering offscreen, and show a plain material or still reflection when unsupported/reduced. |
| 4 | [MeshRefractionMaterial](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshRefractionMaterial.tsx) | BVH-backed multi-bounce refraction through scene geometry. Closure: src/materials/MeshRefractionMaterial.tsx, src/core/shaderMaterial.tsx, and src/helpers/constants.ts. | R3F, Three, three-mesh-bvh; caller supplies an environment texture. | Bound geometry size and bounces, keep fastChroma enabled by default, and build BVH only when visible. Static by default; fallback to a standard physical material using the same environment. |
| 5 | [MeshTransmissionMaterial](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshTransmissionMaterial.tsx) | Screen-space transmissive material with chromatic aberration, anisotropy, distortion, and optional backside sampling. Closure: src/core/Fbo.tsx, src/core/shaderMaterial.tsx, src/materials/DiscardMaterial.tsx, and src/helpers/ts-utils.tsx. | R3F and Three; optional caller-owned buffer/background texture. | Prefer the shared transmission sampler when adequate; otherwise cap buffer resolution and samples. Set temporalDistortion 0 for reduced motion, stop extra passes offscreen, and fall back to MeshPhysicalMaterial transmission or a static material. |
| 6 | [ContactShadows](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/ContactShadows.tsx) | Camera-independent ground contact shadow rendered and blurred from the scene. Closure: src/helpers/ts-utils.tsx. | R3F, Three, three-stdlib blur shaders; no assets. | The two render targets need verified disposal. Replace the default infinite render loop with finite frames for static previews, stop offscreen, and fall back to a normal shadow or no decorative shadow. |
| 7 | [AccumulativeShadows](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/AccumulativeShadows.tsx) | Progressive multi-light shadow-map accumulation. RandomizedLight is supporting anatomy and adds no count. Closure: src/core/shaderMaterial.tsx, src/materials/DiscardMaterial.tsx, src/helpers/constants.ts, and src/helpers/ts-utils.tsx. | R3F and Three; no assets. | ProgressiveLightMap owns two half-float render targets but exposes no complete disposal method in this source; repair and test it. Use finite frames and a lower resolution, stop after convergence, and render one settled frame or a standard shadow under reduced motion. |
| 8 | [Caustics](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/Caustics.tsx) | Geometry- and light-dependent refractive caustic projection, not a generic light texture. Closure: src/core/Fbo.tsx, src/core/Helper.tsx, src/core/Edges.tsx, src/core/Line.tsx, src/core/shaderMaterial.tsx, src/helpers/constants.ts, and src/helpers/ts-utils.tsx. | R3F, Three, three-stdlib, and utility-types for a helper type; caller geometry only. | Four render targets make the source default resolution of 2024 unsuitable for the catalog. Start at 512, allow at most 1024 after profiling, keep frames finite, and use an unlit/still scene fallback. |
| 9 | [SpotLight](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/SpotLight.tsx) | Authored volumetric light cone with optional projected shadow, materially different from a plain Three light. Closure: src/materials/SpotLightMaterial.tsx, src/helpers/glsl/DefaultSpotlightShadowShadows.glsl, and src/helpers/ts-utils.tsx. | R3F, Three, three-stdlib; optional caller texture. | Keep volumetric resolution/opacity conservative, disable the shadow buffer unless demonstrated, and pause time-dependent custom shaders offscreen/reduced. Its shadow path already disposes its target; verify the entire scene. Fallback to a normal spotlight. |
| 10 | [Outlines](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/Outlines.tsx) | Inverted-hull geometry outline that follows the source mesh. Closure: src/core/shaderMaterial.tsx and src/helpers/constants.ts. | R3F, Three, and three-stdlib for creased normals; no assets. | Static and reduced-motion safe. Limit high-poly skinned scenes, verify creased-geometry cleanup, and fall back to the base mesh without an outline. |
| 11 | [Wireframe](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/Wireframe.tsx) | Barycentric, antialiased wireframe overlay with stroke/fill controls. Closure: src/materials/WireframeMaterial.tsx. | R3F and Three; no assets. | Static and reduced-motion safe. Benchmark geometry copying/barycentric generation, release replaced geometry/material state, and fall back to Three's basic wireframe or the plain mesh. |
| 12 | [Trail](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/Trail.tsx) | A controllable spatial trail following an actual Object3D, with width, length, decay, stride, and sampling interval. It is not a generic cursor or particle decoration. Closure: src/helpers/ts-utils.tsx. | R3F, Three, meshline; no assets. | Bound point count, stride, and update cadence; pause sampling offscreen. Reduced motion hides the trail or freezes a short settled trace. Fallback to the object without a trail. |
| 13 | [ShadowAlpha](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/ShadowAlpha.tsx) | Bayer-dither custom depth/distance materials that let partially transparent objects cast alpha-aware shadows. | R3F and Three; optional caller alpha texture. | Static and reduced-motion safe. Avoid an unconditional frame callback when inputs are unchanged, dispose injected materials on unmount, and fall back to an opaque or disabled shadow. |

### Drei notices and provenance

Preserve the Drei MIT notice for every copied file and add the applicable notice/credit:

- MeshRefractionMaterial cites [N8python/diamonds at 69b30cc5586195461f47e0b25ccf14578b292cc0](https://github.com/N8python/diamonds/tree/69b30cc5586195461f47e0b25ccf14578b292cc0), MIT, copyright 2022 N8python.
- MeshTransmissionMaterial credits Junni's shader. [junni-inc/next.junni.co.jp at 5abd8d9fb47fcc13118cdfdd1cfe190d481d20ae](https://github.com/junni-inc/next.junni.co.jp/tree/5abd8d9fb47fcc13118cdfdd1cfe190d481d20ae) has an MIT license, copyright 2022 Junni Co., Ltd. Preserve the source header and the Junni notice.
- MeshTransmissionMaterial also states that its transmission code is based on [KhronosGroup/glTF-Sample-Viewer at 6b4012c8cd58f933565401fbe4404a40380ee0fb](https://github.com/KhronosGroup/glTF-Sample-Viewer/tree/6b4012c8cd58f933565401fbe4404a40380ee0fb), Apache-2.0. Carry the Apache-2.0 text, mark the copied/modified shader, and retain the in-file attribution. Its N8Programs gist is an author credit inside the MIT-licensed Drei file; legal review must confirm that contribution covers the gist lineage before release.
- ContactShadows identifies the Three.js contact-shadow example and Mr.doob as its origin. Preserve the [Three.js MIT notice](https://github.com/mrdoob/three.js/blob/dev/LICENSE).
- AccumulativeShadows identifies Zalo's Progressive Light Map Accumulator as its basis; the implementation is also distributed in Three.js. Preserve the Zalo credit and Three.js MIT notice.
- Caustics credits [N8python/caustics at fa4890cbe16f1e3dc1be5dfefbd01f6932b2ea88](https://github.com/N8python/caustics/tree/fa4890cbe16f1e3dc1be5dfefbd01f6932b2ea88), released under CC0 1.0. Keep the attribution as provenance even though CC0 does not require it.
- ShadowAlpha is based on [gkjohnson/threejs-sandbox at 3f85a11d3cf7972002e79a7e1b236a9f6564bc1c](https://github.com/gkjohnson/threejs-sandbox/tree/3f85a11d3cf7972002e79a7e1b236a9f6564bc1c), MIT, copyright 2018 Garrett Johnson. Preserve its notice and the in-file credit.
- Preserve the licenses/notices for the copied dependency closure: React, Three, React Three Fiber, [three-stdlib MIT at e0e835a267afd01d318c5ea532732af0235872da](https://github.com/pmndrs/three-stdlib/tree/e0e835a267afd01d318c5ea532732af0235872da), [three-mesh-bvh MIT at b11ca70579b015f240ca00603b8118aaba90fb88](https://github.com/gkjohnson/three-mesh-bvh/tree/b11ca70579b015f240ca00603b8118aaba90fb88), [meshline MIT at 4df8778398e086628076267c67552c079d39be85](https://github.com/pmndrs/meshline/tree/4df8778398e086628076267c67552c079d39be85), [glsl-noise's permissive notice at 7870430c384bd53488ff6fe9a47f8a6f571524c4](https://github.com/hughsk/glsl-noise/tree/7870430c384bd53488ff6fe9a47f8a6f571524c4), and [utility-types MIT at fb06cf0c7d2768e39b78bed8b7ca94727998cb2f](https://github.com/piotrwitek/utility-types/tree/fb06cf0c7d2768e39b78bed8b7ca94727998cb2f). These revisions record the license artifacts checked on 2026-07-20; pin the exact package versions resolved during import separately.

## pmndrs/react-postprocessing — 2 conditional candidates

| Field | Value |
| --- | --- |
| Repository | [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Pinned commit | [90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c](https://github.com/pmndrs/react-postprocessing/tree/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c) |
| Commit date | 2025-02-20 |
| License | [MIT, copyright 2020 react-spring](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/LICENSE) |
| Declared dependencies | @react-three/fiber 9, React 19, Three 0.156 or newer, postprocessing 6.36.x, maath 0.6.x, n8ao 1.9.x |
| Assets | None shipped for the selected candidates. Scene content is caller-owned. |

The repository describes itself as a postprocessing wrapper. Ordinary one-file JSX adapters around postprocessing classes do not satisfy the source-copy rule and are rejected source-wide. Two files add enough original implementation to survive that boundary:

| # | Candidate and canonical source | Source closure and distinct contract | Mandatory performance, fallback, and reduced-motion gates |
| ---: | --- | --- | --- |
| 14 | [Autofocus](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/Autofocus.tsx) | Depth-picks a pointer or target, smooths focus distance, and drives depth of field. Closure: src/effects/DepthOfField.tsx, src/EffectComposer.tsx, and src/util.tsx. DepthOfField is supporting anatomy and does not add a second count. | Depth reads and smoothing can run every frame. Use manual mode for static/reduced previews, activate only while visible, use low composer resolution, and return the unfiltered scene if WebGL/depth picking fails. Legal gate: maath's checked repository has only package-level MIT metadata and no license artifact. Do not copy maath code; minimally replace the one damp3 call with a verified Three-MIT equivalent, or reject Autofocus until maath supplies a license artifact. |
| 15 | [TiltShift2](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/TiltShift2.tsx) | Authored focal-line convolution shader, not the adjacent thin TiltShift wrapper. Closure: src/EffectComposer.tsx and src/util.tsx. | Static and reduced-motion safe. Cap samples and composer resolution, run only while visible, and fall back to the unfiltered scene. |

Preserve the repository MIT notice and the licenses for [postprocessing zlib at 18596ef710c929d5ebfd8144de7435bccd6b072e](https://github.com/pmndrs/postprocessing/tree/18596ef710c929d5ebfd8144de7435bccd6b072e), Three, R3F, and React. The checked [maath revision 626d198fbae28ba82f2f1b184db7fcafd4d23846](https://github.com/pmndrs/maath/tree/626d198fbae28ba82f2f1b184db7fcafd4d23846) declares MIT only in package metadata and has no LICENSE/COPYING artifact, so this inventory does not treat maath as verified source. TiltShift2 states that its blur kernel is derived from Evan Wallace's glfx.js; preserve [glfx.js at 86ae72acfffcd50774507eb7b69887ba2493dc35](https://github.com/evanw/glfx.js/tree/86ae72acfffcd50774507eb7b69887ba2493dc35) and its MIT notice, copyright 2011 Evan Wallace.

## fand/vfx-js — 1 conditional candidate

| Field | Value |
| --- | --- |
| Repository | [fand/vfx-js](https://github.com/fand/vfx-js) |
| Pinned commit | [d1bbb602a55e063e722d8cd07bc8406e1784f105](https://github.com/fand/vfx-js/tree/d1bbb602a55e063e722d8cd07bc8406e1784f105) |
| Commit date | 2026-07-07 |
| License | [MIT, copyright 2020-present the VFX-JS developers](https://github.com/fand/vfx-js/blob/d1bbb602a55e063e722d8cd07bc8406e1784f105/LICENSE) |
| Packages at the pin | @vfx-js/react 1.1.0, @vfx-js/core 1.1.0, optional @vfx-js/effects 1.3.0 |
| Dependencies | React/React DOM 18 or 19; @vfx-js/core has no declared runtime dependencies |

### Candidate 16: VFX DOM/media shader surface

This is one reusable React effect family that captures and filters existing DOM/media while retaining semantic source elements. VFXCanvas, VFXImg, VFXVideo, VFXSpan, VFXDiv, and VFXP are input/anatomy modes, not separate countable components. Likewise, the 33 files exported by packages/effects/src/index.ts are shader definitions and presets; changing a shader does not turn the host into another React component.

Canonical React paths at the pinned revision:

    packages/react/src/provider.tsx
    packages/react/src/canvas.tsx
    packages/react/src/element.tsx
    packages/react/src/image.tsx
    packages/react/src/video.tsx
    packages/react/src/lifecycle.ts
    packages/react/src/split-props.ts
    packages/react/src/context.ts
    packages/react/src/hooks.ts
    packages/react/src/react.ts
    packages/react/src/index.ts

Core source root and entry point: [packages/vfx-js/src/index.ts](https://github.com/fand/vfx-js/blob/d1bbb602a55e063e722d8cd07bc8406e1784f105/packages/vfx-js/src/index.ts). Copy only the modules reachable from that entry point and the selected input modes; do not copy the documentation app or demo assets.

Conditional gates:

- Provider catches WebGL construction failure and leaves the original DOM visible, which is the correct fallback baseline. Verify every selected input mode preserves that behavior and semantic accessibility.
- Provider accepts zIndex but its dependency list contains a TODO to add zIndex, so the prop is currently ignored. Repair it or remove it from the public API.
- The default pixel ratio is window.devicePixelRatio without a cap. Enforce the shared 1.5/1 budget and apply a total canvas-pixel ceiling.
- Offscreen hit-testing skips individual draws, but the host animation frame continues. Stop/play the host on document visibility and when no active effect is near the viewport.
- For reduced motion, leave the original DOM unfiltered or use autoplay false and render one deterministic frame. Do not ship the default continuous shader clock.
- Use only caller-owned images/video, preserve alt and captions, and expose CORS/media failures without hiding the semantic source element.
- The core vendors GIF parsing code under packages/vfx-js/src/gifuct-js. Preserve the MIT notices for [matt-way/gifuct-js 1.0.0 at ce45d977cada188f069f672453e872cde0358791](https://github.com/matt-way/gifuct-js/tree/ce45d977cada188f069f672453e872cde0358791) and [matt-way/jsBinarySchemaParser 1.0.1 at 3d625ed2c6eec962f19b2faf4ed91b38dd379e75](https://github.com/matt-way/jsBinarySchemaParser/tree/3d625ed2c6eec962f19b2faf4ed91b38dd379e75), both copyright 2015 Matt Way. If that lineage cannot be carried cleanly, exclude animated-GIF input rather than omitting notices.

## nagelflorian/react-duotone — 1 conditional candidate

| Field | Value |
| --- | --- |
| Repository | [nagelflorian/react-duotone](https://github.com/nagelflorian/react-duotone) |
| Pinned commit | [9bf7088faba573214877a14f443ac1fc5e373135](https://github.com/nagelflorian/react-duotone/tree/9bf7088faba573214877a14f443ac1fc5e373135) |
| Commit date | 2026-07-16 |
| License | [MIT, copyright 2016 Florian Nagel](https://github.com/nagelflorian/react-duotone/blob/9bf7088faba573214877a14f443ac1fc5e373135/LICENSE) |
| Release/dependencies | react-duotone 3.0.0; zero runtime dependencies; declared React/React DOM peer range stops at 18 |
| Assets | None. Images are caller-owned inputs. |

### Candidate 17: Duotone image

Canonical source closure:

    src/component.tsx
    src/create-duotone-image.ts
    src/create-duotone-gradient.ts
    src/hex-to-rgb.ts
    src/main.ts

It maps source-image luminance into a controllable two-color palette. Color pairs are presets, not more components. The behavior is distinct from CSS filters, image dithering, and pixelation.

Conditional gates:

- The initial rendered image has no source until processing completes. Render the original src during work and after any failure so content never disappears.
- The loader does not set crossOrigin before assigning src. Propagate crossOrigin, catch tainted-canvas SecurityError, invoke onError, and fall back to the original image.
- Add cancellation and stale-result guards for prop changes and unmount.
- Full-resolution getImageData plus toDataURL is linear in source pixels and duplicates image memory. Process lazily, downscale to a documented maximum pixel budget, and cache by source plus palette.
- Preserve alt, intrinsic dimensions, loading/decoding behavior, and other safe image props.
- The effect is static and needs no reduced-motion change. The fallback is the original image.
- Verify React 19 build/runtime behavior and update the copied component's compatibility metadata; the published peer range does not claim React 19.

## Rejected and merged candidates

These decisions are intentional. None enters the candidate count.

| Source/unit | Exact source or pin | Decision |
| --- | --- | --- |
| Drei MeshPortalMaterial | [src/core/MeshPortalMaterial.tsx](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MeshPortalMaterial.tsx) | Reject/legal hold. The file links N8python/maskBlur as its source; [that pinned upstream revision](https://github.com/N8python/maskBlur/tree/3e91fdd67f3edb4eee6da3fd2d6110dac5f97749) has no license artifact. It also creates a large SDF/FBO closure needing cleanup. Root Drei MIT is not sufficient evidence for the linked upstream code. |
| Drei SoftShadows | [src/core/SoftShadows.tsx](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/SoftShadows.tsx) | Reject/legal hold. Source comments cite two Shadertoy shaders and no separate permissive grants were verified. It also mutates global Three ShaderChunk state. |
| Drei AsciiRenderer, Effects, Mask, CurveModifier | [pinned source tree](https://github.com/pmndrs/drei/tree/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core) | Reject as thin Three/three-stdlib/postprocessing wrappers or internal helpers, not distinct copied implementations. Four named units. |
| Drei MarchingCubes | [src/core/MarchingCubes.tsx](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/MarchingCubes.tsx) | Reject/merge. It is a thin Three-stdlib integration and collides with the selected Paper Shaders Metaballs family. |
| Drei Cloud, Sparkles, Stars, TrailTexture, PointMaterial, Shadow, MeshDiscardMaterial, GradientTexture | [pinned source tree](https://github.com/pmndrs/drei/tree/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core) | Reject as generic particle/sky/cursor-trail/shadow/gradient decoration or invisible support material. Eight named units; none clears the distinct-effect boundary. |
| Drei Splat | [src/core/Splat.tsx](https://github.com/pmndrs/drei/blob/c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae/src/core/Splat.tsx) | Reject from Visual Effects: specialized 3D media/viewer infrastructure, not a reusable effect contract. |
| react-postprocessing Water | [src/effects/Water.tsx](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/Water.tsx) | Reject/merge with the already selected Paper Shaders Water family, which is the catalog's canonical matching shader source. |
| react-postprocessing Ramp | [src/effects/Ramp.tsx](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/Ramp.tsx) | Reject as a generic gradient/mask effect. |
| react-postprocessing ASCII | [src/effects/ASCII.tsx](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/ASCII.tsx) | Reject/legal hold. It credits emilwidlund/ASCII; the checked upstream revision e0ef82c08610aeaa2c6fd06fd242bdc10fd25951 has a package-level MIT string but no repository license artifact. |
| react-postprocessing LensFlare | [src/effects/LensFlare.tsx](https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects/LensFlare.tsx) | Reject/legal hold. Its linked R3F-Ultimate-Lens-Flare repository is CC0, but the shader contains several fragments credited to Shadertoy IDs without verified permissive grants. |
| Other react-postprocessing effects | [34-file effects directory](https://github.com/pmndrs/react-postprocessing/tree/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/src/effects) | Reject source-wide as thin adapters over postprocessing or n8ao. DepthOfField remains Autofocus anatomy; SelectiveBloom is integration plumbing; TiltShift is the wrapper duplicate of TiltShift2. Presets and selective modes do not add counts. |
| react-blurhash family | [src/Blurhash.tsx](https://github.com/woltapp/react-blurhash/blob/c248bac1508099dff783fb9f51469ca7b0fe4e3e/src/Blurhash.tsx) and [src/BlurhashCanvas.tsx](https://github.com/woltapp/react-blurhash/blob/c248bac1508099dff783fb9f51469ca7b0fe4e3e/src/BlurhashCanvas.tsx) | Reject. The package manifest says MIT, but the pinned repository has no LICENSE/COPYING artifact; additionally this is primarily loading-placeholder media. The two exports are anatomy of one family, not two candidates. |
| react-image-filter | [source/ImageFilter.jsx](https://github.com/Stanko/react-image-filter/blob/0930a4c5bde8248e6bfbf730e8bbb80e79b22e81/source/ImageFilter.jsx) | Reject/merge despite its [MIT license](https://github.com/Stanko/react-image-filter/blob/0930a4c5bde8248e6bfbf730e8bbb80e79b22e81/LICENSE.md). It is an older class component with deprecated lifecycle patterns, weak failure/fallback behavior, no focused tests, and a broad color-matrix API mostly reproducible by CSS. React Duotone is the smaller, current, test-backed representative. |

## Cross-source duplicate audit

| Conditional candidate | Nearest existing or newly reviewed family | Decision |
| --- | --- | --- |
| MeshDistortMaterial, MeshWobbleMaterial | Paper Warp/Water and existing shader backgrounds | Keep. These deform caller geometry in 3D; the existing candidates render full-surface fields. Distort and Wobble also remain distinct from each other: noise deformation versus periodic axis wobble. |
| MeshReflectorMaterial, MeshRefractionMaterial, MeshTransmissionMaterial | Existing liquid glass, fluted glass, distorted glass, and panel filters | Keep. These are scene-aware 3D materials with reflection/refraction/transmission contracts, not DOM panel filters. Do not add cosmetic material presets. |
| ContactShadows, AccumulativeShadows, Caustics, ShadowAlpha | Existing glow, rays, and ordinary shadow decoration | Keep. Each responds to scene geometry/light transport with a different rendering mechanism. RandomizedLight and internal blur/FBO helpers do not add counts. |
| SpotLight | Paper God Rays and Lightboard | Keep. It is a volumetric scene light tied to a real spotlight; those candidates are full-surface or DOM light effects. |
| Outlines, Wireframe | Existing borders and SVG draw effects | Keep. Both operate on 3D mesh geometry. They remain separate because inverted-hull silhouette and barycentric topology rendering expose different contracts. |
| Trail | Existing cursor trails and generic particles | Keep only the Object3D-following form. TrailTexture and pointer modes remain rejected. |
| Autofocus | Existing aperture/chroma/progressive blur and lens effects | Keep. Its distinguishing contract is depth picking plus smooth focus targeting in a 3D scene. DepthOfField alone is not separately counted. |
| TiltShift2 | Existing aperture blur, chroma blur, progressive blur | Keep. It exposes a controllable focal line and authored convolution kernel; reject simple blur presets and the adjacent TiltShift wrapper. |
| VFX DOM/media shader surface | Smooth shader reveal and the selected Paper shader families | Keep one host family. It persistently filters arbitrary semantic DOM/media, whereas Shader Reveal transitions between states. Any VFX shader matching Paper, duotone, dithering, glitch, pixelation, or another selected effect is a preset and adds no count. |
| Duotone image | Paper Image Dithering, Fancy Pixelate, CSS filters, react-image-filter | Keep the luminance-to-two-color mapping as one family. Merge every palette and color-matrix variant into it; reject react-image-filter as the weaker duplicate. |

## Import order if the gap remains

1. Start with the static/lower-risk items: Duotone Image, Outlines, Wireframe, and ShadowAlpha.
2. Add the bounded single-material effects: MeshDistortMaterial and MeshWobbleMaterial.
3. Add TiltShift2 and Autofocus only after one shared postprocessing composer strategy is proven.
4. Add Trail, SpotLight, ContactShadows, MeshRefractionMaterial, and MeshTransmissionMaterial with explicit runtime budgets.
5. Leave MeshReflectorMaterial, AccumulativeShadows, Caustics, and the VFX DOM/media surface last because they have the largest cleanup, multi-pass, memory, or lifecycle surface.

Passing source review does not change the catalog count. A candidate becomes releasable only after copied source, exact dependency pins, license and third-party notices, registry metadata, preview, static fallback, reduced-motion behavior, offscreen pausing, cleanup tests, and visual QA are all present.
