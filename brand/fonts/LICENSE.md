# Fonts

- **Fraunces** — SIL Open Font License 1.1 — https://github.com/undercasetype/Fraunces
- **IBM Plex Sans** — SIL Open Font License 1.1 — https://github.com/IBM/plex
- **IBM Plex Mono** — SIL Open Font License 1.1 — https://github.com/IBM/plex

Latin and Latin-Extended subsets are vendored here so rendering is deterministic
and works without network access. All three licences permit redistribution.

Fraunces and IBM Plex Sans ship here as their full variable-font range (weight,
and for Fraunces also optical size, SOFT and WONK). `templates/_kit.mjs` sets
`font-variation-settings` per use rather than relying on named static instances.
