# Google AdSense Integration Instructions

## Your AdSense Account Details

**Publisher ID:** `ca-pub-5409508349104075`

You have two ad code snippets ready to use. Choose which one to use for each game zone.

---

## Ad Code Option 1 (Fluid In-Article)

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5409508349104075"
     data-ad-slot="2097155341"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Use for:** Instructions screen top ad zone  
**Characteristics:** Fluid layout, responsive width, centered

---

## Ad Code Option 2 (Responsive Banner)

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-5409508349104075"
     data-ad-slot="4379595956"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Use for:** Results screen top/bottom ad zones  
**Characteristics:** Auto format, fully responsive, adapts to container

---

## Integration Steps

### Step 1: Open index.html in your editor

Find the section for Where Is It game (around line ~580-680 in the modal).

### Step 2: Replace Instructions Ad Zone

**Find this:**
```html
<!-- Ad Zone: Above Difficulty Selection -->
<div class="game-ad-zone" id="whereis-ad-zone-top">
  <div class="ad-zone-label">Advertisement</div>
  <div class="ad-placeholder">
    <div class="ad-placeholder-img">AD</div>
    <span class="ad-placeholder-text">Your ad could appear here</span>
  </div>
</div>
```

**Replace with:**
```html
<!-- Ad Zone: Above Difficulty Selection -->
<div class="game-ad-zone" id="whereis-ad-zone-top">
  <div class="ad-zone-label">Advertisement</div>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
       crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block; text-align:center;"
       data-ad-layout="in-article"
       data-ad-format="fluid"
       data-ad-client="ca-pub-5409508349104075"
       data-ad-slot="2097155341"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

### Step 3: Replace Results Screen Ad Zones

**For the TOP ad zone in results screen:**
```html
<!-- Ad Zone: Results Top -->
<div class="game-ad-zone">
  <div class="ad-zone-label">Advertisement</div>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
       crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-5409508349104075"
       data-ad-slot="4379595956"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

**For the BOTTOM ad zone in results screen:**
```html
<!-- Ad Zone: Results Bottom -->
<div class="game-ad-zone">
  <div class="ad-zone-label">Advertisement</div>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
       crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-5409508349104075"
       data-ad-slot="4379595956"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

### Step 4: Save index.html

Press Ctrl+S to save and let VS Code reload.

### Step 5: Test in Browser

1. Open http://localhost:8000 in browser
2. Navigate to "Game" page
3. Click "Ad Where Is It" button
4. Watch for ads loading in the zones
5. Play the game and verify ads appear on results screen

---

## Verification Checklist

- [ ] No JavaScript errors in console (F12 → Console)
- [ ] Ad code loads (check Network tab in DevTools)
- [ ] Ads display in purple/pink zones with "Advertisement" label
- [ ] Game functionality unaffected
- [ ] Ads don't overlay game canvas or break layout
- [ ] Mobile view works (ads responsive)

---

## What Should Happen

### Instructions Screen
When player clicks difficulty button, they should see:
- Game header ("🔍 Ad Where Is It")
- Instructions with 4 numbered steps
- Actual Google ads (instead of gray placeholder)
- Difficulty buttons below ads

### Playing Screen
During gameplay:
- Target symbol displayed in header
- Full-screen grid of blocks with symbols
- No ads visible (clean play experience)
- Timer and wrong-click counter

### Results Screen
After game ends:
- Google ads at top (same as instructions)
- Results summary (time, wrong clicks, credits)
- Compliance message
- Action buttons
- Google ads at bottom
- Profile updates with earned credits

---

## If Ads Don't Show

**Common Reasons:**

1. **Ad Blocker Active**
   - Solution: Test in incognito window (ad blockers disabled)

2. **Invalid Client ID**
   - Check `ca-pub-5409508349104075` is correct
   - Verify in AdSense console

3. **Ad Slots Not Approved**
   - AdSense needs to review your site
   - New slots may not show immediately
   - Check AdSense account for warnings

4. **Script Loaded Multiple Times**
   - Solution: Put `<script async src="...adsbygoogle.js...">` once at top of page
   - Follow with multiple `<ins>` tags for different slots

5. **Localhost Limitations**
   - Local testing may not show real ads
   - Deploy to live domain for full testing
   - Placeholder gray boxes appear instead

---

## Production Deployment Note

These ad codes are configured for your site. Once deployed to production:

1. Update your website URL in AdSense settings
2. Wait 24-48 hours for approval
3. Monitor ad impressions in AdSense dashboard
4. Check for policy violations
5. Optimize ad placement based on performance data

---

## Alternative: Keep Placeholders

If you want to keep testing with placeholder ads, don't replace the code. The game works perfectly with the gray "AD" placeholders and shows:

```html
<div class="ad-placeholder">
  <div class="ad-placeholder-img">AD</div>
  <span class="ad-placeholder-text">Your ad could appear here</span>
</div>
```

This is useful for:
- Design testing
- Gameplay testing
- Layout verification
- Before going live with real ads

---

## Troubleshooting Script Errors

If you see errors like:
```
Uncaught TypeError: adsbygoogle.push is not a function
```

**Solution:**
1. Ensure `<script async src="...adsbygoogle.js...">` loads FIRST
2. Verify it's `ca-pub-5409508349104075` (your correct ID)
3. Check no other scripts modify `window.adsbygoogle`
4. Clear browser cache and reload

---

## Next Steps

After integration:
1. ✅ Test on all browsers (Chrome, Firefox, Safari, Edge)
2. ✅ Test on mobile devices
3. ✅ Monitor AdSense dashboard for impressions
4. ✅ Check compliance reports
5. ✅ Optimize ad placement if needed
6. ✅ Add more games (Ad Trivia, remaining puzzle variants)

---

**Quick Reference:**
- Publisher ID: `ca-pub-5409508349104075`
- Ad Slot 1: `2097155341` (Instructions, fluid layout)
- Ad Slot 2: `4379595956` (Results, responsive)
- Game Modal ID: `whereis-game-modal`
- Ad Zone Class: `.game-ad-zone`

---

**Updated:** February 12, 2026  
**Status:** Ready for Integration
