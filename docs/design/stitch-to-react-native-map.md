# Stitch to React Native mapping

Status: **MAPPING INVENTORIED — BATCH 1 IMPLEMENTED (UNVERIFIED)**  
Reference root: `design-reference/stitch-export/`

This file provides the canonical mapping from Stitch design exports to React Native (Expo Router) routes, components, and backend API contracts.

## Mapping rules

- Preserve the Stitch ID prefix (`a01`, `b01`, and so on).
- One main screen may have several state variants; do not turn every variant into a route.
- Map to UUID/conversation-ID routes, not legacy email routes.
- Record the real API operation and release gate. “Present in OpenAPI” is not equivalent to “enabled in production”.
- Use `CONTRACT_GAP` when UI demands aggregated data or query capabilities not yet exposed as an atomic backend operation.

## Representative Approval Batch 1

| Stitch ID / folder | Screen/state | Role | React Native route | API operations | Reusable components | Decision | Notes/security gate |
|---|---|---|---|---|---|---|---|
| `b01_trang_ch_t_ng_quan_h_m_nay_default` | Member Home / Populated + Daily Summary + Workouts + Nutrition + Water | Member | `/(tabs)/dashboard` | `CONTRACT_GAP` (No backend aggregate `/me/dashboard` endpoint in OpenAPI `fitmate-v1.yaml`) | `ScreenContainer`, `AppTopBar`, `SectionHeader`, `PrimaryButton`, `SecondaryButton`, `FeedbackStates` | `CONVERT` | CONTRACT_GAP recorded. Production route shows honest status and links to functional sub-modules; preview sandbox `/sample-preview` renders Stitch presentation. No mock fallback in production. |
| `e01_danh_s_ch_pt_default` | Trainer List (Marketplace) / Filterable directory with pagination | Member | `/(tabs)/marketplace` | `listTrainers` (`GET /trainers`) | `ScreenContainer`, `AppTopBar`, `SearchInput`, `FilterChipGroup`, `TrainerCard`, `LoadingSkeleton`, `EmptyState`, `ErrorState`, `OfflineState` | `CONVERT` | READY with CONTRACT_GAP: Server pagination via `cursor` and filtering by `specialty`, `minPriceVnd`, `maxPriceVnd`, `minRating`. CONTRACT_GAP: Full-text search not supported by server contract, search filters client-side across loaded page items. |
| `e02_h_s_c_ng_khai_hu_n_luy_n_vi_n_default` | Trainer Public Profile & Services | Member / Public | `/(modals)/trainer/[id]` | `getTrainer` (`GET /trainers/{id}`), `getTrainerAvailability` (`GET /trainers/{id}/availability?from=&to=`) | `ScreenContainer`, `AppTopBar`, `TrainerCard`, `SectionHeader`, `Badge`, `ReviewCard`, `PrimaryButton`, `SecondaryButton`, `NotFoundErrorState`, `ErrorState` | `CONVERT` | READY. Strict trainer UUID route parameter. Maps wire DTO `PTPublicDetail` (`services`, `reviews`). Strictly zero PII. CTAs for booking/chat are capability-gated until MOB-801 integration. |

## Full Stitch Export Inventory

