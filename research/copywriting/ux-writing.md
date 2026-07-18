# UX Writing for Web Interfaces

Research synthesis for buttons, forms, labels, helper text, validation, errors, empty/loading/success states, confirmations, destructive actions, navigation, accessibility, localization, and truthful prototypes.

## Scope and rule strength

This report treats interface copy as part of product behavior, not decoration. It does not prescribe one brand voice or import every convention from one platform. The guidance is organized by strength:

- **Must**: required for truthfulness, task completion, accessibility, or protection from data loss.
- **Default**: the best starting point; depart when the product context gives a concrete reason.
- **Contextual**: depends on platform, risk, audience, or task frequency.

The core test is simple: **does the text help a person predict, complete, understand, or recover from a real interaction?** If it does none of those things, remove it.

## Evidence base

The strongest shared findings across the sources are:

1. Controls need specific, action-oriented labels.
2. Labels and instructions must remain available when people enter data.
3. Errors must identify the problem and provide a realistic correction or next step.
4. Status copy must reflect the system's actual state, not an optimistic fiction.
5. Interruptions and confirmations are justified by risk, not by the desire to add drama.
6. Empty and loading states need to preserve orientation and explain meaningful next actions.
7. UI strings must survive assistive technology, text expansion, different grammar, and right-to-left layouts.

Primary guidance used in this synthesis:

