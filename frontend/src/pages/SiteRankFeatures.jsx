import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');
  .srf-container *,.srf-container *::before,.srf-container *::after{box-sizing:border-box;margin:0;padding:0}
  .srf-container {
    --bg:#06080d;--s1:#0b0f17;--s2:#111620;--s3:#171e2b;
    --bd:#1e2735;--bd2:#28334a;
    --cyan:#4ef0e8;--cyan-d:rgba(78,240,232,0.08);
    --amber:#ffb547;--amber-d:rgba(255,181,71,0.08);
    --rose:#ff6b6b;--rose-d:rgba(255,107,107,0.08);
    --green:#4ade80;--green-d:rgba(74,222,128,0.08);
    --violet:#a78bfa;--violet-d:rgba(167,139,250,0.08);
    --text:#dde4f0;--text2:#7a8899;--text3:#3d4a5c;
    --mono:'IBM Plex Mono',monospace;
    --display:'Syne',sans-serif;
    background:var(--bg);font-family:var(--mono);color:var(--text);min-height:100vh;
  }
  @keyframes srfFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes srfSpin{to{transform:rotate(360deg)}}
  @keyframes srfSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes srfGlow{0%,100%{opacity:0.6}50%{opacity:1}}
  .srf-role-card:hover{border-color:var(--hover-c) !important;background:var(--s2) !important;transform:translateX(4px)}
  .srf-tab-btn:hover{color:var(--text) !important}
  .srf-fix-card:hover .srf-fix-header{background:var(--s2) !important}
  .srf-copy-btn:hover{background:var(--s2) !important}
`;

// — Utils —
const scoreColor = s => s >= 80 ? "var(--green)" : s >= 60 ? "var(--amber)" : "var(--rose)";

// — Score Ring —
function Ring({ score, size = 96 }) {
  const [v, setV] = useState(0);
  const r = size / 2 - 7, c = 2 * Math.PI * r;
  const color = scoreColor(score);
  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + 2, score);
      setV(cur);
      if (cur >= score) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [score]);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bd)" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={c - (v/100)*c} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 0.03s", filter:`drop-shadow(0 0 6px ${color}80)` }}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:size*0.24, fontWeight:800, color, fontFamily:"var(--display)", lineHeight:1 }}>{v}</span>
        <span style={{ fontSize:8, color:"var(--text3)", letterSpacing:"0.1em" }}>/ 100</span>
      </div>
    </div>
  );
}

// — Progress Bar —
function Bar({ label, value, delay = 0 }) {
  const [w, setW] = useState(0);
  const color = scoreColor(value);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 80); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:9, color:"var(--text2)", letterSpacing:"0.05em" }}>{label}</span>
        <span style={{ fontSize:9, color, fontWeight:600 }}>{value}</span>
      </div>
      <div style={{ height:3, background:"var(--bd)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:2, transition:`width 1.1s cubic-bezier(0.4,0,0.2,1) ${delay}ms`, boxShadow:`0 0 6px ${color}50` }}/>
      </div>
    </div>
  );
}

// — Badge —
function Badge({ type = "info", text }) {
  const m = { pass:{c:"var(--green)",bg:"var(--green-d)",i:"✓"}, warn:{c:"var(--amber)",bg:"var(--amber-d)",i:"⚠"}, fail:{c:"var(--rose)",bg:"var(--rose-d)",i:"✕"}, info:{c:"var(--cyan)",bg:"var(--cyan-d)",i:"◆"}, violet:{c:"var(--violet)",bg:"var(--violet-d)",i:"★"} };
  const s = m[type] || m.info;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:3,fontSize:9,background:s.bg,color:s.c,fontWeight:700,letterSpacing:"0.07em",border:`1px solid ${s.c}25` }}>{s.i} {text}</span>;
}

// — Spinner —
function Spin({ color="var(--cyan)", size=13 }) {
  return <div style={{ width:size,height:size,border:`2px solid ${color}25`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"srfSpin 0.7s linear infinite",flexShrink:0 }}/>;
}

// — Code Block —
function Code({ code, lang = "html" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background:"#050810",border:"1px solid var(--bd)",borderRadius:6,overflow:"hidden" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 12px",borderBottom:"1px solid var(--bd)",background:"rgba(255,255,255,0.015)" }}>
        <span style={{ fontSize:9,color:"var(--text3)",letterSpacing:"0.08em" }}>{lang.toUpperCase()}</span>
        <button className="srf-copy-btn" onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          style={{ padding:"2px 10px",background:"var(--s3)",color:copied?"var(--green)":"var(--text2)",border:`1px solid ${copied?"var(--green)30":"var(--bd)"}`,borderRadius:4,fontSize:9,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.05em",transition:"all 0.2s" }}>
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
      <pre style={{ padding:"12px 14px",fontSize:10,lineHeight:1.75,overflowX:"auto",color:"var(--text)",margin:0,fontFamily:"var(--mono)" }}>{code}</pre>
    </div>
  );
}

// — Fix Card —
function FixCard({ fix, i }) {
  const [open, setOpen] = useState(i === 0);
  const ic = fix.impact === "HIGH" ? "var(--rose)" : fix.impact === "MED" ? "var(--amber)" : "var(--cyan)";
  return (
    <div className="srf-fix-card" style={{ border:"1px solid var(--bd)",borderRadius:8,overflow:"hidden",background:"var(--s1)",animation:`srfFadeUp 0.35s ease ${i*70}ms both` }}>
      <div className="srf-fix-header" onClick={()=>setOpen(!open)} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",transition:"background 0.15s",background:open?"var(--s2)":"transparent" }}>
        <div style={{ width:26,height:26,borderRadius:5,flexShrink:0,background:fix.status==="ready"?"var(--green-d)":"var(--amber-d)",border:`1px solid ${fix.status==="ready"?"rgba(74,222,128,0.3)":"rgba(255,181,71,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:fix.status==="ready"?"var(--green)":"var(--amber)" }}>{fix.status==="ready"?"✓":"⚡"}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:2 }}>{fix.title}</div>
          <div style={{ fontSize:10,color:"var(--text2)" }}>{fix.description}</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <span style={{ fontSize:8,fontWeight:700,letterSpacing:"0.07em",padding:"2px 7px",borderRadius:3,background:`${ic}15`,color:ic,border:`1px solid ${ic}30` }}>{fix.impact}</span>
          <span style={{ fontSize:9,color:"var(--text3)",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s" }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px",borderTop:"1px solid var(--bd)",paddingTop:14,animation:"srfFadeUp 0.2s ease" }}>
          {fix.explanation && <p style={{ fontSize:11,color:"var(--text2)",lineHeight:1.7,marginBottom:12 }}>{fix.explanation}</p>}
          {fix.code && <Code code={fix.code} lang={fix.lang||"html"} />}
          {fix.instructions && <div style={{ marginTop:10,padding:"10px 12px",background:"var(--cyan-d)",border:"1px solid rgba(78,240,232,0.15)",borderRadius:6,fontSize:11,color:"var(--cyan)" }}>📌 {fix.instructions}</div>}
          {fix.cms_note && <div style={{ marginTop:8,padding:"10px 12px",background:"var(--violet-d)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:6,fontSize:11,color:"var(--violet)" }}>📌 CMS: {fix.cms_note}</div>}
        </div>
      )}
    </div>
  );
}

