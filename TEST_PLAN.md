# LimaHealth Mobile — End-to-End Test Plan

Flows are grouped so each group can be tested as one sitting. Groups A–C need no
cross-account setup; **group H (cross-role journeys)** needs two devices/emulators
(or web + device) logged in as a member and their assigned counselor at the same time.

## Setup

- Backend running and `EXPO_PUBLIC_API_URL` in `.env.local` pointing at it.
- Demo data: `node LimaHealth/prisma/seed-demo-olivia.js` — creates a student (Olivia),
  her assigned counselor, and a parent, with moods, messages, appointments, notes and alerts.
- Accounts needed:
  - **M1** member (student) with an assigned counselor (Olivia)
  - **M2** member with **no** assigned counselor
  - **C1** counselor assigned to M1
  - **F1** any account with `mustChangePassword = true` (freshly created by an admin)
  - Admin panel (`limahealth-admin`) access, for approving counselor-change requests
- Tip: test on at least one real device (haptics, image picker, Fitbit OAuth deep link `limahealth://`).

Legend: ☐ = to test. Record Pass / Fail / Notes beside each.

---

## A. Launch, Landing & Authentication

| # | Scenario | Steps | Expected |
|---|---|---|---|
| A1 | Cold start splash | Kill app, open | Branded teal splash with heartbeat, then landing screen |
| A2 | Session restore | Log in, kill app, reopen | Lands straight in the role's home (no login) |
| A3 | Org switcher | On landing, tap each org (School / Company / Hospital / NGO) | Colours & labels change (e.g. "Student" vs "Employee", "Counselor" vs other support label) |
| A4 | Member entry | Tap member card | Login screen with member role chip, org theme applied |
| A5 | Counselor entry | Tap provider card | Login screen with counselor role chip |
| A6 | Back from login | Tap ← | Returns to landing |
| A7 | Empty fields | Tap Sign in with blank email/password | Error toast "Please fill in all fields" |
| A8 | Wrong password | Valid email, bad password | "Login Failed" toast with server message; stays on login |
| A9 | Show/hide password | Tap eye icon | Password toggles visible/hidden |
| A10 | Member login | Log in as M1 | "Welcome, <name>!" toast → Insights (home) tab |
| A11 | Counselor login | Log in as C1 | Toast → Counselor Overview (dashboard) |
| A12 | Role mismatch | Enter from *member* card but log in with C1 | Should route to counselor dashboard (routing uses server role) — confirm this is acceptable |
| A13 | Double tap Sign in | Tap Sign in rapidly | Button disabled while loading, single request |
| A14 | Network off | Airplane mode, try login | Error toast, no crash |

## B. Forced Password Change (first login)

| # | Scenario | Steps | Expected |
|---|---|---|---|
| B1 | Redirect | Log in as F1 | Goes to "Security check" change-password screen, not home |
| B2 | Cannot bypass | From change-password, try deep-linking / back into tabs | Redirected back to /change-password |
| B3 | Blank fields | Submit empty | "Please fill in all fields" |
| B4 | Too short | New password < 8 chars | "New password must be at least 8 characters" |
| B5 | Mismatch | New ≠ confirm | "Passwords do not match" |
| B6 | Wrong current | Wrong temporary password | "Couldn't update password" + server message |
| B7 | Success | Valid input | "Password updated" → member home or counselor dashboard by role |
| B8 | Persisted | Kill & reopen app | No longer forced to change password |
| B9 | New password works | Log out, log in with new password | Succeeds |

## C. Sign-out & Session Handling

| # | Scenario | Steps | Expected |
|---|---|---|---|
| C1 | Member logout | Profile → Log out → confirm modal → Sign out | Returns to login; back button does not re-enter tabs |
| C2 | Cancel logout | Open modal, cancel | Stays signed in |
| C3 | Counselor logout | Counselor Profile → Log out | Same as C1 |
| C4 | Expired access token | Wait for / force access-token expiry, then use any screen | Request silently refreshes and succeeds (no logout) |
| C5 | Expired refresh token | Invalidate refresh token server-side, use app | Signed out and sent to login |
| C6 | Concurrent 401s | Expire token, pull-to-refresh a screen with several requests | All requests succeed after one refresh |
| C7 | Cross-role guard | Logged in as member, deep-link to a counselor route (and vice-versa) | Counselor routes redirect non-counselors to /login. **Note:** student routes have no role check — verify a counselor can't use them |

