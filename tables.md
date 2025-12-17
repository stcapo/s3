# Ticketing System Implementation Tables

## Table 4.1 Package List

| Software Package | File Name | Description |
|-----------------|-----------|-------------|
| .github | workflows/ | CI/CD workflow configurations for automated testing and deployment |
| client | Dockerfile | Docker container configuration for the React frontend application |
| client | index.html | Main HTML entry point for the Vite React application |
| client | package.json | Frontend dependencies and npm scripts configuration |
| client | vite.config.ts | Vite build tool configuration for React development |
| client | tailwind.config.js | Tailwind CSS utility framework configuration |
| client | tsconfig.json | TypeScript compiler configuration for the frontend |
| client/src | App.tsx | Main React application component with routing configuration |
| client/src | main.tsx | React application entry point and DOM rendering |
| client/src | index.css | Global CSS styles with Tailwind directives |
| client/src/api | index.ts | API client module with all HTTP request functions using Axios |
| client/src/types | index.ts | TypeScript type definitions for User, Event, Seat, Order, Coupon, etc. |
| client/src/components | Navbar.tsx | Navigation bar component with user menu and route links |
| client/src/pages | Login.tsx | User login page with form validation |
| client/src/pages | Register.tsx | User registration page with account creation |
| client/src/pages | Events.tsx | Event listing page with search and category filtering |
| client/src/pages | EventDetail.tsx | Event detail page with seat selection and booking |
| client/src/pages | Checkout.tsx | Order checkout page with coupon validation and payment |
| client/src/pages | Orders.tsx | User orders history page with cancellation feature |
| client/src/pages | Profile.tsx | User profile management page with password change |
| client/src/pages | Favorites.tsx | User favorites/wishlist page for saved events |
| client/src/pages | Coupons.tsx | Coupon listing and validation page |
| client/src/pages | Admin.tsx | Admin dashboard with statistics and order management |
| server | Dockerfile | Docker container configuration for the Express.js backend |
| server | index.js | Main Express.js server entry point with all API routes |
| server | package.json | Backend dependencies including Express and CORS |
| server/data | db.json | JSON file-based database for users, events, seats, orders |
| server/scripts | seed.js | Database seeding script to initialize sample data |
| root | docker-compose.yml | Docker Compose orchestration for client and server services |

## Table 4.2 Functions and Privileges

| Module | Port | Module Function | Permission Implementation |
|--------|------|-----------------|---------------------------|
| server | 8000 | User Authentication | All: Login; All: Register |
| server | 8000 | User Profile Management | Authenticated users: View, Update profile |
| server | 8000 | Password Management | Authenticated users: Change password |
| server | 8000 | Event Listing | All authenticated: Browse events |
| server | 8000 | Event Details | All authenticated: View event details |
| server | 8000 | Event Search & Filter | All authenticated: Search by name, venue, category |
| server | 8000 | Seat Management | All authenticated: View seats |
| server | 8000 | Seat Lock/Unlock | Authenticated users: Lock/Unlock available seats |
| server | 8000 | Seat Lock Expiration | System: Auto-release after 10 minutes |
| server | 8000 | Order Creation | Authenticated users: Create orders |
| server | 8000 | Order with Coupon | Authenticated users: Apply coupons to orders |
| server | 8000 | Order History | Authenticated users: View own orders |
| server | 8000 | Order Cancellation | Order owner: Cancel within 24 hours |
| server | 8000 | Coupon Validation | All authenticated: Validate coupons |
| server | 8000 | Coupon Listing | All authenticated: View available coupons |
| server | 8000 | Favorites Management | Authenticated users: Add/Remove favorites |
| server | 8000 | Comments & Ratings | Ticket purchasers: Add comments |
| server | 8000 | View Comments | All authenticated: View event comments |
| server | 8000 | Admin Statistics | Admin only: View system statistics |
| server | 8000 | Admin Order Management | Admin only: View all orders |
| server | 8000 | System Reset | Admin only: Reset database |
| client | 5173 | Login Interface | Public: Access login page |
| client | 5173 | Registration Interface | Public: Access registration page |
| client | 5173 | Event Browsing | Authenticated: Browse events |
| client | 5173 | Seat Selection | Authenticated: Interactive seat map |
| client | 5173 | Checkout Process | Authenticated: Complete purchases |
| client | 5173 | Order Management | Authenticated: View/Cancel orders |
| client | 5173 | Profile Management | Authenticated: Edit profile |
| client | 5173 | Admin Dashboard | Admin: Access admin panel |

