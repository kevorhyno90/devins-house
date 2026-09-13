# Devin's House - Architectural & Construction Management PWA

An offline-ready Progressive Web Application (PWA) and architectural design portfolio for an exact **28.25 ft × 16.40 ft (463.3 sq ft)** modern residential home featuring a **Kangaroo-style hidden roof** and an active on-site construction tracker.

*(Extended by **+2 feet in length** from the original design: 28.25 ft length × 16.40 ft width; Corner-to-corner diagonal check: **32.67 ft / 32 ft 8 in**).*

![Devin's House App Icon](app_icon.jpg)

---

## 🌟 Key Features

1. **Exact 28.25 ft × 16.40 ft Rectangular Footprint (+2 ft Length Extension)**:
   - Optimized **463.3 sq ft** ground base (**711 sq ft** total living space with mezzanine).
   - Kangaroo-style hidden parapet roof concealing the sloping metal roof behind modern exterior parapet walls with internal box gutters (12" width × 6" depth).
   - Strict diagonal squareness verification: $\sqrt{28.25^2 + 16.40^2} = \mathbf{32.67\text{ ft}}$ ($32\text{ ft } 8\text{ in}$).
2. **Master Bedroom on Top of Kitchen**:
   - Built on the only intermediate floor level in the house (**248 sq ft** / 15.1 ft × 16.4 ft).
   - Includes an integrated wooden wardrobe and a dedicated changing nook with full-length mirror and changing bench.
3. **Full-Span Lower Kitchen**:
   - Dry pantry kitchen spanning underneath the master bedroom.
   - Full-width pantry cabinetry, deep soft-close drawers, and a dining bar island with stools (strictly no sink and no fridge).
4. **Untouched Stairs Along Wall**:
   - Straight open-riser timber staircase running along the side wall leading smoothly to the master bedroom.
5. **Kids Bedroom**:
   - Ground-floor room (**89 sq ft** / 8.5 ft × 10.5 ft) enclosed with an interior timber door.
   - Contains strictly a solid timber double-decker bunk bed with built-in step drawers and wooden wardrobe only (no desks, zero clutter).
6. **Seating Room Suite**:
   - Under soaring double-height cathedral ceiling (**17.1 ft** apex) with exposed rafters.
   - Furnished with a 3-seater sofa, three 1-seater armchairs, rectangular oak coffee table, and under-stair TV entertainment console.
7. **Single 3.5-Foot Solid Metal Entrance Door**:
   - Sturdy fluted dark steel security door (not glass).
   - Strictly the only exterior door to the house.
8. **Option 6: Smart Zero-Slab Mezzanine (Metal & Timber on 6 Masonry Pillars)**:
   - Eliminates the suspended concrete slab to save over $3,200 in construction costs and 4 weeks of curing downtime.
   - Supported by 6 solid non-metallic white-plastered masonry pillars (**8"×8"**, spaced 14.1 ft on center) carrying horizontal steel I-beams (**6"×3"**) and timber joists (**2"×6" @ 16" o.c.**).
   - **Ultra-Low-Cost Concrete-Free Staircase ($310 - $395 USD Complete)**:
     - *Budget Stringer Option ($310)*: 4"×2" rectangular steel box tubing stringers with welded 1.5"×1.5" angle cleats and treated local pine treads.
     - *Wall-Mounted Floating Cantilever Option ($395)*: Heavy steel brackets anchored into the 8-inch solid masonry wall, with horizontal steel cantilever box arms extending 29.5" outward to support floating timber treads with 100% ground floor clearance.
     - *Carpentry-Only Option ($240)*: 2"×10" C24 timber stringers with galvanized heavy shelf brackets.
   - Under-staircase built-in TV entertainment console and oak bookshelves freeing the entire double-height living room.
   - Private enclosed kids bedroom with solid partition walls, wooden door, custom integrated cabin beds with step drawers, and wardrobe.
   - Kangaroo-style hidden parapet roof concealing low-pitch metal roof and internal box gutters.
   - Complete seating suite (3-seater sofa + three 1-seater armchairs + coffee table), black metallic security front door, and metallic-frame glass windows.
9. **Active Site Diary & Milestone Progress Hub (Day 1 Started)**:
   - Comprehensive 14-step milestone tracker from trench excavation to final handover.
   - 6-Pillar & Foundation Inspection Checklist (Diagonals 32.67 ft, 2-inch spacers, 2-inch blinding, 10-12" starter hooks).
   - Interactive daily site diary allowing workers and project managers to log photos, materials, labor, and weather.

---

## 📱 Progressive Web App (PWA) Features

- **Installable Desktop/Mobile App**: Install directly from Chrome, Edge, or mobile browsers with desktop/home screen icon (`manifest.json`, `app_icon.jpg`).
- **100% Offline Ready**: Pre-cached by custom service worker (`sw.js`).
- **Live Editable Measurements in Feet**: Real-time room dimension adjustments (length, width, heights) with dynamic sq ft floor area recalculations.
- **Construction Expense Tracker**: Manage project budget, log expenditures by category, and export to CSV.
- **Imperial Engineering Calculators**: Paint & primer takeoffs in sq ft and gallons, oak parquet flooring in sq ft, electrical conduit in linear feet, and plumbing/box-gutter takeoffs in linear feet.
- **Construction Progress Tracker**: 14-milestone checklist from ground excavation to final handover.
- **Cost Minimization Guide**: Over $10,800 in structural savings documented.
- **Download Hub**: Download individual 3D renders, vector CAD SVGs, or export the full construction pack to PDF.

---

## 🛠️ Tech Stack

- **Core**: Semantic HTML5 & Vanilla Modern JavaScript (`app.js`)
- **Styling**: Modular Vanilla CSS (`styles.css`) with zero inline styles and full cross-browser compatibility
- **PWA**: Web App Manifest (`manifest.json`) and Cache-First Service Worker (`sw.js`)
- **Visuals**: High-resolution 3D cutaways and exterior facade renders (Octane / Unreal Engine 5 render style)

---

## 🚀 Running Locally

Open `index.html` in any modern web browser or serve via any static HTTP server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

---

## 📄 License

Created for Devin's House project. All rights reserved.
