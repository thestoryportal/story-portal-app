# App store listing process

**Created:** 2025-12-08T04:16:37.535Z
**Updated:** 2025-12-08T04:18:52.514Z
**Messages:** 6

---

### 👤 USER (2025-12-08T04:16:36.852Z)

What is the process for getting an app listed on the different app stores?

---

### 🤖 ASSISTANT (2025-12-08T04:16:38.283Z)

Gathering concise app store policy overview

---

### 🤖 ASSISTANT (2025-12-08T04:16:41.088Z)

Short version: every store is the same *shape* (account → policies → build → metadata → upload → review → release), but the details and fees differ.

I’ll hit the big three: **Apple App Store**, **Google Play**, and **Microsoft Store**.

---

## 1. Apple App Store (iOS / iPadOS / visionOS / etc.)

**1) Get a developer account**

- Join the **Apple Developer Program** ($99/year for individuals/companies).  
- This gives you access to App Store Connect, TestFlight, and distribution tools. citeturn0search15  

**2) Read the rules**

- Apple’s **App Review Guidelines** (Safety, Performance, Business, Design, Legal) are strict. Violations here are the #1 cause of rejection. citeturn0search6  

**3) Prepare the app**

- Set a **bundle identifier**, version, signing, and capabilities in Xcode (or your build system).
- Build a **release build** and test thoroughly on real devices (ideally via TestFlight).

**4) Create the App Store listing**

In **App Store Connect**:

- Reserve the **app name** and set the primary language.
- Fill in:
  - Description, subtitle, keywords
  - Category, age rating, pricing
  - Screenshots and (optional) preview videos
  - Privacy policy URL and data collection disclosures citeturn0search0turn0search9  

**5) Upload the build**

- Archive and upload from Xcode / Transporter or via CI (e.g., EAS, fastlane). citeturn0search12turn0search18  

**6) Submit for review**

- Choose distribution method (manual release, automatic, phased).
- Answer export-compliance, content, and encryption questions.
- Hit **Submit for Review** and wait for App Review.

**7) Respond & release**

- If rejected, fix issues, upload a new build, and resubmit.
- If approved, release immediately or schedule/phased release.

---

## 2. Google Play Store (Android)

**1) Create a Google Play Developer account**

- One-time **$25 registration fee**, then access to **Play Console**. citeturn0search7turn0search13  

**2) Prepare the app**

- Set an **applicationId** (package name), versionCode/versionName.
- Generate a **release-signed app bundle (AAB)** – Play now strongly prefers / requires AABs. citeturn0search10  
- Enroll in **Play App Signing** (mandatory for new apps). citeturn0search10  

**3) Create the Play Store listing**

In **Play Console**:

- Click **Create app** and fill:
  - App name, default language
  - App vs game, free vs paid (note: free → paid has restrictions) citeturn0search1turn0search16turn0search19  
- Complete:
  - Store listing (description, screenshots, feature graphic)
  - Content rating questionnaire
  - Target audience & families (if relevant)
  - Privacy policy URL, data-safety form
  - Pricing & distribution countries

**4) Upload the build**

- Upload your **AAB**, configure release track:
  - **Internal testing**, **closed testing**, **open testing**, or **Production**. citeturn0search22  

**5) Review & roll-out**

- Google runs automated checks and a policy review.
- Once approved:
  - You can do a **staged rollout** (e.g., 5%, 20%, 50%) or release to 100% of users. citeturn0search22  

---

## 3. Microsoft Store (Windows)

**1) Get a developer account**

- Use **Microsoft Partner Center** with a Microsoft account.  
- As of 2025, **Microsoft dropped the registration fee** for individual devs in most markets, so sign-up is free. citeturn0search2turn0news25turn0news28  

**2) Reserve app name & create the app**

- In Partner Center:
  - Reserve a **unique app name**.
  - This creates the app entry and overview page. citeturn0search3turn0search11  

**3) Prepare your package**

- Package as **MSIX**, **MSIX bundle**, or supported installer formats (including Win32, MAUI, Electron, PWAs, etc.). citeturn0search2turn0search8turn0search20  

**4) Fill in Store details**

- Description, screenshots, categories, pricing, regions.
- Fill **age rating**, capabilities, privacy policy.

**5) Submit & certification**

- Create a **submission** from the app’s Product release section, upload packages, and send to the Store. citeturn0search3turn0search14  
- Certification typically takes from a few hours up to a few days. citeturn0search17turn0search20  

**6) Publish & update**

- Once passed, you can publish immediately or schedule.
- Future updates go through the same submission pipeline.

---

## 4. Things that are basically the same everywhere

No matter which store:

