import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { aggregateHash, sha256, structureHash } from '../../../scripts/policy-utils.mjs'

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const tasteRoot = path.resolve(sourceRoot, '../../..')
const repository = 'https://github.com/pmndrs/react-postprocessing'
const revision = '90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c'
const retrievedAt = '2026-07-20'
const root = 'components/react-postprocessing'
const licenseHash = 'sha256:2e36b208b403882158daf95cae207087bbb830db4d434a79ebafffca177244c8'
const commonDependencies = ['@react-three/fiber@9.4.0', 'postprocessing@6.36.6', 'three@0.172.0']

const files = {
  'EffectComposer.tsx': ['src/EffectComposer.tsx', 'sha256:cd9e9cac9dab8ae64fac878f8c3710f73e31db35bf4089da0cda246618e325c8'],
  'Selection.tsx': ['src/Selection.tsx', 'sha256:165ac9c05f4791680dc44772bc015f783e17ab3c7076fe074b33485d093290b6'],
  'util.tsx': ['src/util.tsx', 'sha256:d31715e4c844ad668cefb195bd82953ea22e20cecae0c2c4ec9da9d9e0347c7e'],
  'effects/ASCII.tsx': ['src/effects/ASCII.tsx', 'sha256:341ec5073edd15b92c1976d4061f587d43795d3397c86782da2df795f3de480c'],
  'effects/Bloom.tsx': ['src/effects/Bloom.tsx', 'sha256:dcaa05661d8401ddf403227806a3aed6efb82ee80d1d0345e93aa84d4f0072c7'],
  'effects/ChromaticAberration.tsx': ['src/effects/ChromaticAberration.tsx', 'sha256:56fd19ba1bef3ea18f210fb651171abc0bd3a10d14249d93b38f1473c5cd5c9d'],
  'effects/DepthOfField.tsx': ['src/effects/DepthOfField.tsx', 'sha256:53ac20d944a9edaef664cca6b4067c362269d5ba3913da863c05a4586bd2443b'],
  'effects/Glitch.tsx': ['src/effects/Glitch.tsx', 'sha256:1f526ebf102bc3bb07a1a36d498342a0b1637ef212e21f3f5d74d034a21f9ca0'],
  'effects/GodRays.tsx': ['src/effects/GodRays.tsx', 'sha256:7e54cc0c0df5bdae253bd417ff6fc253b290c53d9899eb88aaa7ce09829fbdd2'],
  'effects/Grid.tsx': ['src/effects/Grid.tsx', 'sha256:3d44884ce38fba0f3eebbbac49e8fb0bbbdd6783c94bcbbfed6de747d7547e85'],
  'effects/LUT.tsx': ['src/effects/LUT.tsx', 'sha256:3ee3ceb3a3c8e952680b8f772212e4b1b4cd4c15ef4407c3b01d687772d2eda3'],
  'effects/Outline.tsx': ['src/effects/Outline.tsx', 'sha256:d9478ed3d2df915bb48553e8c1370873d7b497a17ce1e2308d4c963b4b6644f4'],
  'effects/Pixelation.tsx': ['src/effects/Pixelation.tsx', 'sha256:af7fd6593282f1d612f71c1ee2f70a4cde1f84caa4a80670c0b35dba9c5160e4'],
  'effects/Ramp.tsx': ['src/effects/Ramp.tsx', 'sha256:c0f0b4070ffbb666f0910ae7b0c97f8695b3320062bf072a551ed39840ed3ee2'],
  'effects/SelectiveBloom.tsx': ['src/effects/SelectiveBloom.tsx', 'sha256:73391270dc0b621c2c304cfc4555314eae6489796777abff69be5c7162410d72'],
  'effects/TiltShift2.tsx': ['src/effects/TiltShift2.tsx', 'sha256:41ca5c04781cb2c2278a5942a1ce7de8a7848b8369d2f9b3982b5bfafefe307d'],
  'effects/Water.tsx': ['src/effects/Water.tsx', 'sha256:f3c065bcb58f8534dba227181b960e2c5e0d53f20b7a1d2e43a8a4abe9675617'],
}

