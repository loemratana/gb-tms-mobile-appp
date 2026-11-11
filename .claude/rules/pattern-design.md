# React Native Architecture & Best Practices

## Purpose

These rules define the architecture, design patterns, performance standards, state management, security practices, and coding conventions that Claude must follow when developing or modifying a React Native / Expo application.

The primary goals are:

* Maintainable code
* Clear feature ownership
* Separation of concerns
* Reusable components
* Strong TypeScript safety
* Good mobile performance
* Secure local storage
* Predictable state management
* Testable business logic
* Consistent UI architecture
* Minimal unnecessary complexity

---

# 1. Core Architecture

## 1.1 Feature-Based Modular Architecture

Organize the application primarily by **feature/domain**, not by global file type.

### Preferred

```text
src/
├── app/
│   ├── navigation/
│   ├── providers/
│   └── config/
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
│   ├── profile/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   │
│   └── cart/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       ├── services/
│       └── types/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   └── types/
│
└── assets/
```

### Avoid

```text
src/
├── components/
├── screens/
├── hooks/
├── services/
├── models/
└── utils/
```

where all features are mixed together.

### Why

Feature-based architecture:

* Improves code discoverability
* Keeps related code together
* Reduces coupling
* Makes features easier to maintain
* Reduces merge conflicts
* Makes large applications easier to scale

---

# 2. Feature Ownership

Each feature should own its own implementation.

Example:

```text
features/products/
├── components/
│   ├── ProductCard.tsx
│   └── ProductList.tsx
├── hooks/
│   └── useProducts.ts
├── screens/
│   ├── ProductListScreen.tsx
│   └── ProductDetailScreen.tsx
├── services/
│   └── product.service.ts
├── types/
│   └── product.types.ts
└── utils/
    └── product.utils.ts
```

Do not put product-specific code into global folders.

Prefer:

```text
features/products/components/ProductCard.tsx
```

instead of:

```text
shared/components/ProductCard.tsx
```

unless the component is genuinely shared.

---

# 3. Shared Code Rule

Only move code into `shared/` when it is truly reusable.

### Rule

If a component is used by more than two independent features, consider moving it into:

```text
shared/components/
```

However, reuse count alone is not enough.

The component should also have:

* Generic responsibility
* No feature-specific business logic
* Stable API
* Meaningful reuse potential

### Good shared components

```text
Button
Input
Modal
Card
Avatar
Loading
EmptyState
ErrorState
Screen
Divider
```

### Do not share feature-specific components

```text
ProductCheckoutCard
OrderPaymentSummary
EmployeeSalaryCard
```

unless they genuinely belong to multiple features.

---

# 4. Absolute Imports

Use TypeScript path aliases instead of deeply nested relative imports.

### Avoid

```tsx
import Button from '../../../shared/components/Button'
```

### Prefer

```tsx
import { Button } from '@/shared/components'
```

Configure aliases through:

```text
tsconfig.json
```

Follow the existing project's alias convention if one already exists.

Do not introduce a new import strategy into an existing project unnecessarily.

---

# 5. Separation of Concerns

UI components must not know unnecessary implementation details about:

* HTTP clients
* Axios
* Fetch
* Storage engines
* Authentication token handling
* Database implementations
* API response transformation
* Complex business rules

Use the following architecture:

```text
Screen
   ↓
Custom Hook
   ↓
Service
   ↓
API Client
   ↓
Backend
```

For more complex applications:

```text
Screen
   ↓
Custom Hook
   ↓
Repository
   ↓
Service / Data Source
   ↓
API Client
   ↓
Backend
```

---

# 6. Service Layer Pattern

Create a dedicated service layer for backend communication.

### Bad

```tsx
function LoginScreen() {
  const response = await axios.post(
    '/auth/login',
    credentials
  )
}
```

### Good

```text
LoginScreen
    ↓
useLogin()
    ↓
authService.login()
    ↓
apiClient
```

Example:

```ts
export const authService = {
  login: async (
    request: LoginRequest,
  ): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      request,
    )

    return response.data
  },
}
```

The UI should not directly depend on Axios or Fetch.

---

# 7. Custom Hooks Pattern

Use custom hooks to expose feature behavior to UI components.

Example:

