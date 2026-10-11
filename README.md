# 🎬 RAJNISH STUDIOS - 100+ Premium Captions Pack (₹49) Integration

Aapki official website (`https://rajnishstudios.vercel.app/`) par **"100+ Premium Viral Captions Pack @ ₹49 Only"** ka high-converting section successfully create aur integrate kar diya gaya hai.

---

## 📁 File Structure

```
website for premier/
├── index.html                  # Full website with Captions Pack section & Checkout modal
├── style.css                   # Complete luxury styling + Live animation keyframes
├── script.js                   # Interactivity (Countdown, Style preview simulator, UPI Modal)
├── captions-pack-snippet.html  # Standalone HTML snippet of just the Captions Pack section
└── README.md                   # Documentation & setup guide
```

---

## 🚀 Key Features Jo Is Section Me Hain

1. **Top Urgency Banner & Live Countdown Timer**:
   - `CREATOR LAUNCH EXCLUSIVE • SAVE 95% TODAY`
   - Real-time reverse countdown timer (`04h : 29m : 48s`).
2. **Interactive Live Caption Simulator**:
   - Realistic iPhone / Reel mockup.
   - Live clickable style buttons:
     - ⚡ **Hormozi Punch**: Bouncing high-contrast yellow/green words with scale pop.
     - 🎬 **Cinematic Glow**: Luxury soft breathing glow serif text.
     - 📰 **Vox Highlighter**: Highlight marker box wiping across key words.
     - 🟣 **Neon Cyber**: Neon cyan/magenta kinetic impact glow.
     - 🎤 **Karaoke Bounce**: Word-by-word active glow as creator speaks.
3. **Product Offer Card (₹49 Price Lock)**:
   - Regular Price: ~~₹999~~ → **Today: ₹49 (95% OFF)**
   - Itemized feature list (100+ .mogrt presets, Essential Graphics ready, All Premiere Pro CC versions supported, Commercial license).
   - 3 Fast-Action Free Bonuses (Hook Formula Guide, SFX Pack, Video Tutorial).
4. **Interactive UPI & WhatsApp Checkout Modal**:
   - Instant popup jab user *"Get Instant Access @ ₹49"* par click kare.
   - **Dynamic UPI QR Code**: Scan & Pay ₹49 directly via GPay / PhonePe / Paytm / BHIM.
   - **Copy UPI ID Button**: Instant 1-click clipboard copy (`8521940641@ptsbi`).
   - **Direct WhatsApp Instant Buy Button**: Pre-filled WhatsApp message direct aapke WhatsApp (`+91 8521940641`) par send hota hai.
5. **Preset Category Grid**:
   - 6 visually rich cards (Hormozi, Vox, Cinematic, Karaoke, Cyber, SFX).
6. **FAQ Accordion**:
   - Delivery, Premiere Pro compatibility, commercial license & customization questions.
7. **Local Asset Fallback**:
   - Agar aap file ko bina `assets/` folder ke locally open karte hain, toh script automatically images ko `https://rajnishstudios.vercel.app/` se load kar leti hai, isliye koi bhi image break nahi hoti.

---

## 🛠️ Customization Guide

### 1. UPI ID Badalna
Agar aapko UPI ID change karni ho, `index.html` me line search karein:
```html
<span class="upi-code" id="upi-id-text">8521940641@ptsbi</span>
```
Aur QR code URL me bhi update kar sakte hain:
```html
https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi%3A%2F%2Fpay%3Fpa%3DAAPKI_UPI_ID%26pn%3DRajnish%20Kumar%26am%3D49%26cu%3DINR%26tn%3DPremium%20Captions%20Pack
```

### 2. Google Drive Download Link Set Karna
`script.js` me payment submit hone par aap chahein toh direct Drive link open karwa sakte hain:
```javascript
window.open("AAPKA_GOOGLE_DRIVE_LINK", "_blank");
```

---

## 🌐 Vercel Par Deploy Kaise Karein

Aap apne existing GitHub repository ya Vercel folder me `index.html`, `style.css`, aur `script.js` ko replace/push kar dein:
```bash
git add .
git commit -m "Added Premium Captions Pack section (₹49)"
git push
```
Vercel automatically 30 seconds me live update deploy kar dega!
