import json, glob, statistics as st, sys
sys.stdout.reconfigure(encoding="utf-8")

def load(p): return json.load(open(p, "r", encoding="utf-8"))
def num(a, k): return a.get(k, {}).get("numericValue", None)

def extract(d):
    a = d.get("audits", {})
    perf = d.get("categories", {}).get("performance", {})
    diag_items = a.get("diagnostics", {}).get("details", {}).get("items", [{}])
    return {
        "score": round((perf.get("score") or 0) * 100),
        "fcp": num(a, "first-contentful-paint"),
        "lcp": num(a, "largest-contentful-paint"),
        "tbt": num(a, "total-blocking-time"),
        "cls": num(a, "cumulative-layout-shift"),
        "si":  num(a, "speed-index"),
        "tti": num(a, "interactive"),
        "svr": num(a, "server-response-time"),
        "bytes": num(a, "total-byte-weight"),
        "dom": num(a, "dom-size"),
        "boot": num(a, "bootup-time"),
        "mtwork": num(a, "mainthread-work-breakdown"),
        "lcp_element": a.get("largest-contentful-paint-element", {}).get("details", {}).get("items", []),
        "prio_lcp":    a.get("prioritize-lcp-image", {}).get("details", {}).get("items", []),
        "requests":    a.get("network-requests", {}).get("details", {}).get("items", []),
        "unused_js":   a.get("unused-javascript", {}).get("details", {}).get("items", []),
        "unused_css":  a.get("unused-css-rules", {}).get("details", {}).get("items", []),
        "modern_img":  a.get("modern-image-formats", {}).get("details", {}).get("items", []),
        "resp_imgs":   a.get("uses-responsive-images", {}).get("details", {}).get("items", []),
        "render_blocking": a.get("render-blocking-resources", {}).get("details", {}).get("items", []),
        "diagnostics": diag_items[0] if diag_items else {},
        "fonts_disp":  a.get("font-display", {}).get("details", {}).get("items", []),
    }

runs = {"custom": [], "vercel": []}
for label in ("custom", "vercel"):
    for f in sorted(glob.glob(rf"C:\tmp\lh\lh_{label}_*.json")):
        runs[label].append(extract(load(f)))

def med(rs, k):
    vals = [r[k] for r in rs if isinstance(r[k], (int, float))]
    return st.median(vals) if vals else None

print("=== Phase 1: median mobile Lighthouse (3 runs per domain) ===")
header = f"{'domain':>8} {'score':>5}  {'FCP':>7}  {'LCP':>7}  {'TBT':>7}  {'CLS':>5}  {'SI':>7}  {'TTI':>7}  {'svrRT':>7}  {'bytes':>8}  {'DOM':>4}"
print(header)
for label in ("custom", "vercel"):
    rs = runs[label]
    m = lambda k: med(rs, k)
    def cell(v, kind="ms"):
        if v is None: return "n/a"
        if kind == "cls": return f"{v:.3f}"
        if kind == "kb":  return f"{v/1024:.0f}"
        if kind == "raw": return f"{v:.0f}"
        return f"{v:.0f}ms"
    print(f"{label:>8} {cell(m('score'),'raw'):>5}  {cell(m('fcp')):>7}  {cell(m('lcp')):>7}  {cell(m('tbt')):>7}  {cell(m('cls'),'cls'):>5}  {cell(m('si')):>7}  {cell(m('tti')):>7}  {cell(m('svr')):>7}  {cell(m('bytes'),'kb'):>6}KB  {cell(m('dom'),'raw'):>4}")

print()
print("=== Per-run scatter (verifies variance across cold-cache runs) ===")
for label in ("custom", "vercel"):
    for i, r in enumerate(runs[label], 1):
        print(f"  {label} run{i}: score={r['score']:>3} FCP={r['fcp']:>5.0f} LCP={r['lcp']:>5.0f} TBT={r['tbt']:>5.0f} bytes={(r['bytes'] or 0)/1024:>5.0f}KB")

r0 = runs["custom"][0]
print()
print("=== Phase 1b: LCP element (custom run 1) ===")
if r0["lcp_element"]:
    node = r0["lcp_element"][0].get("node", {}) if isinstance(r0["lcp_element"][0], dict) else {}
    print(f"  nodeLabel : {node.get('nodeLabel', '?')}")
    print(f"  selector  : {node.get('selector', '?')}")
    snip = node.get("snippet", "?")
    print(f"  snippet   : {snip[:220]}")

