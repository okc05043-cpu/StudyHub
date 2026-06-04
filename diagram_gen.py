import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle
import matplotlib.patheffects as pe

fig, ax = plt.subplots(figsize=(18, 11))
ax.set_xlim(0, 18)
ax.set_ylim(0, 11)
ax.axis('off')
fig.patch.set_facecolor('#F0F4FF')

# ── 색상 ────────────────────────────────────────────────
C = {
    'cicd':       '#5E35B1',
    'cicd_bg':    '#EDE7F6',
    'nginx':      '#1565C0',
    'nginx_bg':   '#DDEEFF',
    'front':      '#2E7D32',
    'front_bg':   '#E8F5E9',
    'back':       '#BF360C',
    'back_bg':    '#FBE9E7',
    'db':         '#880E4F',
    'db_bg':      '#FCE4EC',
    'client':     '#37474F',
    'client_bg':  '#ECEFF1',
    'storage':    '#00695C',
    'storage_bg': '#E0F2F1',
    'server_bg':  '#E3F2FD',
}

# ── 헬퍼 ────────────────────────────────────────────────
def rounded_box(ax, x, y, w, h, title, sub, color, bg, dot_label=''):
    rect = FancyBboxPatch((x, y), w, h,
                          boxstyle='round,pad=0.05,rounding_size=0.3',
                          lw=2.2, edgecolor=color, facecolor=bg, zorder=3)
    ax.add_patch(rect)
    # 상단 색 띠
    band = FancyBboxPatch((x+0.05, y+h-0.45), w-0.1, 0.38,
                          boxstyle='round,pad=0.01,rounding_size=0.2',
                          lw=0, edgecolor=color, facecolor=color, zorder=4, alpha=0.85)
    ax.add_patch(band)
    ax.text(x+w/2, y+h-0.26, title,
            ha='center', va='center', fontsize=9.5, fontweight='bold',
            color='white', zorder=5)
    ax.text(x+w/2, y+h/2-0.15, sub,
            ha='center', va='center', fontsize=8, color='#455A64', zorder=4,
            linespacing=1.5)
    if dot_label:
        ax.text(x+w-0.15, y+0.18, dot_label,
                ha='right', va='center', fontsize=7, color=color, zorder=5,
                style='italic')

def arrow(ax, x1, y1, x2, y2, label='', color='#546E7A', bidir=False, rad=0.0):
    style = f'arc3,rad={rad}'
    kw = dict(arrowstyle='->', color=color, lw=1.8, mutation_scale=14)
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(**kw, connectionstyle=style), zorder=2)
    if bidir:
        ax.annotate('', xy=(x1, y1), xytext=(x2, y2),
                    arrowprops=dict(**kw, connectionstyle=style), zorder=2)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx, my+0.22, label, ha='center', va='bottom',
                fontsize=7.8, color=color, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.22', fc='white', ec='none', alpha=0.9),
                zorder=6)

# ════════════════════════════════════════════════════════
#  제목
# ════════════════════════════════════════════════════════
ax.text(9, 10.55, 'StudyHub  |  System Architecture',
        ha='center', va='center', fontsize=19, fontweight='bold', color='#1A237E',
        path_effects=[pe.withStroke(linewidth=5, foreground='white')])

# ════════════════════════════════════════════════════════
#  Server 영역 배경
# ════════════════════════════════════════════════════════
srv = FancyBboxPatch((5.8, 1.3), 11.7, 8.1,
                     boxstyle='round,pad=0.1,rounding_size=0.5',
                     lw=2, edgecolor='#90CAF9', facecolor=C['server_bg'],
                     alpha=0.4, zorder=1)
ax.add_patch(srv)
ax.text(11.65, 9.3, 'Production Server  (VPS / Cloud)  —  Docker Compose',
        ha='center', va='center', fontsize=9, color='#1565C0',
        fontweight='bold', style='italic')

# CI/CD 영역 배경
cicd_bg = FancyBboxPatch((6.1, 7.0), 5.4, 2.0,
                          boxstyle='round,pad=0.08,rounding_size=0.3',
                          lw=1.5, edgecolor=C['cicd'], facecolor=C['cicd_bg'],
                          alpha=0.35, zorder=1)
ax.add_patch(cicd_bg)
ax.text(8.8, 8.92, 'CI / CD  Pipeline',
        ha='center', va='center', fontsize=8.5, color=C['cicd'],
        fontweight='bold', style='italic')

# ════════════════════════════════════════════════════════
#  박스
# ════════════════════════════════════════════════════════

# Developer
rounded_box(ax,  0.3,  8.2, 2.2, 1.8,
            'Developer',  'git push\n(source code)',
            C['client'], C['client_bg'])

# GitHub
rounded_box(ax,  0.3,  5.6, 2.2, 1.8,
            'GitHub',  'Repository\nmain branch',
            C['cicd'], C['cicd_bg'])

# GitHub Actions
rounded_box(ax,  6.3,  7.1, 5.0, 1.7,
            'GitHub Actions',
            'Build & Test  →  SSH Deploy\n(docker-compose up --build)',
            C['cicd'], C['cicd_bg'])

