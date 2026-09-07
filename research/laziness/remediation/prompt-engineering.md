# Prompt Engineering Techniques

## Psychological Pattern Matching

LLMs do not have emotions or understand monetary incentives. However, specific linguistic patterns in the prompt shift which quality distribution the model samples from. Two effects have real sources behind them; a third does not:

| Technique | Documented effect | Source |
|:---|:---|:---|
| "This is very important to my career" (emotional stimulus) | +8.00% Instruction Induction, +115% BIG-Bench, +10.9% human study | EmotionPrompt, [arXiv:2307.11760](https://arxiv.org/abs/2307.11760) |
| "Take a deep breath and work on this problem step-by-step" | Up to +8% GSM8K, up to +50% Big-Bench Hard over human-written prompts | OPRO (Google DeepMind), [arXiv:2309.03409](https://arxiv.org/abs/2309.03409) |
| "I will tip you $200 for a perfect solution" | **No study. Do not cite.** An informal December 2023 Twitter experiment, repeatedly miscredited to Microsoft Research. | see `findings/references.md` |

Read the benchmark alongside the number. EmotionPrompt's +115% is its BIG-Bench result; the same paper's Instruction Induction gain is 8%. A percentage quoted without its benchmark is decoration.

The plausible mechanism is that these phrasings correlate, in training data, with high-effort and carefully reviewed content (academic papers, reviewed codebases, legal documents), so they shift sampling toward that distribution. That is an explanation, not a measured finding.

## Explicit Syntax Binding

Conversational requests allow the model to exercise discretion about output length and detail. Structural binding removes this discretion by explicitly prohibiting truncation patterns.

Effective binding requires two components:

1. **Mandatory tool execution:** Forbid the model from generating answers solely from training weights. Require it to execute search, computation, or code before answering.
2. **Evidence blocks:** Require the model to output raw data (URLs, code execution results, data fragments) before producing its narrative response. This forces the model to read its own retrieved evidence, reducing hallucination probability to near zero.

## XML-Structured Prompts

Enterprise systems use strict XML tagging to separate prompt components, reducing the cognitive load required for the model to parse intent:

1. **System instructions** — Persona definition, quality expectations, explicit prohibitions on filler content.
2. **Context block** (`<context>`) — Passive background data: architecture details, configurations, existing code.
3. **Data block** (`<data>`, `<logs>`, `<config>`) — Active information the model must process against the context.
4. **Task block** (`<tasks>`) — Numbered list of specific actions to execute.

This compartmentalization ensures the model can distinguish between persistent rules, background context, and immediate work items. It significantly reduces the confusion that triggers premature truncation.

## Verification Loops

### Chain of Verification
1. Model generates an initial response
2. Model generates verification questions about its own claims
3. Model independently answers those verification questions
4. Model outputs a revised, evidence-backed response

This process forces iterative self-correction, consuming the model's capacity for shortcutting.

### Reverse Prompting
Instead of manually constructing a structured prompt, provide the model with a one-line objective and instruct it to generate the optimal prompt for that objective. The model produces the XML structure, constraints, and roles required for the task.

### Self-Grading Loop
The prompt requires the model to:
1. Define what excellence looks like for the given task
2. Grade its own initial output against that definition
3. Iterate until the self-defined quality bar is met
