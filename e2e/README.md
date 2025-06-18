# E2E Tests for Vocal Technique Translator

This directory contains end-to-end tests using Playwright to ensure the application works correctly from a user's perspective.

## Test Structure

```
e2e/
├── fixtures/          # Custom test fixtures and setup
├── pages/            # Page Object Models
├── tests/            # Test specifications
├── utils/            # Helper functions and utilities
└── screenshots/      # Screenshots from failed tests (gitignored)
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e tests/basic-transformation.spec.ts

# Run tests in debug mode
npm run test:e2e -- --debug

# Run tests with specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run mobile tests only
npm run test:e2e -- --grep "Mobile"
```

## Test Coverage

### Critical User Flows Tested:

1. **Basic Transformation Flow** (`basic-transformation.spec.ts`)
   - Enter lyrics and translate
   - Change intensity levels
   - Handle multi-line content
   - Clear functionality
   - Load example lyrics
   - Special characters handling

2. **Keyboard Navigation** (`keyboard-navigation.spec.ts`)
   - Keyboard shortcuts modal
   - Intensity shortcuts (1-9, 0)
   - Arrow key navigation
   - Copy shortcuts (Ctrl/Cmd+C)
   - View toggle (V key)
   - Clear (Escape)
   - Tab navigation

3. **Local Storage Persistence** (`local-storage.spec.ts`)
   - Persist lyrics
   - Persist intensity settings
   - Persist view mode
   - Multi-tab synchronization
   - Storage quota handling

4. **View Mode Switching** (`view-mode-switching.spec.ts`)
   - Toggle between full/condensed view
   - Maintain view during intensity changes
   - Copy different content per view
   - Multi-line content handling

5. **Feedback Submission** (`feedback-submission.spec.ts`)
   - Modal open/close
   - Form validation
   - Successful submission
   - Anonymous feedback
   - Error handling
   - Loading states

6. **Copy Functionality** (`copy-functionality.spec.ts`)
   - Copy to clipboard
   - Visual feedback
   - View-dependent content
   - Multi-line formatting
   - Keyboard shortcuts
   - Special characters

7. **Mobile Responsiveness** (`mobile-responsiveness.spec.ts`)
   - Multiple device testing
   - Touch interactions
   - Orientation changes
   - Virtual keyboard
   - Performance on mobile
   - Offline functionality

## Page Objects

- **HomePage**: Main application interface
- **FeedbackModal**: Feedback submission modal
- **KeyboardShortcutsModal**: Keyboard shortcuts help modal

## Best Practices

1. **Use Page Objects**: All element selectors and page interactions should be in page objects
2. **Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Independent Tests**: Each test should be able to run independently
4. **Proper Cleanup**: Tests should clean up after themselves
5. **Wait for Elements**: Always wait for elements/actions to complete
6. **Error Screenshots**: Failed tests automatically capture screenshots

## Debugging

```bash
# Run with Playwright Inspector
npx playwright test --debug

# Run with UI mode
npx playwright test --ui

# Generate test code
npx playwright codegen localhost:3000
```

## CI/CD Integration

Tests are configured to run in CI with:
- Headless mode
- Retry on failure (2 attempts)
- Parallel execution disabled
- HTML report generation

## Maintenance

- Update selectors in page objects when UI changes
- Add new test cases for new features
- Review and update mobile devices list periodically
- Monitor test execution time and optimize slow tests