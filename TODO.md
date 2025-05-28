# Vocal Technique Translator - TODO List

## Priority System

- **P0**: Critical for launch/functionality
- **P1**: Important features that enhance user experience
- **P2**: Nice-to-have improvements
- **P3**: Future considerations

## Categories

- **UI/UX**: User interface and experience improvements
- **Infrastructure**: Deployment, build, and tooling
- **Features**: New functionality
- **Monetization**: Revenue generation
- **Documentation**: Guides and explanations

---

## TODOs by Priority


### P0 - Critical

- [ ] **[Features]** Add basic keyboard shortcuts (spacebar for play/pause, R for repeat) `[VTT-014]`
- [ ] **[UI/UX]** Improve button contrast and size to 44px minimum touch targets `[VTT-013]`
- [ ] **[Features]** Implement copy button for IPA transcriptions `[VTT-012]`
- [ ] **[UI/UX]** Add dark mode toggle `[VTT-011]`
- [ ] **[UI/UX]** Make font size and type more legible `[VTT-001]`
- [ ] **[UI/UX]** Structure words so they're easier to read `[VTT-002]`
- [ ] **[Features]** Add a copy button to the generated text `[VTT-003]`

### P1 - Important

- [ ] **[Features]** Allow users to adjust size of text areas `[VTT-026]`
- [ ] **[Features]** Add visual progress tracking with practice streaks `[VTT-018]`
- [ ] **[Features]** Implement simple favorites system using local storage `[VTT-017]`
- [ ] **[Features]** Add playback speed controls (0.5x to 1.25x) `[VTT-016]`
- [ ] **[UI/UX]** Add print-friendly CSS styles `[VTT-015]`
- [ ] **[Infrastructure]** Create a mobile app for VTT with React Native `[VTT-010]`
- [ ] **[Infrastructure]** Create a deployment pipeline from a specific branch in GH `[VTT-004]`
- [ ] **[Documentation]** Create a "how it works" page instead of the thing at the bottom `[VTT-005]`
- [ ] **[UI/UX]** Take the logos you made and see if AI can make them prettier, then add to site UI `[VTT-006]`

### P2 - Nice to Have

- [ ] **[Features]** Add simple waveform visualization during recording `[VTT-025]`
- [ ] **[Infrastructure]** Add Progressive Web App functionality `[VTT-024]`
- [ ] **[Features]** Implement language-specific IPA filtering `[VTT-023]`
- [ ] **[Features]** Add customizable practice routines with drag-and-drop interfaces `[VTT-022]`
- [ ] **[UI/UX]** Fix zoom-safe interface elements `[VTT-021]`
- [ ] **[Features]** Add quick search filters `[VTT-020]`
- [ ] **[UI/UX]** Replace generic error messages with helpful instructions `[VTT-019]`
- [ ] **[Monetization]** Implement Google AdSense `[VTT-007]`
- [ ] **[Features]** Create a way to submit recommendations that can be easily reviewed by Claude `[VTT-008]`

### P3 - Future

- [ ] **[Infrastructure]** Create a starter template out of Vocal Translator to make it simple to deploy front end apps to s3/cf/l@e in the future on AWS with the CDK `[VTT-009]`

---

## Implementation Order


### Phase 1: Core UX Improvements (Week 1)

1. Make font size and type more legible
2. Structure words so they're easier to read
3. Add a copy button to the generated text

### Phase 2: Polish & Documentation (Week 2)

1. Create a "how it works" page
2. Improve logo design and add to UI

### Phase 3: Infrastructure (Week 3)

1. Set up GitHub deployment pipeline

### Phase 4: Monetization & Community (Week 4)

1. Implement Google AdSense
2. Add recommendation submission feature

### Phase 5: Long-term (Future)

1. Extract reusable CDK template

---

## Notes

- Each item should be moved to "In Progress" when work begins
- Mark items complete with [x] when done
- Add completion dates for tracking
- Consider adding time estimates as work progresses
- Use the unique keys (e.g., `[VTT-001]`) to reference todos in scripts and commits

---

## How to Use the TODO System

### Available Commands

Run these commands from the project root:

```bash
# Show all todos with their current status
npm run todo

# Mark a todo as complete (use the key or a unique pattern)
npm run todo:complete VTT-001
# or
npm run todo:complete "font size"

# Mark a todo as in progress
npm run todo:progress VTT-002
# or
npm run todo:progress "Structure words"

# Add a new todo
npm run todo:add P1 Features "Add dark mode support"
```

### Todo Key Format

- Format: `[VTT-XXX]` where XXX is a three-digit number
- VTT = Vocal Technique Translator
- Numbers are assigned sequentially
- Keys make it easy to reference todos in:
  - Git commits: "Implemented VTT-001: Improved font legibility"
  - Pull requests: "This PR addresses VTT-002 and VTT-003"
  - Scripts: `npm run todo:complete VTT-001`

### Status Indicators

- `[ ]` - Pending/Not started
- `[ ] 🔄` - In progress
- `[x]` - Completed (with date)

### Best Practices

1. Always use the key when referencing a todo in commits or PRs
2. Update status immediately when starting or completing work
3. Add new todos with appropriate priority and category
4. Review and update priorities during planning sessions
