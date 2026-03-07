# Repository Guidelines

## Project Structure & Module Organization
This repository is a Shopify theme organized by platform conventions.

- `layout/`: global wrappers (for example `theme.liquid`).
- `templates/`: page JSON templates, including `templates/customers/`.
- `sections/`: reusable page sections (`*.liquid` and some section JSON groups).
- `snippets/`: small Liquid partials rendered by sections/templates.
- `assets/`: CSS, JavaScript, and static theme assets.
- `config/`: theme settings schema and runtime settings data.
- `locales/`: translation files (`*.json` and `*.schema.json`).

Keep related changes together (for example section markup in `sections/` plus styles/scripts in `assets/`).

## Build, Test, and Development Commands
Use Shopify CLI for local development and validation:

- `shopify theme dev` - run a local preview with live reload.
- `shopify theme check` - run Liquid/theme lint checks.
- `shopify theme push --unpublished` - upload changes to an unpublished theme.
- `shopify theme pull` - sync remote theme changes to local.

Run commands from the repository root.

## Coding Style & Naming Conventions
- Use 2-space indentation in Liquid, CSS, and JavaScript.
- Follow existing Liquid whitespace control patterns (`{%- -%}`) where already used.
- Use kebab-case file names (for example `cart-drawer.liquid`, `product-info.js`).
- Keep section/snippet names descriptive and aligned with purpose.
- Prefer small, composable snippets over large duplicated Liquid blocks.

## Testing Guidelines
There is no dedicated unit test suite in this repository.

- Treat `shopify theme check` as the minimum validation gate.
- Manually verify edited flows in `shopify theme dev` (cart, product, search, locale-specific UI).
- After changing `locales/`, confirm keys resolve correctly and no missing translation strings appear.

## Commit & Pull Request Guidelines
Git history is not available in this workspace snapshot, so use this convention:

- Commit messages: imperative, concise, scoped (example: `sections: fix announcement bar link styles`).
- One logical change per commit.
- PRs should include: summary, impacted templates/sections, testing notes, and screenshots/GIFs for UI changes.
- Link the relevant ticket/issue when applicable.

## Security & Configuration Tips
- Do not commit secrets or store credentials in theme files.
- Review `config/settings_data.json` carefully; avoid overwriting merchant-specific live settings unless intentional.
