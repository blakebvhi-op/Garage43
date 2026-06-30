# Garage 43 🏍️

A Progressive Web App (PWA) for motorcycle garage management and maintenance tracking.

**Features:**
- ✅ Multi-bike management with current mileage tracking
- ✅ Mileage-based maintenance scheduling
- ✅ Cost tracking (parts + labor)
- ✅ Service history with photo uploads
- ✅ Pre-built maintenance templates (Harley, Yamaha, Honda)
- ✅ Works offline with service worker
- ✅ Installable as native app (Android, iOS, Windows, Mac)

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/garage-43.git
   cd garage-43
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser

4. **Build for production**
   ```bash
   npm run build
   ```

## Deployment to GitHub Pages

This project is configured for automatic deployment via GitHub Actions.

### Initial Setup

1. **Push to GitHub**
   - Create a new repository on GitHub (e.g., `garage-43`)
   - Push this code to your repository:
     ```bash
     git remote add origin https://github.com/yourusername/garagepass.git
     git branch -M main
     git push -u origin main
     ```

2. **Enable GitHub Pages**
   - Go to repository **Settings** → **Pages**
   - Under "Build and deployment":
     - Source: **GitHub Actions**
   - The workflow will run automatically on push

3. **Access your app**
   - Your PWA will be live at: `https://yourusername.github.io/garage-43/`

### Automatic Deployment

Every time you push to `main` or `master` branch:
1. GitHub Actions builds the app
2. Service worker is generated
3. App is deployed to GitHub Pages
4. Live in ~2-3 minutes

**Check deployment status:** Go to repository → **Actions** tab

## Installation as App

### Mobile (Android/iOS)
1. Open the PWA URL in your mobile browser
2. Tap the menu icon
3. Select "Install app" or "Add to Home Screen"

### Desktop (Windows/Mac/Linux)
1. Open the PWA URL in Chrome/Edge/Brave
2. Click the install icon (appears in address bar or menu)
3. Choose "Install GaragePass"

## Usage

### Getting Started
1. Sign up with any email and password
2. Add your first bike with current mileage
3. Add maintenance tasks or load a template

### Tracking Maintenance
- Set due dates or mileage intervals (or both)
- Add costs (parts + labor) and notes
- Upload photos of work completed
- Check maintenance status at a glance

### Maintenance Templates
- Pre-built schedules for Harley, Yamaha, Honda
- One-click apply to populate common tasks
- Edit any task after applying

### Data Storage
- All data stored locally in browser (IndexedDB)
- Works offline automatically
- No server required
- Add to your Supabase backend later if needed

## File Structure

```
garagepass/
├── src/
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind styles
├── index.html            # HTML template
├── vite.config.js        # Vite + PWA config
├── package.json          # Dependencies
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Actions workflow
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite PWA Plugin** - PWA features & service worker
- **GitHub Actions** - CI/CD

## Customization

### Update PWA Info
Edit `vite.config.js` - change `manifest` object:
- `name`, `short_name`, `description`
- `theme_color`, `background_color`
- `start_url` (change `/garagepass/` if different repo name)

### Change Colors
In `src/App.jsx`, update Tailwind color classes:
- Primary color: `bg-blue-500` → your color
- Background: `bg-slate-900` → your color

### Add More Bike Templates
In `src/App.jsx`, add to `MAINTENANCE_TEMPLATES` object:
```javascript
suzuki: {
  name: 'Suzuki',
  tasks: [
    { task: 'Oil Change', mileageInterval: 4000, estimatedCost: 60 },
    // ...
  ]
}
```

### Update Base URL
If deploying to different path, change in `vite.config.js`:
```javascript
base: '/your-repo-name/',
```

## Troubleshooting

**App not updating after push?**
- Wait 2-3 minutes for GitHub Actions to complete
- Check Actions tab for build errors
- Hard refresh browser (Ctrl+Shift+R)

**Service worker not installing?**
- Clear browser cache
- Uninstall app, reload page, reinstall

**Changes not showing locally?**
- Stop dev server and restart: `npm run dev`
- Clear `node_modules/.vite` folder

**Icons not showing?**
- Ensure icon files are in `public/` folder
- Check that paths in `vite.config.js` manifest are correct

## Contributing

Feel free to fork and submit pull requests for improvements!

## License

MIT - Use freely for personal and commercial projects

## Support

For issues or questions:
1. Check GitHub Issues tab
2. Review commit history for similar issues
3. Open a new issue with reproduction steps

---

**Built with 🏍️ for motorcycle enthusiasts**