- [GOV.UK button](https://design-system.service.gov.uk/components/button/)
- [GOV.UK text input](https://design-system.service.gov.uk/components/text-input/)
- [GOV.UK error message](https://design-system.service.gov.uk/components/error-message/)
- [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)
- [GOV.UK validation pattern](https://design-system.service.gov.uk/patterns/validation/)
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)
- [GOV.UK service navigation](https://design-system.service.gov.uk/components/service-navigation/)
- [USWDS button](https://designsystem.digital.gov/components/button/)
- [USWDS form](https://designsystem.digital.gov/components/form/)
- [USWDS alert](https://designsystem.digital.gov/components/alert/)
- [USWDS link](https://designsystem.digital.gov/components/link/)
- [W3C WAI forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C WAI labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C WAI user notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [W3C WAI accessible names and descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
- [Microsoft writing style](https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style)
- [Microsoft UI text](https://learn.microsoft.com/en-us/windows/win32/uxguide/text-ui)
- [Microsoft localization overview](https://learn.microsoft.com/en-us/globalization/localization/localization-overview)
- [Microsoft message formatting](https://learn.microsoft.com/en-us/globalization/internationalization/message-formatting)
- [Apple alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- [Apple buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Apple progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)
- [Apple localization](https://developer.apple.com/localization/)
- [Atlassian empty states](https://atlassian.design/foundations/content/designing-messages/empty-state)
- [Carbon empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [GOV.UK prototyping](https://prototype-kit.service.gov.uk/docs/prototyping)
- [GOV.UK phase banner](https://design-system.service.gov.uk/components/phase-banner/)

## 1. Buttons and calls to action

### Preferred rules

- **Must:** A button label must describe the action or its immediate result. Prefer a specific verb and object when the object is not obvious: `Save changes`, `Delete invoice`, `Send invitation`.
- **Must:** The label must match what actually happens. `Publish` cannot save a draft; `Download PDF` cannot open an unrelated preview; `Start free trial` cannot begin a paid subscription.
- **Must:** Use buttons for actions and links for navigation. Visual styling does not change semantics.
- **Must:** Destructive buttons must name the destructive action. Use `Delete project`, not `Confirm`, `OK`, or `Yes`.
- **Default:** Keep labels short enough to scan, but never shorten them into ambiguity. One to four words is common, not a hard limit.
- **Default:** Use sentence case unless an established platform or brand convention requires otherwise.
- **Default:** Give one action clear priority within a decision. Multiple visually equal primary buttons create false hierarchy.
- **Default:** Keep the same action name stable across the flow. Do not alternate among `Continue`, `Proceed`, `Next step`, and `Move forward` without a difference in behavior.
- **Contextual:** `Continue` is acceptable when the next step is obvious and no data is saved. More specific labels are better when the consequence matters.
- **Contextual:** Icon-only buttons are acceptable for familiar, space-constrained actions when they have an accessible name and the icon is genuinely understood in context.

### Anti-patterns

- Generic labels: `Submit`, `Go`, `Do it`, `OK`, `Yes`, `Click here`.
- Marketing labels that conceal the action: `Experience the future`, `Unlock magic`, `Elevate now`.
- Labels that describe the interface instead of the outcome: `Button`, `Form action`, `Next screen`.
- Button copy that repeats the heading without clarifying the action.
- Two primary CTAs with the same intent, such as `Get started` and `Start now` side by side.
- Negative or double-negative choices: `Don't disable reminders`.
- Changing a button to `Saved` when saving has not succeeded.
- Disabling a submit button without explaining what is missing or how to enable it.

### Examples

| Weak | Better | Why |
|---|---|---|
| `Submit` | `Send application` | Names the real action and object. |
| `OK` | `Delete invoice` | Makes the irreversible consequence explicit. |
| `Learn more` | `Read the migration guide` | Predicts the destination out of context. |
| `Proceed` | `Review order` | Describes the next step. |
| `Get started` + `Start now` | One `Start free trial` button | Removes duplicate intent. |

## 2. Form labels, questions, and helper text

### Preferred rules

- **Must:** Every form control needs a programmatically associated label. In most cases it should also be visible.
- **Must:** Do not use placeholder text as the label. It disappears during entry, is often low contrast, and may not be announced consistently.
- **Must:** Ask only for data needed for the task. Excess fields are a content and product-design failure, not merely a layout issue.
- **Must:** Put format requirements, limits, and unusual constraints before the user submits.
- **Default:** Use short, direct labels or natural questions in sentence case.
- **Default:** Put labels above fields in ordinary web forms. This supports scanning, zoom, long translations, and narrow viewports.
- **Default:** Use helper text only when it changes how a person answers: why the information is needed, where to find it, an unfamiliar format, or a real constraint.
- **Default:** Place helper text next to the field it explains and connect it with `aria-describedby` where appropriate.
- **Default:** Mark optional fields explicitly when most fields are required; mark required fields when most are optional. Do not flood every label with redundant markers.
- **Default:** Use examples as examples, not as hidden requirements. Distinguish `For example` from `Must be`.
- **Contextual:** Visually hidden labels can work for familiar controls such as search when visible context is unambiguous, but the accessible name still has to exist.
- **Contextual:** One question per page is strong for complex or high-stakes services, but compact forms can group closely related fields without becoming confusing.

### Helper text earns its space when it answers one of these

- Why do you need this?
- Where can I find it?
- What format or range is accepted?
- What will happen with it?
- Is this public, private, or shared?
- What happens if I leave it blank?

If it merely restates the label, remove it.

### Anti-patterns

- Label: `Email`; helper: `Enter your email`.
- Placeholder-only fields.
- `Required` shown only by color or an unexplained asterisk.
- Instructions after the form or only after failure.
- Hidden password rules revealed one at a time after each failed submission.
- Helper text used for brand jokes, filler, or reassurance with no decision value.
- Asking `First name` and `Last name` when the product does not need to split a person's name.
- Assuming one global format for names, addresses, phone numbers, dates, or postal codes.
- Clearing valid and invalid values after submission.
- Disabling fields as a substitute for explaining availability or prerequisites.

### Examples

| Weak | Better |
|---|---|
| Label `Password`; after failure: `Must contain 12 characters` | Label `Password`; helper `Use at least 12 characters` |
| Label `Reference`; helper `Enter reference` | Label `Order reference`; helper `On your receipt, below the order date` |
| Placeholder `name@example.com` with no label | Label `Email address`; optional example below only if needed |
| `Phone number (required)` when every field is required | Explain once at form level that all fields are required, or mark the exceptions |

## 3. Validation and error messages

### Preferred rules

- **Must:** Say what went wrong and how to fix it, or state honestly when the user cannot fix it.
- **Must:** Identify the affected field in the message. `Enter an email address` is better than `This field is required`.
- **Must:** Distinguish different failure causes when the remedy differs: empty, wrong format, too short, too long, out of range, unavailable, permission denied, or service failure.
- **Must:** Never blame the user. Avoid `You forgot`, `You failed`, `Illegal`, and scolding humor.
- **Must:** Preserve submitted values unless there is a security reason not to.
- **Must:** Do not claim a value is invalid when the service is actually unavailable.
- **Must:** For page-level validation, provide a clear error summary linked to the corresponding fields, while retaining inline messages.
- **Must:** Dynamic errors and status changes need to be announced to assistive technology without stealing focus unnecessarily.
- **Default:** Put inline errors after the label and helper text, close to the field.
- **Default:** Use the same wording in the summary and inline location.
- **Default:** Write the correction in positive, direct language.
- **Default:** Validate at a point where feedback is useful. Do not interrupt every keystroke with premature errors.
- **Default:** Put technical codes and diagnostic details behind progressive disclosure unless they are useful to the audience.
- **Contextual:** Inline validation during entry is useful when the condition can be evaluated fairly and feedback helps immediately, such as username availability. It is harmful when it announces failure before the person has finished typing.
- **Contextual:** A generic service-failure message can be necessary when the cause is genuinely unknown, but it must still say what was preserved and what the person can do next.

### Error formula

Use the shortest combination that resolves the situation:

1. **Problem:** what did not happen or which value is affected?
2. **Constraint or cause:** include only when known and useful.
3. **Recovery:** what can the person do now?
4. **Data status:** was their work saved, preserved locally, or lost?

### Anti-patterns

- `Something went wrong.` with no next step.
- `Invalid input.`
- `Error 0x80131500.` as the only explanation.
- `Oops! You broke the internet.`
- `Please enter a valid value.`
- `There was an error submitting the form` when the service knows the connection timed out.
- Red borders or icons without text.
- One message listing unrelated failures without mapping them to fields.
- A toast that disappears before it can be read.
- Repeated submission producing duplicate records while the UI reports a failure.

### Examples

| Situation | Weak | Better |
|---|---|---|
| Empty email | `Required field` | `Enter your email address` |
| Wrong date range | `Invalid date` | `Start date must be before 18 July 2026` |
| File too large | `Upload failed` | `Choose a file smaller than 10 MB` |
| Network failure, draft preserved | `Something went wrong` | `We couldn't send the message. Your draft is saved on this device. Try again.` |
| Permission problem | `Error 403` | `You don't have access to this project. Ask a project admin for access.` |

## 4. Empty and zero-result states

An empty state is not one condition. Copy must distinguish at least:

- **First use:** nothing has been created yet.
- **User-cleared:** the person completed or removed everything.
- **No results:** a search or filter matched nothing.
- **Unavailable:** data exists but could not be loaded.
- **No permission:** data may exist, but the current user cannot access it.

### Preferred rules

- **Must:** Name the actual state. Never show `No data` for a network failure or permissions issue.
- **Must:** Offer a realistic next action when one exists.
- **Must:** Do not imply the user can create, retry, or request access if that action is unavailable.
- **Default:** Use a short title that states the condition, followed by one sentence for cause or next step if needed.
- **Default:** For zero results, reflect the active query or filters and offer a useful recovery such as clearing filters or correcting a term.
- **Default:** For first use, explain the value of the first action without turning the state into a marketing page.
- **Default:** Replace the empty content region instead of leaving a full, meaningless table or chart frame that assistive technology must traverse.
- **Default:** Avoid celebratory language when the empty state may reflect loss, failure, or exclusion.
- **Contextual:** A small amount of personality can suit a successful cleared state in a low-stakes product. It should never obscure the state or next action.

### Examples

| State | Weak | Better |
|---|---|---|
| First use | `Nothing here yet!` | `No projects yet` + `Create a project to organize this work.` |
| Zero result | `No data` | `No invoices match “June”` + `Clear the date filter` |
| Failure | `No notifications` | `Notifications couldn't load` + `Try again` |
| Permission | `Empty folder` | `You don't have access to this folder` + access route if available |

## 5. Loading and progress copy

### Preferred rules

- **Must:** Show that work is in progress when a delay would otherwise look like a frozen interface.
- **Must:** Do not invent progress percentages, remaining times, queue positions, or live status.
- **Must:** If work stalls or fails, replace the loading state with a truthful explanation and recovery action.
- **Default:** Use determinate progress when the system can measure it accurately; use indeterminate progress when it cannot.
- **Default:** Use specific status text only when it adds information: `Uploading 3 of 8 files` is useful; `Loading...` beside an obvious spinner often is not.
- **Default:** Preserve layout and context where possible. Skeletons should approximate the real structure, not simulate content indefinitely.
- **Default:** Change the triggering control to reflect the active operation when useful, such as `Saving...`, and prevent accidental duplicate submission.
- **Default:** If an operation can safely be paused or canceled, expose that option and state the consequence.
- **Contextual:** Skeletons are useful for known, stable content structures. A spinner, progress bar, or existing cached content is better when structure is unknown or a skeleton would imply facts that are not yet available.
- **Contextual:** Optimistic updates are appropriate only when failure is rare, reversal is safe, and rollback is clear.

### Anti-patterns

- A spinner with no accessible status during a long operation.
- `Almost done` shown for an unknown duration.
- A progress bar that races to 90% and remains there for minutes.
- Skeletons that never resolve or mimic ads and real content.
- Showing old data as current without a stale or offline indication.
- Success copy before the server confirms the action.
- Removing a submitted item immediately with no rollback when the deletion can fail.

### Examples

- `Uploading 3 of 8 files` is better than `Working on it` when the count is known.
- `Reconnecting... Changes are stored on this device` is better than a silent frozen editor.
- `Saving...` should become `Saved` only after the relevant persistence layer confirms it.

## 6. Success, completion, and notifications

### Preferred rules

- **Must:** Confirm completion only after the action actually succeeds.
- **Must:** For consequential transactions, state what completed, provide any reference, and explain what happens next and when.
- **Must:** If success is partial, say so. Never collapse mixed outcomes into a green `Done` state.
- **Default:** Keep routine success feedback close to the action and brief.
- **Default:** Use a durable confirmation page or panel when people may need a receipt, reference, next steps, or proof of submission.
- **Default:** Do not use an interrupting dialog for a routine success.
- **Default:** Give notifications a single clear purpose. Too many alerts train people to ignore all of them.
- **Default:** Use `role="status"` for advisory success updates and reserve assertive alerts for urgent messages.
- **Contextual:** A transient toast is appropriate for reversible, low-stakes actions when disappearance does not remove necessary information.
- **Contextual:** A playful success line can fit a brand moment, but the factual outcome must remain explicit.

### Anti-patterns

- `Success!` without saying what succeeded.
- A confetti animation hiding a failed or still-pending request.
- `Your order is confirmed` before payment authorization.
- Success feedback conveyed only through green color or a checkmark.
- A toast as the only record of a reference number.
- A completion page with no next step, expected timing, or support route.

### Examples

| Weak | Better |
|---|---|
| `Success!` | `Profile changes saved` |
| `Done` | `Invitation sent to rina@example.com` |
| `Order complete` | `Order received` + order number + expected dispatch date |
| `3 files uploaded` when one failed | `2 files uploaded. “budget.csv” was too large.` |

## 7. Confirmations and destructive actions

### Preferred rules

- **Must:** Confirm uncommon, irreversible, high-impact actions before execution.
- **Must:** Name the object and consequence: `Delete “Q3 forecast”? This permanently removes the file and its comments.`
- **Must:** Use a specific destructive action label and provide a clear safe exit.
- **Must:** Do not make the destructive choice look like a harmless continuation.
- **Default:** Prefer undo over confirmation for frequent, reversible actions. Repeated confirmation dialogs create habituation.
- **Default:** Keep confirmation text neutral and factual. Do not shame or manipulate people into the preferred option.
- **Default:** Avoid confirmation dialogs for merely informational messages; place those messages in context.
- **Default:** Use progressive disclosure for technical impact details that only some users need.
- **Contextual:** Typed confirmation or reauthentication may be justified for exceptionally high-impact actions such as deleting an organization, transferring ownership, or exposing sensitive data. Do not use it for ordinary deletion.
- **Contextual:** If a destructive action was already deliberate and fully clear, the platform may favor a lighter confirmation or undo. Risk, reversibility, and frequency determine the pattern.

### Anti-patterns

- `Are you sure?` without naming the action.
- `Yes` / `No` choices whose meaning requires rereading the dialog.
- `Cancel` used to mean cancel the item instead of close the dialog.
- Making the destructive button the visually dominant primary action by default.
- Confirming every delete, including easily undone items.
- Dark patterns such as `No, I prefer to lose productivity`.
- Hiding permanent deletion behind a generic `Remove` label.

### Examples

| Weak | Better |
|---|---|
| Title `Are you sure?`; buttons `Yes` / `No` | Title `Delete “Launch plan”?`; buttons `Delete plan` / `Cancel` |
| `Remove account` for permanent deletion | `Delete account permanently` |
| Dialog after archiving an item | Archive immediately and offer `Undo` when recovery is reliable |

## 8. Navigation and links

### Preferred rules

- **Must:** Navigation labels must describe destinations in the user's language, not internal department names or invented brand poetry.
- **Must:** Link text must identify its destination or purpose. Avoid repeated `Learn more`, `Read more`, and `Click here` links.
- **Must:** Different destinations need distinguishable labels; the same destination should be named consistently.
- **Must:** Indicate the current page or section programmatically, such as with `aria-current`, not only by color.
- **Default:** Keep primary navigation labels short, familiar, and parallel.
- **Default:** Link to the most relevant destination rather than a page that makes the user search again.
- **Default:** Disclose unusual behavior that affects the decision to follow a link: download type and size, authentication requirement, or a new tab when truly necessary.
- **Default:** Avoid stuffing paragraphs with links; each link adds a decision.
- **Contextual:** `Back` is appropriate when it reliably returns to the previous step and preserves work. Use a named destination when browser history is unpredictable.
- **Contextual:** `Home`, `Pricing`, and `Contact` can be better than more distinctive labels because navigation prioritizes recognition over brand voice.

### Anti-patterns

- `Discover`, `Explore`, `World`, or `Universe` as vague primary destinations.
- Multiple `Learn more` links pointing to different pages.
- Link copy that describes an interaction method: `Click here`, `Tap this`.
- Opening a new tab without warning or need.
- Using a button to navigate merely because the design needs a filled rectangle.
- Hiding primary actions in a `More` menu while leaving decorative actions visible.
- Renaming the same destination between desktop and mobile navigation.

## 9. Accessibility checks for UX copy

These are not optional polish steps.

### Names and structure

- Every interactive element has a meaningful accessible name.
- Visible labels and accessible names use the same essential words so speech-input users can name what they see.
- Labels describe purpose; descriptions hold supplementary constraints or hints.
- Headings describe the content that follows and are not decorative fragments.
- Repeated controls are distinguishable when their objects differ, for example `Edit billing address` and `Edit shipping address`.

### Errors and status

- Error meaning is not conveyed by color, icon, or position alone.
- Errors are available in text, associated with the relevant control, and easy to find.
- A page-level summary links to each invalid field when the form warrants one.
- Dynamic success, error, and loading updates use the appropriate live-region behavior.
- Routine updates do not use assertive announcements that interrupt current speech.
- Focus moves only when doing so helps recovery, such as moving to a submitted form's error summary.

### Reading and interaction

- Copy does not rely on seeing direction, color, size, or position: avoid `Use the green button on the right`.
- Link text makes sense out of context where practical.
- Instructions appear before they are needed.
- Time limits are avoided or can be extended unless essential to the task.
- UI copy survives 200% zoom, text enlargement, and narrow reflow without clipping critical labels or actions.
- Important information does not vanish before a person can perceive it.

### Tone

- Errors do not blame, ridicule, or infantilize.
- Humor never replaces diagnosis or recovery.
- Urgency words such as `now` and `immediately` are reserved for real urgency.
- Success and error language remains understandable for people with cognitive disabilities and for readers using translation tools.

## 10. Localization and internationalization

### Preferred rules

- **Must:** Store user-facing strings separately from functional code and identifiers.
- **Must:** Do not assemble sentences from translated fragments. Grammar, gender, case, word order, articles, and plural forms vary by language.
- **Must:** Use locale-aware formatting for dates, times, numbers, currencies, measurements, addresses, and names.
- **Must:** Support right-to-left direction and avoid hardcoded `left` / `right` language when `start` / `end` is meant.
- **Must:** Provide translators with context for short labels, ambiguous terms, variables, and placeholders.
- **Default:** Write complete, plain source strings. Clear source copy improves translation quality.
- **Default:** Keep terminology consistent and maintain a small product glossary for repeated actions and objects.
- **Default:** Design controls for text expansion and contraction. Do not rely on a fixed English button width or one-line navigation at every locale.
- **Default:** Use proper plural and gender-aware message APIs rather than string conditionals.
- **Default:** Pseudolocalize and test expansion, accented characters, non-Latin scripts, bidirectional text, and longer accessible labels.
- **Default:** Localize alt text, accessible names, errors, privacy explanations, and notification copy, not only visible marketing text.
- **Contextual:** Brand names and product terms may stay untranslated, but this requires an explicit terminology decision rather than accidental omission.
- **Contextual:** A button may wrap or stack in a localized layout if keeping it on one line would force truncation or unreadably small type. English desktop preferences are not universal rules.

### Anti-patterns

- Concatenating `Delete` + object + `?` at runtime.
- Reusing one English string in contexts that require different grammar elsewhere.
- Truncating translated buttons with ellipses.
- Embedding translatable text in images.
- Hardcoding `$`, `MM/DD/YYYY`, imperial units, or Western name order.
- Assuming capitalization rules transfer across languages.
- Inserting HTML fragments into translator-facing sentences without context.
- Using flags as language labels.
- Testing only English and only left-to-right layouts.

### Localization examples

- Weak resource design: `"delete_prompt": "Delete the "` plus a runtime object name.
- Better resource design: separate complete messages such as `Delete the file?` and `Delete the folder?`, or a localization-aware message format with documented variables.
- Weak helper: `Date (MM/DD/YYYY)` everywhere.
- Better helper: a locale-appropriate example and a date control that accepts the expected local format.

## 11. Truthful copy for prototypes, mock data, and unconnected interfaces

Official prototype guidance distinguishes prototype code from production code, and GOV.UK uses phase banners to tell users when a service is still being worked on. The following rules are a synthesis from that principle plus the status and error guidance above.

### Preferred rules

- **Must:** Never present a nonfunctional prototype as a live service to people who could reasonably mistake it for one.
- **Must:** Never claim that data was saved, sent, paid, published, synchronized, secured, or deleted when no such operation occurred.
- **Must:** Mark the prototype or demo at the experience level when the context is not already controlled and obvious.
- **Must:** Mark sample data when it could be interpreted as real customer, financial, performance, legal, medical, or operational data.
- **Must:** Do not collect real sensitive information in a prototype unless the research protocol, infrastructure, consent, and data handling explicitly support it.
- **Default:** Make the tested path realistic enough to evaluate the interaction, but stop unsupported paths honestly.
- **Default:** For an unconnected form, state the limitation before submission when it affects consent or effort. Do not wait until after a person fills a long form.
- **Default:** Use a neutral limitation message and, where useful, explain what the production action would do.
- **Default:** Include unimplemented integrations, missing real content, sample data, and nonfunctional actions in the handoff report.
- **Contextual:** In a moderated usability test, the researcher may explain the prototype boundary verbally. The interface should still avoid false confirmations that corrupt the test or deceive participants.
- **Contextual:** Fictional data is appropriate when the explicit task is to design a populated state. Use coherent sample data and label the environment; do not fabricate social proof or publish it as evidence.

### Recommended prototype copy

**Experience-level notice**

> Prototype: this demo does not send, save, or publish real data.

**Before an unconnected form**

> Demo form. Your entries stay in this browser and will not be submitted.

**After a simulated step**

> Demo complete. In the live product, this step would send the invitation.

**Unavailable action**

> Export is not connected in this prototype.

### Anti-patterns

- Fake `Payment successful`, `Email sent`, or `Changes saved` messages.
- Static numbers labeled `Live`, `Real-time`, or `Synced`.
- A loading animation that ends in a fabricated result.
- A functional-looking form that silently discards entries.
- A disabled button with no explanation in a test path.
- Tiny footer-only disclaimers while the main UI claims production behavior.
- Lorem ipsum where realistic content is essential to understanding the design.
- Fake customer names, testimonials, ratings, logos, or performance metrics presented as proof.

## 12. Compact implementation checklist

### Before writing

- What real action, state, object, or destination does this string represent?
- What does the person need to know before acting?
- Is the information already obvious from nearby content?
- Is the user able to complete the action shown?

### Before shipping

- Buttons predict their result and use real semantics.
- Links describe their destination and avoid repeated vague labels.
- Every control has a visible or otherwise justified accessible label.
- Helper text adds a constraint, reason, source, consequence, or example.
- All validation cases have specific recovery copy.
- Submitted values survive errors unless security prevents it.
- Empty, unavailable, permission, and zero-result states are distinct.
- Loading text and progress values are truthful.
- Success is shown only after confirmed success.
- Destructive actions expose consequence and a safe exit or undo.
- Dynamic states are announced accessibly without unnecessary interruption.
- Strings are localization-ready and layouts tolerate expansion and RTL.
- Prototype limitations and sample data are explicit.

## 13. Rules suitable for the final skill

1. Every UI string must describe a real action, state, object, constraint, destination, or recovery step; otherwise remove it.
2. Button labels must predict the result and use specific actions instead of `Submit`, `OK`, or marketing language.
3. Links must name their destination or purpose; do not use repeated `Learn more`, `Read more`, or `Click here` labels.
4. Every input needs a persistent, programmatically associated label; placeholders never replace labels.
5. Helper text is allowed only when it changes how the user answers or understands the consequence.
6. Error copy must identify the problem and give a realistic correction or next step without blaming the user.
7. Preserve entered values after validation failure unless a security requirement prevents it.
8. Distinguish first-use, zero-result, cleared, unavailable, and permission empty states.
9. Never invent progress, completion, live status, saved state, or transaction success.
10. Confirm uncommon irreversible actions; prefer undo for frequent reversible actions.
11. Destructive controls must name the action and object and provide a clear safe exit.
12. Use alerts and dialogs only for information that is important, actionable, and worth interrupting the task.
13. Dynamic status, errors, and success messages must be exposed to assistive technology with appropriate urgency.
14. Do not encode meaning through color, icon, location, or visual styling alone.
15. Do not concatenate translated sentence fragments; provide complete strings, translator context, locale formatting, expansion room, and RTL support.
16. Clearly label prototypes, sample data, and unconnected actions when they could be mistaken for production behavior.
17. For unconnected forms, disclose before submission that data will not be sent or saved, then report the missing integration in the handoff.
18. Context can change tone, length, component choice, and confirmation depth, but it cannot justify deception, inaccessible labels, hidden consequences, or false system state.

## Conclusion

Good UX writing is not a layer of polished phrases applied after the interface is built. It is the shortest accurate explanation of what the interface is, what it needs, what it will do, what just happened, and what the person can do next. The most damaging UI-copy slop is not merely awkward wording; it is wording that invents functionality, hides consequences, blames the user, or leaves recovery undefined.
