# Step-by-Step Guide: Deploy DayForge to GitHub & Install the PWA

Follow these simple steps to push DayForge to your GitHub account, enable free automated GitHub Pages hosting, and install the app on your phone, tablet, or computer.

---

## Step 1: Create a New Repository on GitHub
1. Log in to your GitHub account at [https://github.com](https://github.com).
2. Click the **+** icon in the top right corner and choose **New repository**.
3. Name your repository (e.g., `dayforge`).
4. Set visibility to **Public** (or Private if you have GitHub Pro/Team with Pages support).
5. Leave "Add a README file" unchecked (we already have a complete one).
6. Click **Create repository**.

---

## Step 2: Push Your Code to GitHub
In your local project terminal, run the following commands (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name):

```bash
# Initialize git if not already initialized
git init

# Add all files
git add .

# Create the initial commit
git commit -m "feat: initial DayForge PWA build ready for GitHub Pages"

# Rename branch to main
git branch -M main

# Link your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push the code to GitHub
git push -u origin main
```

---

## Step 3: Enable GitHub Pages in Your Repository Settings
1. On GitHub, navigate to your repository's **Settings** tab.
2. In the left sidebar under "Code and automation", click **Pages**.
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
4. That's it! The automated workflow in `.github/workflows/deploy.yml` will run automatically.
5. In your repository, click the **Actions** tab to watch the build complete (usually ~30–45 seconds).
6. Once completed, your live URL will be shown at the top of the **Pages** settings screen, typically:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

---

## Step 4: Open and Install the PWA

### On Android (Chrome / Brave / Edge)
1. Open your GitHub Pages link in Chrome or your preferred browser:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`
2. You will see an **Install DayForge PWA** button in the app sidebar or bottom menu, or Chrome will prompt "Add DayForge to Home screen".
3. Tap **Install** or **Add to Home screen**.
4. The DayForge icon will appear on your phone's app launcher. When opened, it runs in full-screen standalone mode with 100% offline access to your tasks, notes, snippets, and projects!

### On iPhone / iPad (iOS Safari)
1. Open your GitHub Pages link in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom of the screen).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right corner.
5. DayForge is now installed on your iOS home screen as a standalone web application.

### On Desktop (Windows / macOS / Linux via Chrome, Edge, Brave)
1. Visit your GitHub Pages link.
2. Click the **Install DayForge** button in the left sidebar, or click the install icon in your browser's URL address bar (monitor with a down arrow).
3. Confirm installation. DayForge will launch in its own dedicated, native desktop window.

---

## Offline & Privacy Guarantee
- All your notes, tasks, code snippets, project milestones, and financial ledger data are stored locally on your device via **IndexedDB** (`DayForgeDB`).
- The application works seamlessly without an internet connection once installed.
- You can backup or transfer your data at any time via the built-in **Backup & Export** menu (downloads a validated `.json` file).
