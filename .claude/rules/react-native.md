# React Native Engineering Rules

## Purpose

These rules define how Claude must design, implement, refactor, and review React Native applications.

The goal is to produce code that is:

* Maintainable
* Scalable
* Type-safe
* Testable
* Performant
* Secure
* Easy to understand
* Easy for another developer to extend

These rules apply to React Native and Expo applications using TypeScript.

---

# 1. Core Principles

Always prefer:

```text
Simple > clever
Explicit > implicit
Reusable > duplicated
Typed > untyped
Feature-oriented > file-type-oriented
Small components > giant components
Business logic outside UI > business logic inside UI
Server state separated from client state
Composition > inheritance
Consistency > unnecessary abstraction
```

Do not introduce architecture or libraries just because they are popular.

Choose the simplest architecture that can support the current application and its expected growth.

---

# 2. Project Architecture

Prefer feature-based architecture.

Recommended structure:

```text
src/
├── app/
│   ├── navigation/
│   ├── providers/
│   └── config/
│
├── components/
│   ├── ui/
│   ├── forms/
│   └── feedback/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   │
│   └── orders/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       ├── services/
│       └── types/
│
├── services/
│   ├── api/
│   ├── storage/
│   └── analytics/
│
├── hooks/
├── utils/
├── types/
└── constants/
```

Do NOT create a large global folder such as:

```text
components/
services/
hooks/
screens/
models/
```

where every feature is mixed together.

Prefer:

```text
features/products/
features/orders/
features/auth/
```

because feature ownership remains clear.

---

# 3. Components

Components must have a single responsibility.

Avoid:

```tsx
<ProductScreen />
```

containing:

* API requests
* authentication logic
* business calculations
* navigation decisions
* form validation
* large UI sections
* storage operations

A screen should primarily compose other components and connect hooks.

Prefer:

```tsx
export function ProductScreen() {
  const { products, isLoading } = useProducts()

  return (
    <Screen>
      <ProductHeader />
      <ProductList
        products={products}
        loading={isLoading}
      />
    </Screen>
  )
}
```

Business logic belongs in hooks/services:

```text
Screen
  ↓
Hook
  ↓
Service
  ↓
API
```

---

# 4. Do NOT Put Business Logic Inside Components

Never put large business logic directly inside JSX components.

Bad:

```tsx
function CheckoutScreen() {
  const total = cart.reduce(...)
  const discount = ...
  const shipping = ...
  const finalPrice = ...

  // API request
  // validation
  // storage
  // navigation
}
```

Prefer:

```text
CheckoutScreen
    ↓
useCheckout()
    ↓
checkoutService
    ↓
API
```

The component should focus on presentation and user interaction.

---

# 5. Component Size

Avoid huge components.

If a component becomes difficult to understand, split it.

For example:

```text
ProductScreen
├── ProductHeader
├── ProductImage
├── ProductInfo
├── ProductPrice
├── ProductActions
└── ProductReviews
```

Do not split components artificially just to create many files.

Extract a component when:

* It has a clear responsibility
* It is reused
* It has meaningful internal logic
* The parent component becomes difficult to read
* It represents a meaningful UI section

---

# 6. TypeScript

TypeScript is mandatory.

Use strict typing.

Prefer:

```ts
interface Product {
  id: string
  name: string
  price: number
}
```

or:

```ts
type ProductStatus = 'active' | 'inactive'
```

Avoid:

```ts
any
```

Do not use `any` to silence TypeScript errors.

If the type is genuinely unknown, use:

```ts
unknown
```

and validate/narrow it.

---

# 7. API Types

API responses must have explicit types.

Bad:

```ts
const response = await api.get('/products')
```

with no response type.

Prefer:

```ts
const response = await api.get<Product[]>('/products')
```

or:

```ts
interface ProductResponse {
  data: Product[]
  total: number
}

const response =
  await productService.getProducts()
```

Keep API request/response types close to the feature:

```text
features/products/types/
```

Do not duplicate the same API type across multiple files.

---

# 8. API Architecture

Do not call APIs directly from UI components.

Bad:

```tsx
useEffect(() => {
  axios.get('/products')
}, [])
```

Prefer:

```text
Component
    ↓
useProducts()
    ↓
productService
    ↓
apiClient
    ↓
Backend
```

