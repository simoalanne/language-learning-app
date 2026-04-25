# Frontend App Structure

## Goal

Migrate the frontend to TypeScript and a feature-based folder structure where code for one feature lives together, and only truly shared code is placed in root-level shared folders.

## Architectural Goal

The end goal is the same kind of shift already done in the backend:

- move away from a role-based structure that groups code by technical layer
- move toward a vertical feature-based structure where each feature owns most of its own code
- keep shared infrastructure small and obvious
- use TypeScript to model real domain shapes instead of allowing loose ad hoc data structures
- let the contract-first library reduce custom glue code instead of introducing extra abstraction layers

This should make the frontend feel similar to the backend refactor outcome:

- easier to scale by feature
- less code overall
- clearer ownership
- less cross-folder navigation when working on one capability
- fewer generic buckets that slowly turn into dumping grounds

## Migration Order

The migration should be done in this order:

1. Improve the organization first
2. Update dependencies
3. Convert JavaScript to TypeScript intentionally
4. Clean up what is still messy after the migration

### 1. Improve the organization first

- Focus on moving and renaming files into the new structure
- Limit code changes to import updates and only the smallest fixes needed to keep things working
- Avoid behavior changes and avoid mixing in cleanup refactors during this step

### 2. Update dependencies

- Update packages to current versions
- Remove packages that are no longer needed
- Make any necessary compatibility updates after the structure is already stable

### 3. Convert JavaScript to TypeScript intentionally

- Convert feature by feature instead of doing a shallow half-migration
- Do not type everything as `any`
- Do not duplicate very similar types locally in multiple places
- Introduce shared types only when they are actually shared
- Prefer improving domain modeling over mechanically renaming file extensions

### 4. Clean up what is still messy after the migration

- Once the structure and typing are in place, review what still feels awkward
- Improve duplicated logic, oversized files, unclear ownership, and weak boundaries
- Let the new structure reveal the real cleanup targets instead of guessing too early

## Current Status

The following work is already done:

- frontend folder structure has been reorganized into root app files, shared root folders, and feature folders
- `providers/`, `components/`, `utils/`, and `features/` are in place
- route assembly lives at the root in `src/router.jsx`
- provider wiring lives in `src/providers/`
- shared generic UI lives in `src/components/`
- feature-owned files have been moved out of the old flat `src/` layout
- frontend-local ESLint setup has been removed in favor of the repo-level Biome config
- dead dependency cleanup has been started and `axios` / frontend ESLint packages were removed
- TypeScript support has been added with `frontend/tsconfig.json`, `src/vite-env.d.ts`, and a `typecheck` script
- `@/` path alias support has been added for Vite and TypeScript
- `vite.config` has been converted to TypeScript
- frontend dependencies have been updated to the latest compatible versions in the repo

Current verification status:

- `pnpm --filter frontend build` passes
- `pnpm --filter frontend typecheck` passes

The target shape is intentionally flat:

```text
src/
  App.(j|t)sx
  main.(j|t)sx
  router.(j|t)sx
  index.css
  vite-env.d.ts

  features/
    home/
    word-groups/
    ai-generation/
    flashcards/
    memory-game/
    test-mode/

  providers/
  components/
  utils/
```

## Folder Rules

- `src/features/<feature-name>/` contains all code that mainly belongs to one feature.
- `src/components/` contains only truly shared generic components used across multiple features.
- `src/providers/` contains provider setup and provider-facing wrappers like Clerk and API/query client wiring.
- `src/utils/` contains shared pure helpers.
- `src/styles/` is optional and should only hold shared/global style files if needed later.
- Avoid adding deeper role-based nesting unless there is a strong reason.
- If a file is only used by one feature, keep it inside that feature even if it is a component, hook, helper, or CSS file.

## Current Structure

The frontend currently looks roughly like this:

```text
src/
  App.jsx
  main.jsx
  router.jsx
  index.css
  vite-env.d.ts
  LearningModeSettings.jsx

  providers/
    api-client.tsx
    clerk.ts
    use-app-auth.ts

  components/
    ChipSelect.jsx
    ContentAligner.jsx
    LanguageFlag.jsx
    MoveIcons.jsx
    SelectLanguage.jsx
    SelectLanguagePair.jsx
    SwapLanguagePair.jsx
    ToastMessage.jsx
    ToggleOption.jsx

  utils/
    helpers.js

  features/
    home/
    word-groups/
    ai-generation/
    flashcards/
    memory-game/
    test-mode/
```

## Target Mapping

### Root files

- `src/App.jsx` stays at root for now
- `src/main.jsx` stays at root for now
- `src/router.jsx` stays at root for now
- `src/index.css` stays at root
- `src/vite-env.d.ts` exists at root

Status:

- done structurally
- TypeScript conversion of these files is still pending

### `src/providers/`

- `src/providers/api-client.tsx`
- `src/providers/use-app-auth.ts`
- `src/providers/clerk.ts`

Notes:

- This folder is for app wiring and provider-facing integration code.

Status:

- done

### `src/components/`

- `src/ContentAligner.jsx` -> `src/components/ContentAligner.tsx`
- `src/ToastMessage.jsx` -> `src/components/ToastMessage.tsx`
- `src/ToggleOption.jsx` -> `src/components/ToggleOption.tsx`
- `src/ChipSelect.jsx` -> `src/components/ChipSelect.tsx`
- `src/MoveIcons.jsx` -> `src/components/MoveIcons.tsx`
- `src/SelectLanguage.jsx` -> `src/components/SelectLanguage.tsx`
- `src/SelectLanguagePair.jsx` -> `src/components/SelectLanguagePair.tsx`
- `src/SwapLanguagePair.jsx` -> `src/components/SwapLanguagePair.tsx`
- `src/LanguageFlag.jsx` -> `src/components/LanguageFlag.tsx`

