# -*- coding: utf-8 -*-
"""专题学习构建脚本 v2（2026-11-01）
功能：
1. 微信文章整理稿(md) -> HTML，归入对应专题 topics/<topic>/wx/
2. 所有专题页面注入：h2 折叠展开(details) + 浮动「📚 目录」返回按钮
3. 重建 topics/topics.json（含各专题微信文章清单，列表页自动渲染）
以后新增微信文章：在 WX_MAP 登记一行，重跑本脚本 + push 即可。"""
import os, re, json, datetime
import markdown

REPO = r"D:\WorkBuddy\Claw\work\family-nav\fengge-dashboard"
TOPICS = os.path.join(REPO, "topics")
KB = r"F:\金融知识库\公众号文章"
GEN_DATE = datetime.date.today().isoformat()

# ============ 微信文章清单 ============
WX_MAP = {
    "wuzhong2026": [  # 五中全会
        "2026-09-21_中共中央政治局会议_二十届五中全会_全面从严治党决定.md",
        "2026-10-29_党建_二十届五中全会公报_全文.md",
        "2026-10-30_中宣部召开学习宣传贯彻二十届五中全会精神会议.md",
        "2026-10-30_党建_国家外汇管理局党组传达学习五中全会精神.md",
        "2026-10-30_党建_学习笔记二十届五中全会公报.md",
        "2026-10-30_党建_工商银行党委扩大会议传达学习五中全会精神.md",
        "2026-10-30_党建_苏州市委常委会扩大会议传达学习五中全会精神.md",
        "2026-10-30_党建_解读二十届五中全会精神新闻发布会.md",
        "2026-10-30_金融_建设银行党委传达学习贯彻五中全会精神.md",
        "2026-10-31_党建_新华日报江苏全省热议五中全会精神.md",
        "2026-10-31_党建_读懂决定二十届五中全会精神解读_出卷人版.md",
    ],
    "jinrongjie2026": [  # 金融街论坛
        "2026-10-19_央视财经_2026金融街论坛年会开幕.md",
        "2026-10-20_潘功胜_2026金融街论坛演讲_货币政策框架转型.md",
        "2026-10-21_2026金融街论坛_央行主场论坛_AI金融治理.md",
    ],
    "yanjiang": [  # 演讲/表达
        "2026-07-13_职场发言技巧_被提拔高情商讲话.md",
    ],
}

TOPIC_META = [
    {"dir": "wuzhong2026", "title": "二十届五中全会精神 · 学习汇编", "emoji": "📕",
     "desc": "学习要点摘编 · 资料库版（学习路径 / 信号清单 / 汇报用法）", "date": "2026-10-20"},
    {"dir": "jinrongjie2026", "title": "2026 金融街论坛年会 · 精神汇编", "emoji": "🏛️",
     "desc": "年会主要精神要点 + 重要演讲汇编（金融监管/资本市场信号）", "date": "2026-10-20"},
    {"dir": "yanjiang", "title": "演讲知识库", "emoji": "🎤",
     "desc": "主持人风格图谱 / 总统演讲结构 / 7 篇著名演讲拆解（10 个子册）", "date": "2026-11-01"},
]

