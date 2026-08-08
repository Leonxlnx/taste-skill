import math

CX = CY = 32.0
R = 30.0            # радиус шестигранника до вершины

# --- Стрелка в центре (сквозное отверстие). Снята с референса:
#     A задняя верхняя, B остриё справа, C задняя нижняя, D вырез (вогнутая точка).
ARROW = [(21.5, 17.5), (47.5, 23.5), (36.5, 47.5), (29.5, 31.0)]

# --- Три ленты: (угол начала, угол конца по часовой, цвет)
#     Красная занимает примерно половину кольца, белая и синяя по сегменту.
PIECES = [
    (-109,  78, '#E4232E', 'red'),
    (  84, 140, '#1D6FD8', 'blue'),
    ( 161, 217, '#F4F6FA', 'white'),
]


def pt(r, deg, cx=CX, cy=CY):
    a = math.radians(deg)
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def toward(a, b, dist):
    vx, vy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(vx, vy)
    return (a[0] + vx / L * dist, a[1] + vy / L * dist)


def rounded(verts, cr):
    """Замкнутый контур со скруглёнными углами. cr обрезается под короткие рёбра."""
    n, out = len(verts), []
    for i in range(n):
        p, prv, nxt = verts[i], verts[i - 1], verts[(i + 1) % n]
        lim = min(math.dist(p, prv), math.dist(p, nxt)) / 2.2
        r = min(cr, lim)
        a_in, a_out = toward(p, prv, r), toward(p, nxt, r)
        out.append(("L" if i else "M") + f"{a_in[0]:.2f} {a_in[1]:.2f}")
        out.append(f"Q{p[0]:.2f} {p[1]:.2f} {a_out[0]:.2f} {a_out[1]:.2f}")
    return " ".join(out) + " Z"


hexagon = rounded([pt(R, -90 + 60 * i) for i in range(6)], 4.2)
arrow = rounded(ARROW, 2.2)

# Кольцо = шестигранник минус стрелка (evenodd делает стрелку сквозной).
ring = hexagon + " " + arrow


def wedge(a0, a1):
    """Сектор из центра, которым вырезается отдельная лента."""
    pts = [(CX, CY)]
    steps = max(2, int(abs(a1 - a0) // 12) + 2)
    for i in range(steps + 1):
        pts.append(pt(120, a0 + (a1 - a0) * i / steps))
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + " Z"


clips, layers = [], []
for a0, a1, color, name in PIECES:
    clips.append(f'    <clipPath id="pm-{name}"><path d="{wedge(a0, a1)}"/></clipPath>')
    layers.append(
        f'  <path d="{ring}" fill-rule="evenodd" fill="{color}" clip-path="url(#pm-{name})"/>')

svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
    'role="img" aria-labelledby="pm-logo-title">\n'
    '  <title id="pm-logo-title">Prompter Moscow</title>\n'
    '  <defs>\n' + "\n".join(clips) + '\n  </defs>\n'
    + "\n".join(layers) + '\n</svg>\n'
)

open('/home/user/taste-skill/prompter-moscow/assets/logo.svg', 'w').write(svg)
print(svg[:400])
print('...')
print('bytes:', len(svg))
