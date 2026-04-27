# FIX-07: Restrict Firebase API Key

## Why

The Firebase client API key is public by default, but an **unrestricted** key allows
anyone to use your Firebase quota, spam authentication, and abuse your project.

## Steps to Restrict

1. Go to: https://console.cloud.google.com/apis/credentials?project=qottonweb
2. Find the **Browser key** (used by your Firebase client SDK)
3. Click to edit it

### Application Restrictions

- Select **HTTP referrers (websites)**
- Add your production domains:
  - `qotton.jo/*`
  - `*.qotton.jo/*`
  - `localhost:3000/*` (for development — remove in production)

### API Restrictions

- Select **Restrict key**
- Allow only these APIs:
  - **Identity Toolkit API** (Firebase Auth)
  - **Firebase Installations API**
  - **Cloud Firestore API**
  - **Firebase Cloud Messaging API** (if using push notifications)
  - **Token Service API** (for token refresh)

4. Click **Save**

## Verify

After restricting, test your app thoroughly — login, registration,
Firestore reads/writes, and Google OAuth should all still work.
If anything breaks, check the API restriction list.
