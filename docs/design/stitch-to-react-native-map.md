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
| `a01_ch_o_m_ng_default` | Welcome / Onboarding splash | Public | `/(auth)/welcome` | None (Local static) | `CONVERT` |
| `a02_ng_nh_p_default` | Authentication Login | Public | `/(auth)/login` | `login` (`POST /auth/login`) | `CONVERT` |
| `a03_ng_k_default` | Registration | Public | `/(auth)/register` | `register` (`POST /auth/register`) | `CONVERT` |
| `a04_x_c_minh_email_email_link_state` | Email Verification | Public | `/(auth)/verify-email` | `verifyEmail` | `CONVERT` |
| `a05_qu_n_m_t_kh_u_reset_flow` | Forgot / Reset Password | Public | `/(auth)/forgot-password` | `forgotPassword` | `CONVERT` |
| `b01_trang_ch_t_ng_quan_h_m_nay_default` | Member Home Dashboard | Member | `/(tabs)/dashboard` | `CONTRACT_GAP` | `CONVERT` |
| `c01_nh_t_k_dinh_d_ng_default` | Nutrition Diary | Member | `/(tabs)/nutrition` | `GET /nutrition` | `CONVERT` |
| `c02_nh_p_m_n_th_c_ng_default` | Manual Meal Entry | Member | `/(modals)/nutrition/add-manual` | `POST /nutrition` | `CONVERT` |
| `c03_ch_p_nh_m_n_n_camera_viewfinder` | Meal Camera Scan | Member | `/(modals)/nutrition/camera-scan` | Device Camera / Expo ImagePicker | `CONVERT` |
| `c04_ph_n_t_ch_v_x_c_nh_n_m_n_candidates_review` | AI Meal Analysis Review | Member | `/(modals)/nutrition/ai-review` | `POST /ai/nutrition/analyze` | `CONVERT` |
| `c05_chi_ti_t_m_n_ghi_default` | Meal Entry Detail | Member | `/(modals)/nutrition/[id]` | `GET /nutrition/{id}` | `CONVERT` |
| `c06_th_c_n_tu_n_default` | Weekly Meal Plan | Member | `/nutrition/weekly-plan` | `GET /nutrition/weekly` | `CONVERT` |
| `c07_th_m_thay_m_n_d_ki_n_default` | Substitute / Add Meal Plan Item | Member | `/nutrition/substitute` | `updateMealPlanItem` | `CONVERT` |
| `d01_k_ho_ch_t_p_default` | Workout Plans Overview | Member | `/(tabs)/workout` | `GET /workout-plans` | `CONVERT` |
| `d02_chi_ti_t_k_ho_ch_default` | Workout Plan Detail | Member | `/workout/[id]` | `GET /workout-plans/{id}` | `CONVERT` |
| `d03_t_o_s_a_k_ho_ch_b_i_t_p_default` | Create / Edit Workout Plan | Member / PT | `/workout/edit/[id]` | `createWorkoutPlan` | `CONVERT` |
| `d04_bu_i_t_p_ang_di_n_ra_active_set` | Active Workout Session | Member | `/workout/active-session` | Local timer + sync | `CONVERT` |
| `d05_kh_i_ph_c_k_t_th_c_s_m_modals` | Session Early End / Recovery | Member | Modal in Active Workout | Local state | `STATE_VARIANT` |
| `d06_t_ng_k_t_bu_i_t_p_pending_sync` | Workout Summary & Offline Sync | Member | `/workout/summary` | `POST /workout-logs` | `CONVERT` |
| `d07_l_ch_s_t_p_default` | Workout History | Member | `/workout/history` | `GET /workout-logs` | `CONVERT` |
| `d08_chi_ti_t_bu_i_t_p_default` | Workout Session Log Detail | Member | `/workout/log/[id]` | `GET /workout-logs/{id}` | `CONVERT` |
| `d09_c_n_n_ng_default` | Weight Tracker | Member | `/metrics/weight` | `GET /metrics/weight` | `CONVERT` |
| `d10_g_i_i_u_ch_nh_ai_default` | AI Workout Suggestions | Member | `/workout/ai-suggestions` | `GET /ai/workout/suggestions` | `CONVERT` |
| `e01_danh_s_ch_pt_default` | Trainer Marketplace Directory | Member | `/(tabs)/marketplace` | `GET /trainers` | `CONVERT` |
| `e02_h_s_c_ng_khai_hu_n_luy_n_vi_n_default` | Trainer Public Profile | Member / Public | `/(modals)/trainer/[id]` | `GET /trainers/{id}` | `CONVERT` |
| `e03_ch_n_d_ch_v_v_gi_default` | Service & Package Selection | Member | `/booking/select-service` | `GET /trainers/{id}/services` | `CONVERT` |
| `e04_x_c_nh_n_t_l_ch_default` | Confirm Booking Request | Member | `/booking/confirm` | `POST /bookings` | `CONVERT` |
| `e05_tr_v_t_thanh_to_n_status_matrix` | Payment Status & Checkout | Member | `/booking/payment-status` | `GET /payments/{id}` | `CONVERT` |
| `e06_chi_ti_t_l_ch_h_n_default` | Appointment Detail | Member | `/appointments/[id]` | `GET /appointments/{id}` | `CONVERT` |
| `e07_l_ch_h_n_c_a_t_i_default` | My Appointments | Member | `/appointments` | `GET /appointments` | `CONVERT` |
| `e08_h_y_i_l_ch_theo_d_i_ho_n_ti_n_default` | Cancel / Reschedule & Refund | Member | `/appointments/[id]/reschedule` | `rescheduleAppointment` | `CONVERT` |
| `e09_nh_gi_pt_default` | Rate & Review Trainer | Member | `/appointments/[id]/review` | `POST /trainers/{id}/reviews` | `CONVERT` |
| `f01_b_ng_tin_c_ng_ng_default` | Community Feed | Member | `/(tabs)/social` | `GET /community/posts` | `CONVERT` |
| `f02_t_o_b_i_vi_t_default` | Create Community Post | Member | `/community/create-post` | `POST /community/posts` | `CONVERT` |
| `f03_chi_ti_t_b_i_vi_t_b_nh_lu_n_default` | Post Detail & Comments | Member | `/community/post/[id]` | `GET /community/posts/{id}` | `CONVERT` |
| `f04_b_o_c_o_ho_c_ch_n_default` | Report / Block User or Content | Member | Modal / Sheet | `POST /reports` | `CONVERT` |
| `f05_h_s_c_ng_khai_th_nh_vi_n_default` | Member Public Profile | Member / Public | `/user/[id]` | `GET /users/{id}/public` | `CONVERT` |
| `f06_t_m_ng_i_v_b_n_b_default` | Find Friends & Members | Member | `/community/search` | `GET /users/search` | `CONVERT` |
| `f07_h_p_th_tin_nh_n_default` | Direct Messages Inbox | Member / PT | `/messages` | `GET /conversations` | `CONVERT` |
| `f08_cu_c_tr_chuy_n_history_restricted_composer` | Chat Conversation | Member / PT | `/messages/[conversationId]` | `GET /conversations/{id}/messages` | `CONVERT` |
| `fitmate_mobile_system` | Design System Specs & Tokens | Developer | `mobile/src/theme/designTokens.ts` | Design Token Repository | `REFERENCE_ONLY` |
| `g01_danh_s_ch_h_i_tho_i_ai_default` | AI Assistant Chat History | Member | `/ai/conversations` | `GET /ai/conversations` | `CONVERT` |
| `g02_chat_ai_t_ng_t_c_structured_suggestion_review` | Interactive AI Chat | Member | `/ai/chat/[id]` | `POST /ai/chat` | `CONVERT` |
| `h01_th_ng_b_o_default_expired_target_fallback` | Notification Center | Member / PT | `/notifications` | `GET /notifications` | `CONVERT` |
| `h02_danh_s_ch_y_u_c_u_h_tr_default` | Support Ticket List | Member / PT | `/support` | `GET /support/tickets` | `CONVERT` |
| `h03_t_o_y_u_c_u_ph_n_nh_bu_i_t_p_linked_case` | Submit Support Ticket | Member / PT | `/support/new` | `POST /support/tickets` | `CONVERT` |
| `h04_chi_ti_t_y_u_c_u_h_tr_thread_reply` | Support Ticket Thread | Member / PT | `/support/[id]` | `GET /support/tickets/{id}` | `CONVERT` |
| `i03_b_ng_linh_ki_n_v_quy_chu_n_thi_t_k_default` | Component Library Guide | Developer | `mobile/app/sample-preview.tsx` | Development Component Showcase | `REFERENCE_ONLY` |
| `p01_t_ng_quan_pt_default` | Trainer Dashboard | PT | `/(pt-tabs)/overview` | `GET /pt/dashboard` | `CONVERT` |
| `p02_h_s_chuy_n_m_n_v_d_ch_v_default` | Trainer Professional Profile & Services | PT | `/pt/profile-services` | `PUT /pt/profile` | `CONVERT` |
| `p03_l_ch_r_nh_default` | Trainer Schedule Management | PT | `/pt/schedule` | `PUT /pt/availability` | `CONVERT` |
| `p04_ch_ng_ch_c_a_t_i_default` | Trainer Certifications | PT | `/pt/certificates` | `GET /pt/certificates` | `CONVERT` |
| `p05_qu_n_l_bu_i_v_i_kh_ch_allowed_actions` | Manage Client Sessions | PT | `/pt/client-sessions` | `GET /pt/client-sessions` | `CONVERT` |
| `p06_doanh_thu_hu_n_luy_n_vi_n_default` | Trainer Revenue & Earnings | PT | `/pt/earnings` | `GET /pt/earnings` | `CONVERT` |
| `p07_chi_ti_t_kho_n_chi_default` | Payout Detail & Banking Statement | PT | `/pt/earnings/payout/[id]` | `GET /pt/payouts/{id}` | `CONVERT` |
