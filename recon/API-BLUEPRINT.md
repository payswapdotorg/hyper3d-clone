# Hyper3D (Rodin by Deemos) — API Blueprint & Functional Recon

Captured live 2026-10-17 by the lead through the replay browser (logged-in
session, real generation executed end-to-end). Source of truth for the
hyper3d-clone build.

## 1. Architecture (observed)

- **Frontend**: hyper3d.ai — React 18.3 SPA (react-router), static/js/main.*.js
- **API**: `https://api.hyper3d.com` (XHR with `Authorization: Bearer <token>`)
- **Files/CDN**: `https://file.hyper3d.com` (signed URLs, Volcengine TOS,
  `X-Tos-*` query params, 7-day expiry)
- **Auth**: Google OAuth (fedcm) → login page; session in localStorage:
  - `token` (32-char opaque, Bearer for all api.hyper3d.com calls)
  - `userInfo` (full profile JSON, see §5)
  - `user_uuid`
- **Analytics**: umami (hyper3d.ai/api/send) + GA4 + sentry.deemos.com
- **Captcha** (login/anti-bot): `/api/init` returns config —
  `{"captcha":{"enabled":true,"turnstile":{"site_key":"0x4AAA..."},"aliyun":{"scene_id":"oidkxwje","prefix":"zrzuah"},"geetest":{"captcha_id":"c4f1af..."}}}`
  (Aliyun cloudauth device fingerprint POSTs observed during login)

## 2. The generation flow (agentic Gen-2.5 — CAPTURED LIVE)

Workspace `/workspace/rodin`. Input card tabs: **Image to 3D | 3D Editing |
WorldGen** (+ ChatAvatar product at /workspace/chatavatar, Video at
/workspace/video). Version selector: **Gen-1.5 V1.2 / Gen-2.5 Agent-Ready**.
Text prompt is ALWAYS optional guidance — **an image is REQUIRED** in both
standard and agentic modes ("Add at least one image to start Agentic Mode").
Agentic toggle (OFF/ON pill with "5 min" and "1 Credit" chips) saves to user
preferences (`rodin_generation_mode: "agentic"|"standard"` via
`POST /api/user/update_info`).

### Step-by-step (what we executed):
1. **Upload image** → input[type=file] (accepts .jpg/.jpeg/.png/.webp)
2. **Auto-analysis** (fires automatically): `POST /api/task/rodin_mesh_image_process`
   - REQUEST: FormData (the image file) + JSON fields — observed response
     params: `{"prompt":"A red fresh apple. simple geometry.","height":8,"allow_face_enhance":true,"default_face_enhance":false,"is_multiview":false,"num_multiview":0,"bbox":[]}`
   - The app VLM-captions the image into a prompt ("A red fresh apple. simple geometry.")
   - `height: 8` = default bounding height; `bbox: []` = ControlNet bboxes
3. **Effort modal** (on first GENERATE click): "Which thinking effort is more
   suitable for you?" — cards: **Extreme-High ~80s / High ~40s / Medium ~20s /
   Low ~9s / Extreme-Low ~4s**; right panel shows showcase categories
   (3A Gaming, Product Mockup, Hard-Surface Workflows, Character Creation,
   Premium Showcases, Virtual Production); SELECT button confirms
4. **GENERATE** (`#rodinGenerateBtn`, label "GENERATE Free Preview" for new
   users / "GENERATE 0.5 Credits" standard / agentic = 10 credits) →
   `POST /api/task/rodin_agentic`
   - RESPONSE: `{"uuid":"0bb1d4a9-...","producer":"agentic","job":{"uuids":["48c8d17d-..."],"subscription_key":"<JWT with jobIds+iat>"}}`
