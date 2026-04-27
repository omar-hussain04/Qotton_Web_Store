# FIX-01: Migrate Service Account Key to GCP Secret Manager

## Why This Is Needed

The Google Service Account private key is currently stored as plaintext in `.env`.
If your VPS, Docker container, or dev machine is compromised, the key is immediately exposed.

## Step 1: Rotate the Key Immediately

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=qottonweb
2. Find `qottonshop@qottonweb.iam.gserviceaccount.com`
3. Click the service account → **Keys** tab
4. **Delete** the current key
5. Click **Add Key → Create new key → JSON**
6. Download the new JSON file
7. Copy the `private_key` value into your `.env` file's `GOOGLE_PRIVATE_KEY`
8. **Delete the downloaded JSON file** after copying the key

## Step 2: Store in GCP Secret Manager (Recommended)

1. Go to: https://console.cloud.google.com/security/secret-manager?project=qottonweb
2. Click **Create Secret**
3. Name: `google-private-key`
4. Value: Paste the full private key
5. Click **Create**

## Step 3: Reference in apphosting.yaml

Replace the `value:` directives with `secret:` for sensitive values:

```yaml
env:
  - variable: GOOGLE_PRIVATE_KEY
    secret: google-private-key
    availability:
      - BUILD
      - RUNTIME
```

## Step 4: Grant Access

Ensure the Firebase App Hosting service account has the
`Secret Manager Secret Accessor` IAM role.