## Table 4.3 Micro-services URLs

| Module Unit | URL Name | URL Path | Request Method | Functional Description |
|-------------|----------|----------|----------------|------------------------|
| auth-service | S1_UserLogin | /api/auth/login | POST | Authenticate user credentials and return user data |
| auth-service | S2_UserRegister | /api/auth/register | POST | Create new user account with validation |
| user-service | S3_GetUserProfile | /api/users/:id | GET | Retrieve user profile by user ID |
| user-service | S4_UpdateUserProfile | /api/users/:id | PUT | Update user profile information and password |
| event-service | S5_GetAllEvents | /api/events | GET | Retrieve all events with optional search and category filters |
| event-service | S6_GetEventById | /api/events/:id | GET | Retrieve single event details by event ID |
| event-service | S7_GetEventComments | /api/events/:eventId/comments | GET | Get all comments and average rating for an event |
| event-service | S8_AddEventComment | /api/events/:eventId/comments | POST | Add a comment and rating for an event |
| seat-service | S9_GetEventSeats | /api/events/:eventId/seats | GET | Retrieve all seats for a specific event |
| seat-service | S10_LockSeat | /api/seats/:seatId/lock | POST | Lock a seat for a user during selection |
| seat-service | S11_UnlockSeat | /api/seats/:seatId/unlock | POST | Unlock a previously locked seat |
| seat-service | S12_ReleaseExpiredLocks | /api/seats/release-expired | POST | Release all seats with expired locks (10 min timeout) |
| order-service | S13_CreateOrder | /api/orders | POST | Create a new order from locked seats |
| order-service | S14_CreateOrderWithCoupon | /api/orders/with-coupon | POST | Create order with optional coupon discount |
| order-service | S15_GetUserOrders | /api/users/:userId/orders | GET | Retrieve all orders for a specific user |
| order-service | S16_CancelOrder | /api/orders/:orderId/cancel | POST | Cancel an order within 24 hours and process refund |
| coupon-service | S17_GetAllCoupons | /api/coupons | GET | Retrieve all active coupons |
| coupon-service | S18_ValidateCoupon | /api/coupons/validate | POST | Validate coupon code and calculate discount |
| favorite-service | S19_AddFavorite | /api/favorites | POST | Add an event to user's favorites |
| favorite-service | S20_RemoveFavorite | /api/favorites/:eventId | DELETE | Remove an event from user's favorites |
| favorite-service | S21_GetUserFavorites | /api/users/:userId/favorites | GET | Retrieve all favorited events for a user |
| admin-service | S22_GetAdminStats | /api/admin/stats | GET | Retrieve comprehensive system statistics |
| admin-service | S23_GetAdminOrders | /api/admin/orders | GET | Retrieve all orders with user and event details |
| admin-service | S24_ResetSystem | /api/admin/reset | POST | Reset database to initial seed state |

## Table 4.4 API Gateway URLs

