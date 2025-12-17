# Ticketing System Test Results List

## Test Results Summary

| Module Unit | Index | URL Name | URL Path | Request Method | Status Code | Result |
|-------------|-------|----------|----------|----------------|-------------|--------|
| **Authentication Service** |
| auth-service | 1 | UserLogin_ValidCredentials | /api/auth/login | POST | 200 | ✅ Pass |
| auth-service | 2 | UserLogin_InvalidUsername | /api/auth/login | POST | 401 | ✅ Pass |
| auth-service | 3 | UserLogin_InvalidPassword | /api/auth/login | POST | 401 | ✅ Pass |
| auth-service | 4 | UserLogin_EmptyCredentials | /api/auth/login | POST | 401 | ✅ Pass |
| auth-service | 5 | UserRegister_ValidData | /api/auth/register | POST | 200 | ✅ Pass |
| auth-service | 6 | UserRegister_DuplicateUsername | /api/auth/register | POST | 400 | ✅ Pass |
| auth-service | 7 | UserRegister_DuplicateEmail | /api/auth/register | POST | 400 | ✅ Pass |
| auth-service | 8 | UserRegister_MissingFields | /api/auth/register | POST | 400 | ✅ Pass |
| **User Service** |
| user-service | 9 | GetUserProfile_ValidId | /api/users/:id | GET | 200 | ✅ Pass |
| user-service | 10 | GetUserProfile_InvalidId | /api/users/:id | GET | 404 | ✅ Pass |
| user-service | 11 | UpdateProfile_ValidData | /api/users/:id | PUT | 200 | ✅ Pass |
| user-service | 12 | UpdateProfile_DuplicateEmail | /api/users/:id | PUT | 400 | ✅ Pass |
| user-service | 13 | ChangePassword_CorrectCurrent | /api/users/:id | PUT | 200 | ✅ Pass |
| user-service | 14 | ChangePassword_WrongCurrent | /api/users/:id | PUT | 400 | ✅ Pass |
| **Event Service** |
| event-service | 15 | GetAllEvents_NoFilter | /api/events | GET | 200 | ✅ Pass |
| event-service | 16 | GetAllEvents_SearchQuery | /api/events?search=演唱会 | GET | 200 | ✅ Pass |
| event-service | 17 | GetAllEvents_CategoryFilter | /api/events?category=话剧 | GET | 200 | ✅ Pass |
| event-service | 18 | GetAllEvents_CombinedFilter | /api/events?search=北京&category=演唱会 | GET | 200 | ✅ Pass |
| event-service | 19 | GetEventById_ValidId | /api/events/:id | GET | 200 | ✅ Pass |
| event-service | 20 | GetEventById_InvalidId | /api/events/:id | GET | 404 | ✅ Pass |
| event-service | 21 | GetEventComments_ValidEvent | /api/events/:eventId/comments | GET | 200 | ✅ Pass |
| event-service | 22 | GetEventComments_NoComments | /api/events/:eventId/comments | GET | 200 | ✅ Pass |
| event-service | 23 | AddComment_ValidData | /api/events/:eventId/comments | POST | 200 | ✅ Pass |
| event-service | 24 | AddComment_NoPurchase | /api/events/:eventId/comments | POST | 403 | ✅ Pass |
| event-service | 25 | AddComment_DuplicateComment | /api/events/:eventId/comments | POST | 400 | ✅ Pass |
| event-service | 26 | AddComment_InvalidEvent | /api/events/:eventId/comments | POST | 404 | ✅ Pass |
| **Seat Service** |
| seat-service | 27 | GetEventSeats_ValidEvent | /api/events/:eventId/seats | GET | 200 | ✅ Pass |
| seat-service | 28 | GetEventSeats_EmptyResult | /api/events/:eventId/seats | GET | 200 | ✅ Pass |
| seat-service | 29 | LockSeat_AvailableSeat | /api/seats/:seatId/lock | POST | 200 | ✅ Pass |
| seat-service | 30 | LockSeat_AlreadySold | /api/seats/:seatId/lock | POST | 400 | ✅ Pass |
| seat-service | 31 | LockSeat_LockedByOther | /api/seats/:seatId/lock | POST | 400 | ✅ Pass |
| seat-service | 32 | LockSeat_InvalidSeat | /api/seats/:seatId/lock | POST | 404 | ✅ Pass |
| seat-service | 33 | UnlockSeat_OwnLock | /api/seats/:seatId/unlock | POST | 200 | ✅ Pass |
| seat-service | 34 | UnlockSeat_OtherUserLock | /api/seats/:seatId/unlock | POST | 403 | ✅ Pass |
| seat-service | 35 | UnlockSeat_InvalidSeat | /api/seats/:seatId/unlock | POST | 404 | ✅ Pass |
| seat-service | 36 | ReleaseExpiredLocks_WithExpired | /api/seats/release-expired | POST | 200 | ✅ Pass |
| seat-service | 37 | ReleaseExpiredLocks_NoExpired | /api/seats/release-expired | POST | 200 | ✅ Pass |
| **Order Service** |
| order-service | 38 | CreateOrder_ValidSeats | /api/orders | POST | 200 | ✅ Pass |
| order-service | 39 | CreateOrder_SoldSeat | /api/orders | POST | 400 | ✅ Pass |
| order-service | 40 | CreateOrder_NotLockedByUser | /api/orders | POST | 400 | ✅ Pass |
| order-service | 41 | CreateOrder_InvalidSeat | /api/orders | POST | 400 | ✅ Pass |
| order-service | 42 | CreateOrderWithCoupon_ValidCoupon | /api/orders/with-coupon | POST | 200 | ✅ Pass |
| order-service | 43 | CreateOrderWithCoupon_InvalidCoupon | /api/orders/with-coupon | POST | 200 | ✅ Pass |
| order-service | 44 | CreateOrderWithCoupon_ExpiredCoupon | /api/orders/with-coupon | POST | 200 | ✅ Pass |
| order-service | 45 | GetUserOrders_WithOrders | /api/users/:userId/orders | GET | 200 | ✅ Pass |
| order-service | 46 | GetUserOrders_NoOrders | /api/users/:userId/orders | GET | 200 | ✅ Pass |
| order-service | 47 | CancelOrder_Within24Hours | /api/orders/:orderId/cancel | POST | 200 | ✅ Pass |
| order-service | 48 | CancelOrder_After24Hours | /api/orders/:orderId/cancel | POST | 400 | ✅ Pass |
| order-service | 49 | CancelOrder_AlreadyCancelled | /api/orders/:orderId/cancel | POST | 400 | ✅ Pass |
| order-service | 50 | CancelOrder_OtherUserOrder | /api/orders/:orderId/cancel | POST | 403 | ✅ Pass |
| order-service | 51 | CancelOrder_InvalidOrder | /api/orders/:orderId/cancel | POST | 404 | ✅ Pass |
| **Coupon Service** |
| coupon-service | 52 | GetAllCoupons_Active | /api/coupons | GET | 200 | ✅ Pass |
| coupon-service | 53 | ValidateCoupon_ValidCode | /api/coupons/validate | POST | 200 | ✅ Pass |
| coupon-service | 54 | ValidateCoupon_InvalidCode | /api/coupons/validate | POST | 404 | ✅ Pass |
| coupon-service | 55 | ValidateCoupon_ExpiredCoupon | /api/coupons/validate | POST | 400 | ✅ Pass |
| coupon-service | 56 | ValidateCoupon_BelowMinPurchase | /api/coupons/validate | POST | 400 | ✅ Pass |
| coupon-service | 57 | ValidateCoupon_MaxUsesReached | /api/coupons/validate | POST | 400 | ✅ Pass |
| coupon-service | 58 | ValidateCoupon_PercentageDiscount | /api/coupons/validate | POST | 200 | ✅ Pass |
| coupon-service | 59 | ValidateCoupon_FixedDiscount | /api/coupons/validate | POST | 200 | ✅ Pass |
| **Favorite Service** |
| favorite-service | 60 | AddFavorite_NewEvent | /api/favorites | POST | 200 | ✅ Pass |
| favorite-service | 61 | AddFavorite_AlreadyFavorited | /api/favorites | POST | 400 | ✅ Pass |
| favorite-service | 62 | RemoveFavorite_Existing | /api/favorites/:eventId | DELETE | 200 | ✅ Pass |
| favorite-service | 63 | RemoveFavorite_NotFavorited | /api/favorites/:eventId | DELETE | 404 | ✅ Pass |
| favorite-service | 64 | GetUserFavorites_WithFavorites | /api/users/:userId/favorites | GET | 200 | ✅ Pass |
| favorite-service | 65 | GetUserFavorites_NoFavorites | /api/users/:userId/favorites | GET | 200 | ✅ Pass |
| **Admin Service** |
| admin-service | 66 | GetAdminStats_ValidRequest | /api/admin/stats | GET | 200 | ✅ Pass |
| admin-service | 67 | GetAdminStats_EventStats | /api/admin/stats | GET | 200 | ✅ Pass |
| admin-service | 68 | GetAdminOrders_AllOrders | /api/admin/orders | GET | 200 | ✅ Pass |
| admin-service | 69 | GetAdminOrders_WithUserDetails | /api/admin/orders | GET | 200 | ✅ Pass |
| admin-service | 70 | ResetSystem_Success | /api/admin/reset | POST | 200 | ✅ Pass |
| **Frontend - Login & Register** |
| frontend | 71 | LoginPage_Render | / | GET | 200 | ✅ Pass |
| frontend | 72 | LoginPage_SubmitValid | / | POST | 200 | ✅ Pass |
| frontend | 73 | RegisterPage_Render | /register | GET | 200 | ✅ Pass |
| frontend | 74 | RegisterPage_Submit | /register | POST | 200 | ✅ Pass |
| **Frontend - Events** |
| frontend | 75 | EventsList_Render | / | GET | 200 | ✅ Pass |
| frontend | 76 | EventsList_Search | /?search=周杰伦 | GET | 200 | ✅ Pass |
| frontend | 77 | EventsList_CategoryFilter | /?category=演唱会 | GET | 200 | ✅ Pass |
| frontend | 78 | EventDetail_Render | /events/:id | GET | 200 | ✅ Pass |
| frontend | 79 | EventDetail_SeatMap | /events/:id | GET | 200 | ✅ Pass |
| **Frontend - Checkout** |
| frontend | 80 | Checkout_Render | /checkout | GET | 200 | ✅ Pass |
| frontend | 81 | Checkout_CouponValidation | /checkout | POST | 200 | ✅ Pass |
| frontend | 82 | Checkout_Payment | /checkout | POST | 200 | ✅ Pass |
| **Frontend - Orders** |
| frontend | 83 | Orders_Render | /orders | GET | 200 | ✅ Pass |
| frontend | 84 | Orders_CancelOrder | /orders | POST | 200 | ✅ Pass |
| **Frontend - Profile** |
| frontend | 85 | Profile_Render | /profile | GET | 200 | ✅ Pass |
| frontend | 86 | Profile_UpdateInfo | /profile | PUT | 200 | ✅ Pass |
| frontend | 87 | Profile_ChangePassword | /profile | PUT | 200 | ✅ Pass |
| **Frontend - Favorites & Coupons** |
| frontend | 88 | Favorites_Render | /favorites | GET | 200 | ✅ Pass |
| frontend | 89 | Favorites_RemoveItem | /favorites | DELETE | 200 | ✅ Pass |
| frontend | 90 | Coupons_Render | /coupons | GET | 200 | ✅ Pass |
| frontend | 91 | Coupons_ValidateTest | /coupons | POST | 200 | ✅ Pass |
| **Frontend - Admin** |
| frontend | 92 | AdminDashboard_Render | /admin | GET | 200 | ✅ Pass |
| frontend | 93 | AdminDashboard_StatsTab | /admin | GET | 200 | ✅ Pass |
| frontend | 94 | AdminDashboard_OrdersTab | /admin | GET | 200 | ✅ Pass |
| frontend | 95 | AdminDashboard_ResetSystem | /admin | POST | 200 | ✅ Pass |
| **Gateway - Authentication** |
| api-gateway | 96 | Gateway_LoginForward | /api/auth/login | POST | 200 | ✅ Pass |
| api-gateway | 97 | Gateway_RegisterForward | /api/auth/register | POST | 200 | ✅ Pass |
| **Gateway - Events & Seats** |
| api-gateway | 98 | Gateway_EventsForward | /api/events | GET | 200 | ✅ Pass |
| api-gateway | 99 | Gateway_SeatsForward | /api/events/:eventId/seats | GET | 200 | ✅ Pass |
| api-gateway | 100 | Gateway_SeatLockForward | /api/seats/:seatId/lock | POST | 200 | ✅ Pass |
| **Gateway - Orders & Coupons** |
| api-gateway | 101 | Gateway_OrderForward | /api/orders | POST | 200 | ✅ Pass |
| api-gateway | 102 | Gateway_CouponForward | /api/coupons/validate | POST | 200 | ✅ Pass |
| **Gateway - Admin** |
| api-gateway | 103 | Gateway_AdminStatsForward | /api/admin/stats | GET | 200 | ✅ Pass |
| api-gateway | 104 | Gateway_AdminOrdersForward | /api/admin/orders | GET | 200 | ✅ Pass |
| **Integration Tests** |
| integration | 105 | E2E_UserRegistrationFlow | /register → / | POST | 200 | ✅ Pass |
| integration | 106 | E2E_LoginToEventsFlow | / → /events | GET | 200 | ✅ Pass |
| integration | 107 | E2E_FullPurchaseFlow | /events → /checkout → /orders | POST | 200 | ✅ Pass |
| integration | 108 | E2E_OrderCancellationFlow | /orders → Cancel → Refund | POST | 200 | ✅ Pass |
| integration | 109 | E2E_CouponPurchaseFlow | /checkout → Apply Coupon → Pay | POST | 200 | ✅ Pass |
| integration | 110 | E2E_FavoriteManagementFlow | /events → Favorite → /favorites | POST | 200 | ✅ Pass |

---

## Test Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| Authentication Service | 8 | 8 | 0 | 100% |
| User Service | 6 | 6 | 0 | 100% |
| Event Service | 12 | 12 | 0 | 100% |
| Seat Service | 11 | 11 | 0 | 100% |
| Order Service | 14 | 14 | 0 | 100% |
| Coupon Service | 8 | 8 | 0 | 100% |
| Favorite Service | 6 | 6 | 0 | 100% |
| Admin Service | 5 | 5 | 0 | 100% |
| Frontend | 25 | 25 | 0 | 100% |
| API Gateway | 9 | 9 | 0 | 100% |
| Integration | 6 | 6 | 0 | 100% |
| **Total** | **110** | **110** | **0** | **100%** |

## Test Environment

- **Backend Server**: Express.js v4.18.2 on Port 8000
- **Frontend Client**: React 18 + Vite on Port 5173
- **Database**: JSON file-based storage (db.json)
- **Docker**: docker-compose v3.8
- **Node.js**: v18+ LTS
- **Testing Date**: 2024-12-16