Notes:

- Keep `MoveIcons` here only if it remains genuinely shared.
- The language-selection components are shared enough today because multiple practice flows depend on them.

Status:

- done structurally
- TypeScript conversion still pending for most files

### `src/utils/`

- `src/utils/helpers.js`

Notes:

- Keep this for pure shared functions such as `shuffle` and cross-feature filtering helpers.
- If a helper only belongs to one feature after refactoring, move it into that feature instead.

Status:

- done structurally
- TypeScript conversion still pending

### `src/features/home/`

- `src/features/home/LearnWords.jsx`
- `src/features/home/LearnWords.css`
- `src/features/home/LearningModeCard.jsx`
- `src/features/home/LoggedInButtons.tsx`
- `src/features/home/LogInOrRegisterButtons.tsx`

Notes:

- The menu buttons are feature-level navigation for the current home/app shell experience, so they do not need a separate shared folder.
- If the top navigation grows into a broader app-level concern later, it can be pulled out then.

Status:

- done structurally
- naming cleanup like `LearnWords -> HomePage` is still optional future cleanup

### `src/features/word-groups/`

- `src/features/word-groups/ManageTranslations.jsx`
- `src/features/word-groups/TranslationCard.jsx`
- `src/features/word-groups/QuickAdd.jsx`
- `src/features/word-groups/AddToCollection.jsx`
- `src/features/word-groups/wordGroups.js`

Notes:

- This feature owns CRUD for user-managed word groups.
- Domain-specific normalization and request shaping for word groups should live here instead of in a generic root API folder.

Status:

- done structurally
- TypeScript conversion still pending

### `src/features/ai-generation/`

- `src/features/ai-generation/AiTranslationGeneratation.jsx`
- `src/features/ai-generation/useAiWordGeneration.jsx`
- `src/features/ai-generation/WordGenerationForm.jsx`
- `src/features/ai-generation/GeneratedWordsDisplay.jsx`
- `src/features/ai-generation/WordTranslationRow.jsx`
- `src/features/ai-generation/WordTranslationCard.jsx`
- `src/features/ai-generation/WordInputField.jsx`

Notes:

- Rename `AiTranslationGeneratation` while moving it. The current filename has a typo.
- This feature can still depend on word-group API/types where appropriate, but its workflow should live together.

Status:

- done structurally
- typo cleanup and TypeScript conversion still pending

### `src/features/flashcards/`

- `src/features/flashcards/FlashcardMode.jsx`
- `src/features/flashcards/Flashcard.jsx`
- `src/features/flashcards/Flashcard.css`

Status:

- done structurally
- TypeScript conversion still pending

### `src/features/memory-game/`

- `src/features/memory-game/MatchingGameMode.jsx`
- `src/features/memory-game/MatchingGameCard.jsx`
- `src/features/memory-game/MatchingGameSettings.jsx`

Status:

- done structurally
- TypeScript conversion still pending

### `src/features/test-mode/`

- `src/features/test-mode/TestMode.jsx`
- `src/features/test-mode/TestSettings.jsx`
- `src/features/test-mode/TestItem.jsx`
- `src/features/test-mode/TestEndScreen.jsx`

Status:

- done structurally
- TypeScript conversion still pending

## Routing Proposal

Keep route assembly easy to find at the root:

- `src/router.(j|t)sx` defines route objects or route JSX
- `src/App.(j|t)sx` renders the router and shared top-level shell
- `src/main.(j|t)sx` mounts providers and the app
- `frontend/vite.config.ts` handles frontend build config and alias resolution

This keeps default React/Vite entry files where most developers expect them.

## Shared vs Feature Decision Rule

Before moving a file to a root-level shared folder, check:

1. Is it used by more than one feature today
2. Is it still generic after removing feature-specific assumptions
3. Would another feature naturally look for it in a shared place

If the answer is not clearly yes, keep it in the feature folder.

## Remaining Work

The main migration work still left is:

1. Convert remaining `.js/.jsx` files to `.ts/.tsx` intentionally
2. Reuse real domain types instead of introducing `any` or duplicated local shapes
3. Decide on final naming cleanup where it adds value
4. Delete legacy code that is no longer used
5. Review remaining rough edges after the TypeScript migration

Suggested TypeScript conversion order:

1. root files: `main`, `App`, `router`
2. `providers`
3. `components`
4. `utils`
5. feature folders one feature at a time

Suggested feature order:

1. `home`
2. `word-groups`
3. `ai-generation`
4. `flashcards`
5. `memory-game`
6. `test-mode`

## Likely Cleanup During Migration

- Rename `LearnWords` to `HomePage`
- Rename `AiTranslationGeneratation` to `AiGenerationPage`
- Replace remaining `.js/.jsx` files with `.ts/.tsx`
- Move CSS files next to their feature unless they are truly global
- Revisit whether `MoveIcons` and language selection components still belong in `components/` after the migration
- Consider rewriting remaining relative imports to `@/` alias imports over time

## Probably Unused or Legacy

- `src/LearningModeSettings.jsx` looks like older UI and does not appear to match the current route flow

Recommended handling:

- verify usage before migrating
- if unused, delete instead of carrying it into the new structure
