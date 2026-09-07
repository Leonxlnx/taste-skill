# Empirical Results

**Scope note.** This file holds only results that trace to a citable source in
[`references.md`](references.md). Earlier revisions of this page reported an
unsourced "December 2025 three-part controlled study" and a table of prompt
stimuli miscredited to Microsoft Research; both have been removed rather than
re-dressed. Where the honest answer is "observed but not established", it says
so.

---

## Prompt stimuli that measurably change output

### Emotional stimuli (EmotionPrompt, arXiv:2307.11760)

Appending an emotional clause to a prompt ("This is very important to my
career", "You'd better be sure") measurably improved output across three
evaluations:

| Evaluation | Reported improvement |
|:---|:---|
| Instruction Induction | +8.00% relative |
| BIG-Bench | +115% |
| Human study (performance, truthfulness, responsibility) | +10.9% average |

The +115% figure is the paper's BIG-Bench result for emotional stimuli. It is
not a "combined stimuli" number and it does not generalize to every benchmark -
the same paper's Instruction Induction gain is 8%. Quote the benchmark with the
number or the number means nothing.

**What this does not show:** that financial framing works. EmotionPrompt tested
emotional stimuli only. The widely repeated "$200 tip" result is not from this
paper and has no study behind it - see `references.md`.

### Optimized instructions (OPRO, arXiv:2309.03409)

Google DeepMind's OPRO used an LLM to search prompt space and surfaced "take a
deep breath and work on this problem step-by-step", which outperformed
human-written instructions by **up to 8% on GSM8K** and **up to 50% on
Big-Bench Hard**.

The transferable lesson is not the phrase. It is that instruction wording is
worth optimizing empirically, and that phrasings which sound equivalent to a
human are not equivalent to a model.

## Where truncation actually comes from

Honest status: **not settled**. The mechanisms below are plausible and partly
supported; none is established well enough to state as fact in a skill file.

- **Long-context retrieval degrades in the middle.** *Lost in the Middle*
  (arXiv:2307.03172) shows accuracy drops when the needed content sits in the
  middle of a long context. This is the best-supported claim in this folder and
  it has a direct design consequence: put hard rules near the top or the bottom
  of a SKILL.md, never buried mid-file.
- **Instruction count degrades compliance.** Widely observed in practice, and
  the reason this repo enforces a deliverable count before generating (see the
  `full-output-enforcement` skill). We have no controlled measurement of our own.
- **Seasonal output variation.** An unreplicated December 2023 community
  experiment. Interesting; not evidence. Treated here as an open hypothesis.

## Why this folder is small

These skills were written from observed failure modes in production output -
placeholder comments, skipped sections, three-equal-cards layouts - not derived
from the literature. The research folder exists to keep that honest, not to
lend borrowed authority. If a rule in `skills/` cannot be justified by what the
model actually produced, it should not survive because a citation was attached
to it afterwards.
