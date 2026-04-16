# Third-Party Services & Accounts

Accounts and services recommended to fully launch Jhesster Chess — backend, mobile, and production infrastructure.

---

## 1. Backend Hosting

You need somewhere to run the Express + Socket.io server.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[Railway](https://railway.app)** | 500 hrs/month | Easiest — push to deploy, built-in env vars, persistent process |
| **[Render](https://render.com)** | 750 hrs/month | Good alternative; free tier spins down on inactivity (adds latency) |
| **[Fly.io](https://fly.io)** | 3 shared VMs | More control, better for low-latency online play; slight learning curve |

**Recommendation:** Railway for simplicity. Fly.io if online multiplayer latency matters.

---

## 2. Database

User accounts, ratings, game history, and leaderboards all need a database.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[MongoDB Atlas](https://www.mongodb.com/atlas)** | 512 MB shared cluster | Pairs naturally with Mongoose; easy to set up |
| **[Supabase](https://supabase.com)** | 500 MB PostgreSQL | Includes auth, realtime, and REST API out of the box |
| **[Neon](https://neon.tech)** | 0.5 GB PostgreSQL | Serverless Postgres; great if you prefer SQL |

**Recommendation:** MongoDB Atlas if you stay with the current Express setup. Supabase if you want auth and realtime handled for you later.

---

## 3. Domain Name

A custom domain for the web app and PWA install.

| Registrar | Notes |
|-----------|-------|
| **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** | At-cost pricing (no markup), free WHOIS privacy, integrates with Cloudflare CDN |
| **[Namecheap](https://www.namecheap.com)** | Good prices, easy DNS management |
| **[Porkbun](https://porkbun.com)** | Often the cheapest for `.com` and `.io` |

**Recommendation:** Cloudflare Registrar — you will likely use Cloudflare for CDN anyway, so keeping it together saves DNS management steps.

---

## 4. CDN / DNS / DDoS Protection

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[Cloudflare](https://www.cloudflare.com)** | Unlimited bandwidth | Caching, HTTPS, DDoS mitigation, PWA-friendly headers — all free on the base plan |

**Recommendation:** Essential. Put the frontend and API behind Cloudflare from day one.

---

## 5. Mobile App Stores

Required if you publish via Capacitor (native mobile wrapper).

| Store | Cost | Notes |
|-------|------|-------|
| **[Apple Developer Program](https://developer.apple.com/programs/)** | $99 / year | Required to publish on the iOS App Store and enable PWA install prompts on Safari |
| **[Google Play Console](https://play.google.com/console)** | $25 one-time | Required to publish on the Android Play Store |

**Note:** If you only ship a PWA (no Capacitor), you do not need these accounts — users install via the browser's "Add to Home Screen" prompt. Apple's Safari still shows the prompt without a developer account. Google Play has a dedicated PWA publishing flow if you later want store presence without a native wrapper ([Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)).

---

## 6. Email (Transactional)

Needed for: email verification, password reset, and any notification emails.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[Resend](https://resend.com)** | 3,000 emails/month | Modern API, great DX, dead-simple integration with Node |
| **[SendGrid](https://sendgrid.com)** | 100 emails/day | Industry standard; more complex but very reliable |
| **[Postmark](https://postmarkapp.com)** | 100 emails/month (dev) | Best deliverability; paid for production volume |

**Recommendation:** Resend — easiest to integrate and the free tier is generous for an early-stage app.

---

## 7. Error Monitoring

Catch crashes and unexpected errors in production before users report them.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[Sentry](https://sentry.io)** | 5,000 errors/month | Industry standard; works for both frontend (React) and backend (Node) |
| **[Highlight.io](https://www.highlight.io)** | 500 sessions/month | Session replay + errors — useful for debugging mobile UX issues |

**Recommendation:** Sentry. One SDK covers both the Vite frontend and the Express backend.

---

## 8. Analytics

Understand how players use the app without compromising their privacy.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[Plausible](https://plausible.io)** | 30-day trial, then paid | Privacy-friendly, no cookies, GDPR-compliant |
| **[PostHog](https://posthog.com)** | 1M events/month | Open-source; product analytics + feature flags + session replay |
| **[Umami](https://umami.is)** | Self-host free | Lightweight, open-source, self-hostable alternative to Plausible |

**Recommendation:** PostHog — the free tier is very generous and you get feature flags (useful for rolling out new features) alongside analytics.

---

## 9. CI/CD (Continuous Integration)

Automate testing and deployment when you push code.

| Service | Free tier | Notes |
|---------|-----------|-------|
| **[GitHub Actions](https://github.com/features/actions)** | 2,000 min/month (public repos: unlimited) | Already available if the repo is on GitHub; no separate sign-up needed |

**Recommendation:** GitHub Actions. If the repo is already on GitHub this requires no new account.

---

## 10. Optional / Future

These are not required to launch but are worth knowing about:

| Service | Purpose |
|---------|---------|
| **[Firebase Cloud Messaging](https://firebase.google.com)** | Push notifications (e.g. "Your opponent moved") for the PWA and native mobile builds |
| **[Lichess API](https://lichess.org/api)** | Free, no-auth access to millions of real chess puzzles — useful if you want to replace the hand-crafted puzzle set with a live feed |
| **[Chess.com Public API](https://www.chess.com/news/view/published-data-api)** | Read-only access to public player stats and games |
| **[Stripe](https://stripe.com)** | Payments — if you ever add a premium tier or cosmetic purchases |
| **[OneSignal](https://onesignal.com)** | Easier push notification alternative to Firebase (free tier: unlimited web push) |

---

## Priority Order

If you are setting things up for the first time, do them in this order:

1. **GitHub** (source control — should already exist)
2. **Cloudflare** (domain + CDN — set up before anything goes public)
3. **Domain registrar** (buy the domain)
4. **MongoDB Atlas or Supabase** (database — needed before backend can run in production)
5. **Railway or Render** (deploy the backend)
6. **Vercel or Netlify** (deploy the frontend — or serve it from Railway alongside the backend)
7. **Resend** (email — needed for auth flows)
8. **Sentry** (error monitoring — add early so you catch prod bugs immediately)
9. **PostHog** (analytics — add once there are real users)
10. **Apple Developer / Google Play** (only when targeting the app stores)
