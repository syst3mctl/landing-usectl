# usectl Privacy Policy

**Last updated:** November 7, 2026

This Privacy Policy explains how usectl collects, uses, shares and protects personal data when you visit **usectl.com**, create an account, or use the usectl dashboard, API, CLI, mobile app, MCP server and related services (together, the **"Service"**).

A Georgian version of this policy is available. If the two versions differ, the English version applies, unless the law of your country requires otherwise.

---

## 1. Who we are

The Service is operated by **[[LEGAL ENTITY NAME]]**, identification code **[[ID CODE]]**, registered at 37 Zhiuli Shartava St., Tbilisi 2209, Georgia (**"usectl"**, **"we"**, **"us"**).

For personal data about our own users, such as account, billing and website data, we are the **controller**.

Contact for privacy questions: **hello@usectl.com**

## 2. Two kinds of data

This policy separates two kinds of data:

- **Account and usage data.** This is information about you as our customer: who you are, how you pay, and how you use the Service. We decide how this data is used. Sections 3 to 12 cover it.
- **Customer Content.** This is everything you deploy or store on the Service: source code, container images, environment variables and secrets, databases, files in object storage, and the logs, metrics and traces your applications produce. Your applications may hold personal data about *your* users. For that data, **you are the controller and we act as your processor**. We process Customer Content only to provide the Service to you and as you instruct (see section 4).

## 3. Data we collect

### 3.1 Data you give us

- **Account data:** name, email address, and password. We store passwords only as a one-way bcrypt hash.
- **Sign-in through third parties:** if you sign in with GitHub, Google or Apple, we receive the basic profile those providers share, such as your name, email address, avatar and account ID.
- **Team data:** the email addresses of people you invite to a project or Machine.
- **Billing data:** billing name, email, country and tax details. Payments are handled by Stripe. **We never receive or store your full card number.** We keep your subscription status, plan, invoices and payment history.
- **Communications:** messages you send us by email, support requests, founding-member requests, and newsletter sign-ups.

### 3.2 Data from your connected services

- **GitHub:** when you install the usectl GitHub App, we access the repositories you choose. We read repository names, branches, commit metadata and source code so we can build and deploy them. We do not access repositories you have not granted.
- **Custom domains:** domain names and the DNS and TLS details needed to serve them.

### 3.3 Data collected automatically

- **Technical and log data:** IP address, browser and device type, operating system, request time, pages and API endpoints used, CLI version, and error reports.
- **Service activity:** builds, deploys, resource usage (CPU, memory, storage, network) and AI token usage, which we need for billing and limits.
- **Mobile app:** device push-notification token and app version, used to send you notifications.
- **Website analytics:** on usectl.com we may use analytics and session-replay tools to understand how visitors use the site. See section 11 on cookies.

## 4. How we use your data

| Purpose | Data used | Legal basis |
|---|---|---|
| Create and manage your account, and sign you in | Account and sign-in data | Performing our contract with you |
| Build, deploy, host and run your applications and addons | Customer Content, GitHub data | Performing our contract with you |
| Bill you, run trials, and enforce plan limits | Billing, usage data | Performing our contract; legal obligations (tax and accounting) |
| Send service emails and notifications (for example: deploy failed, trial ending, payment failed) | Email, push token | Performing our contract |
| Keep the Service secure, detect abuse, and investigate incidents | Technical, log and activity data | Our legitimate interest in a safe and reliable Service |
| Provide support | Communications, account data | Performing our contract |
| Improve the Service and the website | Usage and analytics data (aggregated where possible) | Our legitimate interest; your consent where the law requires it |
| Send product news and offers | Email | Your consent. You can unsubscribe at any time. |
| Comply with the law and respond to lawful requests | Any relevant data | Legal obligation |

**We do not sell your personal data**, and we do not use it for third-party advertising.

## 5. AI features

usectl includes AI features: the Devo assistant, automated deploy triage, the incident agent, and the AI addon you can attach to your projects.

