# UI/UX Improvements & Recommendations

**Generated:** July 10, 2026  
**Purpose:** Comprehensive list of UI improvements needed across the Noir Wallet app

---

## 🔴 Critical Issues (Fix First)

### 1. **Inconsistent Background Colors**
- **Issue:** Mixed use of `Colors.black` vs `Colors.surfaceBg`
- **Impact:** Visual inconsistency across screens
- **Files affected:** 
  - `ReceiveScreen.tsx` uses `Colors.black`
  - Should use `Colors.surfaceBg` (#0A0A0A) throughout
- **Fix:** Global find/replace `backgroundColor: Colors.black` → `backgroundColor: Colors.surfaceBg`

### 2. **TransactionItem Needs Design Token Integration**
- **Issue:** Still using old color syntax (`+ '20'` for opacity)
- **Impact:** Not using centralized design system
- **Fix:** 
  - Import `colorWithOpacity` from designTokens
  - Replace `config.color + '20'` with `colorWithOpacity(config.color, 0.15)`
  - Add proper spacing, touch targets, accessibility

### 3. **NumericKeypad Missing Haptic Feedback**
- **Issue:** No tactile feedback when pressing keys
- **Impact:** Poor UX, feels unresponsive
- **Fix:** Add `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on key press

### 4. **SearchBar Missing Accessibility**
- **Issue:** No accessibility labels or roles
- **Impact:** Poor screen reader support
- **Fix:** Add `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`

---

## 🟡 High Priority (Important for UX)

### 5. **EmptyState Component Too Generic**
- **Issue:** Icon size (28px) too small, lacks visual impact
- **Impact:** Empty states don't feel polished
- **Improvements:**
  - Increase icon size to 48-64px
  - Use design tokens consistently
  - Add optional action button prop
  - Better color contrast for icon
  - Add test IDs

### 6. **Receive Screen Layout Issues**
- **Problems:**
  - QR code section not centered properly
  - Asset chips could be more prominent
  - Balance card feels disconnected
  - Missing haptic feedback on interactions
- **Improvements:**
  - Better vertical spacing
  - Larger touch targets for asset chips (44px min)
  - Add haptic feedback to copy/share buttons
  - Use design tokens for shadows
  - Add skeleton loader while QR generates

### 7. **Send Screen Needs Complete Redesign**
- **Critical Issues:**
  - Multi-step flow is confusing
  - No visual progress indicator
  - Amount input could be more prominent
  - Insufficient feedback for errors
- **Improvements:**
  - Add step indicator (1/3, 2/3, 3/3)
  - Larger amount display during entry
  - Inline validation with helpful messages
  - Preview card before confirmation
  - Better error recovery flow

### 8. **NumericKeypad Visual Improvements**
- **Issues:**
  - Keys feel flat, no depth
  - "C" button unclear (use "Clear" or icon)
  - No visual feedback on press beyond opacity
- **Improvements:**
  - Add subtle shadow to keys
  - Scale animation on press
  - Better visual hierarchy (0 key larger?)
  - Consider making it a grid instead of 4 rows
  - Add haptic feedback

---

## 🟢 Medium Priority (Polish & Consistency)

### 9. **Transaction Item Enhancements**
- **Improvements Needed:**
  - Add swipe actions (view details, share, copy hash)
  - Make entire item tappable to view details
  - Add haptic feedback on tap
  - Better status indicators (animated pending?)
  - Group by date with section headers
  - Add skeleton loaders
  - Show network fee if available

### 10. **Global Navigation Improvements**
- **Issues:**
  - Inconsistent header styles across screens
  - Back buttons vary in style
  - No navigation breadcrumbs in deep flows
- **Fix:**
  - Create standardized `ScreenHeader` component
  - Consistent back button behavior
  - Add screen titles to headers
  - Proper animation transitions

### 11. **Better Loading States**
- **Missing:**
  - Skeleton loaders for balance card
  - Loading states for transaction list
  - Pull-to-refresh on more screens
  - Shimmer effect on loading cards
- **Add to:**
  - Transaction History
  - Device List
  - Profile Screen
  - Agent screens

### 12. **Consistent Card Styling**
- **Issue:** Cards have varying padding, shadows, borders
- **Fix:**
  - All cards should use `DesignTokens.shadows.card`
  - Consistent padding: `Spacing.lg` (24px)
  - Consistent border: 1px `Colors.borderGrey`
  - Consistent radius: `BorderRadius.lg` (16px)

---

## 🔵 Low Priority (Nice to Have)

### 13. **Animation Enhancements**
- **Add:**
  - Slide-in animations for transaction items
  - Fade transitions between screens
  - Micro-interactions on buttons
  - Loading spinners with branded colors
  - Success/error animations with icons

### 14. **Dashboard Improvements**
- **Enhancements:**
  - Add transaction filters (all, sent, received)
  - Quick action shortcuts could pulse on first visit
  - Recent transactions could have "Load More" button
  - Add spending summary card (daily/weekly)
  - Swipe gestures between sections

### 15. **Dark Mode Refinements**
- **Issues:**
  - Some text slightly too dim
  - Card borders could be more subtle
  - Gold accent could be warmer in some contexts
- **Fine-tuning:**
  - Increase contrast for secondary text
  - Experiment with border opacity
  - Test gold in different lighting conditions

### 16. **Typography Consistency**
- **Audit Needed:**
  - Some screens still use hardcoded font sizes
  - Letter spacing not consistent on uppercase labels
  - Line heights vary
- **Fix:**
  - Replace all hardcoded sizes with `FontSize.*`
  - Add `letterSpacing: DesignTokens.typography.letterSpacing.wider` to all uppercase text
  - Use consistent line heights

### 17. **Accessibility Audit**
- **Missing:**
  - Accessibility labels on many images/icons
  - Focus indicators for keyboard navigation (web)
  - Screen reader announcements for dynamic content
  - Reduced motion support
  - High contrast mode
- **Add:**
  - Comprehensive `accessibilityLabel` on all interactive elements
  - `accessibilityHint` for complex interactions
  - `accessibilityLiveRegion` for status updates
  - Test with VoiceOver/TalkBack

---

## 🎨 Component-Specific Issues

### 18. **Button Component**
- ✅ Already improved with haptics and animations
- **Minor:** Could add loading state with spinner
- **Minor:** Icon positioning could be more flexible

### 19. **Toast Component**
- ✅ Already improved with haptics
- **Minor:** Add action button support (e.g., "Undo")
- **Minor:** Support for custom duration per type

### 20. **BalanceCard Component**
- ✅ Already improved
- **Enhancement:** Add sparkline/chart showing balance trend
- **Enhancement:** Tap to toggle between PHP/USD
- **Enhancement:** Skeleton loader while fetching

### 21. **ReadyToTapIndicator**
- ✅ Already improved with states
- **Enhancement:** Add sound effect option (subtle beep on success)
- **Enhancement:** More dramatic success animation
- **Enhancement:** Show estimated time for processing

---

## 📱 Screen-Specific Issues

### 22. **Merchant POS Screen**
- ✅ Already improved
- **Enhancement:** Show last 3 transactions inline
- **Enhancement:** Add quick amount buttons (₱50, ₱100, ₱500)
- **Enhancement:** Sound effects for success/error
- **Enhancement:** Printer receipt option

### 23. **Dashboard Screen**
- ✅ Already improved
- **Enhancement:** Pull-down to reveal profile/settings
- **Enhancement:** Customizable quick actions
- **Enhancement:** Wallet cards could be reorderable
- **Enhancement:** Add "Pay" shortcut if NFC device detected

### 24. **Profile Screen**
- **Issues:**
  - Needs consistency with new design system
  - Avatar could be larger and customizable
  - Settings items need better hierarchy
- **Fix:** Refactor to use design tokens throughout

### 25. **Transaction Detail Screen**
- **Issues:**
  - Too much information cramped
  - No visual hierarchy
  - Missing context actions (share, copy hash)
- **Improvements:**
  - Hero amount at top
  - Collapsible technical details
  - Map view if location available
  - Share receipt button
  - Add to calendar option

### 26. **Settings/Security Screen**
- **Issues:**
  - List items too close together
  - Toggle switches inconsistent
  - No visual feedback on changes
- **Improvements:**
  - Better grouping with section headers
  - Consistent spacing (min 56px height per item)
  - Toast notifications on setting changes
  - Confirmation dialogs for destructive actions

---

## 🧩 New Components Needed

### 27. **ScreenHeader Component**
```typescript
interface ScreenHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: ReactNode
  variant?: 'default' | 'large' | 'minimal'
}
```
- Standardized header across all screens
- Consistent back button behavior
- Optional actions on right side

### 28. **ProgressIndicator Component**
- For multi-step flows (Send, Receive, Onboarding)
- Shows current step and total steps
- Animated transitions between steps

### 29. **AmountInput Component**
- Specialized input for currency amounts
- Large, prominent display
- Built-in validation
- Auto-formatting
- Haptic feedback

### 30. **ActionSheet Component**
- Bottom sheet for contextual actions
- Smooth animations
- Backdrop dimming
- Swipe to dismiss

### 31. **SkeletonLoader Component**
- Reusable loading placeholders
- Matches actual content dimensions
- Subtle pulse animation
- Use throughout app

---

## 🔧 Technical Improvements

### 32. **Performance Optimizations**
- **Issues:**
  - Large transaction lists could be slow
  - Heavy animations might affect older devices
- **Solutions:**
  - Virtualize transaction lists (FlatList with optimization)
  - Lazy load images and heavy components
  - Memoize expensive calculations
  - Use `useCallback` for animation callbacks

### 33. **Error Handling**
- **Missing:**
  - Error boundaries for crash recovery
  - Offline mode indicators
  - Retry mechanisms
  - Helpful error messages
- **Add:**
  - Global error boundary with friendly UI
  - Network status banner
  - Automatic retry for failed requests
  - Context-specific error messages

### 34. **Testing & Debugging**
- **Add:**
  - `testID` props to all interactive elements
  - Storybook for component development
  - Visual regression tests
  - Accessibility tests
  - Performance monitoring

---

## 🎯 Quick Wins (Easy, High Impact)

### Priority Order for Implementation:

1. **Fix all background colors** (5 min) - Consistency
2. **Add haptic feedback to NumericKeypad** (10 min) - Feel
3. **Update TransactionItem with design tokens** (20 min) - Consistency
4. **Add accessibility labels to SearchBar** (10 min) - A11y
5. **Improve EmptyState component** (20 min) - Polish
6. **Add pull-to-refresh to transaction screens** (15 min) - UX
7. **Add loading skeletons to BalanceCard** (30 min) - Polish
8. **Standardize card shadows and borders** (30 min) - Consistency
9. **Add haptic to all button interactions** (15 min) - Feel
10. **Create ScreenHeader component** (45 min) - Reusability

---

## 📊 Metrics to Track

After implementing improvements:

- **User Satisfaction:** NPS score
- **Performance:** Time to interactive, FPS during animations
- **Accessibility:** Screen reader success rate
- **Engagement:** Daily active users, session duration
- **Errors:** Crash rate, failed transactions
- **Completion:** Success rate for send/receive flows

---

## 🎨 Design System Maturity Checklist

- [x] Centralized design tokens
- [x] Typography system
- [x] Color system with semantic colors
- [x] Spacing system
- [x] Component library basics (Button, Card, Toast)
- [ ] Complete component library (all screens)
- [ ] Storybook documentation
- [ ] Accessibility guidelines documented
- [ ] Animation library
- [ ] Icon system standardized
- [ ] Illustration style guide
- [ ] Empty state patterns
- [ ] Error state patterns
- [ ] Loading state patterns

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Fix critical issues (#1-4)
- Implement quick wins
- Update all screens to use design tokens

### Phase 2: Components (Week 2)
- Build missing components (#27-31)
- Update existing components
- Add comprehensive accessibility

### Phase 3: Screens (Week 3-4)
- Refactor all screens with new components
- Add animations and micro-interactions
- Implement loading and error states

### Phase 4: Polish (Week 5)
- Performance optimization
- Animation refinements
- Accessibility audit
- User testing and iteration

### Phase 5: Documentation (Week 6)
- Storybook for all components
- Design system documentation
- Developer guidelines
- Handoff to team

---

## 💡 Additional Considerations

### Internationalization (i18n)
- All hardcoded strings should be externalized
- Support for right-to-left (RTL) languages
- Currency formatting based on locale
- Date/time formatting

### Platform-Specific Considerations
- iOS: Native blur effects, haptics
- Android: Material ripple effects, different haptics
- Web: Keyboard navigation, mouse hover states

### Future Features
- Dark mode toggle (currently always dark)
- Custom themes
- Widget support
- Watch app companion
- Tablet/iPad optimization

---

**Total Issues Identified:** 34  
**Critical:** 4  
**High Priority:** 4  
**Medium Priority:** 8  
**Low Priority:** 8  
**Component-Specific:** 4  
**Screen-Specific:** 5  
**New Components:** 5  
**Technical:** 3

**Estimated Total Implementation Time:** 4-6 weeks  
**Quick Wins Time:** 4-6 hours