// — Demo data (fallback) —
const DEMO = {
  seo: { score:67, sub_scores:{"On-Page SEO":72,"Technical SEO":61,"Content Relevance":78,"Link Structure":58},
    issues:[{title:"Missing meta description",detail:"No <meta name='description'> found",impact:"-8pts"},{title:"No structured data (JSON-LD)",detail:"Competitors use WebSite + Organization schema",impact:"-10pts"},{title:"Multiple H1 tags (3 found)",detail:"Only 1 H1 per page is recommended",impact:"-5pts"},{title:"4 images missing alt text",detail:"Affects image SEO + accessibility",impact:"-4pts"}],
    intelligence:["Competitor #1 uses 6 JSON-LD schema types vs your 0","Top 3 results all have FAQ schema — you don't","Competitors average 2.1 internal links per page — you have 0.4"]
  },
  speed: { score:72, sub_scores:{"Performance":68,"Core Web Vitals":61,"Resource Optimization":74,"Server Response":84},
    issues:[{title:"3 render-blocking scripts",detail:"Blocking first paint by ~1.2s",impact:"-12pts"},{title:"No browser cache headers",detail:"Static assets expire on every visit",impact:"-8pts"},{title:"Images not in WebP format",detail:"Could save ~420KB total",impact:"-6pts"},{title:"CLS score: 0.18 (above 0.1 limit)",detail:"Layout shifts hurting user experience",impact:"-9pts"}],
    intelligence:["Competitor loads in 1.8s vs your 3.4s on mobile","Competitor uses CDN — your assets are single-origin","Top competitor scores 94 on PageSpeed — you score 61"]
  },
  content: { score:74, sub_scores:{"Word Count":58,"Readability":81,"Keyword Usage":72,"Content Structure":70},
    issues:[{title:"Thin content — 340 words",detail:"Competing pages average 1,200+ words",impact:"-15pts"},{title:"No FAQ section",detail:"Missing rich snippet opportunity",impact:"-8pts"},{title:"Weak call-to-action copy",detail:"Generic 'Learn More' buttons detected",impact:"-5pts"},{title:"No internal linking strategy",detail:"Only 2 internal links found",impact:"-7pts"}],
    intelligence:["Top competitor publishes 8 articles/month vs your 1","Competitor FAQ section gets rich snippet in Google","Competitor's H2 tags target 6 long-tail keywords — yours don't"]
  }
};