---

## D. Member — Insights (Home) & Fitbit

| # | Scenario | Steps | Expected |
|---|---|---|---|
| D1 | Onboarding modal | First login as member with no Fitbit linked | Fitbit onboarding modal appears |
| D2 | Skip / cooldown | Skip modal, leave and return to Home | Modal does **not** reappear within the cooldown window |
| D3 | Cooldown expiry | After cooldown (or clear storage) | Modal reappears |
| D4 | Connect Fitbit | Tap Connect → complete OAuth with a real Fitbit account | Browser closes back into the app, "Fitbit connected" toast, then **real** vitals (resting HR, steps, calories, sleep) matching the Fitbit app, and "Synced HH:MM" |
| D5 | Cancel OAuth | Close the browser mid-flow | Returns to home, no crash, still unlinked |
| D6 | Linked user | Log in with linked account | No modal; stored vitals show immediately, then refresh from Fitbit |
| D6a | Pull to refresh | Walk some steps, sync the Fitbit app, pull down on Home | Step count updates; "Synced" time changes (max once a minute) |
| D6b | Background sync | Leave the app closed ~30 min | New reading appears (backend log: `[Fitbit] Scheduled sync`) |
| D6c | Revoked access | Remove LimaHealth under fitbit.com → Settings → Applications, then open Home | Onboarding modal returns asking to reconnect |
| D6d | Already-linked Fitbit | Link the same Fitbit to a second member | "This Fitbit is already linked to another account" |
| D7 | AI insight | With data | AI insight card shows; risk > 60 shows high-stress styling |
| D8 | AI CTA | Tap AI call-to-action | Navigates to Wellness tab |
| D9 | Quick mood log | Pick a mood on home and submit | "Mood logged" toast; appears in Mood tab history |
| D10 | Unread message dot | Have C1 send a message | Message icon shows unread indicator within ~30s |
| D11 | Header nav | Tap message icon / avatar | Opens Messages / Profile |
| D12 | Status check fails | Backend down during load | No onboarding modal nag; screen still renders |

## E. Member — Mood Tracking

| # | Scenario | Steps | Expected |
|---|---|---|---|
| E1 | History load | Open Mood tab | Past entries list / chart |
| E2 | No mood selected | Tap save without mood | "Select a mood first" |
| E3 | Save with note | Select mood + note → save | "Reflection saved"; history updates |
| E4 | Pull to refresh | Pull down | Reloads history |
| E5 | Empty state | New member with no logs | Sensible empty state, no crash |
| E6 | Counselor sees it | As C1, open M1 in caseload | New mood appears in student detail |

## F. Member — Wellness & Counselling Booking

| # | Scenario | Steps | Expected |
|---|---|---|---|
| F1 | Wellness overview | Open Wellness tab | Up to 3 upcoming (CONFIRMED/PENDING), up to 3 past (COMPLETED) sessions |
| F2 | Open booking | Tap "Book" CTA | CounselingBooking screen shows assigned counselor |
| F3 | No counselor (M2) | Open booking as M2 | No-counselor state with link to Profile to request one |
| F4 | Incomplete | Book without date or time | "Incomplete" alert |
| F5 | Date range | Inspect dates | Next 5 weekdays only (no weekends) |
| F6 | Book | Pick date + time → Book | "Session Requested!" toast, returns to Wellness; appears as PENDING |
| F7 | Pick a proposed time | After C1 sends options (H3) | Pending proposal card with 2–3 times; tap one → "Time confirmed!" and it moves to upcoming |
| F8 | Proposal race | Pick a time after C1 withdrew the proposal | "Could not confirm" with server error |
| F9 | Pull to refresh | Pull down | Data reloads |

## G. Member — Messages, Alerts, Panic, Privacy, Profile