const changes = {
  'EffectComposer.tsx': ['Declared the React Three Fiber composer as a client component.', 'Reduced default multisampling from 8 to 4 and dispose the composer on unmount.'],
  'Selection.tsx': ['Declared the selection helpers as client components.'],
  'util.tsx': ['Declared the React helpers as client code, made wrapEffect return explicit for React refresh transforms, removed circular JSON serialization from effect arguments, and added a native prefers-reduced-motion hook used by temporal effects.'],
  'effects/ASCII.tsx': ['Declared the effect as client code, guarded character texture creation during SSR, and dispose the generated texture and effect on unmount.'],
  'effects/Bloom.tsx': ['Declared the effect as client code.'],
  'effects/ChromaticAberration.tsx': ['Declared the effect as client code.'],
  'effects/DepthOfField.tsx': ['Declared the effect as client code.'],
  'effects/Glitch.tsx': ['Declared the effect as client code and disable temporal glitches when reduced motion is requested.'],
  'effects/GodRays.tsx': ['Declared the effect as client code and dispose it on unmount.'],
  'effects/Grid.tsx': ['Declared the effect as client code and dispose it on unmount.'],
  'effects/LUT.tsx': ['Declared the effect as client code and dispose it on unmount.'],
  'effects/Outline.tsx': ['Declared the effect as client code and disable outline pulsing when reduced motion is requested.'],
  'effects/Pixelation.tsx': ['Declared the effect as client code and dispose it on unmount.'],
  'effects/Ramp.tsx': ['Declared the effect as client code.'],
  'effects/SelectiveBloom.tsx': ['Declared the effect as client code and dispose it on unmount.'],
  'effects/TiltShift2.tsx': ['Declared the effect as client code.'],
  'effects/Water.tsx': ['Declared the effect as client code and set distortion to a static frame when reduced motion is requested.'],
}

const components = [
  ['ascii', 'ASCII', 'Converts a rendered scene into a configurable character-cell shader.', ['ascii', 'shader', 'typography'], 'ascii-postprocessing-effect', []],
  ['bloom', 'Bloom', 'Adds thresholded mipmap bloom to emissive scene content.', ['bloom', 'glow', 'light'], 'luminance-bloom-effect', ['util.tsx']],
  ['chromatic-aberration', 'Chromatic Aberration', 'Offsets color channels with configurable radial modulation.', ['chromatic-aberration', 'color', 'lens'], 'chromatic-aberration-effect', ['util.tsx']],
  ['depth-of-field', 'Depth of Field', 'Applies camera-aware depth blur with target and bokeh controls.', ['depth-of-field', 'bokeh', 'camera'], 'depth-of-field-effect', []],
  ['glitch', 'Glitch', 'Applies an interruptible sporadic digital glitch with bounded duration and strength controls.', ['glitch', 'distortion', 'temporal'], 'sporadic-glitch-effect', ['util.tsx']],
  ['god-rays', 'God Rays', 'Projects volumetric light shafts from a supplied mesh or points source.', ['god-rays', 'volumetric-light', 'occlusion'], 'mesh-source-god-rays', ['util.tsx']],
  ['grid', 'Grid', 'Overlays a configurable screen-space grid effect on a rendered scene.', ['grid', 'screen-space', 'shader'], 'screen-space-grid-effect', []],
  ['lut', 'LUT', 'Applies a supplied 3D lookup texture for real-time color grading.', ['lut', 'color-grading', '3d-texture'], 'three-dimensional-lut-effect', []],
  ['outline', 'Outline', 'Draws configurable visible and hidden edges around selected scene objects.', ['outline', 'selection', 'edges'], 'selected-object-outline-effect', ['Selection.tsx', 'util.tsx']],
  ['pixelation', 'Pixelation', 'Pixelates the composed scene at a configurable granularity.', ['pixelation', 'retro', 'shader'], 'scene-pixelation-effect', []],
  ['ramp', 'Ramp', 'Blends linear, radial, or mirrored color ramps over or through the scene.', ['ramp', 'gradient', 'mask'], 'configurable-ramp-effect', ['util.tsx']],
  ['selective-bloom', 'Selective Bloom', 'Applies bloom only to selected objects and supplied lights.', ['bloom', 'selection', 'light'], 'selected-object-bloom-effect', ['Selection.tsx', 'util.tsx']],
  ['tilt-shift', 'Tilt Shift', 'Applies directional depth-like blur with bounded shader samples.', ['tilt-shift', 'blur', 'focus'], 'directional-tilt-shift-effect', ['util.tsx']],
  ['water', 'Water Distortion', 'Distorts the composed scene with a configurable animated water shader.', ['water', 'distortion', 'shader'], 'water-distortion-effect', ['util.tsx']],
]

