#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成投资顾问持续跟踪页 advisor.html（2026-11-21）
读 F:\投资顾问\03_看板数据\advisor_latest.json，复用全站 nav/密码锁/样式。
全站菜单由 build_invest_views.py 统一生成（advisor.html 已入 MENU/FILES）。
"""
import os
import sys
import json
import html
import datetime

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from build_invest_views import nav, LOCK, CSS, CACHE_BUST, DISC

BOARD = r"F:\投资顾问\03_看板数据\advisor_latest.json"
OUT = os.path.join(HERE, "advisor.html")

LEVEL_COLOR = {"高": "var(--red)", "中": "var(--warn)", "低": "var(--green)"}


def esc(s):
    return html.escape(str(s or ""))


def load_board():
    try:
        with open(BOARD, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"generated_at": "-", "version": "-", "as_of": "-",
                "total_asset": None, "total_pnl": None, "count": 0, "items": [], "pushes": []}


def fmt(x):
    try:
        return f"{x:,.2f}"
    except Exception:
        return "—"


def pnl_cls(x):
    """A股口径：正=红(pos)，负=绿(neg)。"""
    try:
        return "pos" if float(x) > 0 else ("neg" if float(x) < 0 else "")
    except Exception:
        return ""


def pnl_txt(x):
    try:
        v = float(x)
        return f"+{v:,.2f}" if v > 0 else f"{v:,.2f}"
    except Exception:
        return "—"


def build():
    d = load_board()
    items = d.get("items", [])
    pushes = d.get("pushes", [])

    # 期号与四类资产
    issue = d.get("issue_rule", {}) or {}
    cur_issue = issue.get("current_issue", 1)
    four = d.get("four_assets", []) or []
    fx_note = (d.get("merge_note", {}) or {}).get("fx_source", "")

    # 数字卡（红涨绿跌，A股口径）
    total_pnl = d.get("total_pnl")
    cards = f"""<div class="cards">
      <div class="card"><div class="label">简报期号</div><div class="value" style="font-size:18px;">第 {cur_issue:03d} 期</div></div>
      <div class="card"><div class="label">四账户总资产</div><div class="value">{fmt(d.get('total_asset'))}</div></div>
      <div class="card"><div class="label">累计盈亏</div><div class="value {pnl_cls(total_pnl)}">{pnl_txt(total_pnl)}</div></div>
      <div class="card"><div class="label">持续跟踪条目</div><div class="value">{d.get('count', 0)}</div></div>
    </div>"""

    # 四类资产结构表（参照周末简报格式）
    farows = []
    for a in four:
        p = a.get("pnl")
        farows.append(
            f"<tr><td><b>{esc(a.get('name'))}</b><div style='font-size:10px;color:var(--muted)'>{esc(a.get('note'))}</div></td>"
            f"<td class='num'>{fmt(a.get('mv'))}</td>"
            f"<td class='num'>{esc(a.get('weight'))}</td>"
            f"<td class='num {pnl_cls(p)}'>{pnl_txt(p)}</td>"
            f"<td class='num {pnl_cls(p)}'>{esc(a.get('pnl_rate'))}</td></tr>")
    four_html = ""
    if farows:
        four_html = f"""<section>
      <h2>📊 四类资产结构（第 {cur_issue:03d} 期 · 红=盈利 绿=亏损）</h2>
      <div class="meta-line">美元按 {esc(fx_note)} 折算；黄金按参考市值。权重按总资产 {fmt(d.get('total_asset'))} 计算。</div>
      <table><thead><tr><th>资产类别</th><th class="num">市值（元）</th><th class="num">权重</th><th class="num">累计盈亏</th><th class="num">盈亏率</th></tr></thead>
      <tbody>{''.join(farows)}</tbody></table>
      <div class="disc">期号按内容流水编号（每产出一份新简报 +1），不再用日期版本号。简报最新：<code>{esc(issue.get('latest_file'))}</code></div>
    </section>"""

    # 收集整理清单
    rows = []
    for it in items:
        lv = it.get("level", "中")
        color = LEVEL_COLOR.get(lv, "var(--muted)")
        rows.append(f"""<div class="item">
          <div class="item-h"><span class="badge" style="color:{color};border-color:{color};">{esc(lv)}</span>
            <b>{esc(it.get('title'))}</b> <span class="tag">{esc(it.get('type'))}</span></div>
          <div class="item-m">{esc(it.get('summary') or '—')}</div>
          <div class="item-s">来源：{esc(it.get('source'))} ｜ 归档：{esc(it.get('archived_at'))} ｜ <code>{esc(it.get('file'))}</code></div>
        </div>""")
    collect_html = "\n".join(rows) if rows else "<div class='empty'>暂无收集记录。收到第一条投资资讯后自动出现。</div>"

    # 推送留档
    prow = []
    for p in pushes:
        prow.append(f"<div class='push'>📤 <code>{esc(p.get('file'))}</code> <span class='item-s'>{esc(p.get('date'))}</span></div>")
    push_html = "\n".join(prow) if prow else "<div class='empty'>暂无推送留档。</div>"

    doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>丰哥·投资顾问（持续跟踪）</title>
<style>
{CSS}
.card .value{{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:12px;}}
.card{{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:13px 15px;}}
.card .label{{color:var(--muted);font-size:11px;margin-bottom:6px;}}
section{{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:16px 18px;}}
h2{{font-size:15px;margin-bottom:12px;color:var(--accent);}}
.item{{border-bottom:1px solid var(--border);padding:10px 0;}}
.item:last-child{{border-bottom:none;}}
.item-h{{font-size:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}}
.badge{{font-size:11px;border:1px solid;padding:1px 7px;border-radius:10px;}}
.tag{{font-size:11px;color:var(--muted);background:var(--bg);border:1px solid var(--border);padding:1px 7px;border-radius:8px;}}
.item-m{{font-size:13px;color:var(--text);margin:6px 0;line-height:1.6;}}
.item-s{{font-size:11px;color:var(--muted);}}
code{{font-size:11px;color:var(--accent);}}
.push{{font-size:12px;padding:5px 0;border-bottom:1px solid var(--border);}}
.empty{{color:var(--muted);font-size:13px;padding:10px 0;}}
.meta-line{{color:var(--muted);font-size:12px;margin-bottom:12px;}}
.disc{{color:var(--muted);font-size:11px;line-height:1.7;margin-top:14px;border-top:1px solid var(--border);padding-top:12px;}}
section table{{border-collapse:collapse;width:100%;font-size:13px;}}
section th{{color:var(--muted);font-weight:500;text-align:left;padding:7px 9px;border-bottom:1px solid var(--border);}}
section th.num,section td.num{{text-align:right;font-variant-numeric:tabular-nums;}}
section td{{padding:8px 9px;border-bottom:1px solid var(--border);}}
section tr:last-child td{{border-bottom:none;}}
</style>
</head>
<body>
{LOCK}
<div class="wrap">
  <div class="header">
    <h1><span class="dot">🤖</span> 投资顾问 · 持续跟踪 <span class="version">第 {cur_issue:03d} 期</span></h1>
    <div class="meta">数据截至 <b>{esc(d.get('as_of'))}</b> ｜ 生成 {esc(d.get('generated_at'))}</div>
  </div>
  {nav('advisor.html')}
  <main>
    {cards}
    {four_html}
    <section>
      <h2>📥 收集整理（本地保存 · 持续跟踪）</h2>
      <div class="meta-line">凡投资类来料，按「事件定性→双向传导→持仓映射→观察信号」结构化归档，本地永久留痕。</div>
      {collect_html}
    </section>
    <section>
      <h2>📤 推送存档（按规划推送给康哥）</h2>
      {push_html}
    </section>
    <div class="disc">{DISC}</div>
  </main>
</div>
</body>
</html>"""

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"[gen_advisor] {OUT}  {len(doc)} 字符  收集={len(items)}条 推送={len(pushes)}条")


if __name__ == "__main__":
    build()