**Messages**

| # | Scenario | Expected |
|---|---|---|
| G1 | Open thread with existing conversation | Loads messages with counselor |
| G2 | No conversation yet | Empty/no-counselor state with back button |
| G3 | Send message | Appears in thread; empty draft can't be sent |
| G4 | Live receive | Counselor reply appears within ~4s without refresh |
| G5 | Leave screen | Polling stops (check network log) |

**Panic button (floating, member only)**

| # | Scenario | Expected |
|---|---|---|
| G6 | Visible on every member tab; draggable | FAB shows; can be dragged; not shown for counselors/parents |
| G7 | Open & cancel | Modal opens with haptic; Cancel closes |
| G8 | Send without note | "Sent" state naming assigned counselor (or support label if none) |
| G9 | Send with note | Note included in alert (verify on counselor side) |
| G10 | Failure | Offline → error state with message; can retry |
| G11 | Can't close while sending | Close disabled during send |
| G12 | View alert | Tap "view" → Alerts tab |

**Alerts tab**

| # | Scenario | Expected |
|---|---|---|
| G13 | List alerts | Shows own alerts; pull-to-refresh works |
| G14 | Resolve | Marks alert resolved |

**Privacy tab**

| # | Scenario | Expected |
|---|---|---|
| G15 | Consent toggles | Toggle persists after leaving and returning |
| G16 | Toggle failure | Offline → toggle rolls back + "Couldn't save preference" |
| G17 | Fitbit disconnect | Confirm dialog → "Fitbit disconnected"; Home shows onboarding again |
| G18 | Data export | Info alert shown (**note:** UI-only, no API call) |
| G19 | Delete account | Confirm dialog (**note:** Delete does nothing — currently a no-op) |

**Profile**

| # | Scenario | Expected |
|---|---|---|
| G20 | Care team | Shows assigned counselor, or "Request counselor" if none |
| G21 | Request counselor change — empty reason | "Please share a reason for the request" |
| G22 | Request counselor change | "Request sent to your admin"; button shows pending state |
| G23 | Photo — permission denied | "Photo library access is needed" |
| G24 | Photo — upload | "Profile photo updated"; avatar updates on Home too |
| G25 | Change password — blank / mismatch / wrong current / success | Matching toasts. **Note:** no 8-char minimum here unlike first-login screen |
| G26 | Theme picker | Switch theme; applies app-wide and persists across restart |

---

## H. Counselor Workspace

**Dashboard (Overview)**

| # | Scenario | Expected |
|---|---|---|
| H1 | Load | Stats, today's appointments (green = confirmed, amber = pending), recent students/notes |
| H2 | Quick links | Sessions / Caseload / Notes / Messages tiles navigate correctly |
| H3 | Tap appointment/student | Opens student detail |
| H4 | Pull to refresh | Reloads |

**Alerts**

| # | Scenario | Expected |
|---|---|---|
| H5 | Tab badge | Shows unresolved count; updates within ~30s of a new panic alert |
| H6 | Active vs resolved | Separated lists |
| H7 | Resolve | Moves to resolved; badge decrements |
| H8 | Tap alert | Opens that student's detail |

**Caseload & Student detail**

| # | Scenario | Expected |
|---|---|---|
| H9 | Caseload list + search by name/email | Filters correctly, case-insensitive |
| H10 | Student detail | Profile, biometric averages (or "No biometric readings yet"), mood, latest alert, AI insights |
| H11 | Add note (empty / valid) | Empty ignored; valid → "Note saved" and listed |
| H12 | Schedule button | Opens Schedule with student prefilled |
| H13 | Message button | Opens chat with that student |
| H14 | Invalid studentId | Not-found state with back button |

**Scheduling**

| # | Scenario | Expected |
|---|---|---|
| H15 | Defined mode | One slot; submit disabled until date+time set → "Session scheduled" |
| H16 | Options mode | Starts with 2 slots; add 3rd, remove 3rd; submit only when all filled → "Options sent" |
| H17 | Mode switch | Defined ↔ Options keeps/pads slots correctly |
| H18 | Optional reason | Sent when filled, omitted when blank |

