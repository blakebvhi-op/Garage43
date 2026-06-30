# Deploy GaragePass to GitHub Pages

## 5-Minute Setup

### Step 1: Create GitHub Repository
```bash
# If you don't have git initialized
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/garagepass.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Done! The workflow will run automatically

### Step 3: Verify Deployment
1. Go to **Actions** tab in your repository
2. Wait for the "Deploy PWA to GitHub Pages" workflow to complete (✅ green checkmark)
3. Your app is now live at: `https://yourusername.github.io/garagepass/`

---

## Making Updates

After deployment is working, to push updates:

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push
```

The GitHub Actions workflow will automatically:
- Build your app
- Run tests (if you add them)
- Deploy to GitHub Pages
- Your changes go live in ~2 minutes

---

## Troubleshooting

**Workflow fails with error?**
- Check the Actions tab for error messages
- Common issue: Wrong `base` path in `vite.config.js`
- If repo is `garagepass`, base should be `/garagepass/`

**App shows 404?**
- Verify the URL is correct: `https://username.github.io/reponame/`
- Wait a few minutes for deployment to complete
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

**Pages tab shows "ready to be published"?**
- GitHub Actions must be the source
- Make sure you selected "GitHub Actions" in Pages settings

---

## Custom Domain (Optional)

Want to use your own domain instead of `github.io`?

1. In **Settings → Pages**, add your domain under "Custom domain"
2. Point your domain's DNS to GitHub (GitHub will show instructions)
3. Your app will be at `https://yourdomain.com`

---

## Performance Tips

- App uses service worker for caching
- First load: ~500kb (cached for offline use)
- Updates check automatically when app launches
- Users can update by closing and reopening the app

---

**That's it! Your PWA is now live and updates automatically with every push to main.** 🎉
