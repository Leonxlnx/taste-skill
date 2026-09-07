# Cognitive Shortcuts

## Shortcutting under long context

> **Status: observed in our own testing, not a cited result.** An earlier
> revision of this page attributed this to a benchmark called "LazyBench". No
> such paper or dataset could be located, so the citation has been removed
> rather than left standing. What follows is a working description of a failure
> mode, not a finding.

Frontier models appear to shortcut when a task reads as straightforward or the
context is very long: instead of executing the full multi-step reasoning, they
produce a surface-level summary of it.

The one adjacent claim that does have a source is positional: *Lost in the
Middle* ([arXiv:2307.03172](https://arxiv.org/abs/2307.03172)) shows retrieval
accuracy degrading when the needed content sits mid-context. That has a direct
consequence for skill authoring - hard rules belong near the top or bottom of a
file, not buried in the middle.

## Metacognitive Laziness

The interaction between model brevity and human behavior creates a feedback loop. As models provide instant, condensed answers, users increasingly offload inference and logical deduction work. This dynamic is discussed in the literature on cognitive offloading, but we have no specific citation to offer for it and an earlier revision of this page invented one. Treat it as a hypothesis about our own workflow, not a documented population-level effect.

In professional environments, this shifts critical thinking from original synthesis to "prompt verification" — users evaluate whether the AI's truncated output seems reasonable rather than performing the analysis themselves.

## Seasonal Behavior Anomalies (unreplicated)

> **Status: open hypothesis.** Stated as confirmed in an earlier revision. It is not.

In December 2023 a community experiment (Rob Lynch) reported shorter
GPT-4-turbo outputs when the system prompt implied December rather than May.
The proposed explanation is that holiday-period training data contains fewer
long work outputs. The result was never independently replicated and no lab has
confirmed it.

It is included here because the *shape* of the claim is useful - arbitrary
context signals may shift brevity calibration - not because the claim is
established. Do not build a rule on it.

## Error Avoidance as Truncation Driver

Models may also truncate as risk mitigation: on long-form tasks, longer outputs mean more surface area for compounding errors and hallucination, so brevity is the safer play. This is a mechanistic guess consistent with what we observe, offered without a citation because we do not have one.