# ============ 模板 ============
WX_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
html {{ -webkit-text-size-adjust:100%; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  background:#f2f4f8; color:#2b3445; line-height:1.75; font-size:16px; }}
.hero {{ background:linear-gradient(135deg,#0d2b52 0%,#14417e 55%,#1b5aa8 100%); color:#fff;
  padding:34px 20px 30px; text-align:center; }}
.hero .tag {{ display:inline-block; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.35);
  border-radius:999px; padding:2px 12px; font-size:12px; margin-bottom:10px; }}
.hero h1 {{ font-size:20px; font-weight:700; line-height:1.4; }}
.wrap {{ max-width:860px; margin:0 auto; padding:16px 14px 80px; }}
.meta {{ background:#fff; border-radius:12px; padding:14px 18px; margin-top:-18px;
  box-shadow:0 4px 18px rgba(13,43,82,.10); font-size:13px; color:#5a6478; }}
.meta a {{ color:#1b5aa8; word-break:break-all; }}
.card {{ background:#fff; border-radius:12px; padding:24px 22px; margin-top:14px;
  box-shadow:0 2px 10px rgba(13,43,82,.06); }}
h2, summary.sec-h {{ font-size:19px; color:#0d2b52; border-left:5px solid #d4a017; padding-left:12px; margin:26px 0 12px; }}
summary.sec-h {{ cursor:pointer; list-style:none; }}
summary.sec-h::-webkit-details-marker {{ display:none; }}
details.sec > summary.sec-h .arr {{ float:right; font-size:12px; color:#9aa4b8; font-weight:normal; padding-top:6px; }}
details.sec[open] > summary.sec-h .arr::after {{ content:"收起 ▲"; }}
details.sec:not([open]) > summary.sec-h .arr::after {{ content:"展开 ▼"; }}
h3 {{ font-size:16.5px; color:#14417e; margin:18px 0 8px; }}
p {{ margin:10px 0; }}
ul,ol {{ margin:8px 0 8px 22px; }}
li {{ margin:4px 0; }}
blockquote {{ background:linear-gradient(90deg,#fdf6e3,#fbf3dc); border-left:4px solid #d4a017;
  border-radius:0 8px 8px 0; padding:10px 14px; margin:12px 0; color:#5c4a12; font-size:14px; }}
blockquote p {{ margin:3px 0; }}
table {{ width:100%; border-collapse:collapse; margin:12px 0; font-size:13.5px; display:block; overflow-x:auto; }}
th {{ background:#0d2b52; color:#fff; padding:8px 10px; text-align:left; white-space:nowrap; }}
td {{ border:1px solid #e3e8f0; padding:7px 9px; vertical-align:top; }}
tr:nth-child(even) td {{ background:#f7f9fc; }}
strong {{ color:#0d2b52; }}
a {{ color:#1b5aa8; }}
code {{ background:#eef2f8; border-radius:4px; padding:1px 6px; font-size:13px; color:#14417e; }}
hr {{ border:none; border-top:1px dashed #ccd5e0; margin:26px 0; }}
.footer {{ text-align:center; color:#8a94a6; font-size:12px; margin-top:26px; }}
.fab-back {{ position:fixed; bottom:24px; right:16px; z-index:99; background:#0d2b52; color:#fff;
  text-decoration:none; border-radius:999px; padding:11px 18px; font-size:14px; font-weight:600;
  box-shadow:0 4px 16px rgba(13,43,82,.40); display:flex; align-items:center; gap:6px; }}
.fab-back:active {{ transform:scale(.94); }}
@media (max-width:600px) {{ .hero h1{{font-size:17px;}} .card{{padding:18px 14px;}} body{{font-size:15px;}}
  h2, summary.sec-h{{font-size:17px;}} }}
</style>
</head>
<body>
<div class="hero">
  <div class="tag">{topic_emoji} {topic_title} · 微信文章整理</div>
  <h1>{title}</h1>
</div>
<div class="wrap">
<div class="meta">{meta}</div>
<div class="card">
{body}
</div>
<div class="footer">微信文章整理稿 · 生成于 {gen_date} · 权威源：F:\\金融知识库\\公众号文章</div>
</div>
<a class="fab-back" href="{fab}">📚 目录</a>
<script>
(function(){{
  function expandHash(){{
    var h = location.hash.slice(1);
    if(!h) return;
    var ds = document.querySelectorAll('details.sec');
    for(var i=0;i<ds.length;i++){{
      if(ds[i].id===h || ds[i].querySelector('summary#'+h) || ds[i].querySelector('#'+h)) ds[i].open=true;
    }}
    var el = document.getElementById(h);
    if(el) setTimeout(function(){{ el.scrollIntoView({{behavior:'smooth', block:'start'}}); }}, 60);
  }}
  window.addEventListener('hashchange', expandHash);
  if(location.hash) expandHash();
}})();
</script>
</body>
</html>"""

INJECT_CSS = """
details.sec { margin-top:6px; }
summary.sec-h { cursor:pointer; list-style:none; }
summary.sec-h::-webkit-details-marker { display:none; }
details.sec > summary.sec-h .arr { float:right; font-size:12px; color:#9aa4b8; font-weight:normal; padding-top:8px; }
details.sec[open] > summary.sec-h .arr::after { content:"收起 ▲"; }
details.sec:not([open]) > summary.sec-h .arr::after { content:"展开 ▼"; }
.fab-back { position:fixed; bottom:24px; right:16px; z-index:99; background:#0d2b52; color:#fff;
  text-decoration:none; border-radius:999px; padding:11px 18px; font-size:14px; font-weight:600;
  box-shadow:0 4px 16px rgba(13,43,82,.40); display:flex; align-items:center; gap:6px; }
.fab-back:active { transform:scale(.94); }
"""

INJECT_JS = """
<script>
(function(){
  function expandHash(){
    var h = location.hash.slice(1);
    if(!h) return;
    var ds = document.querySelectorAll('details.sec');
    for(var i=0;i<ds.length;i++){
      if(ds[i].id===h || ds[i].querySelector('summary#'+h) || ds[i].querySelector('#'+h)) ds[i].open=true;
    }
    var el = document.getElementById(h);
    if(el) setTimeout(function(){ el.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);
  }
  window.addEventListener('hashchange', expandHash);
  if(location.hash) expandHash();
})();
</script>
"""

# ============ 工具函数 ============
def fold_h2(html):
    """把 body 里的 h2 分段包进 <details class='sec'>，返回(新html, 折叠数)"""
    matches = list(re.finditer(r'(<h2\b[^>]*>)(.*?)(</h2>)', html, re.S))
    if not matches:
        return html, 0
    # 终止标记：footer 或 </body>
    foot = html.find('<div class="footer"')
    out = [html[:matches[0].start()]]
    for i, m in enumerate(matches):
        attrs, inner = m.group(1), m.group(2)
        seg_end = matches[i+1].start() if i+1 < len(matches) else (foot if foot != -1 else len(html))
        idm = re.search(r'id="([^"]+)"', attrs)
        sid = ' id="%s"' % idm.group(1) if idm else ''
        body = html[m.end():seg_end]
        out.append('<details class="sec"%s><summary class="sec-h"><span class="sec-t">%s</span><span class="arr"></span></summary>' % (sid, inner))
        out.append(body)
        out.append('</details>')
    if foot != -1:
        out.append(html[foot:])
    else:
        out.append(html[matches[-1].end():])
    return ''.join(out), len(matches)


def add_h2_selector(html):
    """让原 CSS 的 h2 规则同时作用于 summary.sec-h"""
    return re.sub(r'h2\s*\{', 'h2, summary.sec-h {', html.replace('h2{', 'h2, summary.sec-h{'))


def inject_page(html, fab_href, hero_label=None):
    """对已有完整 HTML 注入：h2选择器扩展 + 折叠 + fab + JS"""
    html = add_h2_selector(html)
    folded = 0
    if '<details class="sec"' not in html:
        html, folded = fold_h2(html)
    if 'fab-back' not in html:
        html = html.replace('</style>', INJECT_CSS + '</style>', 1)
        html = html.replace('</body>', '<a class="fab-back" href="%s">📚 目录</a>%s</body>' % (fab_href, INJECT_JS), 1)
    return html, folded


def parse_md(path):
    """返回 (title, meta_html, body_html)；支持 YAML frontmatter 和纯文本两种格式"""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    title, meta_html = None, ''
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            yml = text[3:end].strip()
            text = text[end+3:].strip()
            rows = []
            for line in yml.splitlines():
                if ':' in line:
                    k, v = line.split(':', 1)
                    k, v = k.strip(), v.strip().strip('"\'')
                    if k in ('title',) and v:
                        title = v
                    elif v and k not in ('tags', 'keywords', 'categories'):
                        rows.append('<b>%s</b>：%s' % (k, v))
            meta_html = '<br>'.join(rows)
    if title is None:
        m = re.match(r'#\s*(.+)', text.strip())
        if m:
            title = m.group(1).strip()
    body_html = markdown.markdown(text, extensions=["tables", "fenced_code"])
    return title, meta_html, body_html


def fname_date(name):
    m = re.match(r'(\d{4}-\d{2}-\d{2})', name)
    return m.group(1) if m else ''


# ============ 主流程 ============
report = []

for meta in TOPIC_META:
    tdir = meta["dir"]
    tpath = os.path.join(TOPICS, tdir)
    wxlist = []

    # ---- 1) 微信文章转换 ----
    for fn in WX_MAP.get(tdir, []):
        src = os.path.join(KB, fn)
        if not os.path.exists(src):
            report.append("SKIP(缺文件) %s" % fn)
            continue
        title, meta_html, body_html = parse_md(src)
        date = fname_date(fn)
        if meta_html:
            meta_html += '<br><b>日期</b>：%s' % date
        else:
            meta_html = '<b>日期</b>：%s' % date
        key = re.sub(r'[^0-9A-Za-z\u4e00-\u9fff]+', '_', os.path.splitext(fn)[0])[:60]
        out_name = date + '_' + key + '.html'
        out_dir = os.path.join(tpath, 'wx')
        os.makedirs(out_dir, exist_ok=True)
        html = WX_TPL.format(title=title or fn, topic_emoji=meta["emoji"], topic_title=meta["title"],
                             meta=meta_html, body=body_html, gen_date=GEN_DATE, fab='../../index.html')
        html, folded = inject_page(html, '../../index.html')
        with open(os.path.join(out_dir, out_name), 'w', encoding='utf-8') as f:
            f.write(html)
        wxlist.append({"t": title or fn, "u": "%s/wx/%s" % (tdir, out_name), "d": date})
        report.append("WX %s/%s  折叠%d段" % (tdir, out_name, folded))

    # ---- 2) 专题主页面（F盘拷贝副本 / 演讲生成页）注入折叠 + fab ----
    idx = os.path.join(tpath, 'index.html')
    if os.path.exists(idx):
        with open(idx, encoding='utf-8') as f:
            html = f.read()
        if 'fab-back' not in html:
            html, folded = inject_page(html, '../index.html')
            with open(idx, 'w', encoding='utf-8') as f:
                f.write(html)
            report.append("INJECT %s/index.html  折叠%d段" % (tdir, folded))
        else:
            report.append("SKIP(已注入) %s/index.html" % tdir)

    # ---- 3) 演讲子册页也注入 ----
    if tdir == 'yanjiang':
        for fn in os.listdir(tpath):
            if fn.endswith('.html') and fn != 'index.html':
                p = os.path.join(tpath, fn)
                with open(p, encoding='utf-8') as f:
                    html = f.read()
                if 'fab-back' not in html:
                    html, folded = inject_page(html, '../index.html')
                    with open(p, 'w', encoding='utf-8') as f:
                        f.write(html)
                    report.append("INJECT yanjiang/%s 折叠%d段" % (fn, folded))

    meta["wx"] = wxlist

# ---- 4) 重建 topics.json ----
data = {"updated": GEN_DATE, "topics": [
    {"title": m["title"], "emoji": m["emoji"], "desc": m["desc"],
     "url": "%s/index.html" % m["dir"], "date": m["date"], "wx": m["wx"]}
    for m in TOPIC_META]}
with open(os.path.join(TOPICS, 'topics.json'), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
report.append("topics.json 重建：wx 共 %d 篇" % sum(len(m["wx"]) for m in TOPIC_META))

print('\n'.join(report))
