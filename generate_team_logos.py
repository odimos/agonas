"""
Generate SVG logos for each team and upload via the management API.
Run from the project root: python generate_team_logos.py
"""
import io
import requests

API = "http://localhost:8000"

TEAMS = [
    (215, "OPA FC"),
    (216, "Panteiakoi"),
    (217, "Polytechnioi United"),
    (218, "EKPA Rovers"),
    (219, "The Accountants"),
    (220, "Flat Back Four"),
    (221, "Sunday Knee FC"),
    (222, "No Offside Rule"),
    (223, "ASO Korydallos"),
    (224, "Halandri Athletic"),
    (225, "Ilioupoli Stars"),
    (226, "Peristeri FC"),
    (227, "Glyfada Beach Boys"),
    (228, "Kifisia Wanderers"),
    (229, "Nea Ionia United"),
    (230, "Galatsi FC"),
    (231, "AUEB Ballers"),
    (232, "Agronomoi FC"),
    (233, "Offsidious"),
    (234, "The Yellow Cards"),
]

# Distinct palette — one color per team
COLORS = [
    ("#1a6b3c", "#ffffff"),  # dark green / white
    ("#0d3b8c", "#ffffff"),  # navy / white
    ("#7b2d8b", "#ffffff"),  # purple / white
    ("#c0392b", "#ffffff"),  # red / white
    ("#1a5276", "#ffffff"),  # steel blue / white
    ("#117a65", "#ffffff"),  # teal / white
    ("#784212", "#ffffff"),  # brown / white
    ("#2e4057", "#ffffff"),  # slate / white
    ("#6c3483", "#ffffff"),  # violet / white
    ("#1e8449", "#ffffff"),  # green / white
    ("#b7950b", "#ffffff"),  # gold dark / white
    ("#922b21", "#ffffff"),  # crimson / white
    ("#1a5276", "#f0e68c"),  # blue / yellow
    ("#0e6655", "#ffffff"),  # emerald / white
    ("#4a235a", "#ffffff"),  # deep purple / white
    ("#1b4f72", "#ffffff"),  # ocean / white
    ("#7d6608", "#ffffff"),  # olive / white
    ("#212f3d", "#ffffff"),  # charcoal / white
    ("#6e2f1a", "#ffffff"),  # rust / white
    ("#1a1a2e", "#f5c518"),  # dark navy / gold
]


def initials(name):
    words = name.split()
    # Skip common short words
    skip = {"fc", "the", "no", "a", "an"}
    sig = [w for w in words if w.lower() not in skip]
    if len(sig) >= 2:
        return (sig[0][0] + sig[1][0]).upper()
    return sig[0][:2].upper() if sig else name[:2].upper()


def make_svg(name, bg, fg):
    letters = initials(name)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <rect width="100" height="100" rx="16" fill="{bg}"/>
  <text x="50" y="50" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="{fg}">{letters}</text>
</svg>"""


def upload(team_id, svg_bytes, filename):
    url = f"{API}/api/teams/{team_id}/photo"
    resp = requests.post(url, files={"photo": (filename, svg_bytes, "image/svg+xml")})
    resp.raise_for_status()
    return resp.json().get("photo_url")


for i, (tid, name) in enumerate(TEAMS):
    bg, fg = COLORS[i % len(COLORS)]
    svg = make_svg(name, bg, fg).encode("utf-8")
    photo_url = upload(tid, svg, f"team_{tid}.svg")
    print(f"{tid} {name:30s} -> {photo_url}")

print("Done.")