**Sessions**

| # | Scenario | Expected |
|---|---|---|
| H19 | Tabs | Today / Upcoming / Proposed / Past bucket correctly (cancelled & completed → Past) |
| H20 | Accept pending | Confirm dialog → "Session confirmed" |
| H21 | Reject pending / Cancel confirmed | Confirm dialog → "Session cancelled" |
| H22 | Withdraw proposal | Confirm → "Proposal withdrawn"; disappears from member's Wellness |
| H23 | Availability toggle | "Now accepting bookings" / "Set to Away" |
| H24 | Weekly hours link | Opens Availability |

**Availability**

| # | Scenario | Expected |
|---|---|---|
| H25 | Load existing hours | Saved days/windows shown |
| H26 | End ≤ start | "Check your hours" error |
| H27 | Save | "Weekly hours saved" and back |

**Notes / Messages / Chat / Profile**

| # | Scenario | Expected |
|---|---|---|
| H28 | Notes list; add note by picking a student | "Note saved"; tap note → student detail |
| H29 | Conversations list | Tap → chat with correct student name |
| H30 | Chat send / live receive (~4s) | Works both ways |
| H31 | Profile photo, password change, theme, logout | Same as member G23–G26, C3 |

---

## I. Cross-Role Journeys (two devices: M1 + C1)

Run these in order — each depends on real round-trips between roles.

1. **Member-initiated booking** — M1 books (F6) → C1 sees it as pending (Dashboard + Sessions/Upcoming) → C1 Accepts (H20) → M1's Wellness shows CONFIRMED. Repeat with Reject → M1 no longer sees it as upcoming.
2. **Counselor-defined session** — C1 schedules a defined slot for M1 (H15) → appears in M1 Wellness.
3. **Counselor proposes options** — C1 sends 2–3 options (H16) → shows in C1 Sessions/Proposed → M1 picks one (F7) → C1 sees it as a booked session, proposal gone. Variant: C1 withdraws first → M1 pick fails (F8).
4. **Messaging** — M1 sends → C1 Messages list + chat updates; C1 replies → M1 Home unread dot (≤30s) and thread (≤4s).
5. **Panic escalation** — M1 panic with note (G9) → C1 Alerts badge increments (≤30s) → C1 opens alert → student detail shows latest alert → C1 resolves → badge decrements; M1 Alerts shows resolved.
6. **Mood visibility** — M1 logs mood with note → C1 student detail shows it.
7. **Counselor change request** — M1 requests change (G22) → admin approves in `limahealth-admin` → M1 Profile/Booking show new counselor; old C1 caseload no longer lists M1.
8. **Account lifecycle** — Admin creates a new member → first login forces password change (B) → Fitbit onboarding (D1) → assigned counselor visible.

## J. Non-functional / Edge Checks

- ☐ Offline on each tab: error toasts, no crashes, no infinite spinners
- ☐ Slow network (throttle): loading states and disabled buttons prevent double submits
- ☐ Org themes: log in with accounts from each org type; labels (member/support) correct everywhere
- ☐ Light/dark themes readable on every screen
- ☐ Keyboard doesn't cover inputs (login, change-password, chat, notes, request modal) on iOS & Android
- ☐ Android hardware back on every screen and modal
- ☐ Small screen (e.g. 360px wide) and large tablet layouts
- ☐ Timezones: book/schedule near midnight; verify times match on both sides

## Known Gaps Spotted While Mapping Flows

These are worth confirming (they may fail the tests above by design):

- **Delete Account** (Privacy) button has no action; **Data Export** only shows an alert.
- **Bio Insights** screen (`app/(student)/biometric.js`) is hidden from tabs and not linked from anywhere.
- **Parent OTP login** exists in `AuthContext` but has no screen in the app.
- `app/test-chart.js` is a reachable dev route.
- Profile password change has no 8-character minimum (first-login screen does).
- Member booking uses fixed time slots (09:00, 10:30, 13:00, 14:30, 16:00), not the counselor's saved availability hours.
- Student route group checks only `mustChangePassword`, not role.