function permalink(upstreamPath) {
  return `${repository}/blob/${revision}/${upstreamPath}`
}

function fileEntry(relative, primary = false) {
  return {
    path: `${root}/${relative}`,
    type: primary ? 'registry:component' : relative === 'util.tsx' || relative === 'Selection.tsx' ? 'registry:lib' : 'registry:component',
    target: `@components/taste-blocks/react-postprocessing/${relative}`,
  }
}

async function buildItem([slug, title, description, tags, family, extra = [], dependencyExtras = []]) {
  const effectName = title === 'Chromatic Aberration' ? 'ChromaticAberration' : title === 'Color Average' ? 'ColorAverage' : title === 'Depth of Field' ? 'DepthOfField' : title === 'God Rays' ? 'GodRays' : title === 'Lens Flare' ? 'LensFlare' : title === 'Selective Bloom' ? 'SelectiveBloom' : title === 'Tilt Shift' ? 'TiltShift2' : title === 'Water Distortion' ? 'Water' : title
  const effectPath = `effects/${effectName}.tsx`
  const closure = [effectPath, 'EffectComposer.tsx', ...extra]
  const sourceFiles = []
  const contentHashes = []
  const upstreamHashes = []
  const structuralFiles = []

  for (const relative of closure) {
    const [upstreamPath, upstreamSha256] = files[relative]
    const local = path.join(sourceRoot, root, ...relative.split('/'))
    const content = await readFile(local)
    const contentSha256 = sha256(content)
    sourceFiles.push({
      shippedPath: `${root}/${relative}`,
      upstreamPath,
      permalink: permalink(upstreamPath),
      upstreamSha256,
      contentSha256,
      changes: changes[relative],
    })
    upstreamHashes.push(upstreamSha256)
    contentHashes.push(contentSha256)
    structuralFiles.push({ path: path.relative(tasteRoot, local), content })
  }

  const name = `react-postprocessing-${slug}`
  return {
    name,
    type: 'registry:component',
    title,
    description,
    author: 'pmndrs and react-postprocessing contributors',
    dependencies: [...commonDependencies, ...dependencyExtras].sort(),
    registryDependencies: [],
    files: closure.map((relative, index) => fileEntry(relative, index === 0)),
    categories: ['visual-effects'],
    meta: {
      tasteblocks: {
        status: 'draft',
        category: 'visual-effects',
        tags,
        renderer: 'webgl',
        preview: `previews/drafts/react-postprocessing/${name}.tsx`,
        source: { project: 'react-postprocessing', repository, revision, retrievedAt, files: sourceFiles },
        license: {
          spdx: 'MIT',
          scope: closure.map((relative) => files[relative][0]).join(', '),
          copyright: ['Copyright (c) 2020 react-spring'],
          evidence: {
            upstreamPath: 'LICENSE',
            permalink: permalink('LICENSE'),
            sha256: licenseHash,
            localPath: 'registry/sources/react-postprocessing/LICENSE',
          },
          notices: [],
        },
        assets: [],
        modifications: sourceFiles.map((source) => ({
          shippedPath: source.shippedPath,
          change: source.changes.join(' '),
          reason: 'Keep the copied component Next-compatible, motion-safe, bounded, and leak-free without changing its authored visual model.',
        })),
        dedupe: {
          family,
          sourceHash: aggregateHash(upstreamHashes),
          contentHash: aggregateHash(contentHashes),
          structureHash: structureHash(structuralFiles),
        },
        verification: { reviewedBy: null, reviewedAt: null },
      },
    },
  }
}