print()
print("--- LCP prioritization audit items ---")
if r0["prio_lcp"]:
    it = r0["prio_lcp"][0]
    print(f"  candidate URL : {it.get('url', '?')}")
    for k in ("ttfb", "loadStart", "loadEnd", "wastedMs"):
        if k in it: print(f"  {k:>14}: {it[k]:>6.0f} ms")
else:
    print("  (audit found no image-based LCP wins to optimize further)")

# Phase 2
print()
print("=== Phase 2: request errors (custom run 1) ===")
codes = {}
image_reqs = []
for req in r0["requests"]:
    s = req.get("statusCode")
    codes[s] = codes.get(s, 0) + 1
    if (req.get("mimeType") or "").startswith("image/"):
        image_reqs.append(req)
print(f"  Status distribution: {codes}")
print(f"  402 count : {codes.get(402, 0)}")
print(f"  404 count : {codes.get(404, 0)}")
print(f"  5xx count : {sum(v for k, v in codes.items() if isinstance(k, int) and 500 <= k < 600)}")

# Phase 3
print()
print(f"=== Phase 3: image audit — {len(image_reqs)} image requests in initial load ===")
img_bytes = sum((r.get("transferSize") or 0) for r in image_reqs)
print(f"  Total image transfer: {img_bytes/1024:.0f} KB")
print()
print("  Top image requests (by transfer size):")
for r in sorted(image_reqs, key=lambda x: -((x.get("transferSize") or 0)))[:12]:
    sz = (r.get("transferSize") or 0)/1024
    stt = r.get("networkRequestTime", 0)
    ent = r.get("networkEndTime", 0)
    url = r.get("url", "")
    if len(url) > 100: url = "…" + url[-97:]
    print(f"    {sz:>6.1f} KB  status={r.get('statusCode')}  start={stt:>5.0f}ms  dur={ent-stt:>5.0f}ms")
    print(f"                        {url}")

print()
print("=== Modern-image-formats audit (Lighthouse) ===")
if not r0["modern_img"]:
    print("  (all images already in modern format)")
else:
    for it in r0["modern_img"][:6]:
        w = (it.get("wastedBytes") or 0)/1024
        u = it.get("url", "?")
        if len(u) > 100: u = "…" + u[-97:]
        print(f"    wasted {w:>5.0f} KB   {u}")

print()
print("=== Responsive-images audit ===")
if not r0["resp_imgs"]:
    print("  (no images oversized for viewport)")
else:
    for it in r0["resp_imgs"][:6]:
        w = (it.get("wastedBytes") or 0)/1024
        u = it.get("url", "?")
        if len(u) > 100: u = "…" + u[-97:]
        print(f"    wasted {w:>5.0f} KB   {u}")

# Phase 4
print()
print("=== Phase 4: render + JS + fonts ===")
print(f"  DOM size    : {r0['dom'] or 'n/a'} nodes")
print(f"  Main-thread : {(r0['mtwork'] or 0):.0f} ms")
print(f"  JS boot-up  : {(r0['boot'] or 0):.0f} ms")
print()
print("  Render-blocking resources:")
if not r0["render_blocking"]:
    print("    (none)")
for it in r0["render_blocking"][:4]:
    print(f"    {(it.get('totalBytes', 0))/1024:>5.0f} KB   {it.get('url', '?')[:110]}")
print()
print("  Unused JS (top 3):")
for it in sorted(r0["unused_js"], key=lambda x: -(x.get("wastedBytes", 0) or 0))[:3]:
    w = (it.get("wastedBytes", 0) or 0)/1024
    t = (it.get("totalBytes", 0) or 0)/1024
    u = it.get("url", "?")
    if len(u) > 100: u = "…" + u[-97:]
    print(f"    wasted={w:>5.0f}KB total={t:>5.0f}KB   {u}")
print()
print("  Font-display audit:")
if not r0["fonts_disp"]:
    print("    (all fonts use font-display swap/optional)")

print()
print("=== Diagnostics ===")
d = r0["diagnostics"]
for k in ("numRequests", "totalByteWeight", "totalTaskTime", "mainDocumentTransferSize",
         "numScripts", "numStylesheets", "numFonts", "numTasks", "rtt", "throughput",
         "maxRtt", "maxServerLatency"):
    if k in d:
        v = d[k]
        if k in ("totalByteWeight", "mainDocumentTransferSize"): v = f"{v/1024:.0f} KB"
        if k == "throughput":                                     v = f"{v/1024/1024:.2f} MB/s"
        print(f"  {k:>26} : {v}")