Example:

```ts
// product.service.ts

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products')
    return response.data
  },
}
```

Then:

```ts
// use-products.ts

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts,
  })
}
```

---

# 9. Server State vs Client State

Keep server state and client state separate.

Server state includes:

* Products
* Orders
* Users
* Categories
* Notifications from backend
* API data

Client state includes:

* Modal visibility
* Selected tab
* Temporary form state
* UI preferences
* Local interaction state

Do not put API data into global state unnecessarily.

Prefer TanStack Query for server state when the project uses it.

Example:

```ts
useQuery({
  queryKey: ['products'],
  queryFn: productService.getProducts,
})
```

Use a global state library such as Zustand/Redux only when state genuinely needs to be shared.

Do not introduce Redux/Zustand for simple local state.

---

# 10. Local State

Use local state when only one component needs the state.

Prefer:

```tsx
const [isOpen, setIsOpen] = useState(false)
```

instead of creating global state for:

```text
modal visibility
selected item
input value
temporary UI state
expanded/collapsed state
```

Global state should solve a real problem.

---

# 11. Custom Hooks

Use custom hooks to encapsulate reusable behavior.

Good:

```text
useAuth()
useProducts()
useOrders()
useDebounce()
usePermissions()
useNetworkStatus()
```

A hook should not become a dumping ground.

Avoid:

```text
useEverything()
useAppLogic()
useCommonStuff()
```

Prefer several focused hooks.

---

# 12. Navigation

Navigation configuration must be centralized.

Do not scatter navigation definitions throughout components.

Prefer:

```text
src/app/navigation/
├── RootNavigator.tsx
├── AuthNavigator.tsx
├── MainNavigator.tsx
├── TabNavigator.tsx
└── types.ts
```

Navigation types must be strongly typed.

Avoid:

```ts
navigation.navigate('Product', {
  id: something,
})
```

when route parameters are not type checked.

Define route types explicitly.

---

# 13. Navigation Rules

Do not put business decisions throughout UI components.

Bad:

```tsx
if (!user) {
  navigation.navigate('Login')
}

if (!user.isVerified) {
  navigation.navigate('Verify')
}
```

Prefer centralized authentication/navigation guards.

Navigation should answer:

```text
Where should the user go?
```

Business services should answer:

```text
Is the user allowed to perform this action?
```

---

# 14. Forms

Do not put complex form logic directly inside screens.

For complex forms use a form library such as React Hook Form when appropriate.

Keep:

```text
validation
default values
submission
error handling
```

separate from UI layout.

Prefer schema validation with Zod when the project already uses it.

Example:

```text
LoginScreen
    ↓
useLoginForm()
    ↓
loginSchema
    ↓
authService
```

---

# 15. Performance

Performance must be considered when building UI, especially lists and media-heavy screens.

For long lists:

Prefer:

```tsx
FlatList
```

or:

```tsx
FlashList
```

instead of:

```tsx
ScrollView
```

with hundreds of elements.

Always provide stable keys.

Prefer:

```tsx
keyExtractor={(item) => item.id}
```

Avoid array index keys when stable IDs exist.

---

# 16. List Performance

For expensive list items:

```tsx
const ProductItem = React.memo(function ProductItem() {
  ...
})
```

Use memoization only when it solves an actual rendering problem.

Do NOT blindly add:

```ts
useMemo()
useCallback()
React.memo()
```

everywhere.

First understand whether there is actually an expensive computation or unnecessary render.

---

# 17. Images

Optimize images.

Prefer appropriate image sizes rather than loading huge originals.

For Expo projects, use optimized image tooling such as:

```text
expo-image
```

when appropriate.

Avoid rendering hundreds of full-resolution images simultaneously.

Use:

* caching
* proper dimensions
* thumbnails
* lazy loading where appropriate

---

# 18. Avoid Unnecessary Re-renders

Watch for:

* Large contexts
* Frequently changing global state
* Inline object creation
* Inline functions passed to many expensive children
* Unnecessary state updates
* Large parent components

Do not optimize prematurely.

Measure first when possible.

Use React DevTools profiling for difficult performance problems.

---

# 19. Hermes

For modern React Native/Expo applications, prefer Hermes for production builds unless there is a specific compatibility reason not to use it.

