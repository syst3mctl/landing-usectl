# usectl Privacy Policy

**Last updated:** November 14, 2026

This Privacy Policy explains how usectl collects, uses, shares and protects personal data when you visit **usectl.com**, create an account, or use the usectl dashboard, API, CLI, mobile app, MCP server and related services (together, the **"Service"**).

A Georgian version of this policy is available. If the two versions differ, the English version applies, unless the law of your country requires otherwise.

---

## 1. Who we are

The Service is operated by **Systemctl LLC** (შპს „სისტემ სითი ელი“), registered at 37 Zhiuli Shartava St., Tbilisi 2209, Georgia (**"usectl"**, **"we"**, **"us"**).

For personal data about our own users, such as account, billing and website data, we are the **controller**.

Contact for privacy questions: **info@usectl.com**

## 2. Two kinds of data

This policy separates two kinds of data:

- **Account and usage data.** This is information about you as our customer: who you are, how you pay, and how you use the Service. We decide how this data is used. Sections 3 to 12 cover it.
- **Customer Content.** This is everything you deploy or store on the Service: source code, container images, environment variables and secrets, databases, files in object storage, and the logs, metrics and traces your applications produce. Your applications may hold personal data about *your* users. For that data, **you are the controller and we act as your processor**. We process Customer Content only to provide the Service to you and as you instruct (see section 4).

## 3. Data we collect

### 3.1 Data you give us

- **Account data:** name, email address, and password. We store passwords only as a one-way bcrypt hash.
- **Sign-in tokens and API keys:** when you sign in we issue session tokens; refresh tokens last up to 90 days and we store them only as SHA-256 hashes. When you create an API key for automation or AI agents (`usectl_agt_…`), we show it once and store only its first characters and a SHA-256 hash, so we cannot retrieve the full key afterwards.
- **Sign-in through third parties:** if you sign in with GitHub, Google or Apple, we receive the basic profile those providers share, such as your name, email address, avatar and account ID.
- **Team data:** the email addresses of people you invite to a project or Machine.
- **Billing data:** billing name, email, country and tax details. Payments are handled by Stripe. **We never receive or store your full card number.** We keep your subscription status, plan, invoices and payment history.
- **Communications:** messages you send us by email, support requests and founding-member requests.
- **Newsletter sign-ups:** the email address you enter in the website footer. The form is delivered to our inbox through Web3Forms.
- **Demo bookings:** when you book a demo from usectl.com, the booking is made in Google Calendar. We receive your name, email address, the time you choose and anything you write in the booking form.

### 3.2 Data from your connected services

- **GitHub:** when you install the usectl GitHub App, we access the repositories you choose. We read repository names, branches, commit metadata and source code so we can build and deploy them. We do not access repositories you have not granted.
- **Custom domains:** domain names and the DNS and TLS details needed to serve them.

### 3.3 Data collected automatically

- **Technical and log data:** IP address, browser and device type, operating system, request time, pages and API endpoints used, CLI version, and error reports.
- **Service activity:** builds, deploys, resource usage (CPU, memory, storage, network) and AI token usage, which we need for billing and limits.
- **Mobile app:** device push-notification token and app version, used to send you notifications.
- **Website analytics and ad measurement:** on usectl.com, **only if you accept cookies**, we use Google Analytics, session replay (OpenReplay, running on our own infrastructure) and the Meta Pixel. We also remember the campaign (UTM) parameters of the link you arrived through. See section 11.
- **Session replay in the dashboard:** when you are signed in to manager.usectl.com, we record how you use the dashboard (clicks, scrolling, pages visited and the layout of the page) to find and fix confusing parts of the product. These recordings are **linked to your account**. They never include what you type, the contents of code blocks, terminals, logs, message payloads or AI chats, or the query strings of URLs; email addresses and numbers on screen are masked. Recordings run on our own infrastructure, are visible only to usectl administrators and are deleted after **30 days**. We honour your browser's Do Not Track setting, and you can turn recording off on your profile page (the setting applies to the browser you set it in). See section 4.
- **Linking a website visit to your sign-up:** if you accepted cookies on usectl.com and then follow a link to the dashboard, we pass along the ID of your website session replay. When you sign up or sign in, we attach it to your dashboard recording, so we can see which parts of the website led to the sign-up.
- **Country detection:** our network provider (Cloudflare) tells our website which country a visit comes from, so we can show the Georgian or English version. We do not store this.

## 4. How we use your data

