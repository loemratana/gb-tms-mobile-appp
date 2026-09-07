# API Endpoints

## Authentication (`/api/v1/auth`)

| Method | Endpoint                            | Description                                                                                                                                                    | Auth Required |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| POST   | `/api/v1/auth/login`                | Authenticates a user and issues a short-lived access token plus a long-lived refresh token. Creates a new session record tagged with device IP and User-Agent. | No            |
| POST   | `/api/v1/auth/refresh-token`        | Exchanges a valid refresh token for a new access token. The refresh token is rotated (old one invalidated).                                                    | No            |
| POST   | `/api/v1/auth/logout`               | Revokes all active sessions for the current authenticated user.                                                                                                | Yes           |
| POST   | `/api/v1/auth/logout-all`           | Revokes every active refresh token belonging to the authenticated user, ending all sessions across every device.                                               | Yes           |
| GET    | `/api/v1/auth/sessions`             | Returns all currently active (non-expired, non-revoked) login sessions for the authenticated user, including device name, type, IP address, and creation time. | Yes           |
| DELETE | `/api/v1/auth/sessions/{sessionId}` | Ends one specific device's session by its session ID, without affecting other active sessions. A user may only revoke their own sessions.                      | Yes           |