Do not disable Hermes without understanding the reason.

---

# 20. Security

Never store sensitive credentials in plain AsyncStorage.

Do not store:

```text
JWT refresh tokens
private keys
API secrets
passwords
sensitive authentication credentials
```

in ordinary unencrypted storage.

For Expo:

```text
expo-secure-store
```

is preferred for sensitive local credentials.

For bare React Native, use an appropriate secure keychain/keystore solution.

---

# 21. Never Hardcode Secrets

Never write:

```ts
const API_KEY = 'abc123'
```

or:

```ts
const JWT_SECRET = 'secret'
```

inside application source code.

Use environment configuration and platform/build secrets.

Remember:

> Client-side environment variables are NOT automatically secret.

Anything bundled into a mobile application can potentially be extracted.

Only put public configuration in the client.

---

# 22. HTTPS

Production API communication must use HTTPS.

Do not introduce:

```text
http://api.production.com
```

for production traffic.

Development HTTP is acceptable when intentionally running a local development server.

---

# 23. Authentication

Authentication must have a clear separation:

```text
UI
 ↓
Auth Hook
 ↓
Auth Service
 ↓
API
 ↓
Backend
```

The UI should not manually manage token refresh logic.

Centralize:

* access token handling
* refresh token handling
* logout
* session restoration
* authentication errors
* unauthorized responses

---

# 24. API Error Handling

Do not handle every API error independently in every component.

Centralize common API behavior.

Example:

```text
apiClient
├── request
├── authentication
├── refresh token
├── error normalization
└── response handling
```

Components should receive meaningful errors:

```ts
{
  message: 'Unable to load products'
}
```

rather than raw Axios/fetch errors everywhere.

---

# 25. Loading and Error States

Every asynchronous screen should consider:

```text
Loading
Success
Empty
Error
Retry
```

Do not only implement the successful state.

Example:

```tsx
if (isLoading) {
  return <ProductSkeleton />
}

if (isError) {
  return <ErrorState onRetry={refetch} />
}

if (products.length === 0) {
  return <EmptyState />
}

return <ProductList products={products} />
```

---

# 26. Offline and Network Resilience

Mobile networks are unreliable.

For important applications consider:

* request retries
* caching
* stale data handling
* network status
* optimistic updates where appropriate
* offline queues where required

Do not blindly retry every request.

Never automatically retry operations that may create duplicate transactions unless the API supports idempotency.

---

# 27. Testing

Use multiple testing levels.

### Unit Tests

Test:

```text
utilities
validation
business calculations
formatters
pure functions
```

### Component Tests

Test:

```text
rendering
user interaction
form behavior
loading/error states
```

### Integration Tests

Test interactions between:

```text
components
hooks
services
state
API mocks
```

### E2E Tests

Focus on critical user journeys:

```text
Login
Registration
Checkout
Payment
Order creation
Critical workflows
```

Do not write E2E tests for every tiny component.

---

# 28. Test Behavior, Not Implementation

Prefer:

```text
"The user can submit the login form"
```

over:

```text
"setLoading() was called exactly once"
```

Tests should survive internal refactoring.

---

# 29. CI/CD

Before merging production code, automatically run:

```text
TypeScript
Lint
Unit tests
Component tests
Build
```

For production applications, consider:

```text
E2E tests
Expo/EAS build
Release validation
```

Never commit:

```text
API secrets
private keys
signing credentials
.env files containing secrets
```

---

# 30. Environment Configuration

Separate environments:

```text
development
staging
production
```

Example:

```text
.env.development
.env.staging
.env.production
```

Do not mix development URLs with production configuration.

---

# 31. Cross-Platform Code

Prefer shared code.

Only introduce platform-specific code when necessary.

Prefer:

```ts
Platform.select({
  ios: ...,
  android: ...,
})
```

for small differences.

For larger differences:

```text
Component.ios.tsx
Component.android.tsx
Component.web.tsx
```

Avoid spreading platform checks everywhere.

Instead:

```text
UI
 ↓
Platform abstraction
 ↓
Native implementation
```

---

# 32. Real Device Testing

Do not rely exclusively on simulators/emulators.

Important features should be tested on real devices when possible.

Especially test:

