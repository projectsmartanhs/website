# SMART-ANHS: Supabase backend + Google Drive storage

How it fits together:

```
Your website (GitHub Pages)  ->  Supabase (sign-in, database, one server function)  ->  Google Drive (files only)
```

- **Supabase** stores the school data (the same data the app already edits) and controls who can see or change it.
- **Google Drive** stores uploaded files (PDFs, scans, reports). The website never talks to Drive directly. A Supabase **Edge Function** named `drive` does, so no Google password or key is ever in your website files.
- Leave `config.js` blank and the app still runs in the old local mode (data saved in the browser, passcode admin).

Total time: about 45 to 60 minutes. Do the parts in order.

---

## Part 1: Supabase

1. Go to supabase.com, create an account, and click **New project**. Pick the region closest to you (Singapore). Save the database password somewhere safe.
2. Open **SQL Editor > New query**, paste the whole of `supabase/schema.sql`, and press **Run**. This creates the tables, the roles, and the Row Level Security rules.
3. Open **Authentication > Sign In / Providers** (or **Providers > Email**) and **turn OFF "Allow new users to sign up"**. Only people you add can get in. Keep "Confirm email" on.
4. Open **Authentication > Users > Add user**. Create **your own admin account** (email + a strong password, tick "Auto confirm user"). **The first user created automatically becomes `admin`.**
5. Add the other staff the same way. They start as `viewer`. Promote them in the SQL Editor:
   ```sql
   update public.profiles set role = 'school_head' where email = 'principal@example.com';
   update public.profiles set role = 'teacher'     where email = 'teacher@example.com';
   ```

| Role | Can read data | Can edit data | Upload files | Delete files |
|---|---|---|---|---|
| admin, school_head | yes | yes | yes | yes |
| teacher, staff | yes | no | yes | no |
| viewer | yes | no | no | no |

6. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key into `config.js`:
   ```js
   SUPABASE_URL: "https://xxxxxxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJ...the anon key..."
   ```
   The anon key is meant to be public. **Never** put the `service_role` key in any website file.

## Part 2: Google Drive access

The Edge Function signs in to Drive as the school's Google account using a one-time authorization (a "refresh token"). It only uses the `drive.file` permission, so it can only touch files and the folder it created, not the rest of your Drive. It creates a folder called **SMART-ANHS Files** in that Drive the first time a file is uploaded.

1. Sign in to console.cloud.google.com with the Google account whose Drive will hold the files. Create a project (name it `smart-anhs`).
2. **APIs & Services > Library**: search **Google Drive API** and click **Enable**.
3. **APIs & Services > OAuth consent screen** (or "Google Auth Platform"):
   - User type **External** (or **Internal** if this is a school Google Workspace account).
   - Fill in the app name and your email.
   - Add the scope `.../auth/drive.file`.
   - Add your own email under **Test users**.
   - **Important:** then click **Publish app / Make it "In production"**. If you leave it in "Testing", Google expires the token every 7 days and uploads will suddenly stop. `drive.file` does not need Google verification.
4. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type **Web application**.
   - Under **Authorized redirect URIs** add exactly: `https://developers.google.com/oauthplayground`
   - Save the **Client ID** and **Client secret**.
5. Get the refresh token:
   1. Open developers.google.com/oauthplayground.
   2. Click the gear icon, tick **Use your own OAuth credentials**, and paste the Client ID and secret.
   3. In the scope box type `https://www.googleapis.com/auth/drive.file`, click **Authorize APIs**, and sign in with the school Drive account.
   4. Click **Exchange authorization code for tokens** and copy the **Refresh token**.

## Part 3: Deploy the Drive function

**Option A, dashboard (no tools to install):**
1. In Supabase, open **Edge Functions > Deploy a new function > Via Editor**. Name it exactly `drive`.
2. Paste the contents of `supabase/functions/drive/index.ts` and deploy.
3. Open **Edge Functions > Secrets** and add:

| Secret | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | from Part 2 step 4 |
| `GOOGLE_CLIENT_SECRET` | from Part 2 step 4 |
| `GOOGLE_REFRESH_TOKEN` | from Part 2 step 5 |
| `ALLOWED_ORIGIN` | your site address, e.g. `https://yourname.github.io` (no trailing slash, no path) |
| `DRIVE_FOLDER_NAME` | optional, default `SMART-ANHS Files` |

**Option B, command line:**
```bash
npm i -g supabase
supabase login
supabase init              # in this folder; keeps the existing supabase/ files
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... ALLOWED_ORIGIN=https://yourname.github.io
supabase functions deploy drive
```

## Part 4: Publish the website

Upload every file in this folder to your GitHub repository (including the new `config.js`, `backend.js`, `files.js`, and `SETUP.md`; the `supabase/` folder is optional on the website). Open the site and do a hard refresh (Ctrl+Shift+R).

## Test checklist

1. Click **Portal Login**, sign in with your admin email. The button changes to "Administrator · Log out" and a **Cloud: saved** badge appears in the admin bar.
2. Edit a record. The badge shows "saving" then "saved". Open the site on another device, sign in, and the change is there.
3. Open **Reports & documents**, upload a PDF. Check Google Drive: it is inside **SMART-ANHS Files**. Download it again from the site.
4. Sign in as a `viewer`: you can read, but editing and uploads are not offered. (Even with browser tricks, the database rules refuse it.)
5. Press the Search Portal button and search for the file name. Uploaded files appear in the results.

## How saving works (and its limits)

- All school data is saved as one document in `app_state`. Each save is checked against a version number. If two admins save at the same time, the second sees "Cloud: conflict" and must reload to get the other person's changes first, so nobody silently overwrites someone else.
- There is no live co-editing. Other people see changes when they reload or sign in again.
- Signing out removes the school data from that browser, so it does not stay on shared computers. Visitors who are not signed in only see the built-in sample data.
- Export data (admin bar) remains available as a manual backup.
- File size limit is 25 MB per file (change `MAX_BYTES` in the function). Deleting a file moves it to the Drive trash.
- Every save, upload, download, and delete is recorded in `audit_log` (admins can read it in the Supabase Table Editor).

## Before using real learner or staff data

- Supabase free projects pause after a week of inactivity and have no automatic backups. Use a paid plan for real use and turn on backups.
- Learner and personnel records are personal information under the Data Privacy Act (RA 10173) and DepEd policy. Name a Data Protection Officer, limit accounts to people who need them, keep the Drive account private with 2-step verification, and complete a privacy impact review first. The app's data is still sample data until you decide otherwise.
- Use strong, unique passwords, and enable leaked-password protection in Supabase **Authentication > Policies**.

## Troubleshooting

| Problem | Likely cause |
|---|---|
| "Could not load the Supabase library" | An ad blocker or no internet blocked `cdn.jsdelivr.net`. |
| Sign-in says incorrect email or password | Wrong password, or the user was not auto-confirmed (Authentication > Users). |
| Signed in but cannot edit | Your role is not `admin` or `school_head`. Check `public.profiles`. |
| Upload says "Google sign-in failed" | A wrong secret, or the refresh token expired because the consent screen is still in "Testing". Publish it and repeat Part 2 step 5. |
| Upload fails with a network or CORS error | `ALLOWED_ORIGIN` does not exactly match your site address. |
| "Cloud: conflict" | Someone else saved first. Reload the page. |
