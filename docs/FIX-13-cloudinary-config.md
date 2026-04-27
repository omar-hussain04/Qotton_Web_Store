# FIX-13: Secure Cloudinary Upload Preset

## Why

The `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is an unsigned preset exposed to the client.
Anyone can upload arbitrary files to your Cloudinary account using this preset.

## Steps to Restrict

1. Log into https://console.cloudinary.com/
2. Go to **Settings → Upload → Upload Presets**
3. Find the `QottonUploade` preset and edit it:

### Recommended Settings

| Setting | Value |
|---|---|
| **Signing Mode** | Unsigned (keep for now) |
| **Max file size** | 5 MB |
| **Allowed formats** | `jpg, jpeg, png, webp` |
| **Folder** | `qotton/products` |
| **Unique filename** | Yes |
| **Overwrite** | No |
| **Resource type** | Image only |

### Enable Moderation (if available on your plan)

- Enable **Auto-moderation** to reject inappropriate content

## Long-Term: Migrate to Signed Uploads

Create a server-side API route `/api/admin/upload` that:
1. Verifies the caller is an admin (Bearer token + custom claims)
2. Generates a signed Cloudinary upload URL
3. Returns the signed URL to the client
4. Client uploads directly to Cloudinary with the signed URL

This prevents any unauthorized uploads entirely.