| Purpose | Data used | Legal basis |
|---|---|---|
| Create and manage your account, and sign you in | Account and sign-in data | Performing our contract with you |
| Build, deploy, host and run your applications and addons | Customer Content, GitHub data | Performing our contract with you |
| Bill you, run trials, and enforce plan limits | Billing, usage data | Performing our contract; legal obligations (tax and accounting) |
| Send service emails and notifications (for example: deploy failed, trial ending, payment failed) | Email, push token | Performing our contract |
| Keep the Service secure, detect abuse, and investigate incidents | Technical, log and activity data | Our legitimate interest in a safe and reliable Service |
| Provide support | Communications, account data | Performing our contract |
| Improve the Service | Usage data (aggregated where possible) | Our legitimate interest |
| Find and fix usability problems in the dashboard (session replay, linked to your account) | Dashboard session recordings, account ID | Our legitimate interest in a product that is easy to use. You can object at any time by turning recording off on your profile page. |
| Understand how visitors use usectl.com (Google Analytics, session replay) | Website analytics data, cookie identifiers | Your consent |
| Measure our advertising on Meta (Facebook, Instagram) and see which campaigns lead to sign-ups | Meta Pixel events (page views, clicks on sign-up buttons, completed registrations), cookie identifiers, campaign (UTM) parameters, IP address and browser data | Your consent |
| Send product news and offers | Email | Your consent. You can unsubscribe at any time. |
| Comply with the law and respond to lawful requests | Any relevant data | Legal obligation |

**We do not sell your personal data.** We do not use your account data or Customer Content for advertising. On usectl.com, and only with your consent, the Meta Pixel measures our own ad campaigns (see section 11).

## 5. AI features

usectl includes AI features: the Devo assistant, automated deploy triage, the incident agent, and the AI addon you can attach to your projects.

- By default, these features run on **models hosted in our own infrastructure**. Your prompts, logs and code sent to these features are not passed to outside AI companies.
- If **you** configure an external AI provider (for example OpenAI, Anthropic or Google), requests you send through it go to that provider under its own terms and privacy policy.
- We record token usage so we can meter and bill the AI addon.
- **We do not use your Customer Content to train AI models.**

## 6. Who we share data with

We share personal data only with service providers that help us run the Service, and only as far as they need it. If we add or replace a provider that processes Customer Content, we will update this list and tell customers in advance by email or in the dashboard.

| Provider | What they do | Location |
|---|---|---|
| Hetzner Online GmbH | Servers, storage and off-site backups | Germany and Finland (EU) |
| Stripe | Payment processing, subscriptions and invoices | EU / USA |
| Google | Sending email (Google Workspace), Google sign-in, website analytics (Google Analytics, only with your consent), demo bookings (Google Calendar) | EU / USA |
| Meta Platforms Ireland Ltd. and Meta Platforms, Inc. | Meta Pixel on usectl.com: measuring our ad campaigns (only with your consent) | EU (Ireland) / USA |
| Web3Forms | Delivering newsletter sign-ups from the website footer to our inbox | India (forwards each sign-up to our inbox and does not store it) |
| GitHub | Repository access, GitHub sign-in | USA |
| Apple | Sign in with Apple, push notifications on iOS | USA |
| Cloudflare | TLS and routing for custom domains; detecting the visitor's country on usectl.com | Global |
| OpenReplay (self-hosted) | Session replay on usectl.com (only with your consent) and in the dashboard (see section 3.3). It runs on our own infrastructure, so recordings are not sent to an outside company. | Our servers (see section 7) |

We may also disclose data:

- when the law requires it, or to answer a valid request from a court or public authority;
- to protect the rights, property or safety of usectl, our users or the public, including to investigate abuse of the Service;
- to a buyer or successor if usectl is merged, sold or reorganised. This policy will continue to protect your data.

## 7. Where your data is stored and international transfers

Our servers and backups are in the **European Union** (Germany and Finland). usectl is based in Georgia, and some of the providers listed above process data in other countries, including the United States.

When data leaves the EU or Georgia, we rely on the safeguards the law provides, such as an adequacy decision or the European Commission's Standard Contractual Clauses.

## 8. How long we keep data

- **Account data:** while your account is active. To delete your account, email **info@usectl.com**. We delete your account, together with its projects and Machines, within **30 days** of your request, except for data we must keep by law.
- **Billing records:** as long as tax and accounting law requires, generally up to **6 years**.
- **Customer Content:** while your projects and Machines exist.
  - If a trial ends without a subscription, or a payment fails and is not resolved within the **7-day grace period**, your Machine is **archived**: workloads are stopped, but your data is kept for **30 days** so you can restore it by subscribing. If you do not subscribe within those 30 days, the Machine and its data are deleted.
  - When you delete a project, Machine or your account, the related Customer Content is deleted from live systems. Copies in backups are removed as the backups rotate out.
