# The Rewrite

An independent interactive study companion inspired by [Stanford CS153: Frontier Systems](https://cs153.stanford.edu/). **The Rewrite** is the experience; **The Living Stack** is its central interaction. This is not an official Stanford course site.

The first lesson asks learners to follow an AI request, predict which constraint matters, test a simplified system, and carry one decision into their own project through the **Lab Thread**. The learning path adapts through explicit choices and checkpoint responses. It does not use an AI tutor or infer a learner's ability from time on page.

## Run locally

The site is plain HTML, CSS, and JavaScript. There is no build step, package installation, backend, API key, or runtime dependency.

```sh
npm run serve
```

Open [localhost:4173](http://localhost:4173). The preview command uses Python 3 and binds only to the local computer. Alternatively, serve this directory with any static HTTP server. Use HTTP for testing because browsers handle storage differently for `file:` URLs.

Run the pure-logic regression tests with Node.js 20 or newer:

```sh
npm test
```

## Files

| File | Responsibility |
| --- | --- |
| `index.html` | Page structure, opening scene, section anchors, accessible controls |
| `assets/base.css` | Existing stack, panel, simulator, and supporting layout styles |
| `assets/experience.css` | Visual hierarchy, semantic encoding, responsive presentation, opening motion |
| `assets/experience.js` | Finite opening sequence, manual scene control, and reduced-motion behavior |
| `assets/stack.js` | Layer content, inspect panel, dependency drawing, simulator, speaker and module context |
| `assets/learning.js` | Lesson sequence, route choices, checkpoint feedback, bounded detours, Lab Thread |
| `assets/learning.css` | Lesson and project-rail presentation |
| `tests/` | Behavioral checks of the simulator and learning rules |

Keep relative asset URLs so the same files work beneath the GitHub Pages `/therewrite/` path. GitHub Pages serves the repository's static files; merge and publication depend on the repository's Pages settings.

## Visual contract

- **Color identifies a domain family.** Keep named CSS tokens consistent across the stack, lesson, and simulator. Compute and training share cyan; safety and policy share red-orange. Speaker identity, success, and navigation must not borrow unrelated domain colors.
- **Shape distinguishes roles.** Solid cards represent the seven technical layers; dashed boundaries represent security, economics, and policy as constraints across the system. A labeled outline identifies the active selection or bottleneck.
- **Position expresses dependency, not elapsed time.** The stack is a conceptual map. Training shaped the model before a typical serving request; it does not run again for each prompt. Physical infrastructure supports runtime execution.
- **Motion explains a change.** Use staged reveal to establish dependencies, a bounded pulse to show a request, and an explicit transition when a constraint moves. Avoid decorative perpetual animation, unrelated shimmer, and motion as the only explanation.
- **Text repeats visual meaning.** Active states, relationships, and simulator results need visible labels, keyboard controls, and screen-reader context. Respect `prefers-reduced-motion`; keep the same information available without animation.

## Scope and evidence

Module 1 is the implemented interactive lesson. Later modules are a preview of the proposed path, not a complete course or a promise of available lessons. Finishing the local checkpoint records the learner's responses, not certification, mastery, or observed real-world performance.

The simulator is an illustrative teaching model. Its sliders are relative inputs, and its weighted pressure scores are authored assumptions, not measured utilization, predicted latency, costs, capacity, or a recommendation for production infrastructure. Change one input and compare the direction of the result. Use real measurements before making a product decision.

The request walkthrough is also illustrative. It does not reveal the internal architecture, hardware, energy use, or data handling of a named AI provider. The lesson text is editorial synthesis, not a transcript or verified quotation from course speakers.

Speaker listings can be checked against the official [Spring 2026 course page](https://cs153.stanford.edu/) and [Winter 2025 archive](https://cs153.stanford.edu/winter2025/). A listing does not establish that a talk occurred. Associations between speakers and stack layers are editorial. Avoid adding quotes, company metrics, prices, or legal claims without a dated, direct supporting source.

## Local data

Learning choices and Lab Thread notes are stored only in this browser's local storage, under `therewrite.learning.v1`. The app does not send those entries to a server, synchronize them between devices, or call a model. Clearing browser site data removes them. Export the Lab Thread as JSON when you want a portable copy. Storage may be unavailable in restricted browsing contexts; the lesson still works for the current session.

Each lesson pass allows two detours, each with one optional deeper explanation. **Start a fresh lesson pass** clears checkpoint attempts, answers, the request-trace position, and the detour count while preserving the learning profile and Lab Thread.

## Review before merging

Run `npm test`, then check the actual page at desktop and phone widths. Exercise the opening, layer inspection and Escape/focus return, slider changes and scenario reset, checkpoint correction, return from a detour, project-note persistence after reload, export, and a fresh lesson pass that keeps project notes. Check keyboard navigation and reduced motion. Pure-logic tests cannot verify layout, focus behavior, assistive-technology output, or the published deployment.

The `Validate lesson` GitHub Actions workflow runs the same tests on pushes and pull requests with read-only repository access. Tests also check production JavaScript syntax, local asset paths beneath `/therewrite/`, and static navigation targets. The workflow does not publish the site or alter GitHub Pages settings.
