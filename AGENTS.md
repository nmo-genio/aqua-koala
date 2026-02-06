# AGENTS.md - Operational Guide

## Scan Project Configs
*Review these files to understand the project environment before starting work:*
- **Standard Dependencies**: Check `package.json` for React and Vite configurations. Use `npm` as the primary package manager.
- **Native Configuration**: Inspect `capacitor.config.json` for app IDs and web directory targets.
- **CI/CD Status**: **Note:** This repository currently has NO `.github/workflows` or `.aider.conf.yml`. All verification is manual.

## Dev Environment Tips
*Use these commands to set up and navigate the workspace:*
- **Setup**: Run `npm install` to install dependencies.
- **Development**: Launch the local server with `npm run dev`.
- **Navigation**: The project is a single-package repo. Core logic is in `src/`, native iOS code is in `ios/App/`.
- **Scaffolding**: To add a new component, use `mkdir -p src/components && touch src/components/MyNewComponent.jsx`.

## Testing Instructions
*Verify your changes locally before finishing:*
1. **Manual Verification**: Run `npm run dev` and navigate to `http://localhost:5173`.
2. **Logic Check**: Manually trigger hydration state changes (e.g., add 250ml) to verify Koala mascot reactions.
3. **Build & Sync**: For iOS changes, run `npm run build && npx cap sync ios` and verify in Xcode via `npx cap open ios`.
4. **Code Quality**: Ensure no type errors exist in JSX files. Fix any linting issues manually as no auto-linter is configured.

## PR Instructions
*Follow these standards when submitting changes:*
- **Title Format**: Use `feat: <description>` or `fix: <description>` (e.g., `feat: add glassmorphic notification modal`).
- **Pre-commit Requirements**: 
  - Ensure `npm run build` completes without errors.
  - Verify that `src/App.css` follows the design tokens defined in `src/index.css`.
  - Confirm all user data persistence via `@capacitor/preferences` is tested.