* Camera
* GPS
* Notifications
* Biometrics
* File uploads
* Permissions
* Bluetooth
* Deep links
* Background behavior
* Performance

---

# 33. Folder Naming

Use predictable naming.

Prefer:

```text
product.service.ts
product.types.ts
product.hooks.ts
ProductCard.tsx
ProductScreen.tsx
useProducts.ts
```

Avoid meaningless names:

```text
helper.ts
common.ts
stuff.ts
misc.ts
temp.ts
```

Files should communicate their responsibility.

---

# 34. Avoid God Files

Never create files such as:

```text
utils.ts        // 1,500 lines
api.ts          // every API endpoint
hooks.ts        // every hook
components.tsx  // every component
store.ts        // entire application state
```

Split code according to responsibility.

---

# 35. Reusable UI

Reusable UI belongs in:

```text
components/ui/
```

Examples:

```text
Button
Input
Text
Card
Modal
Badge
Avatar
Loading
EmptyState
ErrorState
```

Feature-specific UI belongs inside the feature:

```text
features/products/components/ProductCard.tsx
```

Do not put every component into the global UI directory.

---

# 36. Design System

Do not hardcode visual values everywhere.

Prefer centralized:

```text
colors
spacing
typography
radius
shadows
sizes
```

Example:

```ts
theme.spacing.md
theme.colors.primary
theme.typography.body
```

Follow the existing project's design system instead of creating a second one.

---

# 37. Styling

Keep styling readable and consistent.

Do not create extremely large inline style objects inside JSX.

Prefer:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
```

or the project's established styling system.

Do not introduce Tailwind, NativeWind, styled-components, or another styling framework if the project already has a working styling architecture unless explicitly requested.

---

# 38. Accessibility

Interactive UI should consider accessibility.

Use:

```text
accessibilityLabel
accessibilityRole
accessibilityHint
```

where appropriate.

Buttons should be understandable by screen readers.

Do not use icons alone for important actions without accessible labels.

---

# 39. Navigation and Deep Links

Design navigation so deep linking can be introduced without rewriting the application.

Route definitions should be centralized and typed.

Avoid navigation strings scattered across hundreds of files.

Prefer shared route constants/types.

---

# 40. Dependency Management

Before installing a package, ask:

1. Do we actually need it?
2. Does the existing project already solve this?
3. Is the package actively maintained?
4. Does it support the project's Expo/React Native version?
5. Does it increase bundle size?
6. Does it require native configuration?
7. Is there a simpler built-in solution?

Do not install libraries for trivial problems.

---

# 41. Existing Project Rules

Before modifying an existing project:

1. Inspect the current architecture.
2. Inspect package.json.
3. Inspect navigation.
4. Inspect state management.
5. Inspect API client.
6. Inspect styling system.
7. Inspect reusable components.
8. Follow existing conventions.

Do not replace architecture simply because another architecture is preferred.

Preserve working patterns unless there is a clear reason to change them.

---

# 42. Do Not Rewrite Working Code

When fixing a bug:

Prefer:

```text
smallest safe change
```

over:

```text
rewrite the entire feature
```

Do not:

* rewrite unrelated files
* replace libraries unnecessarily
* change navigation architecture without approval
* change API contracts without approval
* redesign UI while fixing logic
* refactor unrelated code

Keep the change focused.

---

# 43. Before Creating New Code

Claude should first search the existing codebase for:

```text
similar components
similar hooks
similar API services
similar types
similar screens
existing utilities
existing design patterns
```

Reuse existing abstractions when appropriate.

Do not create:

```text
NewButton
NewButton2
ProductButton
CommonButton
ReusableButton
```

if the project already has a suitable `Button`.

---

# 44. Avoid Premature Abstraction

Do not create abstractions just because two pieces of code look similar once.

Wait until a real reusable pattern exists.

Bad:

```text
GenericScreenManager
GenericDataController
UniversalFormEngine
BaseComponent
AbstractApiService
```

unless the project genuinely needs them.

Prefer simple code first.

---

# 45. Comments

Do not write comments explaining obvious code.

Bad:

```ts
// Set loading to true
setLoading(true)
```

Good comments explain:

```text
why
```

not:

```text
what
```

Example:

```ts
// Prevent duplicate checkout requests when users tap the button repeatedly.
```

---

# 46. Logging

Do not leave sensitive or noisy debugging logs in production.

Never log:

```text
passwords
JWTs
refresh tokens
API secrets
personal sensitive data
```

Use a controlled logging abstraction when the application requires production logging.

---

# 47. Error Boundaries

For important production screens, consider React Error Boundaries so an unexpected rendering error does not unnecessarily crash the entire application experience.

Provide a useful recovery UI.

---

# 48. Accessibility + UX States

Every important feature should consider:

```text
Loading
Empty
Error
Success
Disabled
Offline
Permission denied
Unauthorized
```

Do not design only for the happy path.

---

# 49. Claude Implementation Workflow

When implementing a new feature, follow this order:

```text
1. Understand the requirement
2. Inspect existing architecture
3. Identify reusable code
4. Define types
5. Define API/service layer
6. Define hooks/state
7. Build reusable components
8. Build screen
9. Connect navigation
10. Add loading/error/empty states
11. Add tests
12. Run lint/typecheck/tests
13. Review performance
14. Review security
15. Summarize changed files
```

Do not immediately start writing UI before understanding the existing architecture.

---

# 50. Claude Must Check Before Finishing

Before considering a feature complete, verify:

### Architecture

* Is business logic outside UI?
* Is the feature organized clearly?
* Are reusable components separated from feature components?

### TypeScript

* Are API responses typed?
* Are props typed?
* Is `any` avoided?
* Are route parameters typed?

### State

* Is local state local?
* Is server state handled separately?
* Is global state actually necessary?

### Performance

* Are long lists optimized?
* Are unnecessary renders avoided?
* Are images optimized?
* Are expensive calculations controlled?

### Security

* Are credentials stored securely?
* Are secrets excluded from source?
* Is production API traffic HTTPS?
* Is sensitive information excluded from logs?

### UX

* Loading state?
* Error state?
* Empty state?
* Retry?
* Disabled state?
* Accessibility?

### Testing

* Business logic tested?
* Important component interactions tested?
* Critical flows covered?

### Quality

* TypeScript passes
* ESLint passes
* Tests pass
* Build passes

---

# 51. Preferred Data Flow

For most API-driven features, prefer:

```text
                    ┌──────────────┐
                    │    Screen    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Custom Hook  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Service    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  API Client  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Backend    │
                    └──────────────┘
