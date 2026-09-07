# References

Every entry below links to a primary source. Figures are quoted as the source
reports them, with the model and benchmark attached - a percentage without a
benchmark is not a result.

## Cited studies

- **EmotionPrompt** - Li, Wang, Zhang, Zhu, Hou, Lian, Luo, Yang, Xie,
  *"Large Language Models Understand and Can Be Enhanced by Emotional Stimuli"*
  (2023). https://arxiv.org/abs/2307.11760
  Reports **+8.00%** relative improvement on Instruction Induction, **+115%** on
  BIG-Bench, and **+10.9%** in a human study across performance, truthfulness
  and responsibility. The stimuli are emotional ("this is very important to my
  career"), not financial. The paper contains **no** tipping or payment
  experiment.

- **OPRO** - Yang, Wang, Lu, Liu, Le, Zhou, Chen (Google DeepMind),
  *"Large Language Models as Optimizers"* (2023).
  https://arxiv.org/abs/2309.03409
  Source of the "take a deep breath and work on this problem step-by-step"
  instruction, which the method discovered by optimization rather than by
  intuition. Reports gains of **up to 8% on GSM8K** and **up to 50% on
  Big-Bench Hard** over human-designed prompts.

- **Lost in the Middle** - Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni,
  Liang, *"Lost in the Middle: How Language Models Use Long Contexts"* (2023).
  https://arxiv.org/abs/2307.03172
  Relevant to the truncation question: retrieval accuracy degrades when the
  needed information sits in the middle of a long context. Useful when deciding
  where in a SKILL.md to put a hard rule.

## Claims we removed, and why

These circulated in earlier drafts of this folder. They are recorded here so
nobody re-adds them.

- **"$200 tip → +45% output quality"** - originated as an informal Twitter
  experiment (@voooooogel, December 2023), not a study, and was previously
  miscredited here to the EmotionPrompt authors. No peer-reviewed source, no
  benchmark, no reproduction. Do not cite.

- **"LazyBench"** - no locatable paper, benchmark, or dataset under this name.
  Removed pending a real citation.

- **"2025 Controlled Laziness Experiments (December 2025)"** - no authors, no
  venue, no link. Unverifiable as written. Removed.

- **"Winter break hypothesis, statistically confirmed"** - the underlying
  observation is a December 2023 community experiment (Rob Lynch) suggesting
  shorter December outputs from GPT-4-turbo. It was **never** independently
  replicated and no lab has confirmed it. It may be stated as an open
  hypothesis; it may not be stated as confirmed.

## Further reading (documentation, not evidence)

- Anthropic - Agent Skills / SKILL.md authoring:
  https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
- Anthropic - Model Context Protocol: https://modelcontextprotocol.io
- OpenAI - temperature / top_p reference:
  https://platform.openai.com/docs/api-reference/chat
- Google - Gemini thinking configuration:
  https://ai.google.dev/gemini-api/docs/thinking