```ts
const {
  data,
  isLoading,
  error,
  refetch,
} = useProducts()
```

The hook may manage:

* Data fetching
* Mutations
* Query state
* Business interactions
* Permissions
* Feature-specific state

Do not put all application logic into one giant hook.

Avoid:

```text
useEverything()
useAppLogic()
useCommonLogic()
```

Prefer focused hooks:

```text
useAuth()
useProducts()
useOrders()
useCheckout()
usePermissions()
```

---

# 8. Container / Presentational Pattern

Separate stateful behavior from presentation when a screen becomes complex.

### Container

Responsible for:

* Data
* State
* Hooks
* Actions
* Navigation coordination

### Presentational Component

Responsible for:

* Layout
* Styling
* Rendering
* User interaction callbacks

Example:

```tsx
function ProfileContainer() {
  const profile = useProfile()

  return (
    <ProfileView
      profile={profile.data}
      loading={profile.isLoading}
    />
  )
}
```

```tsx
function ProfileView({
  profile,
  loading,
}: ProfileViewProps) {
  // Presentation only
}
```

Do not force this pattern on tiny components where it adds unnecessary complexity.

---

# 9. Component Design

Components should have a clear responsibility.

Avoid giant screens containing:

```text
API requests
state management
validation
business calculations
navigation
storage
analytics
large JSX
```

Instead:

```text
Screen
├── Header
├── Content
├── List
├── EmptyState
└── ActionBar
```

Extract meaningful UI sections when they:

* Have a clear responsibility
* Are reused
* Contain meaningful logic
* Make the parent easier to understand

Do not create tiny components solely to increase file count.

---

# 10. Compound Components

Use compound components for complex reusable UI.

Example:

```tsx
<Select>
  <Select.Trigger />
  <Select.Options />
</Select>
```

Other appropriate examples:

```tsx
<Card>
  <Card.Header />
  <Card.Content />
  <Card.Footer />
</Card>
```

Use this pattern when child components naturally belong to a common parent and need shared context/state.

Do not use compound components for simple UI.

---

# 11. Custom Hooks vs Components

Use a **hook** when the reusable part is primarily behavior.

Example:

```text
useDeviceOrientation()
useAuthSession()
usePermissions()
useDebounce()
```

Use a **component** when the reusable part is primarily UI.

Example:

```text
Button
Modal
ProductCard
Avatar
```

If both behavior and UI are reusable, separate them when practical.

---

# 12. Variant Props Pattern

Use semantic variants for reusable UI components.

### Good

```tsx
<Button
  variant="primary"
  size="large"
/>
```

```tsx
<Badge variant="success" />
```

### Avoid

```tsx
<Button
  backgroundColor="#123456"
  padding={17}
  borderRadius={9}
/>
```

Global components should expose a controlled semantic API.

Examples:

```text
variant
size
tone
status
appearance
```

Do not expose dozens of low-level styling props unless the component genuinely requires them.

---

# 13. Design System

Create a centralized design system.

The design system should define:

```text
Colors
Typography
Spacing
Radius
Shadows/Elevation
Icon sizes
Component sizes
```

Example:

```ts
theme.colors.primary
theme.colors.background
theme.spacing.md
theme.radius.lg
theme.typography.body
```

Avoid randomly inventing values throughout the application.

### Avoid

```tsx
padding: 17
margin: 13
borderRadius: 11
fontSize: 15
```

when equivalent design tokens already exist.

---

# 14. Native-Safe Styling

Prefer the project's established styling solution.

For standard React Native styling:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },
})
```

Avoid unnecessarily recreating large style objects on every render.

Do not introduce a new styling library when the project already has an established styling architecture unless explicitly requested.

---

# 15. Performance — Hermes

Use Hermes for React Native / Expo applications when supported by the project's configuration.

Do not disable Hermes without a specific technical reason.

Hermes is generally preferred for production React Native applications because of its React Native integration and runtime characteristics.

---

# 16. Performance — Rendering

Avoid unnecessary re-renders.

Pay attention to:

* Large context providers
* Frequently changing global state
* Unnecessary state updates
* Expensive calculations
* Large component trees
* Unstable props

Use:

```text
React.memo
useMemo
useCallback
```

when they solve a demonstrated rendering/performance problem.

Do not blindly add memoization everywhere.

---

# 17. Inline Functions

Do not treat every inline callback as a performance problem.

This is valid and often perfectly acceptable:

```tsx
<TouchableOpacity
  onPress={() => handleNavigation(id)}