```

Do not skip layers without a good reason.

---

# 52. Preferred Feature Flow

Example:

```text
features/products/

components/
    ProductCard.tsx
    ProductList.tsx

screens/
    ProductListScreen.tsx
    ProductDetailScreen.tsx

hooks/
    useProducts.ts
    useProduct.ts

services/
    product.service.ts

types/
    product.types.ts

utils/
    product.utils.ts
```

This keeps the feature isolated and maintainable.

---

# 53. What Claude Must NOT Do

Claude must NOT:

* Put API calls directly into presentational components
* Put large business logic inside screens
* Use `any` unnecessarily
* Store JWTs in AsyncStorage
* Hardcode secrets
* Create unnecessary global state
* Use ScrollView for very large lists
* Add dependencies without justification
* Rewrite working architecture unnecessarily
* Duplicate existing components
* Create giant files
* Create giant hooks
* Scatter navigation configuration
* Ignore loading/error/empty states
* Ignore accessibility
* Ignore TypeScript errors
* Ignore lint errors
* Ignore failing tests
* Optimize blindly without evidence
* Change unrelated code while implementing a feature

---

# 54. Definition of Done

A React Native feature is considered complete only when:

```text
✓ Architecture is clean
✓ Components are focused
✓ Business logic is separated
✓ TypeScript is strict
✓ API layer is typed
✓ State ownership is correct
✓ Loading state exists
✓ Error state exists
✓ Empty state exists where applicable
✓ Performance is reasonable
✓ Security requirements are satisfied
✓ Accessibility is considered
✓ Tests exist for important behavior
✓ Lint passes
✓ Typecheck passes
✓ Tests pass
✓ Production build is not broken
```

---

# Final Rule

When choosing between a quick implementation and a maintainable implementation:

> Prefer the maintainable implementation, but do not over-engineer.

The objective is not to create the most sophisticated React Native architecture.

The objective is to create a codebase that another developer can understand, test, modify, and safely extend.