- By default, these features run on **models hosted in our own infrastructure**. Your prompts, logs and code sent to these features are not passed to outside AI companies.
- If **you** configure an external AI provider (for example OpenAI, Anthropic or Google), requests you send through it go to that provider under its own terms and privacy policy.
- We record token usage so we can meter and bill the AI addon.
- **We do not use your Customer Content to train AI models.** [[CONFIRM BEFORE PUBLISHING]]

## 6. Who we share data with

We share personal data only with service providers that help us run the Service, and only as far as they need it:

| Provider | What they do | Location |
|---|---|---|
| Hetzner Online GmbH | Servers, storage and off-site backups | Germany and Finland (EU) |
| Stripe | Payment processing, subscriptions and invoices | EU / USA |
| Google | Sending email (Google Workspace), Google sign-in | EU / USA |
| GitHub | Repository access, GitHub sign-in | USA |
| Apple | Sign in with Apple, push notifications on iOS | USA |
| Cloudflare | TLS and routing for custom domains | Global |
| Website analytics provider(s) | Website usage and session analytics | [[CONFIRM]] |

We may also disclose data:

- when the law requires it, or to answer a valid request from a court or public authority;
- to protect the rights, property or safety of usectl, our users or the public, including to investigate abuse of the Service;
- to a buyer or successor if usectl is merged, sold or reorganised. This policy will continue to protect your data.

## 7. Where your data is stored and international transfers

Our servers and backups are in the **European Union** (Germany and Finland). usectl is based in Georgia, and some of the providers listed above process data in other countries, including the United States.

When data leaves the EU or Georgia, we rely on the safeguards the law provides, such as an adequacy decision or the European Commission's Standard Contractual Clauses.

## 8. How long we keep data

- **Account data:** while your account is active. After you delete your account, we delete or anonymise it within **30 days**, except for data we must keep by law.
- **Billing records:** as long as tax and accounting law requires, generally up to **6 years**.
- **Customer Content:** while your projects and Machines exist.
  - If a trial ends without a subscription, or a payment fails and is not resolved within the **7-day grace period**, your Machine is **archived**: workloads are stopped, but your data is kept so you can restore it by subscribing.
  - When you delete a project, Machine or your account, the related Customer Content is deleted from live systems. Copies in backups are removed as the backups rotate out.
- **Logs and technical data:** for a limited period, generally up to **90 days**, unless we need them longer to investigate a security incident or abuse.
- **Marketing consent:** until you withdraw it.

## 9. How we protect data

We protect data with:

- encryption in transit (TLS);
- encryption of stored secrets and environment variables;
- bcrypt password hashing;
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
- **complain** to a supervisory authority. In Georgia this is the **Personal Data Protection Service of Georgia** (pdps.ge). In the EU, it is the data protection authority of your country.

You can edit most account data in the dashboard. For anything else, email **hello@usectl.com**. We will reply within the time the law sets, generally within one month, and we may ask you to confirm your identity first.

If your request concerns personal data inside an application that someone deploys on usectl, please contact the owner of that application. They are the controller. We will help them respond.

## 11. Cookies and similar technologies

- **Essential cookies and local storage** keep you signed in and keep the Service secure. The Service cannot work without them.
- **Analytics cookies and session replay** on usectl.com help us understand how visitors use the site. Where the law requires consent, we set them only after you agree. You can change your choice or block cookies in your browser at any time.

We do not use cookies for third-party advertising.

## 12. Children

The Service is meant for developers and businesses. It is not directed to children, and you must be at least **18 years old** to create an account. If we learn that we have collected personal data from a child, we will delete it.

## 13. Changes to this policy

We may update this policy. For significant changes, we will notify you by email or in the dashboard before they take effect. The "Last updated" date at the top always shows the current version.

## 14. Contact

**[[LEGAL ENTITY NAME]]**
37 Zhiuli Shartava St., Tbilisi 2209, Georgia
Email: **hello@usectl.com**