# Nginx
rounded_box(ax,  6.3,  4.3, 2.8, 2.2,
            'Nginx',
            'Reverse Proxy\nPort :80\n/ → Frontend\n/api → Backend',
            C['nginx'], C['nginx_bg'])

# Frontend
rounded_box(ax, 10.0,  4.3, 3.2, 2.2,
            'Frontend Container',
            'React + Vite\nTailwind CSS\nPort :5173',
            C['front'], C['front_bg'])

# Backend
rounded_box(ax,  6.3,  1.7, 2.8, 2.2,
            'Backend Container',
            'Node.js + Express\nJWT  |  Multer\nPort :4000',
            C['back'], C['back_bg'])

# MySQL
rounded_box(ax, 10.0,  1.7, 3.2, 2.2,
            'MySQL Container',
            'studyhub DB\nPort :3306\nusers / posts / files\nlikes / bookmarks / comments',
            C['db'], C['db_bg'])

# Browser
rounded_box(ax,  0.3,  3.0, 2.2, 1.9,
            'Browser',
            'Client\nHTTP / HTTPS',
            C['client'], C['client_bg'])

# Web Storage
rounded_box(ax,  0.3,  0.5, 2.2, 2.2,
            'Web Storage',
            'localStorage\n  JWT Token / Nickname\n  Bookmarks\nsessionStorage\n  Recent Posts',
            C['storage'], C['storage_bg'])

# ════════════════════════════════════════════════════════
#  화살표
# ════════════════════════════════════════════════════════

# Developer → GitHub
arrow(ax, 1.4, 8.2, 1.4, 7.4, 'push', C['cicd'])

# GitHub → GitHub Actions
arrow(ax, 2.5, 6.45, 6.3, 7.6, 'trigger', C['cicd'])

# GitHub Actions → Nginx (deploy)
arrow(ax, 8.8, 7.1, 7.7, 6.5, 'SSH deploy', C['cicd'])

# Browser ↔ Nginx
arrow(ax, 2.5, 3.95, 6.3, 5.4, 'HTTP :80', C['nginx'], bidir=True)

# Nginx → Frontend
arrow(ax, 9.1, 5.4, 10.0, 5.4, '/', C['front'])

# Nginx ↔ Backend
arrow(ax, 7.7, 4.3, 7.7, 3.9, '/api', C['back'], bidir=True)

# Backend ↔ MySQL
arrow(ax, 9.1, 2.8, 10.0, 2.8, 'SQL Queries', C['db'], bidir=True)

# Browser ↔ Web Storage
arrow(ax, 1.4, 3.0, 1.4, 2.7, 'read/write', C['storage'], bidir=True)

# ════════════════════════════════════════════════════════
#  기술 태그 (오른쪽 하단)
# ════════════════════════════════════════════════════════
tags = [
    ('Docker Compose',  C['nginx'],   13.8, 3.8),
    ('JWT Auth',        C['back'],    13.8, 3.25),
    ('Bcrypt',          C['back'],    13.8, 2.7),
    ('Multer (File)',    C['back'],    13.8, 2.15),
    ('REST API',        C['back'],    13.8, 1.6),
]
ax.text(14.7, 4.3, 'Tech Tags', ha='center', fontsize=9,
        fontweight='bold', color='#37474F')
for label, col, tx, ty in tags:
    tp = FancyBboxPatch((tx-0.1, ty-0.22), 1.9, 0.38,
                        boxstyle='round,pad=0.06,rounding_size=0.12',
                        lw=1.3, edgecolor=col, facecolor='white', zorder=3)
    ax.add_patch(tp)
    ax.text(tx+0.85, ty-0.03, label, ha='center', va='center',
            fontsize=8, color=col, fontweight='bold', zorder=4)

# ════════════════════════════════════════════════════════
#  범례
# ════════════════════════════════════════════════════════
legend = [
    (C['cicd_bg'],    C['cicd'],    'CI/CD'),
    (C['nginx_bg'],   C['nginx'],   'Nginx'),
    (C['front_bg'],   C['front'],   'Frontend'),
    (C['back_bg'],    C['back'],    'Backend'),
    (C['db_bg'],      C['db'],      'Database'),
    (C['storage_bg'], C['storage'], 'Web Storage'),
    (C['client_bg'],  C['client'],  'Client'),
]
lx, ly = 13.9, 9.0
ax.text(lx+0.85, ly+0.08, 'Legend', ha='center',
        fontsize=9.5, fontweight='bold', color='#1A237E')
for i, (bg, fg, lbl) in enumerate(legend):
    ry = ly - 0.48*(i+1)
    r = FancyBboxPatch((lx, ry), 0.5, 0.32,
                       boxstyle='round,pad=0.04,rounding_size=0.08',
                       lw=1.5, edgecolor=fg, facecolor=bg, zorder=3)
    ax.add_patch(r)
    ax.text(lx+0.65, ry+0.16, lbl, ha='left', va='center',
            fontsize=8.5, color=fg)

# ════════════════════════════════════════════════════════
#  저장
# ════════════════════════════════════════════════════════
plt.tight_layout(pad=0.4)
plt.savefig('c:/Users/user/Desktop/StudyHub/architecture.png',
            dpi=180, bbox_inches='tight',
            facecolor=fig.get_facecolor())
print("architecture.png saved!")
