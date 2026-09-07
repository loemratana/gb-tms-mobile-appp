# React Native Architecture Rule

Keep components thin.

Components are responsible for:

- Rendering UI
- Layout
- Styling
- Receiving props
- Simple UI interactions

Move logic out of components when it involves:

- API calls
- Business rules
- Async operations
- Complex event handlers
- Data transformation
- Validation
- Permission checks
- Navigation workflows
- Complex useEffect
- Device APIs
- GPS
- Camera
- QR scanning
- Notifications
- Authentication
- State orchestration

Use:

- Custom hooks → screen and state logic
- API/services → external data operations
- Utils → pure calculations and transformations
- Schemas → validation
- Zustand → global client state
- TanStack Query → server state
- Components → UI only

Do not create unnecessary abstractions for simple UI behavior.

Prefer:
Component → Hook → Service/API

Keep screens readable enough that another developer can understand
the screen's UI structure without reading the implementation details
of its business logic.
