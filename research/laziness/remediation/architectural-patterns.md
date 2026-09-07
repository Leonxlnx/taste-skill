# Architectural Patterns

## Lazy-Loaded Skills

The standard pattern for managing large context requirements across AI agents is lazy-loaded prompt engineering through skill files.

A skill is a folder containing a `SKILL.md` file with:

- **YAML front-matter:** Contains `name` and a precise `description`. This metadata acts as the discovery hook — the agent reads only this during initialization (~100 tokens per skill).
- **Markdown body:** Full workflows, rules, and instructions. Loaded on-demand only when the agent determines the skill is relevant.

The saving is structural rather than measured: only the front-matter is resident, so a 20k-token skill body costs ~100 tokens until the agent actually needs it. We have no benchmark for the size of that saving in practice and the "35% reduction" previously quoted here had no source.

Discovery reliability does depend on how specific the `description` is. Stated qualitatively, because we have not measured it:

| Description quality | Effect on discovery |
|:---|:---|
| Vague ("Helps with designing APIs") | The agent has nothing to match a request against; the skill is loaded inconsistently or not at all. |
| Specific ("Design RESTful HTTP APIs with OpenAPI specs, focusing on versioning, error codes, and backward compatibility") | Names the nouns a user would actually type, so the match is reliable. |

Write the description as *what it does plus when to use it*, and put the trigger words a user would say into it. See Anthropic's authoring guidance: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview

## Model Context Protocol (MCP)

MCP is an open standard (pioneered by Anthropic, adopted by Google and OpenAI) that enables real-time, bidirectional connections between LLMs and external data sources.

### Architecture Components

- **Host:** The AI application (IDE, terminal tool, chatbot) containing the LLM engine.
- **Client:** Internal bridge within the host that handles protocol communication.
- **Server:** External service exposing databases, APIs, or documentation to the client.
- **Transport:** JSON-RPC 2.0 messages over stdio (local) or HTTP (remote).

### How It Reduces Truncation

Without MCP, models rely on static training weights for factual claims. When those weights are outdated (e.g., a new API version was released after training cutoff), the model either hallucinates a plausible answer or truncates its response to avoid committing to specifics.

With MCP, the model fetches current documentation directly into its context window. This transforms the model from a static knowledge store into a reasoning engine operating on real-time data, eliminating the incentive to hallucinate or truncate.

### Example: Developer Knowledge API

Google's Developer Knowledge MCP Server indexes live documentation across Firebase, Android, and Google Cloud. When a model receives a development question:

1. It executes a `search_document` query against the live index
2. It evaluates returned page URIs
3. It fetches full document content via `get_document` or `batch_get_documents`
4. It generates its response based on current, authoritative documentation

This entirely bypasses the tendency to fabricate answers from outdated training data.

## Chunked Task Execution

For complex tasks that would produce outputs exceeding the model's generation limit, break the work into sequential steps:

1. Request the architecture and structure first (outline only)
2. Request each component individually with explicit instructions for completeness
3. Request assembly and integration after all components are generated

This prevents the model from attempting to estimate total output length and preemptively compressing its response.
