"""Export the approved Fitmate vector geometry to Android/Play raster assets.

Run with a Python environment that has Pillow. The editable master is
assets/brand/fitmate-mark.svg; update the polygon here when changing that SVG.
"""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "brand"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
TEAL = "#0F766E"
WHITE = "#FFFFFF"
MARK = [(24, 20), (62, 20), (75, 32), (62, 44), (39, 44),
        (39, 53), (56, 53), (65, 62), (56, 71), (39, 71),
        (39, 80), (24, 80)]


def render(size: int, variant: str = "square") -> Image.Image:
    scale = 4
    canvas = Image.new("RGBA", (size * scale, size * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    edge = size * scale
    if variant == "round":
        draw.ellipse((0, 0, edge - 1, edge - 1), fill=TEAL)
    elif variant != "foreground" and variant != "monochrome":
        # Google Play and Android apply their own corner mask.
        draw.rectangle((0, 0, edge - 1, edge - 1), fill=TEAL)

    # Keep the mark within the central 66/108 Android adaptive safe zone.
    mark_scale = edge * (0.0094 if variant in ("foreground", "monochrome") else 1 / 96)
    mark_center_x = (24 + 75) / 2
    mark_center_y = (20 + 80) / 2
    points = [
        (edge / 2 + (x - mark_center_x) * mark_scale,
         edge / 2 + (y - mark_center_y) * mark_scale)
        for x, y in MARK
    ]
    draw.polygon(points, fill=WHITE)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    render(1024).save(BRAND / "app-icon.png")
    render(512).save(BRAND / "play-store-icon.png", optimize=True)
    render(432, "foreground").save(BRAND / "adaptive-foreground.png")
    render(432, "monochrome").save(BRAND / "adaptive-monochrome.png")
    if RES.exists():
        for density, size in (('mdpi', 48), ('hdpi', 72), ('xhdpi', 96),
                              ('xxhdpi', 144), ('xxxhdpi', 192)):
            dest = RES / f"mipmap-{density}"
            if dest.exists():
                render(size).save(dest / "ic_launcher.webp", format="WEBP", quality=100, method=6)
                render(size, "round").save(dest / "ic_launcher_round.webp", format="WEBP", quality=100, method=6)
        for density, size in (('mdpi', 288), ('hdpi', 432), ('xhdpi', 576),
                              ('xxhdpi', 864), ('xxxhdpi', 1152)):
            dest = RES / f"drawable-{density}"
            if dest.exists():
                splash = Image.new("RGBA", (size, size), (0, 0, 0, 0))
                mark = render(round(size * 0.42))
                splash.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
                splash.save(dest / "splashscreen_logo.png")


if __name__ == "__main__":
    main()