/>
```

Only extract callbacks when:

* The callback is expensive
* A memoized child is unnecessarily re-rendering
* Profiling shows a meaningful performance problem
* The function needs to be reused

Example:

```tsx
const handlePress = useCallback(() => {
  handleNavigation(id)
}, [id])
```

Do not add `useCallback` automatically to every event handler.

---

# 18. Virtualized Lists

For large collections, use virtualized lists.

Prefer:

```text
FlatList
SectionList
FlashList
```

instead of rendering hundreds of elements inside:

```text
ScrollView
```

For large lists, consider:

```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>
```

---

# 19. List Performance

For large lists:

* Use stable keys
* Use `keyExtractor`
* Keep list items lightweight
* Memoize expensive list items when necessary
* Avoid unnecessary parent re-renders
* Use pagination/infinite loading
* Use `getItemLayout` when item dimensions are fixed
* Avoid rendering expensive components unnecessarily

Example:

```tsx
const ProductItem = React.memo(
  function ProductItem({
    product,
  }: ProductItemProps) {
    return (
      <ProductCard product={product} />
    )
  },
)
```

Do not use `getItemLayout` when item heights are dynamic unless the calculation is correct.

---

# 20. Images

Mobile applications must treat image rendering as a performance concern.

Prefer:

* Appropriate image dimensions
* Compressed assets
* Thumbnail images for lists
* Cached images
* Lazy loading where appropriate
* Modern image libraries when appropriate

Do not load huge original images into list items when a thumbnail is available.

---

# 21. Server State vs Client State

Separate state according to ownership.

```text
State
│
├── Server State
│   └── React Query / TanStack Query
│
├── Global Client State
│   └── Zustand / Redux Toolkit
│
├── Local UI State
│   └── useState
│
└── Form State
    └── React Hook Form
```

---

# 22. Server State

Use a server-state library such as:

```text
TanStack Query
```

for:

* API data
* Caching
* Pagination
* Refetching
* Background synchronization
* Loading states
* Error states
* Mutations

Do not copy all server data into global Zustand/Redux state without a clear reason.

---

# 23. Global Client State

Use Zustand or Redux Toolkit only for state that genuinely needs global access.

Examples:

```text
Authentication session
Shopping cart
Application preferences
Theme
Global settings
```

Do not put local UI state into global state unnecessarily.

### Bad

```text
Global Store
├── modalOpen
├── selectedTab
├── inputValue
├── dropdownOpen
└── temporaryLoading
```

when those states are only needed by one screen.

---

# 24. Local State

Prefer local state for local concerns.

Example:

```tsx
const [isOpen, setIsOpen] = useState(false)
```

Use local state for:

* Modal visibility
* Temporary input
* Selected tab
* Expanded/collapsed state
* Local UI interaction

Move state globally only when multiple independent parts of the application genuinely need it.

---

# 25. Form State

Complex forms should use a dedicated form solution when appropriate.

Recommended:

```text
React Hook Form
+
Zod
```

Keep:

```text
form values
validation
submission
field errors
```

out of large screen components where practical.

---

# 26. Security — Sensitive Storage

Never store sensitive authentication credentials in plain `AsyncStorage`.

Do not store:

```text
Passwords
Refresh tokens
Private keys
Sensitive authentication credentials
```

in ordinary unencrypted storage.

Use secure platform-backed storage such as:

```text
Expo SecureStore
```

or:

```text
react-native-keychain
```

for appropriate sensitive values.

---

# 27. Security — Tokens

Authentication flow should be centralized.

Preferred:

```text
Login
 ↓
Auth Service
 ↓
Secure Storage
 ↓
Session
 ↓
API Client
 ↓
