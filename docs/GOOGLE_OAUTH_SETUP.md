# Google OAuth Setup Guide for Faith & Creator Studio

This guide explains how to enable "Continue with Google" sign-in using Google Cloud Console and Supabase Auth.

---

## Step 1: Open Google Cloud Console

1. Navigate to [console.cloud.google.com](https://console.cloud.google.com).
2. Sign in with your Google account.
3. In the top navigation bar, click the project dropdown and click **New Project**.
4. Name your project: `Faith and Creator Studio` and click **Create**.

---

## Step 2: Configure OAuth Consent Screen

1. In the left navigation menu, go to **APIs & Services** ➔ **OAuth consent screen**.
2. Select **External** as the User Type and click **Create**.
3. Fill in:
   - **App name**: `Faith & Creator Studio`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes**, select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Click **Update** and then **Save and Continue**.
7. If your app is in "Testing" status, add your own email under **Test users** so you can log in during development.
8. Click **Save and Continue**.

---

## Step 3: Create OAuth Client ID Credentials

1. In the left menu, click **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. **Name**: `Faith & Creator Studio Web Client`.
5. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - `http://localhost:5173`
   - `http://localhost:5000`
   - `https://your-production-domain.com` (when deployed)
6. Under **Authorized redirect URIs**, click **+ ADD URI** and add your Supabase Auth callback URL:
   - Look in your Supabase Dashboard ➔ **Authentication** ➔ **Providers** ➔ **Google**.
   - Copy the **Callback URL (for OAuth)**.
   - It looks like: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Paste this URL into the **Authorized redirect URIs** field in Google Cloud Console.
7. Click **Create**.
8. A modal will appear showing your **Client ID** and **Client Secret**. Copy both values.

---

## Step 4: Add Google Credentials into Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** ➔ **Providers**.
3. Find **Google** in the list and click to expand it.
4. Toggle **Enable Google provider** to ON.
5. Paste your:
   - **Client ID**
   - **Client Secret**
6. Click **Save**.

---

## Step 5: Configure Supabase Redirect URLs

1. In Supabase Dashboard, go to **Authentication** ➔ **URL Configuration**.
2. Set **Site URL** to:
   - `http://localhost:5173` (for local development)
3. Under **Redirect URLs**, click **Add URL** and add:
   - `http://localhost:5173/auth/callback`
   - `https://your-production-domain.com/auth/callback`
4. Click **Save**.

Google OAuth is now fully configured! Users can sign in with one click.
