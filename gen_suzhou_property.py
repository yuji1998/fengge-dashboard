#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_suzhou_property.py — 由「苏州楼市周报台账.md」再生 suzhou_property.js

用途：家庭导航首页「苏州楼市」看板的「↻ 刷新」按钮，会触发家里电脑本地服务(:8707)
      调用本脚本，从台账（任务 1cb59925 维护的数据源）重建 suzhou_property.js 并推送。

逻辑：
  - 解析台账表格 -> 重建 window.SUZHOU_PROPERTY.weekly（周报住宅口径）
  - 保留现有 suzhou_property.js 中的 daily / dailyHistory（公众号单日播报，台账不含）
  - --push：生成后 git add/commit/push 到 GitHub Pages（家里电脑有 GitHub 访问权时）

用法：
  python gen_suzhou_property.py --ledger "D:/WorkBuddy/楼市跟踪/苏州楼市周报台账.md" --out suzhou_property.js
  python gen_suzhou_property.py --push        # 用默认路径并推送
"""
import argparse, re, json, subprocess, os, datetime

DEFAULT_LEDGER = r"D:/WorkBuddy/楼市跟踪/苏州楼市周报台账.md"
DEFAULT_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "suzhou_property.js")


def parse_num(s):
    s = (s or "").strip().replace("%", "").replace(",", "").replace("+", "")
    if s in ("", "—", "-", "None", "null"):
        return None
    try:
        return float(s)
    except Exception:
        return None


def parse_ledger(path):
    if not os.path.exists(path):
        raise FileNotFoundError("台账不存在: " + path)
    rows, header = [], None
    with open(path, encoding="utf-8") as f:
        for ln in f:
            ln = ln.rstrip("\n")
            if ln.strip().startswith("|") and "统计周" in ln:
                header = [c.strip() for c in ln.strip().strip("|").split("|")]
                continue
            if header and ln.strip().startswith("|") and set(ln.strip()) != set("|-"):
                cells = [c.strip() for c in ln.strip().strip("|").split("|")]
                if len(cells) < len(header):
                    continue
                rec = dict(zip(header, cells))
                week = rec.get("统计周", "")
                if not week or "周" not in week:
                    continue
                rows.append({
                    "week": week,
                    "new_home": parse_num(rec.get("苏州新房(套)")),
                    "new_qoq": parse_num(rec.get("新房环比")),
                    "new_yoy": parse_num(rec.get("新房同比")),
                    "new_avg": parse_num(rec.get("新房日均")),
                    "new_area": parse_num(rec.get("新房面积(万㎡)")),
                    "second_hand": parse_num(rec.get("苏州二手(套)")),
                    "second_qoq": parse_num(rec.get("二手环比")),
                    "second_yoy": parse_num(rec.get("二手同比")),
                    "second_avg": parse_num(rec.get("二手日均")),
                    "second_area": parse_num(rec.get("二手面积(万㎡)")),
                    "source": rec.get("数据源", "网易楼市周报"),
                })
    return rows


def load_existing_js(path):
    """兜底：尝试从现有 suzhou_property.js 回读 daily（JS 字面量非严格 JSON，尽量解析）。"""
    if not os.path.exists(path):
        return {"daily": None, "dailyHistory": []}
    txt = open(path, encoding="utf-8").read()
    try:
        # 用 node 加载（最稳妥，能解析 JS 对象字面量）
        import subprocess as _sp
        code = "global.window={};require(%r);process.stdout.write(JSON.stringify({daily:window.SUZHOU_PROPERTY.daily,dailyHistory:window.SUZHOU_PROPERTY.dailyHistory}));" % path.replace("\\", "/")
        r = _sp.run(["node", "-e", code], capture_output=True, text=True, timeout=15)
        if r.returncode == 0 and r.stdout.strip():
            return json.loads(r.stdout)
    except Exception:
        pass
    return {"daily": None, "dailyHistory": []}


def load_daily_sidecar(daily_json):
    """优先从合法 JSON 边车读取单日播报（daily/dailyHistory 不进台账）。"""
    if daily_json and os.path.exists(daily_json):
        try:
            o = json.load(open(daily_json, encoding="utf-8"))
            return {"daily": o.get("daily"), "dailyHistory": o.get("dailyHistory", [])}
        except Exception:
            pass
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ledger", default=DEFAULT_LEDGER, help="苏州楼市周报台账.md 路径")
    ap.add_argument("--out", default=DEFAULT_OUT, help="输出的 suzhou_property.js 路径")
    ap.add_argument("--daily-json", default=os.path.join(os.path.dirname(DEFAULT_OUT), "suzhou_daily.json"),
                    help="单日播报边车 JSON（daily/dailyHistory，不进台账）")
    ap.add_argument("--push", action="store_true", help="生成后 git add/commit/push 到 GitHub Pages")
    args = ap.parse_args()

    try:
        weekly = parse_ledger(args.ledger)
    except FileNotFoundError as e:
        print("ERROR:", e)
        weekly = []

    if not weekly:
        print("WARN: 台账无有效周数据，weekly 将为空")

    # 单日播报：优先边车 JSON；兜底回读现有 JS
    sidecar = load_daily_sidecar(args.daily_json)
    existing = sidecar if sidecar else load_existing_js(args.out)
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    obj = {
        "updated_at": now,
        "note": "weekly=网易楼市周报(住宅/全市口径，含环比同比)；daily=苏州楼市公众号单日播报。两套口径不同，去化周期基于单日新房估算，仅供参考。",
        "daily": existing["daily"],
        "dailyHistory": existing["dailyHistory"],
        "weekly": weekly,
    }
    out = "/* 苏州房产成交跟踪数据 —— 家庭看板读取源\n"
    out += " * 自动再生：gen_suzhou_property.py 读「苏州楼市周报台账.md」重建 weekly[]\n"
    out += " * 口径：weekly 为周报住宅口径(全市六区)；daily 为公众号单日播报。两者口径不同，勿混算。\n */\n"
    out += "window.SUZHOU_PROPERTY = " + json.dumps(obj, ensure_ascii=False, indent=2) + ";\n"
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(out)
    print("OK 已生成 %s (%d 周, updated_at=%s)" % (args.out, len(weekly), now))

    if args.push:
        repo = os.path.dirname(os.path.abspath(args.out))
        subprocess.run(["git", "-C", repo, "add", "suzhou_property.js", "suzhou_property.html"], check=False)
        subprocess.run(["git", "-C", repo, "commit", "-m", "chore: 刷新苏州楼市看板数据"], check=False)
        r = subprocess.run(["git", "-C", repo, "push", "origin", "main"], capture_output=True, text=True)
        print("PUSH rc=%s out=%s err=%s" % (r.returncode, r.stdout[-300:], r.stderr[-300:]))


if __name__ == "__main__":
    main()