async function buildManifest() {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'react-postprocessing-drafts',
    homepage: 'https://github.com/pmndrs/react-postprocessing',
    items: await Promise.all(components.map(buildItem)),
  }
}

async function verifyUpstream(upstreamRoot) {
  assert.equal(execFileSync('git', ['-C', upstreamRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), revision, 'upstream checkout is not pinned')
  const blob = (upstreamPath) => execFileSync('git', ['-C', upstreamRoot, 'show', `${revision}:${upstreamPath}`])
  assert.equal(sha256(blob('LICENSE')), licenseHash, 'upstream LICENSE blob hash changed')
  for (const [upstreamPath, expected] of Object.values(files)) {
    assert.equal(sha256(blob(upstreamPath)), expected, `${upstreamPath} blob changed`)
  }
}

async function verifyLocal(manifest) {
  assert.equal(manifest.items.length, 14, 'expected fourteen retained components')
  assert.equal(new Set(manifest.items.map((item) => item.meta.tasteblocks.dedupe.family)).size, 14, 'dedupe families must be unique')
  for (const item of manifest.items) {
    assert.equal(item.type, 'registry:component')
    assert.equal(item.meta.tasteblocks.assets.length, 0)
    assert(!item.name.includes('section') && !item.name.includes('layout'))
    await readFile(path.join(tasteRoot, item.meta.tasteblocks.preview))
    for (const file of item.files) {
      const text = await readFile(path.join(sourceRoot, ...file.path.split('/')), 'utf8')
      assert.match(text, /^'use client'/)
      assert.doesNotMatch(text, /\b(?:fetch|XMLHttpRequest)\s*\(/)
      assert.doesNotMatch(text, /\buseLoader\s*\(|\bTextureLoader\b/)
    }
  }
  const allText = await Promise.all(Object.keys(files).map((relative) => readFile(path.join(sourceRoot, root, ...relative.split('/')), 'utf8')))
  const previewShell = await readFile(path.join(sourceRoot, 'preview/shared.tsx'), 'utf8')
  assert(allText.some((text) => text.includes('prefers-reduced-motion: reduce')))
  assert(allText.some((text) => text.includes('composer.dispose()')))
  assert.match(previewShell, /dpr=\{\[1, 1\.5\]\}/)
  assert.match(previewShell, /frameloop=\{reducedMotion \? 'demand' : 'always'\}/)
  assert.match(previewShell, /aria-label="Interactive three-dimensional post-processing preview"/)
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const upstreamIndex = args.indexOf('--upstream-root')
const upstreamRoot = upstreamIndex >= 0 ? path.resolve(args[upstreamIndex + 1]) : null
const manifest = await buildManifest()
await verifyLocal(manifest)
assert.equal(sha256(await readFile(path.join(sourceRoot, 'LICENSE'))), licenseHash)
if (upstreamRoot) await verifyUpstream(upstreamRoot)

const manifestPath = path.join(sourceRoot, 'drafts.json')
const serialized = `${JSON.stringify(manifest, null, 2)}\n`
if (write) await writeFile(manifestPath, serialized)
else assert.equal(await readFile(manifestPath, 'utf8'), serialized, 'drafts.json is stale')

console.log(`Verified ${manifest.items.length} react-postprocessing component drafts at ${revision}.`)
