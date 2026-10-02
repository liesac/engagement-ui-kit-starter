# Context & Architectural Overview

This document outlines the core engineering decisions made during the implementation of the Caseware Take-Home UI Kit exercise. The solutions prioritize accessibility (a11y), structural type-safety, performance overhead reduction in zoneless Angular 21, and bulletproof backward compatibility for consuming engineering teams.

## Decision 1: Focus Management Strategy (Virtual vs. Physical Focus)

- Chosen Approach: Virtual Focus utilizing the W3C ARIA Combobox/Listbox pattern via aria-activedescendant.
- The component acts as an inline combobox where the actual browser focus remains tightly anchored to the trigger `<button>` element. Navigating via keyboard arrow keys dynamically mutates the aria-activedescendant attribute pointing to the active option’s unique ID. This scales seamlessly to several hundred elements, as it avoids triggering continuous browser reflows and layouts caused by physical focus hopping across separate list nodes.
- Alternative Considered: Physical Focus Rotation. Moving focus directly to the active <li> item using element.focus().
- Why it was rejected: Physical focus rotation introduces heavy management overhead for managing scroll boundaries inside popups. Furthermore, when closing the dropdown or tracking blur/touched states in Angular Forms, it triggers complex race conditions that easily escape the container, fracturing the assistive technology navigation flow.

## Decision 2: Keyboard Interaction Engine

- Chosen Approach: Leveraging Angular CDK’s ActiveDescendantKeyManager inside a zoneless reactive loop.
- Writing custom keyboard event listeners using native switch-case statements (e.key === 'ArrowDown') is error-prone, hard to scale, and fails edge cases like fast-typing lookups (Typeahead). The Angular CDK ActiveDescendantKeyManager abstractly encapsulates keyboard patterns, wraps lists seamlessly via .withWrap(), and ignores disabled choices natively out of the box, fulfilling our core acceptance criteria effortlessly.
- Alternative Considered: Manual RxJS keyboard event stream mapping.
- Why it was rejected: Re-implementing a robust typeahead buffer stream (managing debounceTime, buffer collection, and clearing cache strings upon timeout) introduces unnecessary complexity and testing surface area to the codebase. It reinvents a highly optimized core framework feature, going against the constraint of optimization for clarity.

## Decision 3: Angular Form Integration with Signals Architecture

- Chosen Approach: Custom ControlValueAccessor (CVA) exposing a read-only private reactive signal() mapped inside the writeValue() cycle.
- In a strict Zoneless Angular 21 architecture, relying on standard properties for local state mapping can cause rendering sync delays if external components alter the model outside immediate macro-task loops. Mutating a local Signal (valueSignal.set(value)) inside writeValue triggers a fine-grained, localized DOM update instruction that targets only the necessary DOM text nodes without demanding a top-down change detection sweep.
- Alternative Considered: Using the new model() input pattern.
- Why it was rejected: While model() inherently sets up a two-way bound signal, it bypasses the built-in hooks required by the Angular Form architecture (registerOnChange, registerOnTouched). Using it directly as a CVA bridge breaks the unified framework standard, masking state mutation side effects from the underlying FormGroup.

## Decision 4: Token and Theming System Hierarchy

- Chosen Approach: Two-tier architecture: Primitive SCSS Variables maps directly into CSS Custom Properties (Native Variables) inside _semantic.scss.
- Component files consume purely semantic web values (e.g., var(--cw-sys-bg-surface)). Theme shifts (Light to Dark mode) are handled entirely at the root DOM nodes using [data-theme="dark"]. This guarantees that switching components to dark mode incurs zero visual duplication runtime costs, completely separating meaningful logic from arbitrary visual style values.
- Alternative Considered: SASS Theme Maps and Mixin generation compiles.
- Why it was rejected: SASS-driven map looping compiles heavy CSS blocks by physically duplicating selectors with different colors. This bloats bundle file sizes, prevents real-time client-side theme switching without downloading extra stylesheets, and is highly prone to collision risks in Module Federation setups.

## Decision 5: Code Modernization & Encapsulation Strategy for cw-status-badge

- Chosen Approach: Elimination of template execution side effects, scoping variables.
- The legacy badge component suffered from critical engineering anti-patterns:
	1. Template Getter Execution: It evaluated a getter on every change detection cycle, introducing performance issues.
	2. Global CSS Pollution: Hardcoded values and un-scoped classes posed a risk of accidental visual overrides across the application. Styles were strictly encapsulated within a scoped component class .
	
- Alternative Considered: Better state manegement.
- Why it was rejected: Currently, the application maintains a single variable for each state, which is highly inefficient. While this should be updated, it is critical to first assess the impact of the change. Modifying this structure will alter the component's architecture and introduce a breaking change affecting the entire application. Although we could implement the update to be backward compatible, we must fully understand its downstream impact before proceeding



