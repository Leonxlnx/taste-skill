# Component Sources

Snapshot: 2026-07-19. This is a conservative engineering policy, not legal advice. Recheck the exact license, tag, path, package contents, assets, and dependencies when code is imported.

## Decision rule

Public source is not automatically reusable. Taste Blocks only ingests code when the exact material has an explicit license compatible with redistribution inside another component library.

Prefer, in order:

1. original Taste Blocks implementations;
2. maintained permissive dependencies;
3. selective adaptation from a verified MIT, BSD, ISC, or Apache-2.0 path;
4. written permission for any exception.

Do not recreate proprietary source from browser output, screenshots, documentation examples, or visual inspection. General ideas such as a masked reveal or pointer field can be implemented independently, but distinctive expression, copy, assets, timings, composition, and code must not be copied.

## Approved source pools

These projects have permissive open-source cores that can be studied or selectively adapted when the exact imported path is verified and its notice is preserved.

| Source | License | Preferred use | Boundary |
| --- | --- | --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) | MIT | Registry model, accessible components, selective adaptation | Keep the MIT notice and licenses of underlying dependencies. |
| [HyperUI](https://github.com/markmead/hyperui/blob/main/LICENSE) | MIT | Selective layout study or adaptation | Replace sample images, logos, and copy. |
| [Mantine UI](https://github.com/mantinedev/mantine) | MIT | Layout research; dependency preferred | Do not mix its full visual system into Taste Blocks. |
| [Meraki UI](https://github.com/merakiuilabs/merakiui/blob/main/LICENSE) | MIT | Selective layout adaptation | Replace external assets and brand examples. |
| [Mamba UI](https://github.com/Microwawe/mamba-ui/blob/master/LICENSE.md) | MIT | Selective block adaptation | Verify icons and illustrations separately. |
| [Sailboat UI](https://github.com/sailboatui/sailboatui/blob/main/LICENSE) | MIT | Selective block adaptation | Unsplash and other demo media are not covered by the code license. |
| [Tailblocks](https://github.com/mertJF/tailblocks/blob/master/LICENSE) | MIT | Layout research or selective adaptation | Replace remote media and generic copy. |
| [Flowbite Core](https://github.com/themesberg/flowbite/blob/main/LICENSE.md) | MIT | Dependency or carefully scoped adaptation | Exclude Flowbite Pro and separately licensed docs/assets. |
| [TailGrids Core](https://github.com/TailGrids/tailgrids/blob/main/LICENSE.md) | MIT | Selective free-core adaptation | Exclude paid blocks, templates, and Figma files. |
| [Tremor Raw](https://github.com/tremorlabs/tremor/blob/main/LICENSE) | Apache-2.0 plus notices | Selective source adaptation | Preserve the complete license, notices, and modification record. |
| [Park UI](https://github.com/chakra-ui/park-ui/blob/main/LICENSE) | MIT | Registry patterns or selective adaptation | Keep Ark/Panda as dependencies; exclude separate design assets. |
| [Motion](https://github.com/motiondivision/motion/blob/main/LICENSE.md) | MIT | Runtime dependency | Copying Motion+ examples is not covered by the core license. |
| [Embla Carousel](https://github.com/davidjerleke/embla-carousel/blob/master/LICENSE) | MIT | Runtime dependency for complex galleries | Do not fork the engine without a maintenance reason. |
| [Phosphor Icons](https://github.com/phosphor-icons/react/blob/main/LICENSE) | MIT | Runtime dependency | Brand glyphs still have trademark concerns. |

Other permissive candidates that still require exact-path review: Animata, UI Layouts Free, Blocks.so, Tailark Free, Page UI, Magic UI Free, Motion Primitives Free, Cult UI Free, Kokonut UI, RippleUI, Kutty, TW Elements Free, Material Tailwind Core, AstroWind, and Start Bootstrap.

## Use as dependencies

Behavioral primitives are safer and easier to maintain as dependencies than copied source:

- [Radix Primitives](https://github.com/radix-ui/primitives/blob/main/LICENSE), Base UI, Ark UI, and Headless UI: MIT;
- React Aria and Carbon: Apache-2.0;
- Chakra, Mantine, MUI Core, Ant Design, and Fluent UI: MIT.

Do not combine several competing component systems in one block. Choose the smallest compatible primitive for the required behavior.

## Excluded from source ingestion

| Source | Reason |
| --- | --- |
| [React Bits Pro](https://pro.reactbits.dev/license) | Its license prohibits publishing, sharing, sublicensing, public repositories, and competing component libraries, including modified or partial source. |
| React Bits Free | The current repository states MIT plus Commons Clause while another official page calls it MIT. That conflict is unacceptable for a public library with a future paid product. Do not copy its code unless the owner gives written component-library redistribution permission or the terms become unambiguously permissive. |
| Animate UI | MIT plus Commons Clause; redistribution and future paid use are not sufficiently safe for this product. |
| Aceternity UI, Hover.dev, Float UI | No compatible component-library redistribution grant under the checked terms. |
| 21st.dev marketplace entries | There is no single license covering every community entry. Each author and exact source would require separate verification. |
| Preline and Preline-derived code | Current Fair Use terms restrict competing or similar UI libraries. |
| Tailwind Plus, commercial block packs, paid templates, Figma kits | Standard licenses generally allow end products, not a redistributed source library. |
| Commons Clause, SSPL, non-commercial Creative Commons, no-license code | Incompatible with the intended public and commercial product structure. |
| GPL and AGPL code | Excluded by default because their reciprocal obligations do not fit this registry. |

Attribution never fixes an incompatible license. Buying a component pack also does not create redistribution rights.

## Assets and branding

Code licenses do not automatically cover photos, videos, fonts, icons, illustrations, logos, trademarks, or trade dress.

- Replace all demo photos and copy unless their rights are separately recorded.
- Do not ship upstream logos or imply endorsement.
- Record icon and font licenses independently.
- Prefer original abstract assets, licensed dependencies, or explicit placeholders.
- A top-level Taste Blocks license applies only to original work and does not erase upstream rights.

## Release gate

Before an adapted component can ship:

1. Pin the exact tag or commit and source path.
2. Read the actual license file, file headers, notices, README exceptions, and package metadata.
3. Record code, CSS, assets, generated output, and transitive dependencies separately.
4. Preserve all required notices and mark Apache-2.0 modifications.
5. Replace sample brands, copy, photos, videos, and unverified fonts or icons.
6. Build the published registry output and inspect what it actually contains.
7. Reject the release when any shipped material has unknown scope or conflicting terms.

A commercial lawyer should review the complete notices, product split, and release artifact before a paid launch.