| Module Unit | URL Name | URL Path | Request Method | Functional Description |
|-------------|----------|----------|----------------|------------------------|
| api-gateway | G1_UserLogin | /api/auth/login | POST | Forward login request to auth-service |
| api-gateway | G2_UserRegister | /api/auth/register | POST | Forward registration request to auth-service |
| api-gateway | G3_GetUserProfile | /api/users/:id | GET | Forward profile request to user-service |
| api-gateway | G4_UpdateUserProfile | /api/users/:id | PUT | Forward profile update to user-service |
| api-gateway | G5_GetAllEvents | /api/events | GET | Forward events request to event-service |
| api-gateway | G6_GetEventById | /api/events/:id | GET | Forward event detail request to event-service |
| api-gateway | G7_GetEventComments | /api/events/:eventId/comments | GET | Forward comments request to event-service |
| api-gateway | G8_AddEventComment | /api/events/:eventId/comments | POST | Forward add comment request to event-service |
| api-gateway | G9_GetEventSeats | /api/events/:eventId/seats | GET | Forward seats request to seat-service |
| api-gateway | G10_LockSeat | /api/seats/:seatId/lock | POST | Forward seat lock request to seat-service |
| api-gateway | G11_UnlockSeat | /api/seats/:seatId/unlock | POST | Forward seat unlock request to seat-service |
| api-gateway | G12_ReleaseExpiredLocks | /api/seats/release-expired | POST | Forward expired lock release to seat-service |
| api-gateway | G13_CreateOrder | /api/orders | POST | Forward order creation to order-service |
| api-gateway | G14_CreateOrderWithCoupon | /api/orders/with-coupon | POST | Forward coupon order to order-service |
| api-gateway | G15_GetUserOrders | /api/users/:userId/orders | GET | Forward user orders request to order-service |
| api-gateway | G16_CancelOrder | /api/orders/:orderId/cancel | POST | Forward order cancellation to order-service |
| api-gateway | G17_GetAllCoupons | /api/coupons | GET | Forward coupons request to coupon-service |
| api-gateway | G18_ValidateCoupon | /api/coupons/validate | POST | Forward coupon validation to coupon-service |
| api-gateway | G19_AddFavorite | /api/favorites | POST | Forward add favorite to favorite-service |
| api-gateway | G20_RemoveFavorite | /api/favorites/:eventId | DELETE | Forward remove favorite to favorite-service |
| api-gateway | G21_GetUserFavorites | /api/users/:userId/favorites | GET | Forward favorites request to favorite-service |
| api-gateway | G22_GetAdminStats | /api/admin/stats | GET | Forward admin stats request to admin-service |
| api-gateway | G23_GetAdminOrders | /api/admin/orders | GET | Forward admin orders request to admin-service |
| api-gateway | G24_ResetSystem | /api/admin/reset | POST | Forward system reset to admin-service |

## Table 4.5 Frontend URLs

| Module Unit | URL Name | URL Path | View | Respond Method | Request Method |
|-------------|----------|----------|------|----------------|----------------|
| frontend | F1_LoginPage | / | Login.tsx | Render | GET |
| frontend | F2_LoginSubmit | / | Login.tsx | Redirect | POST |
| frontend | F3_RegisterPage | /register | Register.tsx | Render | GET |
| frontend | F4_RegisterSubmit | /register | Register.tsx | Redirect | POST |
| frontend | F5_EventsList | / | Events.tsx | Render | GET |
| frontend | F6_EventsSearch | /?search=:query | Events.tsx | Render | GET |
| frontend | F7_EventsFilter | /?category=:cat | Events.tsx | Render | GET |
| frontend | F8_EventDetail | /events/:id | EventDetail.tsx | Render | GET |
| frontend | F9_SeatSelection | /events/:id | EventDetail.tsx | Render | GET |
| frontend | F10_SeatLock | /events/:id | EventDetail.tsx | JSON | POST |
| frontend | F11_SeatUnlock | /events/:id | EventDetail.tsx | JSON | POST |
| frontend | F12_AddComment | /events/:id | EventDetail.tsx | JSON | POST |
| frontend | F13_ToggleFavorite | /events/:id | EventDetail.tsx | JSON | POST |
| frontend | F14_CheckoutPage | /checkout | Checkout.tsx | Render | GET |
| frontend | F15_ValidateCoupon | /checkout | Checkout.tsx | JSON | POST |
| frontend | F16_ProcessPayment | /checkout | Checkout.tsx | Redirect | POST |
| frontend | F17_OrdersPage | /orders | Orders.tsx | Render | GET |
| frontend | F18_CancelOrder | /orders | Orders.tsx | JSON | POST |
| frontend | F19_ProfilePage | /profile | Profile.tsx | Render | GET |
| frontend | F20_UpdateProfile | /profile | Profile.tsx | JSON | PUT |
| frontend | F21_ChangePassword | /profile | Profile.tsx | JSON | PUT |
| frontend | F22_FavoritesPage | /favorites | Favorites.tsx | Render | GET |
| frontend | F23_RemoveFavorite | /favorites | Favorites.tsx | JSON | DELETE |
| frontend | F24_CouponsPage | /coupons | Coupons.tsx | Render | GET |
| frontend | F25_TestCoupon | /coupons | Coupons.tsx | JSON | POST |
| frontend | F26_AdminDashboard | /admin | Admin.tsx | Render | GET |
| frontend | F27_AdminStats | /admin | Admin.tsx | JSON | GET |
| frontend | F28_AdminOrders | /admin | Admin.tsx | JSON | GET |
| frontend | F29_AdminReset | /admin | Admin.tsx | JSON | POST |
| frontend | F30_Logout | * | Navbar.tsx | Redirect | POST |

