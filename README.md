# Fitness Playground — GitHub Pages + Firebase (Configured)

This package is already wired to your Firebase project:
- **Project ID:** `webeng-69de3`
- **Auth domain:** `webeng-69de3.firebaseapp.com`
- **Storage bucket:** `webeng-69de3.firebasestorage.app`

## Included
- Public website: `index.html`
- Admin dashboard: `admin.html`
- Firebase-ready JS modules in `assets/js/`
- Firestore and Storage rules
- Client-folder notes for submission

## Before login will work
You still need to finish these in Firebase Console:
1. Enable **Authentication > Sign-in method > Email/Password**
2. Add your admin user in **Authentication > Users**
3. Enable **Firestore Database**
4. Enable **Storage**

## GitHub Pages upload
Upload the entire folder contents to your repository, including:
- `index.html`
- `admin.html`
- `assets/`
- `firestore.rules`
- `storage.rules`

Then enable **Settings > Pages > Deploy from a branch**.

## Live URLs
If your repo is named `fitness-playground`, the links will be:
- Public site: `https://YOUR_USERNAME.github.io/fitness-playground/`
- Admin page: `https://YOUR_USERNAME.github.io/fitness-playground/admin.html`

## Notes
- Admin login happens on the same `admin.html` page. After successful login, the dashboard appears below automatically.
- Firebase Analytics is initialized when supported by the browser.
- If you see login errors, check that Email/Password is enabled and that the admin user exists.