Authorization Header
```

Do not make every screen responsible for:

```text
token retrieval
token refresh
logout
authentication errors
```

Centralize authentication behavior.

---

# 28. Security — Never Hardcode Secrets

Never put secrets into application source code.

Never write:

```ts
const API_SECRET = 'super-secret'
```

or:

```ts
const JWT_SECRET = 'secret'
```

Remember:

> Anything shipped inside a mobile application can potentially be extracted.

Environment variables used in a mobile build are not automatically secret.

Only expose values that are safe to expose to the client.

---

# 29. HTTPS

Production APIs must use HTTPS.

### Production

```text
https://api.example.com
```

### Development

Local HTTP may be used intentionally for development.

Never ship production configuration using insecure HTTP.

---

# 30. API Error Handling

Centralize API error handling.

The API client should normalize common errors.

Example:

```text
API Client
├── Request
├── Authentication
├── Token Refresh
├── Response
└── Error Normalization
```

Components should not need to understand Axios/fetch-specific errors.

Prefer:

```ts
{
  message: 'Unable to load products'
}
```

over passing raw networking errors throughout the UI.

---

# 31. Loading / Error / Empty States

Every asynchronous feature should consider:

```text
Loading
Success
Empty
Error
Retry
Disabled
```

Example:

```tsx
if (isLoading) {
  return <ProductSkeleton />
}

if (isError) {
  return <ErrorState onRetry={refetch} />
}

if (!products.length) {
  return <EmptyState />
}

return <ProductList products={products} />
```

Never implement only the happy path.

---

# 32. Offline and Network Resilience

Mobile networks can be unreliable.

For important features consider:

```text
Caching
Retry
Network detection
Offline states
Optimistic updates
Request deduplication
```

Do not blindly retry mutations that could create duplicate transactions.

For important write operations, prefer backend-supported idempotency when appropriate.

---

# 33. TypeScript

Use TypeScript strictly.

All important data should have explicit types.

Example:

```ts
interface Product {
  id: string
  name: string
  price: number
}
```

Avoid:

```ts
any
```

unless there is a documented and unavoidable reason.

Prefer:

```ts
unknown
```

when a value is genuinely unknown and then narrow/validate it.

---

# 34. API Type Safety

API requests and responses must be typed.

Example:

```ts
const response =
  await apiClient.get<Product[]>('/products')
```

Prefer feature-specific types:

```text
features/products/types/
```

Do not duplicate the same type across many files.

---

# 35. Navigation

Navigation should be centralized and typed.

Prefer:

```text
app/navigation/
├── RootNavigator
├── AuthNavigator
├── MainNavigator
└── navigation.types
```

Avoid scattering route definitions throughout feature components.

Route parameters should be type-safe.

Do not use untyped navigation arguments.

---

# 36. Navigation vs Business Logic

Navigation determines where the user should go.

Business logic determines whether the user is allowed to perform an action.

Do not scatter authentication/business decisions across dozens of screens.

Prefer centralized:

```text
Auth Guard
Permission Logic
Navigation Configuration
```

---

# 37. Repository Pattern

Use the Repository pattern when the application has multiple data sources.

Example:

```text
Hook
 ↓
Repository
 ├── API
 ├── Local Database
 └── Cache
```

Example interface:

```ts
interface ProductRepository {
  getProducts(): Promise<Product[]>
  getProduct(id: string): Promise<Product>
}
```

Use Repository when it provides meaningful abstraction.

Do not create repositories for simple applications just to follow a pattern.

---

# 38. Adapter Pattern

Use an Adapter when an external library does not match the application's internal API.

Example:

```text
Application
     ↓
ImageService
     ↓
External Image Library
```

The rest of the application should not depend heavily on the third-party library's API.

This makes future library replacement easier.

---

# 39. Facade Pattern

Use a Facade to simplify complicated subsystems.

Example:

```ts
auth.login()
auth.logout()
auth.getSession()
auth.isAuthenticated()
```

Internally the facade may coordinate:

```text
API
Secure Storage
Token Refresh
Session
```

The UI should not need to understand all internal authentication details.

---

# 40. Strategy Pattern

Use Strategy when behavior varies based on a type or business rule.

Example:

```text
Payment
├── CashPayment
├── CardPayment
├── QRPayment
└── WalletPayment
```

Instead of creating increasingly large:

```ts
if (...)
else if (...)
else if (...)
```

blocks.

Do not use Strategy for simple conditions.

---

# 41. Dependency Injection

Prefer dependency injection for services that need testing or interchangeable implementations.

Example:

```ts
class OrderService {
  constructor(
    private api: ApiClient,
  ) {}
}
```

This allo
