Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;

public class ImageRectifier {
    public static void Rectify(string srcPath, string destPath) {
        using (Bitmap src = new Bitmap(srcPath))
        using (Bitmap bmp = new Bitmap(src.Width, src.Height))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;
            g.DrawImage(src, 0, 0, src.Width, src.Height);

            // 1. Cover up old top-left title
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(235, 15, 25, 45)))
            using (Pen pen = new Pen(Color.FromArgb(255, 56, 189, 248), 2f)) {
                Rectangle topR = new Rectangle(290, 42, 450, 42);
                g.FillRectangle(brush, topR);
                g.DrawRectangle(pen, topR);
                using (Font font = new Font("Segoe UI", 11f, FontStyle.Bold))
                using (SolidBrush textB = new SolidBrush(Color.FromArgb(255, 56, 189, 248))) {
                    g.DrawString("CANTILEVERED CANOPY & GUTTER OVER 1.0m CORRIDOR", font, textB, 302, 54);
                }
            }

            // 2. Callout: MAIN ENTRANCE DOOR (On wall holding glasses)
            DrawBannerBox(g, 670, 415, 350, 68,
                Color.FromArgb(245, 12, 74, 110),
                Color.FromArgb(255, 56, 189, 248),
                "MAIN ENTRANCE DOOR",
                "Located on this wall holding glasses (below the glass)",
                Color.FromArgb(255, 56, 189, 248),
                Color.FromArgb(255, 240, 249, 255),
                13f, 10f);

            // Arrow down to the wall holding glasses
            using (Pen cyanPen = new Pen(Color.FromArgb(255, 56, 189, 248), 3f)) {
                cyanPen.EndCap = LineCap.ArrowAnchor;
                g.DrawLine(cyanPen, 780, 485, 780, 545);
            }

            // 3. Callout: KITCHEN OUTLET DOOR
            DrawBannerBox(g, 1030, 550, 320, 68,
                Color.FromArgb(245, 30, 27, 75),
                Color.FromArgb(255, 245, 158, 11),
                "KITCHEN OUTLET DOOR",
                "Door in foreground (900mm x 2,100mm)",
                Color.FromArgb(255, 251, 191, 36),
                Color.FromArgb(255, 226, 232, 240),
                13f, 10f);

            // Arrow pointing left to kitchen door
            using (Pen amberPen = new Pen(Color.FromArgb(255, 245, 158, 11), 3f)) {
                amberPen.EndCap = LineCap.ArrowAnchor;
                g.DrawLine(amberPen, 1030, 584, 980, 584);
            }

            // 4. Callout: STONE-PITCHED CEMENT TRENCH
            DrawBannerBox(g, 35, 630, 375, 72,
                Color.FromArgb(245, 15, 23, 42),
                Color.FromArgb(255, 56, 189, 248),
                "STONE-PITCHED CEMENT TRENCH",
                "0.5m Wide (Natural quarry stone mortared with cement)",
                Color.FromArgb(255, 56, 189, 248),
                Color.FromArgb(255, 203, 213, 225),
                12f, 10f);

            // Arrow up to stone trench
            using (Pen trenchPen = new Pen(Color.FromArgb(255, 56, 189, 248), 3f)) {
                trenchPen.EndCap = LineCap.ArrowAnchor;
                g.DrawLine(trenchPen, 215, 630, 215, 580);
            }

            // 5. Header banner at the very top
            Rectangle headerR = new Rectangle(15, 10, 1346, 30);
            using (SolidBrush hBrush = new SolidBrush(Color.FromArgb(245, 7, 17, 30)))
            using (Pen hPen = new Pen(Color.FromArgb(255, 56, 189, 248), 1.5f)) {
                g.FillRectangle(hBrush, headerR);
                g.DrawRectangle(hPen, headerR);
                using (Font hFont = new Font("Segoe UI", 11f, FontStyle.Bold))
                using (SolidBrush textW = new SolidBrush(Color.White)) {
                    g.DrawString("RECTIFIED PLAN: MAIN DOOR ON WALL HOLDING GLASSES | KITCHEN OUTLET AT FOREGROUND | STONE CEMENT TRENCH", hFont, textW, 25, 16);
                }
            }

            bmp.Save(destPath, ImageFormat.Jpeg);
        }
    }

    private static void DrawBannerBox(Graphics g, int x, int y, int w, int h, Color bg, Color border, string title, string sub, Color tCol, Color sCol, float tSize, float sSize) {
        Rectangle r = new Rectangle(x, y, w, h);
        using (SolidBrush bBrush = new SolidBrush(bg))
        using (Pen bPen = new Pen(border, 2f)) {
            g.FillRectangle(bBrush, r);
            g.DrawRectangle(bPen, r);
            using (Font tFont = new Font("Segoe UI", tSize, FontStyle.Bold))
            using (SolidBrush tBrush = new SolidBrush(tCol)) {
                g.DrawString(title, tFont, tBrush, x + 10, y + 6);
            }
            if (!string.IsNullOrEmpty(sub)) {
                using (Font sFont = new Font("Segoe UI", sSize, FontStyle.Regular))
                using (SolidBrush sBrush = new SolidBrush(sCol)) {
                    g.DrawString(sub, sFont, sBrush, x + 10, y + 6 + tSize + 7);
                }
            }
        }
    }
}
'@

$src = "c:\Users\USER\OneDrive\Desktop\devins-house\stone_trench_corridor_doors_dims.jpg"
$dest = "c:\Users\USER\OneDrive\Desktop\devins-house\rectified_entrance_and_trench_design.jpg"
[ImageRectifier]::Rectify($src, $dest)
Write-Host "Rectified image created at: $dest"
