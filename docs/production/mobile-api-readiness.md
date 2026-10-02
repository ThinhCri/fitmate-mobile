# Mobile API readiness — contract versus runtime

Observed: 2026-10-02  
Backend frozen revision: `74b223497f2a075f295644afcf5f9bcad897b66e`  
OpenAPI SHA-256 (raw file bytes): `4637C6AD3A323DF062BA4B4B5C97EF3D7BEB75C475BA44FC1F4B54B8FD827804`  
Contract status: `FROZEN-V1`

This is a static integration gate, not runtime evidence. The frozen OpenAPI contains 159 operations (155 with runtime, 4 AI companion contract-only) and is the only allowed source for generated mobile wire types. Controller discovery does not authorize the mobile app to invent DTOs or call undocumented operations.

## Readiness rule

- `CONTRACT_READY`: operation exists in frozen OpenAPI and verified in backend tests.
- `GATED`: contract exists, but provider/UAT/operator/release evidence is still open.
- `DISABLED`: contract exists, but runtime is intentionally disabled (capability flag).

## Contract-ready operations (available for mobile integration)

All core domains are now represented in the frozen OpenAPI:

| Domain | Key operations | Status |
|---|---|---|
| Auth | register, login, refreshToken, logout, forgotPassword, resetPassword, authChangePassword | `CONTRACT_READY` |
| Users/Profile | getMe, updateMe, putMe, deleteMe, getPublicProfile, searchUsers, getUserPreferences, updateUserPreferences | `CONTRACT_READY` |
| Account lifecycle | requestAccountDeletion, getAccountDeletionStatus, cancelAccountDeletion, exportUserData | `CONTRACT_READY` |
| Devices | registerDevice, revokeDevice | `CONTRACT_READY` |
| Trainers | listTrainers, getTrainer, getTrainerAvailability, submitTrainerReview, getTrainerReviews | `CONTRACT_READY` |
| PT self-service | getMyAvailability, setMyAvailability, listMyCertificates, submitCertificate, listMyServices, createService, getMyService, updateService, deleteService | `CONTRACT_READY` |
| Bookings | createBookingHold, getBookingHold, confirmBookingById, getMyBookingDetail, confirmMyBooking, startMyBooking, listMyBookings, listMyTrainerBookings, cancelMyBooking, completeMyBooking | `CONTRACT_READY` |
| Reschedule | createRescheduleRequest, acceptRescheduleRequest, rejectRescheduleRequest, cancelRescheduleRequest | `CONTRACT_READY` |
| Dashboard | getMyDashboard | `CONTRACT_READY` |
| Payments | createPayment, getMyPayment | `GATED` (payOS re-verification) |
| Revenue | getMyRevenue, getMyRevenueHistory | `CONTRACT_READY` |
| Workout | listMyWorkoutPlans, createWorkoutPlan, getMyWorkoutPlan, updateMyWorkoutPlan, deleteMyWorkoutPlan, listMyWorkoutSessions, logWorkoutSession, getMyWorkoutSession, listMyWeight, logWeight | `CONTRACT_READY` |
| Nutrition | listMyMeals, logMeal, updateMeal, deleteMeal, getMyMealSchedule, setMyMealSchedule | `CONTRACT_READY` |
| Nutrition AI scan | scanMeal | `GATED` (AI capability) |
| Social | listPosts, createPost, getPost, deletePost, listPostComments, createComment, reactToPost, createReport | `CONTRACT_READY` |
| Friends | listPendingFriendRequests, sendFriendRequest, respondFriendRequest, listFriends, unfriend, friendRelationStatus | `CONTRACT_READY` |
| Block | blockUser, listBlocked, unblockUser | `CONTRACT_READY` |
| Chat | sendFriendMessage, listConversations, getConversation, listFriendMessages, markFriendMessagesRead | `CONTRACT_READY` |
| AI companion | listAiThreads, createAiThread, listAiMessages, sendAiMessage | `DISABLED` |
| Notifications | listMyNotifications, markNotificationRead | `CONTRACT_READY` |
| Support | listMySupportTickets, createSupportTicket, getSupportTicket, replySupportTicket, closeSupportTicket | `CONTRACT_READY` |
| Upload | uploadFile | `CONTRACT_READY` |
| System | liveness, getSystemCapabilities | `CONTRACT_READY` |

## Operations with additional release gates

- Payment create/query exists in the contract, but payOS/manual finance changes remain under BE-808..810 and BE-400 re-verification. Mobile must respect `/system/capabilities` and keep live checkout disabled until evidence/operator approval exists.
- AI routes/capability shape exists, but real inference readiness is separately gated by BE-817 and the artifact handoff. No Gemini/model key belongs in mobile.
- Push registration/inbox contract exists, but device/provider credentials and end-to-end delivery remain environment/operator concerns.
- Production/staging execution remains subject to BE-826 UAT and BE-827 release gates.

## Client requirements

1. Generate or map wire types only from the pinned OpenAPI.
2. Keep wire DTOs separate from UI view models.
3. Record operationId and OpenAPI hash in each feature handoff.
4. Treat undocumented operations as unavailable; do not silently call controllers by reading their source.
5. When backend reconciles a gap, update OpenAPI first, refresh `contract-baseline.json`, then implement the mobile caller and contract tests.
