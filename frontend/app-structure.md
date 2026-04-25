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

The target shape is intentionally flat:

```text
src/
  App.tsx
  main.tsx
  router.tsx
  index.css

  features/
    home/
    word-groups/
    ai-generation/
    flashcards/
    memory-game/
    test-mode/

  providers/
  components/
  hooks/
  utils/
  styles/
```

## Folder Rules

- `src/features/<feature-name>/` contains all code that mainly belongs to one feature.
- `src/components/` contains only truly shared generic components used across multiple features.
- `src/providers/` contains provider setup and provider-facing wrappers like Clerk and API/query client wiring.
- `src/utils/` contains shared pure helpers.
- `src/styles/` is optional and should only hold shared/global style files if needed later.
- Avoid adding deeper role-based nesting unless there is a strong reason.
- If a file is only used by one feature, keep it inside that feature even if it is a component, hook, helper, or CSS file.

## Target Mapping

### Root files

- `src/App.jsx` -> `src/App.tsx`
- `src/main.jsx` -> `src/main.tsx`
- create `src/router.tsx`
- `src/index.css` stays at `src/index.css`

### `src/providers/`

- `src/api/api.tsx` -> `src/providers/api-client.tsx`
- `src/Authorisation/useAppAuth.ts` -> `src/providers/use-app-auth.ts`

Notes:

- This folder is for app wiring and provider-facing integration code.
- If Clerk config currently lives in a small local module, move that here too.

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

### `src/utils/`

- `src/util/helpers.js` -> `src/utils/helpers.ts`

Notes:

- Keep this for pure shared functions such as `shuffle` and cross-feature filtering helpers.
- If a helper only belongs to one feature after refactoring, move it into that feature instead.

### `src/features/home/`

- `src/LearnWords.jsx` -> `src/features/home/HomePage.tsx`
- `src/LearnWords.css` -> `src/features/home/home.css`
- `src/LearningModeCard.jsx` -> `src/features/home/LearningModeCard.tsx`
- `src/Menu/LoggedInButtons.tsx` -> `src/features/home/LoggedInButtons.tsx`
- `src/Menu/LogInOrRegisterButtons.tsx` -> `src/features/home/LogInOrRegisterButtons.tsx`

Notes:

- The menu buttons are feature-level navigation for the current home/app shell experience, so they do not need a separate shared folder.
- If the top navigation grows into a broader app-level concern later, it can be pulled out then.

### `src/features/word-groups/`

- `src/ManageTranslations.jsx` -> `src/features/word-groups/ManageTranslationsPage.tsx`
- `src/TranslationCard.jsx` -> `src/features/word-groups/TranslationCard.tsx`
- `src/QuickAdd.jsx` -> `src/features/word-groups/QuickAdd.tsx`
- `src/AddToCollection.jsx` -> `src/features/word-groups/AddToCollection.tsx`
- `src/api/wordGroups.js` -> `src/features/word-groups/word-groups.api.ts`

Notes:

- This feature owns CRUD for user-managed word groups.
- Domain-specific normalization and request shaping for word groups should live here instead of in a generic root API folder.

### `src/features/ai-generation/`

- `src/AiTranslationGeneratation.jsx` -> `src/features/ai-generation/AiGenerationPage.tsx`
- `src/hooks/useAiWordGeneration.jsx` -> `src/features/ai-generation/useAiWordGeneration.ts`
- `src/WordGenerationForm.jsx` -> `src/features/ai-generation/WordGenerationForm.tsx`
- `src/GeneratedWordsDisplay.jsx` -> `src/features/ai-generation/GeneratedWordsDisplay.tsx`
- `src/WordTranslationRow.jsx` -> `src/features/ai-generation/WordTranslationRow.tsx`
- `src/WordTranslationCard.jsx` -> `src/features/ai-generation/WordTranslationCard.tsx`
- `src/WordInputField.jsx` -> `src/features/ai-generation/WordInputField.tsx`

Notes:

- Rename `AiTranslationGeneratation` while moving it. The current filename has a typo.
- This feature can still depend on word-group API/types where appropriate, but its workflow should live together.

### `src/features/flashcards/`

- `src/FlashcardMode.jsx` -> `src/features/flashcards/FlashcardsPage.tsx`
- `src/Flashcard.jsx` -> `src/features/flashcards/Flashcard.tsx`
- `src/Flashcard.css` -> `src/features/flashcards/flashcard.css`

### `src/features/memory-game/`

- `src/MatchingGameMode.jsx` -> `src/features/memory-game/MemoryGamePage.tsx`
- `src/MatchingGameCard.jsx` -> `src/features/memory-game/MatchingGameCard.tsx`
- `src/MatchingGameSettings.jsx` -> `src/features/memory-game/MatchingGameSettings.tsx`

### `src/features/test-mode/`

- `src/TestMode.jsx` -> `src/features/test-mode/TestModePage.tsx`
- `src/TestSettings.jsx` -> `src/features/test-mode/TestSettings.tsx`
- `src/TestItem.jsx` -> `src/features/test-mode/TestItem.tsx`
- `src/TestEndScreen.jsx` -> `src/features/test-mode/TestEndScreen.tsx`

## Routing Proposal

Keep route assembly easy to find at the root:

- `src/router.tsx` defines route objects or route JSX
- `src/App.tsx` renders the router and shared top-level shell
- `src/main.tsx` mounts providers and the app

This keeps default React/Vite entry files where most developers expect them.

## Shared vs Feature Decision Rule

Before moving a file to a root-level shared folder, check:

1. Is it used by more than one feature today
2. Is it still generic after removing feature-specific assumptions
3. Would another feature naturally look for it in a shared place

If the answer is not clearly yes, keep it in the feature folder.

## TypeScript Migration Order

Suggested order to reduce breakage:

1. Convert root entry files: `main`, `App`, `router`
2. Convert `providers`
3. Convert `components`
4. Convert `utils`
5. Convert feature folders one feature at a time

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

## Probably Unused or Legacy

- `src/LearningModeSettings.jsx` looks like older UI and does not appear to match the current route flow

Recommended handling:

- verify usage before migrating
- if unused, delete instead of carrying it into the new structure
