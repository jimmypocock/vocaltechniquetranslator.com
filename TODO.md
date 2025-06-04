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
- **Logic**: Logic and translations
- **Monetization**: Revenue generation
- **Documentation**: Guides and explanations

---

## TODOs by Priority

### P0 - Critical

- [ ] **[Monetization]** Review ADSENSE_RECOMMENDATIONS.md doc and finish building site to get approved by Google. `[VTT-046]`
- [ ] **[Features]** Use Canva to come up with a full brand kit for Vocal Technique Translator. `[VTT-040]`
- [x] **[Features]** Contruct full lyrical logic for redeployment. `[VTT-039]` ✓ 2025-05-31
- [x] **[Features]** Add basic keyboard shortcuts (spacebar for play/pause, R for repeat) `[VTT-014]` ✓ 2025-05-31
- [x] **[UI/UX]** Improve button contrast and size to 44px minimum touch targets `[VTT-013]` ✓ 2025-05-31
- [x] **[UI/UX]** Add dark mode toggle `[VTT-011]` ✓ 2025-05-31
- [x] **[UI/UX]** Make font size and type more legible `[VTT-001]` ✓ 2025-05-31
- [x] **[UI/UX]** Structure words so they're easier to read `[VTT-002]` ✓ 2025-05-31
- [x] **[Features]** Add a copy button to the generated text `[VTT-003]` ✓ 2025-05-31

### P1 - Important

- [x] **[Logic]** Translate: well `[VTT-045]` ✓ 2025-05-31
- [x] **[Logic]** Translate: this `[VTT-044]` ✓ 2025-05-31
- [x] **[Logic]** Translate: city `[VTT-043]` ✓ 2025-05-31
- [x] **[Logic]** Translate: forever `[VTT-042]` ✓ 2025-05-31
- [x] **[Logic]** Translate: lonely `[VTT-041]` ✓ 2025-05-30

#### Local Storage Enhancements

- [x] **[Features]** Save and restore theme preference (dark/light mode) in local storage `[VTT-047]` ✓ 2025-06-04
- [x] **[Features]** Save and restore intensity level setting in local storage `[VTT-048]` ✓ 2025-06-04
- [x] **[Features]** Save and restore most recent lyrics in local storage `[VTT-049]` ✓ 2025-06-04
- [x] **[Features]** Implement favorites system with add/remove/view functionality `[VTT-050]` ✓ 2025-06-04
- [x] **[Features]** Save view preferences (single vs side-by-side) in local storage `[VTT-051]` ✓ 2025-06-04
- [x] **[Features]** Add lyrics history (last 5-10 entries) with quick access `[VTT-052]` ✓ 2025-06-04
- [x] **[Features]** Add randomize lyrics feature from LYRICS.md `[VTT-053]` ✓ 2025-06-04
- [x] **[UI/UX]** Improve favorites UX - move button to output section, persist state, show intensity labels `[VTT-054]` ✓ 2025-06-04

#### Content & Documentation for AdSense Approval

- [ ] **[Documentation]** Create an About page explaining the tool's purpose and creator background `[VTT-032]`
- [x] **[Documentation]** Create a detailed "How to Use" guide with screenshots/examples `[VTT-033]`
- [ ] **[Documentation]** Write 3-5 blog articles about vocal techniques (can use AI assistance) `[VTT-034]`
- [ ] **[Documentation]** Create an FAQ section about vocal techniques and the tool `[VTT-035]`
- [x] **[Monetization]** Create a sitemap.xml and submit to Google Search Console `[VTT-036]` ✓ 2025-05-31
- [ ] **[Monetization]** Reach out to music educators/vocal coaches for testimonials `[VTT-037]`
- [ ] **[Monetization]** Get backlinks from music/education sites (reach out to contacts) `[VTT-038]`

- [x] **[Features]** Allow users to adjust size of text areas `[VTT-026]` ✓ 2025-05-31
- [ ] **[Features]** Add visual progress tracking with practice streaks `[VTT-018]`
- [ ] **[Features]** Implement simple favorites system using local storage `[VTT-017]`
- [ ] **[UI/UX]** Add print-friendly CSS styles `[VTT-015]`
- [ ] **[Infrastructure]** Create a mobile app for VTT with React Native `[VTT-010]`
- [ ] **[Infrastructure]** Create a deployment pipeline from a specific branch in GH `[VTT-004]`
- [x] **[Documentation]** Create a "how it works" page instead of the thing at the bottom `[VTT-005]` ✓ Covered by VTT-033
- [ ] **[UI/UX]** Take the logos you made and see if AI can make them prettier, then add to site UI `[VTT-006]`

#### AdSense Setup Tasks

- [x] **[Monetization]** Create AdSense account and submit site for review `[VTT-027]` ✓ 2025-05-31
- [ ] **[Monetization]** Create ad units in AdSense dashboard (Header, Content, Footer) `[VTT-028]`
- [ ] **[Monetization]** Update .env with AdSense publisher ID and ad slot IDs `[VTT-029]`
- [x] **[Monetization]** Deploy and test consent flow in production `[VTT-030]` ✓ 2025-05-31
- [ ] **[Monetization]** Monitor AdSense performance and optimize placements `[VTT-031]`

### P2 - Nice to Have

- [ ] **[Features]** Add simple waveform visualization during recording `[VTT-025]`
- [ ] **[Infrastructure]** Add Progressive Web App functionality `[VTT-024]`
- [ ] **[Features]** Implement language-specific IPA filtering `[VTT-023]`
- [ ] **[Features]** Add customizable practice routines with drag-and-drop interfaces `[VTT-022]`
- [ ] **[UI/UX]** Fix zoom-safe interface elements `[VTT-021]`
- [ ] **[Features]** Add quick search filters `[VTT-020]`
- [ ] **[UI/UX]** Replace generic error messages with helpful instructions `[VTT-019]`
- [x] **[Monetization]** Implement Google AdSense `[VTT-007]` ✓ Components created, waiting for account setup
- [ ] **[Features]** Create a way to submit recommendations that can be easily reviewed by Claude `[VTT-008]`

### P3 - Future

- [x] **[Infrastructure]** Create a starter template out of Vocal Translator to make it simple to deploy front end apps to s3/cf/l@e in the future on AWS with the CDK `[VTT-009]` ✓ 2025-05-31

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