| Stitch ID / Folder | Target Screen Description | Role | Projected Expo Route | API Operations / Gate | Decision |
|---|---|---|---|---|---|
| `a01_ch_o_m_ng_default` | Welcome / Onboarding splash | Public | `/(auth)/welcome` | None (Local static introductory flow) | `LOCAL_UI` |
| `a02_ng_nh_p_default` | Authentication Login | Public | `/(auth)/login` | `POST /auth/login` (`login`) | `CONTRACT_READY` |
| `a03_ng_k_default` | Registration | Public | `/(auth)/register` | `POST /auth/register` (`register`) | `CONTRACT_READY` |
| `a04_x_c_minh_email_email_link_state` | Email Verification | Public | `/(auth)/verify-email` | `CONTRACT_GAP` (No email verification endpoint in OpenAPI; see `mobile-api-readiness.md`) | `CONTRACT_GAP` |
| `a05_qu_n_m_t_kh_u_reset_flow` | Forgot / Reset Password | Public | `/(auth)/forgot-password` | `POST /auth/password/forgot` (`forgotPassword`) & `POST /auth/password/reset` (`resetPassword`) | `CONTRACT_READY` |
| `b01_trang_ch_t_ng_quan_h_m_nay_default` | Member Home Dashboard | Member | `/(tabs)/dashboard` | `CONTRACT_GAP` (Missing atomic aggregate `/me/dashboard` endpoint in OpenAPI) | `CONTRACT_GAP` |
| `c01_nh_t_k_dinh_d_ng_default` | Nutrition Diary | Member | `/(tabs)/nutrition` | `GET /me/nutrition/meals`, `GET /me/nutrition/schedule` | `CONTRACT_READY` |
| `c02_nh_p_m_n_th_c_ng_default` | Manual Meal Entry | Member | `/(modals)/nutrition/add-manual` | `POST /me/nutrition/meals` | `CONTRACT_READY` |
| `c03_ch_p_nh_m_n_n_camera_viewfinder` | Meal Camera Scan | Member | `/(modals)/nutrition/camera-scan` | Device Camera (`LOCAL_UI`) + `POST /me/nutrition/scan` | `CONTRACT_READY` |
| `c04_ph_n_t_ch_v_x_c_nh_n_m_n_candidates_review` | AI Meal Analysis Review | Member | `/(modals)/nutrition/ai-review` | `POST /me/nutrition/scan` (response mapping) | `CONTRACT_READY` |
| `c05_chi_ti_t_m_n_ghi_default` | Meal Entry Detail | Member | `/(modals)/nutrition/[id]` | `PATCH /me/nutrition/meals/{id}`; Meal DELETE is `CONTRACT_GAP` | `CONTRACT_READY` |
| `c06_th_c_n_tu_n_default` | Weekly Meal Plan | Member | `/nutrition/weekly-plan` | `GET /me/nutrition/schedule` | `CONTRACT_READY` |
| `c07_th_m_thay_m_n_d_ki_n_default` | Substitute / Add Meal Plan Item | Member | `/nutrition/substitute` | `CONTRACT_GAP` (Meal plan item substitution not in OpenAPI) | `CONTRACT_GAP` |
| `d01_k_ho_ch_t_p_default` | Workout Plans Overview | Member | `/(tabs)/workout` | `GET /me/workout/plans`, `GET /me/workout/sessions` | `CONTRACT_READY` |
| `d02_chi_ti_t_k_ho_ch_default` | Workout Plan Detail | Member | `/workout/[id]` | `CONTRACT_GAP` (Single plan detail GET missing; embedded in list) | `CONTRACT_GAP` |
| `d03_t_o_s_a_k_ho_ch_b_i_t_p_default` | Create / Edit Workout Plan | Member / PT | `/workout/edit/[id]` | `POST /me/workout/plans` (`createWorkoutPlan`); Plan delete is `CONTRACT_GAP` | `CONTRACT_READY` |
| `d04_bu_i_t_p_ang_di_n_ra_active_set` | Active Workout Session | Member | `/workout/active-session` | Local timer engine (`LOCAL_UI`) + `POST /me/workout/sessions` | `CONTRACT_READY` |
| `d05_kh_i_ph_c_k_t_th_c_s_m_modals` | Session Early End / Recovery | Member | Modal in Active Workout | Local UI state variant | `LOCAL_UI` |
| `d06_t_ng_k_t_bu_i_t_p_pending_sync` | Workout Summary & Offline Sync | Member | `/workout/summary` | `POST /me/workout/sessions` | `CONTRACT_READY` |
| `d07_l_ch_s_t_p_default` | Workout History | Member | `/workout/history` | `GET /me/workout/sessions` | `CONTRACT_READY` |
| `d08_chi_ti_t_bu_i_t_p_default` | Workout Session Log Detail | Member | `/workout/log/[id]` | `GET /me/workout/sessions/{id}` | `CONTRACT_READY` |
| `d09_c_n_n_ng_default` | Weight Tracker | Member | `/metrics/weight` | `CONTRACT_GAP` (No timeseries weight metrics API; weight is field on UserProfile) | `CONTRACT_GAP` |
| `d10_g_i_i_u_ch_nh_ai_default` | AI Workout Suggestions | Member | `/workout/ai-suggestions` | `CAPABILITY_GATED` (AI routes gated by BE-817 release gate) | `CAPABILITY_GATED` |
| `e01_danh_s_ch_pt_default` | Trainer Marketplace Directory | Member | `/(tabs)/marketplace` | `GET /trainers` (Server cursor pagination; full-text search is `CONTRACT_GAP`) | `CONTRACT_READY` |
| `e02_h_s_c_ng_khai_hu_n_luy_n_vi_n_default` | Trainer Public Profile | Member / Public | `/(modals)/trainer/[id]` | `GET /trainers/{id}`, `GET /trainers/{id}/availability?from=&to=` | `CONTRACT_READY` |
| `e03_ch_n_d_ch_v_v_gi_default` | Service & Package Selection | Member | `/booking/select-service` | `GET /trainers/{id}` (Embedded `services` array) | `CONTRACT_READY` |
| `e04_x_c_nh_n_t_l_ch_default` | Confirm Booking Request | Member | `/booking/confirm` | `POST /bookings/holds`, `POST /bookings/confirm` (`CONTRACT_GAP` on ID routes vs confirm) | `CONTRACT_GAP` |
| `e05_tr_v_t_thanh_to_n_status_matrix` | Payment Status & Checkout | Member | `/booking/payment-status` | `CAPABILITY_GATED` (payOS / manual settlements gated by BE-808..810) | `CAPABILITY_GATED` |
| `e06_chi_ti_t_l_ch_h_n_default` | Appointment Detail | Member | `/appointments/[id]` | `GET /me/bookings` (View model item lookup) | `CONTRACT_READY` |
| `e07_l_ch_h_n_c_a_t_i_default` | My Appointments | Member | `/appointments` | `GET /me/bookings` | `CONTRACT_READY` |
| `e08_h_y_i_l_ch_theo_d_i_ho_n_ti_n_default` | Cancel / Reschedule & Refund | Member | `/appointments/[id]/reschedule` | `POST /me/bookings/{id}/reschedule`, `POST /me/bookings/{id}/cancel` | `CONTRACT_READY` |
| `e09_nh_gi_pt_default` | Rate & Review Trainer | Member | `/appointments/[id]/review` | `CONTRACT_GAP` (Missing `POST /trainers/{id}/reviews` in OpenAPI) | `CONTRACT_GAP` |
| `f01_b_ng_tin_c_ng_ng_default` | Community Feed | Member | `/(tabs)/social` | `GET /social/posts` | `CONTRACT_READY` |
| `f02_t_o_b_i_vi_t_default` | Create Community Post | Member | `/community/create-post` | `POST /social/posts` | `CONTRACT_READY` |
| `f03_chi_ti_t_b_i_vi_t_b_nh_lu_n_default` | Post Detail & Comments | Member | `/community/post/[id]` | `GET /social/posts/{id}`, `POST /social/posts/{id}/comments`, `POST /social/posts/{id}/reactions` | `CONTRACT_READY` |
| `f04_b_o_c_o_ho_c_ch_n_default` | Report / Block User or Content | Member | Modal / Sheet | `POST /social/reports`, `POST /social/blocks` | `CONTRACT_READY` |
| `f05_h_s_c_ng_khai_th_nh_vi_n_default` | Member Public Profile | Member / Public | `/user/[id]` | `CONTRACT_GAP` (Missing public member profile endpoint in OpenAPI) | `CONTRACT_GAP` |
| `f06_t_m_ng_i_v_b_n_b_default` | Find Friends & Members | Member | `/community/search` | `GET /social/friends`; Member search query is `CONTRACT_GAP` | `CONTRACT_READY` |
| `f07_h_p_th_tin_nh_n_default` | Direct Messages Inbox | Member / PT | `/messages` | `GET /chat/friends/conversations` | `CONTRACT_READY` |
| `f08_cu_c_tr_chuy_n_history_restricted_composer` | Chat Conversation | Member / PT | `/messages/[conversationId]` | `GET /chat/friends/conversations/{id}/messages`, `POST /chat/friends/messages` | `CONTRACT_READY` |
| `fitmate_mobile_system` | Design System Specs & Tokens | Developer | `mobile/src/theme/designTokens.ts` | Design Token Repository | `REFERENCE_ONLY` |
| `g01_danh_s_ch_h_i_tho_i_ai_default` | AI Assistant Chat History | Member | `/ai/conversations` | `GET /chat/ai/threads` | `CONTRACT_READY` |
| `g02_chat_ai_t_ng_t_c_structured_suggestion_review` | Interactive AI Chat | Member | `/ai/chat/[id]` | `GET /chat/ai/threads/{id}/messages`, `POST /chat/ai/messages` | `CONTRACT_READY` |
| `h01_th_ng_b_o_default_expired_target_fallback` | Notification Center | Member / PT | `/notifications` | `GET /me/notifications`, `POST /me/notifications/{id}/read` | `CONTRACT_READY` |
| `h02_danh_s_ch_y_u_c_u_h_tr_default` | Support Ticket List | Member / PT | `/support` | `CONTRACT_GAP` (User support tickets missing in OpenAPI) | `CONTRACT_GAP` |
| `h03_t_o_y_u_c_u_ph_n_nh_bu_i_t_p_linked_case` | Submit Support Ticket | Member / PT | `/support/new` | `CONTRACT_GAP` (User support tickets missing in OpenAPI) | `CONTRACT_GAP` |
| `h04_chi_ti_t_y_u_c_u_h_tr_thread_reply` | Support Ticket Thread | Member / PT | `/support/[id]` | `CONTRACT_GAP` (User support tickets missing in OpenAPI) | `CONTRACT_GAP` |
| `i03_b_ng_linh_ki_n_v_quy_chu_n_thi_t_k_default` | Component Library Guide | Developer | `mobile/app/sample-preview.tsx` | Development Component Showcase | `REFERENCE_ONLY` |
| `p01_t_ng_quan_pt_default` | Trainer Dashboard | PT | `/(pt-tabs)/overview` | `CONTRACT_GAP` (Missing PT aggregate dashboard endpoint in OpenAPI) | `CONTRACT_GAP` |
| `p02_h_s_chuy_n_m_n_v_d_ch_v_default` | Trainer Professional Profile & Services | PT | `/pt/profile-services` | `GET /me/services`, `POST /me/services`, `PATCH /me/services/{id}`, `DELETE /me/services/{id}` | `CONTRACT_READY` |
| `p03_l_ch_r_nh_default` | Trainer Schedule Management | PT | `/pt/schedule` | `GET /me/availability?from=&to=`, `PUT /me/availability?from=&to=` | `CONTRACT_READY` |
| `p04_ch_ng_ch_c_a_t_i_default` | Trainer Certifications | PT | `/pt/certificates` | `GET /me/certificates`, `POST /uploads`, `POST /me/certificates` | `CONTRACT_READY` |
| `p05_qu_n_l_bu_i_v_i_kh_ch_allowed_actions` | Manage Client Sessions | PT | `/pt/client-sessions` | `GET /me/bookings` | `CONTRACT_READY` |
| `p06_doanh_thu_hu_n_luy_n_vi_n_default` | Trainer Revenue & Earnings | PT | `/pt/earnings` | `GET /me/revenue`, `GET /me/revenue/{bookingId}` | `CONTRACT_READY` |
| `p07_chi_ti_t_kho_n_chi_default` | Payout Detail & Banking Statement | PT | `/pt/earnings/payout/[id]` | `CONTRACT_GAP` (PT payout statement missing in OpenAPI; only admin manual settlements exist) | `CONTRACT_GAP` |
