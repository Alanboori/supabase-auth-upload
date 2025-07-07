Perfect, thanks! Based on your actual project structure, here's a **fully updated and customized `README.md`** tailored exactly to your setup, including:

* Folder structure
* Progress bar + 500MB limit
* Supabase Edge Functions usage
* File upload flow
* HTML pages (`index.html`, `dashboard.html`, etc.)

---

### ✅ Here's your full `README.md` (just copy and paste into your file):

```markdown
# 🔐 Supabase Auth + Secure File Upload

A full authentication + file upload system built with Supabase Edge Functions (no keys in frontend) and a modern sliding UI using pure HTML, CSS, and JavaScript.

---

## 📁 Features

### ✅ Authentication
- Signup, Login, Forgot Password, and Reset Password flows
- Secure implementation using **Supabase Edge Functions** (TypeScript)
- No Supabase keys exposed on frontend
- Password visibility toggle (👁️ icon stays fixed)

### 📦 File Upload
- Authenticated users can upload files to Supabase Storage
- Each user can access **only their own files**
- **Real-time progress bar** for uploads
- **500 MB** max file size per upload
- File deletion and user-based file listing supported
- Uses private bucket with RLS (Row-Level Security)

### 💻 Frontend
- Built with plain **HTML + CSS + JS**
- Smooth sliding-tab UI (Login / Signup)
- Poppins font, modern UI design
- No frameworks, no build step

---

## 📂 Project Structure

```

my-supabase-app/
│   .env
│   README.md
│
├───.vscode/                       # Editor config (optional)
│
├───public/                       # All frontend files
│   ├── index.html                # Login / Signup page
│   ├── forgot-password.html      # Request password reset
│   ├── reset-password.html       # Final password reset
│   └── dashboard.html            # File upload & management
│
└───supabase/                     # Supabase backend (Edge Functions)
│   config.toml               # Supabase project config
│
├───.temp/                    # Supabase CLI cache (ignore)
│
└───functions/                # Edge Functions (TypeScript)
├───signup/
├───login/
├───forgot-password/
├───reset-password/
├───get-user/
├───upload/
├───list/
├───delete/
└───sync-storage-to-db/

````

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js installed
- Supabase CLI installed (`npm install -g supabase` or use `npx`)
- A Supabase project created (via https://app.supabase.com)

---

### 🔧 Setup

1. **Clone the repo**

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd my-supabase-app
````

2. **Login to Supabase**

```bash
npx supabase login
```

3. **Link your project**

```bash
npx supabase link --project-ref <your-project-ref>
```

4. **Deploy all edge functions**

```bash
npx supabase functions deploy
```

5. **Start local dev (optional)**

```bash
npx supabase start
```

6. **Update frontend JS with your deployed function URL:**

```js
const FUNCTION_BASE_URL = "https://<your-project-ref>.functions.supabase.co";
```

---

## 🧪 Usage

### 🔐 Auth

* Open `public/index.html`
* Switch between **Login** and **Signup** via sliding tabs
* Click “Forgot Password?” for password reset flow
* Edge functions handle all backend securely

### 📁 File Upload (Dashboard)

* After login, user is redirected to `dashboard.html`
* Select a file to upload
* Upload progress is shown with an animated bar
* File size limit: **500 MB**
* Files are stored in a private Supabase Storage bucket
* Only the logged-in user can list or delete their files

---

## 🔐 Supabase Storage Policy Example

> Be sure you added an RLS policy to your bucket:

```sql
create policy "Users can access their own files"
on storage.objects
for all
using (
  auth.uid() = owner
);
```

Also make sure your bucket is marked as **private** in the Supabase dashboard.

---

## 🌍 Deployment

This project does **not use Docker**. It runs fully with Supabase CLI and static HTML:

```bash
npx supabase functions deploy
```

Frontend can be hosted on:

* GitHub Pages
* Netlify
* Vercel
* Firebase Hosting (frontend only)

---

## 🧾 License

MIT — feel free to use, remix, or build upon this.

---

## 👨‍💻 Author

Built with ❤️ by \[Your Name Here]

```

---

Let me know if you'd like:
- The LICENSE file generated
- This README auto-filled with your GitHub repo link
- GitHub Actions to auto-deploy the frontend
- Markdown badges (for stars, license, etc.)

Happy uploading!
```
