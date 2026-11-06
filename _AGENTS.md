# AGENTS

`@ubio/framework` provides common components for building applications.

## Package Conventions

- Place new runtime dependencies in the owning package, not at root.
- Keep `devDependencies` in root unless a package has a strict reason to own them.
- Preserve ESM output and subpath exports for `@ubio/framework`.
- Keep shared tooling (`eslint`, TypeScript, scripts) in the monorepo root.

## TypeScript Conventions

- **General Philosophy**: Keep code simple, readable, and modular. Use Dependency Injection (`mesh-ioc`) and Object Oriented Programming principles (class-based composition, design by contract).
- **Line Length**: Break down long lines, preferably into different statements to improve readability.
- **Method Length**: Break down long methods (aim for < 30 lines of code).
- **No Blank Lines in Methods**: Do not insert blank lines in method bodies. A blank line typically indicates a missing comment or that a logical part can be extracted into its own method.
- **Arguments**: Keep method/function arguments to a minimum. Use options objects if there are many parameters.
- **Type Simplicity**: Never use complex TypeScript type constructs. Types should be readable; users should not have to run a TypeScript compiler in their head to understand what the target type should look like.
- **Type Balance**: Maintain a healthy balance between type safety and the overall number of types introduced. Too many types clutter cognitive space with unnecessary terminology.
- **Loops**: Prefer `for ... of` loops. Never use `.reduce()` as a fancy looping syntax. Never use `.forEach()`. Do use `.map()`, `.filter()`, `.some()` for simple cases.
- **Class Structure**: Keep class members logically grouped. Keep fields at the top, followed by getters and methods. Keep private members below public members in each group.

## Docs Guidelines

- Keep Markdown concise and scannable with short sections and practical examples.
- Use fenced code blocks with language hints for commands and code snippets.
- Maintain sentence-style prose instead of dense paragraph walls.
- **Insert one blank line between Markdown blocks** (headings, paragraphs, lists, code fences, frontmatter-adjacent sections, and HTML/component blocks).
- Keep naming and terminology consistent with package names and vocabulary used in code.

## General Code Guidelines

- Keep modules focused and small. Prefer explicit exports.
- Follow package-local requirements in the corresponding `packages/*/AGENTS.md`.