1. **Developer account**
   - Apple: $99/year  
   - Google Play: $25 one-time  
   - Microsoft Store (indiv.): currently free in most regions citeturn0search15turn0search7turn0news28  

2. **Compliance / policies**
   - Platform policies (content, security, user data, payments).
   - Age ratings, privacy policy, data collection disclosures.

3. **Production build**
   - Correctly signed, versioned, and thoroughly tested.

4. **Store assets**
   - Icon, screenshots for multiple device sizes, description, category, keywords, promo text.

5. **Submission & review**
   - Human + automated review (Apple & Google). Some automated certification on Microsoft.
   - You may get **rejection notes** – you fix, re-upload, resubmit.

6. **Release management**
   - Choice of manual vs scheduled release, and staged rollouts (esp. Google).
   - Ongoing updates go through the same path.

---

If you tell me **which platforms you’re targeting first** (iOS, Android, Windows, plus maybe web/PWA), I can map this into a concrete checklist tailored to your Story Portal MVP, including where a PWA might let you skip or postpone some of this.

---

### 👤 USER (2025-12-08T04:18:36.591Z)

Is the cost just the annuals fees? How long does it take to get an app listed on average?

---

### 🔧 TOOL: web.run (2025-12-08T04:18:38.388Z)

```
【turn0calculator0】 1+1 = 2
```

---

### 🤖 ASSISTANT (2025-12-08T04:18:38.401Z)

Short answer:  
- **Costs:** Mostly just the account fees, but there *can* be other charges depending on how you monetize.  
- **Time to get listed:** From **a few hours to a couple of days** on average, sometimes longer for brand-new developers or “sensitive” apps.

Let’s break it down:

---

## 1. Costs per store

### Apple App Store
- **Developer Program:** $99/year.  
- No per-app listing fee.  
- **Revenue cut:** Apple takes **15–30%** of in-app purchases / paid apps depending on program and revenue tier.
- Optional extras (not from Apple): legal, design, hosting, backend services, etc.

### Google Play Store
- **Developer registration:** $25 **one-time** (lifetime account, unless policies change).  
- No per-app listing fee.  
- **Revenue cut:** usually **15–30%** of in-app purchases / paid apps.

### Microsoft Store
- **Dev account:** As of now, **no registration fee** for individuals in most regions.  
- No per-app listing fee.  
- **Revenue cut:** Depends on whether you use Microsoft’s commerce or your own; if you use their commerce, they take a store commission similar in concept to Apple/Google.

So: yes, from a *pure listing* standpoint, it’s essentially **developer account cost + the store’s revenue share when you sell things**.

---

## 2. How long it takes to get an app listed

These are **rough, real-world averages** once you’ve done all your prep (screenshots, builds, metadata) and hit “Submit”:

### Apple App Store
- Typical review time: **24–48 hours** for many apps.
- Can be:
  - **Under a day** for simple, guideline-clean apps from established accounts.
  - **3–7 days** (or more) if:
    - It’s your first app.
    - There are policy or design questions.
    - It touches sensitive areas (kids, health, finance, user-generated content, etc.).
- Rejections add extra cycles (you fix + resubmit).

### Google Play Store
- For new apps from new accounts, Google often does **slower, more cautious reviews** now.
- Typical:
  - **A few hours to 2 days** for many updates and some new apps.
  - **3–7 days** is common for brand-new dev accounts or certain categories.
- They also sometimes hold rollouts for extra automated checks.

### Microsoft Store
- Often the fastest of the three.
- Typical:
  - **A few hours to 1–2 days** for many submissions.
  - Longer if you request special capabilities or run into certification warnings.

---

## 3. What actually determines speed

Regardless of platform, you’ll be on the faster end if:

- Your **developer account is already active and verified.**
- Your app:
  - Clearly matches a known category.
  - Doesn’t target kids.
  - Doesn’t involve complex payments, gambling, or regulated content.
- Your **metadata is clean** (no keyword stuffing, misleading claims).
- You’ve **filled out privacy/data forms correctly.**

You’ll be on the slower end if:

- It’s your **very first app** from a brand-new account.
- The app is in **health, finance, kids/education, dating, or social** with heavy UGC.
- You get a **rejection** and must resubmit (each iteration adds 1–3+ days).

---

## 4. What this means for you (Story Portal context)

If you had everything ready today and submitted:

- I’d expect:
  - **Google Play:** maybe live in **1–3 days**.
  - **Apple:** realistic expectation **2–5 days**, possibly quicker.
  - **Microsoft:** often **same day to 2 days**.

If you want, next step we can:

- Map a **budget line-item list** (annual fees + hosting + media storage + any 3rd-party services).
- Build a **timeline** from “today” → “MVP in the stores” with buffer for at least one rejection/iteration.

---