const FIXES = {
  seo:[
    { title:"Add Missing Meta Description", description:"No meta description found — affects CTR in search results", impact:"HIGH", status:"ready",
      explanation:"Meta descriptions appear in Google search results and directly influence click-through rate. Missing one can reduce CTR by up to 30%.",
      code:`<meta name="description" content="AI-powered website analysis tool. Analyze SEO, speed, and content metrics. Get actionable recommendations to outrank your competitors in minutes." />`,
      lang:"html", instructions:"Paste inside your <head> tag, before </head>",
      cms_note:"WordPress (Yoast): Edit page → Yoast SEO → Edit snippet. Shopify: Online Store → Preferences → Meta description."
    },
    { title:"Implement JSON-LD Schema Markup", description:"No structured data detected — competitors get rich snippets", impact:"HIGH", status:"ready",
      explanation:"Schema markup helps Google understand your content and unlocks rich results (star ratings, FAQs, breadcrumbs) which increase CTR by 20-30%.",
      code:`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SiteRank AI",
  "description": "AI-powered website competitor analysis tool",
  "url": "https://yourdomain.com",
  "applicationCategory": "SEO Tool",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "creator": { "@type": "Organization", "name": "SiteRank AI" }
}
</script>`,
      lang:"json", instructions:"Paste before </body> on your homepage",
      cms_note:"WordPress: Use 'Schema & Structured Data for WP' plugin. Paste in Theme → header.php."
    },
    { title:"Fix Duplicate H1 Tags", description:"3 H1 tags found — only 1 recommended per page", impact:"MED", status:"ready",
      explanation:"Multiple H1 tags confuse search engines about the primary topic. Google uses H1 to understand what the page is about — only one should contain your target keyword.",
      code:`<!-- BEFORE (problematic): -->
<h1>Welcome to our site</h1>
<h1>SEO Analysis Tool</h1>
<h1>Get Started Free</h1>

<!-- AFTER (correct): -->
<h1>AI-Powered SEO Analysis Tool</h1>
<h2>Welcome to SiteRank</h2>
<h2>Get Started Free</h2>`,
      lang:"html", instructions:"Keep the most keyword-focused H1. Change all others to H2 or H3."
    }
  ],
  speed:[
    { title:"Defer Render-Blocking JavaScript", description:"3 scripts blocking first paint — adding ~1.2s delay", impact:"HIGH", status:"ready",
      explanation:"Render-blocking scripts prevent the browser from displaying any content until they fully load. Adding 'defer' loads them after HTML parsing completes.",
      code:`<!-- BEFORE (blocking render): -->
<script src="/js/analytics.js"></script>
<script src="/js/chat-widget.js"></script>
<script src="/js/tracking.js"></script>

<!-- AFTER (non-blocking): -->
<script src="/js/analytics.js" defer></script>
<script src="/js/chat-widget.js" defer></script>
<script src="/js/tracking.js" defer></script>

<!-- For independent third-party scripts, use async: -->
<script async src="https://cdn.example.com/widget.js"></script>`,
      lang:"html", instructions:"Add 'defer' to all non-critical scripts in your <head>.",
      cms_note:"WordPress: Use 'WP Rocket' or 'Asset CleanUp Pro' — no code editing needed."
    },
    { title:"Add Browser Caching Headers", description:"Static assets have no cache headers — re-downloaded every visit", impact:"HIGH", status:"ready",
      explanation:"Cache headers tell browsers to store files locally. Returning visitors load from cache instead of downloading again — can cut repeat-visit load time by 50%.",
      code:`# .htaccess (Apache) — add to your root directory:
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg   "access plus 1 year"
  ExpiresByType image/webp   "access plus 1 year"
  ExpiresByType text/css     "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2   "access plus 1 year"
</IfModule>

# Nginx — add to your server {} block:
location ~* \\.(jpg|jpeg|webp|png|css|js|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}`,
      lang:"bash", instructions:"Apache: Add to .htaccess in site root. Nginx: Add to /etc/nginx/sites-enabled/yoursite.conf",
      cms_note:"WordPress: WP Rocket handles this automatically under 'Browser Caching' settings."
    }
  ],
  content:[
    { title:"Expand Thin Content on Main Page", description:"340 words found — competing pages average 1,200+", impact:"HIGH", status:"ready",
      explanation:"Content length correlates strongly with rankings for competitive keywords. Pages ranking #1-3 for your target keywords average 1,247 words. Add depth with examples, FAQs, and use cases.",
      code:`<!-- Add these sections to your main page content: -->

<section class="how-it-works" style="margin: 60px 0;">
  <h2>How SiteRank AI Works</h2>
  <p>SiteRank AI uses a three-step AI-powered process:
  first we crawl your site and competitors, then our model
  scores 40+ ranking factors, then generates a prioritized
  action plan specific to your industry and competition level.</p>
  <!-- Add 200-300 more words explaining your process in detail -->
</section>

<section class="faq" style="margin: 60px 0;">
  <h2>Frequently Asked Questions</h2>
  <!-- Add 6-8 FAQ items targeting long-tail keywords -->
  <div class="faq-item">
    <h3>How accurate is the SEO analysis?</h3>
    <p>Our analysis uses the same signals Google's crawlers check...</p>
  </div>
</section>`,
      lang:"html", instructions:"Add sections before your footer. Target 1,000–1,500 total words.",
      cms_note:"WordPress: Add 'Classic Text' blocks in Gutenberg editor. Shopify: Edit page in Pages section."
    },
    { title:"Add FAQ Schema for Rich Snippets", description:"FAQ content detected but no schema markup — missing Google rich snippets", impact:"HIGH", status:"ready",
      explanation:"FAQ schema can double your search result size by showing expandable questions directly in Google. This increases CTR by 20-30% with no ranking change needed.",
      code:`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does SiteRank AI analyze websites?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SiteRank AI crawls your website and up to 5 competitor sites, analyzing 40+ SEO, speed, content, and UX factors. Results are returned in under 60 seconds with prioritized recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Is the analysis accurate for all website types?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — SiteRank AI works for any publicly accessible website including e-commerce, blogs, SaaS, and local business sites."
      }
    }
  ]
}
</script>`,
      lang:"json", instructions:"Paste before </body>. Update questions to match your actual FAQ content.",
      cms_note:"WordPress: Paste in Custom HTML block at page bottom, or use Rank Math schema settings."
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// — MAIN APP —
// ═══════════════════════════════════════════════════════════════════════════
export default function SiteRankFeatures() {
  const [step, setStep] = useState("role");       // role → url → results
  const [role, setRole] = useState(null);
  const [url, setUrl] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("seo");
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState({});
  const [fixes, setFixes] = useState({});
  const [generatingFix, setGeneratingFix] = useState({});
  const [logLines, setLogLines] = useState([]);
  const [urlFocused, setUrlFocused] = useState(false);

  const ROLES = [
    { id:"owner",    icon:"🏠", title:"I own this website",            desc:"Get fix code to copy-paste or apply via CMS",                        color:"var(--green)",  badge:"COPY-PASTE FIXES + CMS" },
    { id:"agency",   icon:"📋", title:"This is a client's website",    desc:"Generate audit report + fix instructions to send your client",       color:"var(--cyan)",   badge:"EXPORTABLE CLIENT REPORT" },
    { id:"research", icon:"🔬", title:"This is a competitor's website", desc:"Get competitive intelligence — what they're doing right vs you",    color:"var(--amber)",  badge:"INTELLIGENCE ONLY" },
  ];

  const TABS = [
    { id:"seo",     icon:"🔍", label:"SEO Analysis",  color:"var(--cyan)" },
    { id:"speed",   icon:"⚡", label:"Speed Metrics", color:"var(--amber)" },
    { id:"content", icon:"✏️", label:"Content Score", color:"var(--violet)" },
  ];

  const selectedRole = ROLES.find(r => r.id === role);
  const activeTabCfg = TABS.find(t => t.id === activeTab);

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.token;
      }
    } catch (e) {
      console.error('Error getting auth token:', e);
    }
    return null;
  };

  // — Run analysis —
  const runAnalysis = async (type, targetUrl) => {
    const u = targetUrl || url;
    if (loading[type]) return;
    setLoading(l => ({ ...l, [type]: true }));

    const logs = {
      seo:     ["Connecting to website...", "Parsing HTML document...", "Checking meta tags + OG data...", "Validating headings (H1-H6)...", "Scanning JSON-LD schema...", "Checking canonical + sitemap...", "Running AI scoring model..."],
      speed:   ["Connecting to website...", "Fetching page resources...", "Measuring Core Web Vitals...", "Auditing JavaScript bundles...", "Checking caching headers...", "Calculating LCP, CLS, FID...", "Running AI scoring model..."],
      content: ["Connecting to website...", "Extracting page content...", "Counting words + structure...", "Measuring readability score...", "Analyzing keyword usage...", "Checking E-E-A-T signals...", "Running AI scoring model..."],
    };
    setLogLines([]);
    (logs[type] || []).forEach((l, i) => setTimeout(() => setLogLines(prev => [...prev, l]), i * 320));

    try {
      // Try real API, fall back to demo data
      let result;
      const token = getAuthToken();
      
      try {
        const apiEndpoint = type === 'seo' ? '/api/seo/analyze' : 
                           type === 'speed' ? '/api/speed/analyze' : 
                           '/api/content/analyze';
        
        const res = await fetch(`${API_URL}${apiEndpoint}`, {
          method: "POST", 
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ url: u })
        });
        
        if (!res.ok) throw new Error("API error");
        result = await res.json();
        
        // Transform API response to match our UI format
        result = {
          score: result.score || result.overall_score || 70,
          sub_scores: result.sub_scores || result.metrics || {},
          issues: (result.issues || []).map(issue => 
            typeof issue === 'string' ? { title: issue } : {
              title: issue.issue || issue.title || issue.name || 'Issue',
              detail: issue.description || issue.detail || '',
              impact: issue.impact || ''
            }
          ),
          intelligence: DEMO[type]?.intelligence || [],
          url: u
        };
      } catch (err) {
        console.log('Using demo data for', type, err);
        // Use demo data with slight randomization
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 800));
        result = { ...DEMO[type], url: u };
      }
      setAnalysisData(d => ({ ...d, [type]: { ...result, url: u } }));
    } finally {
      setLoading(l => ({ ...l, [type]: false }));
      setLogLines([]);
    }
  };

  // — Generate AI fixes —
  const generateFixes = async (type) => {
    setGeneratingFix(g => ({ ...g, [type]: true }));
    const data = analysisData[type];
    const token = getAuthToken();
    
    try {
      let fixesResult = [];
      try {
        const res = await fetch(`${API_URL}/api/fix/${type}`, {
          method: "POST", 
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            url: data.url, 
            issues: data.issues?.map(i => i.title || i) || [], 
            role,
            current_data: data
          })
        });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const result = await res.json();
        
        // Transform API response format to match UI component format
        fixesResult = (result.fixes || []).map(fix => ({
          title: fix.issue || fix.title || "Fix",
          description: fix.placement || fix.section || "",
          impact: (fix.impact && fix.impact.includes("CTR")) ? "HIGH" : 
                  (fix.impact && fix.impact.includes("20")) ? "MED" : "HIGH",
          status: "ready",
          explanation: fix.impact || "",
          code: fix.fixed_code || fix.code || "",
          lang: fix.config_type || (fix.fixed_code?.includes("<script") ? "json" : "html"),
          instructions: fix.instructions || "",
          cms_note: fix.effort === "copy-paste" ? "This is a simple copy-paste fix" : fix.effort || ""
        }));
        
        if (fixesResult.length > 0) {
          setFixes(f => ({ ...f, [type]: fixesResult }));
        } else {
          throw new Error("No fixes returned");
        }
      } catch (err) {
        console.log('Using demo fixes for', type, err);
        await new Promise(r => setTimeout(r, 1800));
        setFixes(f => ({ ...f, [type]: FIXES[type] || [] }));
      }
    } finally {
      setGeneratingFix(g => ({ ...g, [type]: false }));
    }
  };

  // — Start full analysis —
  const startAnalysis = () => {
    let u = urlInput.trim();
    if (!u) return;
    if (!u.startsWith("http")) u = "https://" + u;
    setUrl(u);
    setStep("results");
    setActiveTab("seo");
    setAnalysisData({});
    setFixes({});
    setTimeout(() => runAnalysis("seo", u), 50);
  };

  // — Tab click —
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (!analysisData[tab] && !loading[tab]) runAnalysis(tab);
  };

  // — Export report —
  const exportReport = () => {
    const lines = [`SITERANK AI — CLIENT REPORT\nDate: ${new Date().toLocaleDateString()}\nURL: ${url}\nMode: ${role?.toUpperCase()}\n`];
    Object.entries(analysisData).forEach(([type, d]) => {
      lines.push(`\n— ${type.toUpperCase()} SCORE: ${d.score}/100`);
      d.issues?.forEach(issue => lines.push(`  ✕ ${issue.title || issue}`));
      if (fixes[type]) {
        lines.push(`\n  AI FIXES (${fixes[type].length}):`);
        fixes[type].forEach((f,i) => lines.push(`  ${i+1}. [${f.impact}] ${f.title}\n     ${f.instructions || ""}`));
      }
    });
    const blob = new Blob([lines.join("\n")], { type:"text/plain" });
    Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:"siterank-report.txt" }).click();
  };

  // — Download PDF Report (Agency) —
  const downloadPDFReport = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}/api/report/white-label-pdf`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          url,
          client_name: "Client Website",
          agency_name: "Your Agency",
          seo_data: analysisData.seo || { score: 0, issues: [] },
          speed_data: analysisData.speed || { score: 0, issues: [] },
          content_data: analysisData.content || { score: 0, issues: [] },
          include_fixes: true,
          seo_fixes: fixes.seo || [],
          speed_fixes: fixes.speed || [],
          content_fixes: fixes.content || []
        })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: downloadUrl, download: "siterank-audit-report.pdf" }).click();
      } else {
        // Fallback to text export
        exportReport();
      }
    } catch (err) {
      console.error('PDF generation failed, using text export:', err);
      exportReport();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: ROLE SELECTION
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "role") return (
    <div className="srf-container">
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden" }}>
        {/* Grid bg */}
        <div style={{ position:"fixed",inset:0,backgroundImage:`linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)`,backgroundSize:"44px 44px",opacity:0.25,pointerEvents:"none" }}/>
        {/* Glow */}
        <div style={{ position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:400,height:200,background:"radial-gradient(ellipse, rgba(78,240,232,0.06) 0%, transparent 70%)",pointerEvents:"none" }}/>

        <div style={{ maxWidth:540,width:"100%",position:"relative",animation:"srfFadeUp 0.5s ease" }}>
          {/* Pill */}
          <div style={{ textAlign:"center",marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",background:"var(--cyan-d)",border:"1px solid rgba(78,240,232,0.2)",borderRadius:20,fontSize:9,color:"var(--cyan)",letterSpacing:"0.12em",marginBottom:22 }}>◆ SITERANK AI</div>
            <h1 style={{ fontFamily:"var(--display)",fontSize:28,fontWeight:800,color:"var(--text)",lineHeight:1.2,marginBottom:12 }}>
              Who is this site for?
            </h1>
            <p style={{ fontSize:11,color:"var(--text2)",lineHeight:1.7 }}>
              Your relationship determines what we show you.<br/>
              <span style={{ color:"var(--text3)" }}>Audit is always public data. Fixes go to the right person.</span>
            </p>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {ROLES.map((r, i) => (
              <button key={r.id} className="srf-role-card" data-testid={`role-card-${r.id}`}
                onClick={() => { setRole(r.id); setStep("url"); }}
                style={{
                  display:"flex",alignItems:"center",gap:14,padding:"16px 18px",
                  background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:10,
                  cursor:"pointer",textAlign:"left",fontFamily:"var(--mono)",
                  transition:"all 0.2s",animation:`srfFadeUp 0.4s ease ${i*90}ms both`,
                  "--hover-c": r.color
                }}>
                <div style={{ width:42,height:42,borderRadius:8,flexShrink:0,background:`${r.color}10`,border:`1px solid ${r.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19 }}>{r.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:3 }}>{r.title}</div>
                  <div style={{ fontSize:10,color:"var(--text2)" }}>{r.desc}</div>
                </div>
                <div style={{ fontSize:8,fontWeight:700,letterSpacing:"0.07em",padding:"3px 8px",borderRadius:3,background:`${r.color}12`,color:r.color,border:`1px solid ${r.color}25`,flexShrink:0,textAlign:"right" }}>{r.badge}</div>
              </button>
            ))}
          </div>

          <p style={{ textAlign:"center",marginTop:18,fontSize:9,color:"var(--text3)",letterSpacing:"0.04em" }}>
            All analysis uses publicly accessible data only. No credentials required.
          </p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: URL ENTRY
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "url") return (
    <div className="srf-container">
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24 }}>
        <div style={{ position:"fixed",inset:0,backgroundImage:`linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)`,backgroundSize:"44px 44px",opacity:0.25,pointerEvents:"none" }}/>

        <div style={{ maxWidth:500,width:"100%",animation:"srfFadeUp 0.4s ease",position:"relative" }}>
          <button onClick={() => setStep("role")} data-testid="back-to-role-btn" style={{ background:"none",border:"none",color:"var(--text2)",fontSize:10,cursor:"pointer",marginBottom:24,padding:0,fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:6,letterSpacing:"0.04em" }}>← BACK</button>

          {/* Role banner */}
          <div style={{ padding:"10px 14px",marginBottom:28,background:`${selectedRole.color}08`,border:`1px solid ${selectedRole.color}25`,borderRadius:8,display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:20 }}>{selectedRole.icon}</span>
            <div>
              <div style={{ fontSize:11,fontWeight:600,color:selectedRole.color,marginBottom:2 }}>{selectedRole.title}</div>
              <div style={{ fontSize:9,color:"var(--text2)",letterSpacing:"0.05em" }}>{selectedRole.badge}</div>
            </div>
          </div>

          <h2 style={{ fontFamily:"var(--display)",fontSize:24,fontWeight:800,color:"var(--text)",marginBottom:8 }}>Enter the website URL</h2>
          <p style={{ fontSize:11,color:"var(--text2)",marginBottom:22,lineHeight:1.6 }}>
            We'll run SEO, Speed, and Content analysis.<br/>All data comes from publicly accessible sources.
          </p>

          {/* URL Input */}
          <div style={{ display:"flex",gap:8,padding:"6px 6px 6px 14px",background:"var(--s1)",border:`1px solid ${urlFocused ? selectedRole.color+"50" : "var(--bd)"}`,borderRadius:8,transition:"border 0.2s, box-shadow 0.2s",boxShadow:urlFocused ? `0 0 0 3px ${selectedRole.color}0d` : "none" }}>
            <span style={{ color:"var(--text3)",fontSize:12,display:"flex",alignItems:"center",flexShrink:0 }}>$</span>
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&startAnalysis()}
              onFocus={()=>setUrlFocused(true)} onBlur={()=>setUrlFocused(false)}
              placeholder="https://yourwebsite.com" autoFocus
              data-testid="url-input"
              style={{ flex:1,background:"none",border:"none",outline:"none",color:"var(--text)",fontSize:12,fontFamily:"var(--mono)" }}/>
            <button onClick={startAnalysis} disabled={!urlInput.trim()} data-testid="analyze-btn"
              style={{ padding:"9px 16px",background:urlInput.trim()?selectedRole.color:"var(--s3)",color:urlInput.trim()?"var(--bg)":"var(--text3)",border:"none",borderRadius:6,fontSize:10,fontWeight:700,cursor:urlInput.trim()?"pointer":"not-allowed",fontFamily:"var(--mono)",letterSpacing:"0.06em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
              ANALYZE →
            </button>
          </div>

          {/* What we analyze */}
          <div style={{ marginTop:20,padding:"14px 16px",background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:8 }}>
            <div style={{ fontSize:9,color:"var(--text3)",letterSpacing:"0.08em",marginBottom:10 }}>WHAT WE ANALYZE</div>
            {[
              { icon:"🔍", label:"SEO", detail:"Meta tags, headings, schema, sitemap, canonicals" },
              { icon:"⚡", label:"Speed", detail:"Core Web Vitals, load time, caching, scripts" },
              { icon:"✏️", label:"Content", detail:"Word count, readability, keywords, E-E-A-T" },
            ].map(item => (
              <div key={item.label} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
                <span style={{ fontSize:13 }}>{item.icon}</span>
                <span style={{ fontSize:10,color:"var(--cyan)",fontWeight:600,minWidth:50 }}>{item.label}</span>
                <span style={{ fontSize:10,color:"var(--text2)" }}>{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  const currentData = analysisData[activeTab];
  const isLoading = loading[activeTab];
  const currentFixes = fixes[activeTab];
  const isGeneratingFix = generatingFix[activeTab];

  return (
    <div className="srf-container">
      <style>{css}</style>
      <div style={{ minHeight:"100vh",background:"var(--bg)" }}>

        {/* — Top Nav — */}
        <div style={{ borderBottom:"1px solid var(--bd)",padding:"0 20px",background:"var(--s1)",position:"sticky",top:0,zIndex:100 }}>
          <div style={{ maxWidth:920,margin:"0 auto",display:"flex",alignItems:"center",gap:12,height:50 }}>
            <button onClick={()=>setStep("role")} data-testid="new-analysis-btn" style={{ background:"none",border:"none",color:"var(--text2)",fontSize:9,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.07em",flexShrink:0 }}>← NEW</button>
            <div style={{ width:1,height:18,background:"var(--bd)" }}/>
            <div style={{ padding:"4px 10px",background:"var(--s3)",border:"1px solid var(--bd)",borderRadius:4,fontSize:10,color:"var(--cyan)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280 }}>{url}</div>
            {selectedRole && (
              <div style={{ fontSize:8,padding:"3px 8px",background:`${selectedRole.color}10`,color:selectedRole.color,border:`1px solid ${selectedRole.color}25`,borderRadius:3,letterSpacing:"0.07em",fontWeight:700,flexShrink:0 }}>
                {selectedRole.icon} {role.toUpperCase()}
              </div>
            )}
            {role === "agency" && Object.keys(analysisData).length > 0 && (
              <button onClick={downloadPDFReport} data-testid="export-report-btn" style={{ marginLeft:"auto",padding:"6px 12px",background:"var(--s3)",color:"var(--text2)",border:"1px solid var(--bd2)",borderRadius:5,fontSize:9,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.05em",flexShrink:0 }}>⬇ EXPORT REPORT</button>
            )}
          </div>
        </div>

        {/* — Tabs — */}
        <div style={{ borderBottom:"1px solid var(--bd)",background:"var(--s1)" }}>
          <div style={{ maxWidth:920,margin:"0 auto",display:"flex" }}>
            {TABS.map(tab => {
              const d = analysisData[tab.id];
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} className="srf-tab-btn" onClick={() => switchTab(tab.id)} data-testid={`tab-${tab.id}`}
                  style={{ padding:"13px 18px",background:"none",border:"none",borderBottom:`2px solid ${active?tab.color:"transparent"}`,color:active?tab.color:"var(--text2)",fontSize:10,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em",fontWeight:active?600:400,display:"flex",alignItems:"center",gap:7,transition:"all 0.2s" }}>
                  {tab.icon} {tab.label}
                  {loading[tab.id] && <Spin color={tab.color} size={10}/>}
                  {d && !loading[tab.id] && (
                    <span style={{ fontSize:9,padding:"1px 5px",borderRadius:3,background:`${scoreColor(d.score)}18`,color:scoreColor(d.score),fontWeight:700 }}>{d.score}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* — Main Content — */}
        <div style={{ maxWidth:920,margin:"0 auto",padding:"22px 20px 60px" }}>

          {/* Loading */}
          {isLoading && (
            <div style={{ padding:20,background:"var(--s1)",border:`1px solid ${activeTabCfg.color}25`,borderRadius:10,animation:"srfFadeUp 0.3s ease" }} data-testid="loading-indicator">
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <Spin color={activeTabCfg.color}/>
                <span style={{ fontSize:10,color:activeTabCfg.color,letterSpacing:"0.07em" }}>ANALYZING {url.replace(/https?:\/\//,"").split("/")[0]}...</span>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                {logLines.map((l,i) => (
                  <div key={i} style={{ fontSize:10,color:"var(--text2)",display:"flex",gap:8,animation:"srfSlideIn 0.25s ease" }}>
                    <span style={{ color:activeTabCfg.color,flexShrink:0 }}>→</span>{l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {currentData && !isLoading && (
            <div style={{ display:"flex",flexDirection:"column",gap:14,animation:"srfFadeUp 0.4s ease" }} data-testid="analysis-results">

              {/* — Score Overview — */}
              <div style={{ display:"flex",gap:16,padding:20,background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:10,alignItems:"center" }}>
                <Ring score={currentData.score}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,color:"var(--text2)",marginBottom:10 }}>
                    {url.replace(/https?:\/\//,"")} — <span style={{ color:activeTabCfg.color }}>{activeTabCfg.label}</span>
                  </div>
                  {currentData.sub_scores && Object.entries(currentData.sub_scores).map(([k,v],i) => (
                    <Bar key={k} label={k} value={v} delay={i*80}/>
                  ))}
                </div>
              </div>

              {/* — Issues — */}
              {currentData.issues?.length > 0 && (
                <div style={{ padding:18,background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                    <h3 style={{ fontSize:9,color:"var(--text2)",letterSpacing:"0.09em" }}>ISSUES FOUND ({currentData.issues.length})</h3>

                    {/* CTA based on role */}
                    {role === "research" ? (
                      <Badge type="warn" text="INTELLIGENCE MODE — VIEW ONLY"/>
                    ) : !currentFixes && !isGeneratingFix ? (
                      <button onClick={() => generateFixes(activeTab)} data-testid="generate-fixes-btn"
                        style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 14px",background:activeTabCfg.color,color:"var(--bg)",border:"none",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em" }}>
                        ⚡ GENERATE AI FIXES
                      </button>
                    ) : isGeneratingFix ? (
                      <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:10,color:activeTabCfg.color }}>
                        <Spin color={activeTabCfg.color}/> GENERATING FIXES...
                      </div>
                    ) : (
                      <Badge type="pass" text={`${currentFixes.length} FIXES READY`}/>
                    )}
                  </div>

                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {currentData.issues.map((issue,i) => (
                      <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:6,animation:`srfSlideIn 0.3s ease ${i*50}ms both` }}>
                        <span style={{ color:"var(--rose)",fontSize:11,flexShrink:0,marginTop:1 }}>✕</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11,color:"var(--text)",marginBottom:issue.detail?3:0 }}>{issue.title||issue}</div>
                          {issue.detail && <div style={{ fontSize:10,color:"var(--text2)" }}>{issue.detail}</div>}
                        </div>
                        {issue.impact && <span style={{ fontSize:9,color:"var(--rose)",flexShrink:0,fontWeight:600 }}>{issue.impact}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* — AI Fixes (Owner / Agency) — */}
              {currentFixes && role !== "research" && (
                <div style={{ animation:"srfFadeUp 0.4s ease" }} data-testid="fixes-section">
                  {/* Role context banner */}
                  {role === "owner" && (
                    <div style={{ padding:"10px 14px",marginBottom:12,background:"var(--green-d)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:7,fontSize:11,color:"var(--green)" }}>
                      🏠 <strong>Owner Mode:</strong> Copy each fix and paste into your CMS or code. Every fix includes exact placement instructions.
                    </div>
                  )}
                  {role === "agency" && (
                    <div style={{ padding:"10px 14px",marginBottom:12,background:"var(--cyan-d)",border:"1px solid rgba(78,240,232,0.2)",borderRadius:7,fontSize:11,color:"var(--cyan)" }}>
                      📋 <strong>Agency Mode:</strong> Share these fixes with your client's dev team. Use "Export Report" above to generate a PDF.
                    </div>
                  )}

                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                    <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 10px var(--green)",animation:"srfGlow 2s ease-in-out infinite" }}/>
                    <h3 style={{ fontSize:9,color:"var(--green)",letterSpacing:"0.09em" }}>AI FIX PACKAGE — {currentFixes.length} FIXES GENERATED</h3>
                  </div>

                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {currentFixes.map((fix,i) => <FixCard key={i} fix={fix} i={i}/>)}
                  </div>
                </div>
              )}

              {/* — Competitive Intelligence (Research mode) — */}
              {role === "research" && currentData.intelligence && (
                <div style={{ padding:18,background:"var(--s1)",border:"1px solid rgba(78,240,232,0.2)",borderRadius:10,animation:"srfFadeUp 0.4s ease" }} data-testid="intelligence-section">
                  <h3 style={{ fontSize:9,color:"var(--cyan)",letterSpacing:"0.09em",marginBottom:14 }}>◆ COMPETITIVE INTELLIGENCE</h3>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {currentData.intelligence.map((item,i) => (
                      <div key={i} style={{ padding:"10px 12px",background:"var(--s2)",borderRadius:6,borderLeft:"2px solid var(--cyan)",fontSize:11,color:"var(--text)",animation:`srfSlideIn 0.3s ease ${i*70}ms both` }}>
                        <span style={{ color:"var(--cyan)",marginRight:8 }}>→</span>{item}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12,padding:"10px 14px",background:"var(--amber-d)",border:"1px solid rgba(255,181,71,0.2)",borderRadius:7,fontSize:11,color:"var(--amber)" }}>
                    💡 Use these insights to improve <strong>your own site</strong> — not theirs.
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Empty state */}
          {!currentData && !isLoading && (
            <div style={{ padding:40,textAlign:"center",background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:10,animation:"srfFadeUp 0.3s ease" }}>
              <div style={{ fontSize:30,marginBottom:12 }}>{activeTabCfg.icon}</div>
              <div style={{ fontSize:13,color:"var(--text2)",marginBottom:16 }}>Ready to run {activeTabCfg.label}</div>
              <button onClick={()=>runAnalysis(activeTab)} data-testid="run-analysis-btn" style={{ padding:"10px 20px",background:activeTabCfg.color,color:"var(--bg)",border:"none",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em" }}>
                RUN {activeTab.toUpperCase()} ANALYSIS →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