5. **Progress**: agentic status messages appear in a pill ("I'm taking a closer
   look at your reference. I'm following the outer edge of the object to
   understand...", "I'm acquiring attachment heights in relation to the main
   body", "I'm reviewing the layout from a wider view") + polling via
   `POST /api/task/card/{task_uuid}` (task.step: "ModelGenerate")
6. **Result**: `GET /api/task/rodin_agentic_history?uuid={task_uuid}` →
   versions v3 with signed URLs. Task card fields below (§4).

## 3. API endpoints (verified)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/init` | GET | captcha config (turnstile/aliyun/geetest) |
| `/api/user/get_info` | POST | profile: balance, subscriptions, preferences |
| `/api/user/update_info` | POST | preference updates (agentic mode, effort) |
| `/api/task/rodin_mesh_image_process` | POST | image upload + auto-caption (FormData) |
| `/api/task/rodin_agentic` | POST | create agentic generation task |
| `/api/task/card/{task_uuid}` | POST | task detail/status poll |
| `/api/task/rodin_agentic_history?uuid=` | GET | generation versions + signed model URLs |
| `/api/task/list_Rodin/Featured?user_uuid=&page=&limit=&step=ModelGenerate` | GET | featured gallery (6666 tasks, 16/page) |
| `/api/task/list_Rodin/Mine?user_uuid=...&show_private=true` | GET | user's own tasks |
| `/api/story/stories` | POST | community X/Twitter shares (517 approved) |
| `/api/subscription/subscribe_to_plan` | POST | Stripe subscription create (Billing provider Stripe, plan levels Creator/Business, monthly/yearly, promotion codes) |
| `/api/education/status` | GET | education discount verification |

## 4. Task object (verbatim from our apple generation)

```json
{
  "task_uuid": "0bb1d4a9-e701-4871-ace0-9491e775238e",
  "type": "RodinAgentic",
  "prompt": "A red fresh apple. simple geometry.",
  "step": "ModelGenerate",
  "pending_jobs": [],
  "time": "2026-10-17T16:32:39.549Z",
  "author": {"username": "yaslen Catty", "user_uuid": "...", "email": "...", "avatar_url": "..."},
  "lisenced": false, "is_private": false, "is_hidden": false,
  "is_featured": false, "num_like": 0, "is_like": false,
  "image_url": "<signed .webp render>",
  "video_url": "<signed .webm turntable>",
  "usage": {"elapsed_seconds": 280.261, "used_tokens": 807808},
  "settings": {"height": 8, "version": "v3", "type": "model_generate"},
  "model_preview_info": {"model": "<signed model.usdz>"},
  "card_poster_info": {"preview_image": "<signed render.webp>"},
  "agentic_generate_info": {
    "input_image": {"0000.webp": "<signed input>"},
    "capabilities": ["prompt_refine", "usdz", "blend", "source"],
    "versions": {"v3": {"model": "<usdz>", "preview_image": "<webp>", "generation_time": "...", "generation_uuid": "48c8d17d-..."}}
  },
  "user_state": "DonePreview",
  "generate_time": "2026-10-17T16:37:21.211Z"
}
```

Observed facts: agentic generation took **280s**, used **807,808 tokens**,
cost **10 credits** (balance 50→40). Standard = "0.5 Credits"/Free Preview.
Outputs: **model.usdz** (4.3MB, USD scene), **render.webp** (preview),
**render.webm** (turntable video). Capabilities: prompt_refine, usdz, blend,
source.

## 5. User object (verbatim)

```json
{
  "user_uuid": "c916e545-...", "username": "yaslen Catty",
  "email": "yaslencatty@gmail.com", "balance": 50, "frozen": 0,
  "chances_left_to_set_private_task": 10,
  "registration_time": "2026-10-17T16:02:07.734Z",
  "has_complete_order": false, "has_purchase_credit": false,
  "preferences": {"rodin_generation_mode": "standard"},
  "subscriptions": {"current_active": false, "highest_level": "Free",
    "trial_eligibility": true, "active_subscriptions": [],
    "quota_unlimited_plan": 5, "quota_reset_remain": 52652},
  "privileges": ["LowPriorityQueue"], "features": ["user_queue.low_priority"],
  "referral_code": "T9AAG055"
}
```

## 6. UI/UX reference (screenshots in bundle)

- `shot-landing.jpg` — marketing home: nav (Products/Features/API/Pricing/
  Resources), "7-Day Trial Free" badge, hero "Create 3D Models The Easy Way"
- `shot-studio.jpg` — workspace: Rodin branding "Gen-2.5 Agent-Ready", gallery
  rail (ASSET/EXPLORE, Featured/Mine/Liked), credits display
- `shot-effort-modal.jpg` — effort selection modal (5 efforts + showcases)
- `shot-agentic-progress.jpg` — agentic status pills
- `apple-render.webp` — OUR generated apple's render (real output)
- `apple-model.usdz` — OUR generated USDZ (real 3D asset, 4.3MB)
- `apple-turntable.webm` — turntable video of the generated model
- `test-apple.png` / `test-mug.png` — the input images we used

## 7. Pricing (observed in UI)

- Subscription panel: "24/month, 7-DAY FREE TRIAL", Creator/Business tiers,
  "Unlock 5x and 10x tiers with Business Plan", "1 results at a time"
- Credits Top-Up: 8 / 16 / 32 credits packs + Custom
- Subscribe modal: "First Month 80% Off" promo (Business $120/mo, promo codes
  exist — e.g. IGqSyeZk observed in a subscribe POST)
- Code Redemption, Affiliate Partner, Refer-a-friend programs