- **Logs and technical data:** for a limited period, generally up to **90 days**, unless we need them longer to investigate a security incident or abuse.
- **Session replay recordings** (website and dashboard): **30 days**.
- **Marketing consent:** until you withdraw it.
- **Website cookies:** see the table in section 11. Your cookie choice itself is kept for 6 months.

## 9. How we protect data

We protect data with:

- encryption in transit (TLS);
- encryption of stored secrets and environment variables;
- bcrypt password hashing, and SHA-256 hashing of refresh tokens and API keys;
- isolation between customer workloads;
- access controls and audit logs for sensitive operations;
- regular off-site backups.

No system is perfectly secure. If a personal data breach affects you, we will notify you and the competent authority as the law requires.

## 10. Your rights

Under Georgia's Law on Personal Data Protection and, where it applies, the EU General Data Protection Regulation (GDPR), you have the right to:

- **access** your personal data and get a copy of it;
- **correct** inaccurate data;
- **delete** your data ("right to be forgotten");
- **restrict** or **object to** certain processing, including direct marketing;
- **data portability**, meaning you can receive your data in a common machine-readable format;
- **withdraw consent** at any time, without affecting processing done before you withdrew it;
- **complain** to a supervisory authority. In Georgia this is the **State Audit Office of Georgia** (sao.ge), which supervises personal data protection since 2 March 2026. In the EU, it is the data protection authority of your country.

You can edit most account data in the dashboard. For anything else, email **info@usectl.com**. We will reply within the time the law sets, generally within one month, and we may ask you to confirm your identity first.

If your request concerns personal data inside an application that someone deploys on usectl, please contact the owner of that application. They are the controller. We will help them respond.

## 11. Cookies and similar technologies

When you first visit usectl.com, a banner asks whether you accept optional cookies. **Nothing optional loads until you choose.** Accepting and rejecting are equally easy, and the website works the same either way.

- We remember your choice, whichever it is, for **6 months**, and then ask again.
- You can change your choice at any time with the **"Cookie settings"** link at the bottom of every page. If you withdraw consent, the optional tools stop and we delete our campaign cookie and the Meta cookies.
- Your choice applies to usectl.com and its subdomains, including manager.usectl.com. Session replay in the dashboard is not part of this choice: it is covered in section 3.3, and you turn it off on your profile page.
- You can also block or delete cookies in your browser settings.

| Name | Set by | What it does | Kind | Lifetime |
|---|---|---|---|---|
| `usectl_consent` | usectl | Remembers your cookie choice | Essential | 6 months |
| `lang` | usectl | Remembers the language you picked (English or Georgian) | Essential | 1 year |
| Sign-in cookies and local storage on manager.usectl.com | usectl | Keep you signed in and keep the Service secure | Essential | As long as needed |
| `usectl_attr` | usectl | Remembers the campaign (UTM) parameters of the link you arrived through, so we can tell which campaigns lead to sign-ups | Optional, only after consent | 90 days |
| `_ga`, `_ga_*` | Google Analytics | Counts visits and shows how the website is used | Optional, only after consent | Up to 2 years |
| OpenReplay identifiers (browser storage) | usectl (self-hosted OpenReplay) | Session replay: records clicks, scrolling and the structure of the page. What you type is never recorded, and email addresses are masked. | Optional, only after consent | Until deleted in your browser |
| `_fbp`, `_fbc` | Meta Pixel | Measures our ad campaigns on Facebook and Instagram, and links a click on one of our ads to the visit that follows | Optional, only after consent | 90 days |
| `usectl:session-replay-opt-out` (browser storage, manager.usectl.com) | usectl | Remembers that you turned dashboard recording off on your profile page | Essential | Until you turn recording back on |

**About the Meta Pixel.** If you accept, the Pixel sends Meta three kinds of events: a page view (on usectl.com and manager.usectl.com), a click on a sign-up button, and a completed registration. Each event includes the cookie identifiers above, your IP address, browser details and the page address. We never send your name, email address or account data through the Pixel. Meta processes this data under its own Privacy Policy (facebook.com/privacy/policy) and may also use it to deliver and improve ads.

We do not show third-party ads on our website, and we do not sell the data these cookies collect.

## 12. Children

The Service is meant for developers and businesses. It is not directed to children, and you must be at least **18 years old** to create an account. If we learn that we have collected personal data from a child, we will delete it.

## 13. Changes to this policy

We may update this policy. For significant changes, we will notify you by email or in the dashboard before they take effect. The "Last updated" date at the top always shows the current version.

## 14. Contact

**Systemctl LLC**
37 Zhiuli Shartava St., Tbilisi 2209, Georgia
Email: **info@usectl.com**
