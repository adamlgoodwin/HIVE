<!-- markdownlint-disable -->
# 🚀 HIVE Authentication & Multi-Org Roadmap

## Current Status ✅
- [x] Reusable GenericDataTable system complete
- [x] Testing framework working on Vercel
- [x] Supabase integration and RBAC service foundation
- [x] Linked-list ordering system designed
- [x] Build pipeline and deployment working

## Phase 1: Foundation Routing & Auth Context 🔧

### Step 1.1: Install React Router v6
- [ ] `npm install react-router-dom@6`
- [ ] Test: Build completes without errors

### Step 1.2: Create Auth Context
- [ ] `src/context/AuthContext.tsx`
  - Subscribe to `supabase.auth.onAuthStateChange`
  - Store: `session`, `user`, `loading`, `orgs`, `activeOrg`
  - Expose: `setActiveOrg`, `signOut`
- [ ] Test: Context provides session state correctly

### Step 1.3: Create Protected Layout
- [ ] `src/layouts/ProtectedLayout.tsx`
  - Check auth context for valid session
  - Redirect to `/login` if unauthenticated
  - Render `<Outlet />` for authenticated users
- [ ] Test: Redirects work correctly

## Phase 2: Authentication Pages 🔐

### Step 2.1: Login Page
- [ ] `src/pages/LoginPage.tsx`
  - Mantine form with email/password
  - `supabase.auth.signInWithPassword`
  - "Send Magic Link" option
  - Error handling and loading states
- [ ] Test: Can log in with valid credentials

### Step 2.2: Basic Routing Setup
- [ ] Update `src/App.tsx` with React Router
  - Route: `/login` → `<LoginPage />`
  - Route: `/*` → `<ProtectedLayout>` wrapping existing pages
- [ ] Test: Unauthenticated users see login first

### Step 2.3: Post-Login Flow
- [ ] After successful login:
  - Fetch user organizations via `rbacService.getProfileWithRoles`
  - Set default `activeOrg` (first org or null)
  - Redirect to dashboard
- [ ] Test: Login flow completes and shows dashboard

## Phase 3: Organization Management 🏢

### Step 3.1: Organization Context
- [ ] Extend AuthContext with org management
- [ ] Load user's organizations on login
- [ ] Handle users with no organizations gracefully
- [ ] Test: Org data loads correctly

### Step 3.2: Organization Switcher
- [ ] Add `<Select>` component to navigation bar
- [ ] Bind to `activeOrg` from context
- [ ] Style to match existing navigation
- [ ] Test: Switching orgs updates context

### Step 3.3: Data Service Integration
- [ ] Update course data services to accept `orgId` parameter
- [ ] Filter courses by active organization
- [ ] Handle "personal" courses (no org affiliation)
- [ ] Test: Table data respects org boundaries

## Phase 4: Enhanced Auth Features 🌟

### Step 4.1: Self-Registration (Optional)
- [ ] `src/pages/SignupPage.tsx`
- [ ] Route: `/signup`
- [ ] `supabase.auth.signUp` with email verification
- [ ] Test: New users can create accounts

### Step 4.2: User Profile Management
- [ ] Basic profile page showing user info and orgs
- [ ] Organization membership display
- [ ] Role information from RBAC system
- [ ] Test: Profile displays correct information

### Step 4.3: Invitation System
- [ ] Admin interface for inviting users to organizations
- [ ] Email invitation flow
- [ ] Accept/decline invitation process
- [ ] Test: Invitation workflow works end-to-end

## Phase 5: Multi-Tenant Polish 🎨

### Step 5.1: Permission-Based UI
- [ ] Show/hide features based on user roles
- [ ] Integrate with existing RBAC service
- [ ] Course creation permissions
- [ ] Test: UI respects user permissions

### Step 5.2: Organization-Scoped Features
- [ ] Organization settings/preferences
- [ ] Org-specific course templates
- [ ] Bulk course operations per org
- [ ] Test: Features work within org boundaries

### Step 5.3: Navigation Cleanup
- [ ] Remove old `window.history.pushState` from DevNavigation
- [ ] Convert all navigation to React Router Links
- [ ] Add breadcrumbs for nested pages
- [ ] Test: All navigation uses proper routing

## Success Criteria 🎯

### Must Have:
- ✅ Login required before accessing app
- ✅ Users can belong to multiple organizations
- ✅ Course data scoped to active organization
- ✅ Seamless organization switching
- ✅ Self-registration and admin invitations both work

### Nice to Have:
- 🎯 Magic link authentication
- 🎯 OAuth providers (Google, etc.)
- 🎯 Advanced permission management UI
- 🎯 Organization analytics/reporting

## Testing Strategy 🧪

Each step includes specific tests to ensure:
1. **Incremental progress** - Each step builds on the previous
2. **No regressions** - Existing features continue working
3. **Clear validation** - Easy to verify step completion
4. **Rollback safety** - Can revert if issues arise

## Technical Notes 📝

- **Why React Router v6**: Industry standard, handles edge cases, future-proof
- **Why Auth Context**: Single source of truth, cleaner than prop drilling
- **Why Protected Layout**: Clean separation, easy to test, reusable pattern
- **Why Incremental**: Each step is deployable and testable independently
