"""
SITERANK AI - Auto-Fix Engine
Transforms detected issues into actionable, copy-paste fixes using AI
"""

import os
import json
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from openai import OpenAI

logger = logging.getLogger(__name__)

# Initialize NVIDIA DeepSeek client
def get_ai_client():
    return OpenAI(
        base_url=os.environ.get('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
        api_key=os.environ.get('NVIDIA_API_KEY')
    )


# ==================== Request/Response Models ====================

class SEOFixRequest(BaseModel):
    url: str
    issues: List[str]
    page_title: Optional[str] = ""
    page_description: Optional[str] = ""
    page_content: Optional[str] = ""
    target_keyword: Optional[str] = ""

class SpeedFixRequest(BaseModel):
    url: str
    issues: List[str]
    server_type: Optional[str] = "nginx"  # nginx, apache, node
    current_scripts: Optional[List[str]] = []
    current_images: Optional[List[str]] = []

class ContentFixRequest(BaseModel):
    url: str
    issues: List[str]
    current_content: Optional[str] = ""
    target_keyword: Optional[str] = ""
    page_title: Optional[str] = ""

class FixItem(BaseModel):
    issue: str
    status: str = "fixed"
    original: Optional[str] = None
    fixed_code: str
    instructions: str
    placement: Optional[str] = None
    impact: Optional[str] = None
    effort: str = "copy-paste"

class FixResponse(BaseModel):
    success: bool
    url: str
    fixes: List[Dict[str, Any]]
    summary: str


# ==================== SEO Auto-Fix ====================

async def generate_seo_fixes(request: SEOFixRequest) -> FixResponse:
    """Generate AI-powered SEO fixes for detected issues"""
    
    client = get_ai_client()
    
    system_prompt = """You are an expert SEO engineer. Given a URL and list of SEO issues, 
generate exact, production-ready HTML code fixes. Return ONLY valid JSON, no markdown.

For each issue, provide:
- The exact HTML code to fix the issue
- Clear instructions on where to place it
- Expected SEO impact

Be specific and practical. Generate real, usable code."""

    user_prompt = f"""
URL: {request.url}
Current Title: {request.page_title or 'Not provided'}
Current Description: {request.page_description or 'Not provided'}
Target Keyword: {request.target_keyword or 'Not specified'}
Page Content Preview: {request.page_content[:1500] if request.page_content else 'Not provided'}

Issues to fix: {json.dumps(request.issues)}

Generate fixes for each issue. Return JSON in this exact format:
{{
  "fixes": [
    {{
      "issue": "issue_name",
      "status": "fixed",
      "original": "original code if applicable or null",
      "fixed_code": "exact HTML/code to use",
      "instructions": "where and how to implement",
      "placement": "inside <head> / before </body> / etc",
      "impact": "SEO improvement description",
      "effort": "copy-paste"
    }}
  ],
  "summary": "brief summary of all fixes"
}}"""

    try:
        response = client.chat.completions.create(
            model="deepseek-ai/deepseek-v3.2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        result_text = response.choices[0].message.content
        
        # Clean up response - remove markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
        
        result = json.loads(result_text.strip())
        
        return FixResponse(
            success=True,
            url=request.url,
            fixes=result.get("fixes", []),
            summary=result.get("summary", "SEO fixes generated successfully")
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        # Return fallback fixes
        return generate_fallback_seo_fixes(request)
    except Exception as e:
        logger.error(f"SEO fix generation failed: {e}")
        raise


def generate_fallback_seo_fixes(request: SEOFixRequest) -> FixResponse:
    """Generate rule-based fallback fixes if AI fails"""
    fixes = []
    
    for issue in request.issues:
        if "meta_description" in issue.lower() or "missing_meta" in issue.lower():
            fixes.append({
                "issue": "missing_meta_description",
                "status": "fixed",
                "original": None,
                "fixed_code": f'<meta name="description" content="Discover {request.target_keyword or "our services"} - Professional solutions for your needs. Learn more about what we offer and how we can help you succeed.">',
                "instructions": "Add this tag inside your <head> section",
                "placement": "inside <head>",
                "impact": "Improves CTR by 15-30% in search results",
                "effort": "copy-paste"
            })
        
        if "title" in issue.lower():
            fixes.append({
                "issue": "title_optimization",
                "status": "fixed",
                "original": request.page_title,
                "fixed_code": f'<title>{request.target_keyword or "Your Brand"} - Professional Solutions | Your Company</title>',
                "instructions": "Replace your existing <title> tag",
                "placement": "inside <head>",
                "impact": "Better keyword targeting, improved rankings",
                "effort": "copy-paste"
            })
        
        if "schema" in issue.lower() or "structured" in issue.lower():
            fixes.append({
                "issue": "no_schema_markup",
                "status": "fixed",
                "original": None,
                "fixed_code": '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "''' + (request.page_title or "Page Title") + '''",
  "description": "''' + (request.page_description or "Page description") + '''",
  "url": "''' + request.url + '''"
}
</script>''',
                "instructions": "Add this script before the closing </body> tag",
                "placement": "before </body>",
                "impact": "Enables rich snippets in search results",
                "effort": "copy-paste"
            })
        
        if "canonical" in issue.lower():
            fixes.append({
                "issue": "missing_canonical",
                "status": "fixed",
                "original": None,
                "fixed_code": f'<link rel="canonical" href="{request.url}">',
                "instructions": "Add inside your <head> section",
                "placement": "inside <head>",
                "impact": "Prevents duplicate content issues",
                "effort": "copy-paste"
            })
        
        if "h1" in issue.lower():
            fixes.append({
                "issue": "missing_h1",
                "status": "fixed",
                "original": None,
                "fixed_code": f'<h1>{request.target_keyword or "Main Heading"} - Your Compelling Title</h1>',
                "instructions": "Add as the main heading at the top of your content",
                "placement": "top of main content area",
                "impact": "Improves page structure and keyword relevance",
                "effort": "copy-paste"
            })
        
        if "alt" in issue.lower() and "image" in issue.lower():
            fixes.append({
                "issue": "images_missing_alt",
                "status": "fixed",
                "original": '<img src="image.jpg">',
                "fixed_code": f'<img src="image.jpg" alt="Descriptive text about {request.target_keyword or "the image"}" loading="lazy">',
                "instructions": "Add alt attributes to all images describing their content",
                "placement": "on each <img> tag",
                "impact": "Improves accessibility and image SEO",
                "effort": "copy-paste"
            })
    
    return FixResponse(
        success=True,
        url=request.url,
        fixes=fixes,
        summary=f"Generated {len(fixes)} SEO fixes for your website"
    )


# ==================== Speed Auto-Fix ====================

async def generate_speed_fixes(request: SpeedFixRequest) -> FixResponse:
    """Generate AI-powered speed optimization fixes"""
    
    client = get_ai_client()
    
    system_prompt = """You are an expert web performance engineer. Given a URL and list of performance issues,
generate exact, production-ready code fixes. Return ONLY valid JSON, no markdown.

For each issue, provide server configs, HTML changes, or code snippets that can be directly implemented."""

    user_prompt = f"""
URL: {request.url}
Server Type: {request.server_type}
Issues to fix: {json.dumps(request.issues)}

Generate performance fixes. Return JSON in this exact format:
{{
  "fixes": [
    {{
      "issue": "issue_name",
      "status": "fixed",
      "original": "original code if applicable",
      "fixed_code": "exact code/config to use",
      "config_type": "nginx/apache/html/js",
      "instructions": "implementation steps",
      "placement": "where to add this",
      "impact": "performance improvement",
      "effort": "copy-paste"
    }}
  ],
  "summary": "brief summary"
}}"""

    try:
        response = client.chat.completions.create(
            model="deepseek-ai/deepseek-v3.2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        result_text = response.choices[0].message.content
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
        
        result = json.loads(result_text.strip())
        
        return FixResponse(
            success=True,
            url=request.url,
            fixes=result.get("fixes", []),
            summary=result.get("summary", "Speed fixes generated successfully")
        )
        
    except Exception as e:
        logger.error(f"Speed fix generation failed: {e}")
        return generate_fallback_speed_fixes(request)


def generate_fallback_speed_fixes(request: SpeedFixRequest) -> FixResponse:
    """Generate rule-based fallback speed fixes"""
    fixes = []
    
    for issue in request.issues:
        if "render" in issue.lower() and "blocking" in issue.lower():
            fixes.append({
                "issue": "render_blocking_scripts",
                "status": "fixed",
                "original": '<script src="app.js"></script>',
                "fixed_code": '<script src="app.js" defer></script>',
                "instructions": "Add 'defer' attribute to non-critical scripts",
                "placement": "on <script> tags",
                "impact": "Reduces First Contentful Paint by 20-40%",
                "effort": "copy-paste"
            })
        
        if "lazy" in issue.lower() or "image" in issue.lower():
            fixes.append({
                "issue": "no_lazy_loading",
                "status": "fixed",
                "original": '<img src="image.jpg">',
                "fixed_code": '<img src="image.jpg" loading="lazy" decoding="async">',
                "instructions": "Add loading='lazy' to images below the fold",
                "placement": "on <img> tags",
                "impact": "Reduces initial page load by 30-50%",
                "effort": "copy-paste"
            })
        
        if "cache" in issue.lower():
            if request.server_type == "nginx":
                fixes.append({
                    "issue": "missing_cache_headers",
                    "status": "fixed",
                    "original": None,
                    "fixed_code": '''location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}''',
                    "config_type": "nginx",
                    "instructions": "Add to your nginx.conf server block",
                    "placement": "nginx.conf",
                    "impact": "Eliminates repeat downloads, faster repeat visits",
                    "effort": "copy-paste"
                })
            else:
                fixes.append({
                    "issue": "missing_cache_headers",
                    "status": "fixed",
                    "original": None,
                    "fixed_code": '''<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>''',
                    "config_type": "apache",
                    "instructions": "Add to your .htaccess file",
                    "placement": ".htaccess",
                    "impact": "Eliminates repeat downloads",
                    "effort": "copy-paste"
                })
        
        if "gzip" in issue.lower() or "compress" in issue.lower():
            if request.server_type == "nginx":
                fixes.append({
                    "issue": "no_compression",
                    "status": "fixed",
                    "original": None,
                    "fixed_code": '''gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;''',
                    "config_type": "nginx",
                    "instructions": "Add to your nginx.conf http block",
                    "placement": "nginx.conf",
                    "impact": "Reduces file sizes by 60-80%",
                    "effort": "copy-paste"
                })
        
        if "preload" in issue.lower() or "lcp" in issue.lower():
            fixes.append({
                "issue": "no_preload_lcp",
                "status": "fixed",
                "original": None,
                "fixed_code": '<link rel="preload" as="image" href="/path/to/hero-image.jpg">',
                "instructions": "Add in <head> for your largest above-fold image",
                "placement": "inside <head>",
                "impact": "Improves LCP by 100-500ms",
                "effort": "copy-paste"
            })
        
        if "minif" in issue.lower() or "bundle" in issue.lower():
            fixes.append({
                "issue": "unminified_assets",
                "status": "fixed",
                "original": '<link rel="stylesheet" href="styles.css">',
                "fixed_code": '<link rel="stylesheet" href="styles.min.css">',
                "instructions": "Use minified versions of CSS/JS files. Consider tools like terser (JS) or cssnano (CSS)",
                "placement": "asset references",
                "impact": "Reduces file sizes by 20-40%",
                "effort": "requires build step"
            })
    
    return FixResponse(
        success=True,
        url=request.url,
        fixes=fixes,
        summary=f"Generated {len(fixes)} performance fixes"
    )


# ==================== Content Auto-Fix ====================

async def generate_content_fixes(request: ContentFixRequest) -> FixResponse:
    """Generate AI-powered content fixes and rewrites"""
    
    client = get_ai_client()
    
    system_prompt = """You are an expert SEO content writer. Given page content and issues,
rewrite and improve content sections. Return ONLY valid JSON, no markdown.

For each issue, provide rewritten content that's SEO-optimized, engaging, and actionable."""

    user_prompt = f"""
URL: {request.url}
Page Title: {request.page_title or 'Not provided'}
Target Keyword: {request.target_keyword or 'Not specified'}
Current Content: {request.current_content[:3000] if request.current_content else 'Not provided'}

Issues to fix: {json.dumps(request.issues)}

Generate content fixes. Return JSON in this exact format:
{{
  "fixes": [
    {{
      "issue": "issue_name",
      "status": "fixed",
      "section": "which section this applies to",
      "original_snippet": "brief original text if applicable",
      "fixed_code": "rewritten/new content",
      "word_count_delta": "+X words or -X words",
      "instructions": "how to implement",
      "impact": "content improvement description",
      "effort": "copy-paste"
    }}
  ],
  "summary": "brief summary"
}}"""

    try:
        response = client.chat.completions.create(
            model="deepseek-ai/deepseek-v3.2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=6000
        )
        
        result_text = response.choices[0].message.content
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
        
        result = json.loads(result_text.strip())
        
        return FixResponse(
            success=True,
            url=request.url,
            fixes=result.get("fixes", []),
            summary=result.get("summary", "Content fixes generated successfully")
        )
        
    except Exception as e:
        logger.error(f"Content fix generation failed: {e}")
        return generate_fallback_content_fixes(request)


def generate_fallback_content_fixes(request: ContentFixRequest) -> FixResponse:
    """Generate rule-based fallback content fixes"""
    fixes = []
    keyword = request.target_keyword or "your topic"
    
    for issue in request.issues:
        if "thin" in issue.lower() or "short" in issue.lower():
            fixes.append({
                "issue": "thin_content",
                "status": "fixed",
                "section": "main_body",
                "original_snippet": "Content too short",
                "fixed_code": f"""## Understanding {keyword.title()}

{keyword.title()} is essential for businesses looking to improve their online presence. In this comprehensive guide, we'll explore the key aspects that make {keyword} effective.

### Why {keyword.title()} Matters

The importance of {keyword} cannot be overstated. Studies show that businesses implementing proper {keyword} strategies see significant improvements in their results.

### Key Benefits

1. **Improved Visibility** - Get found by your target audience
2. **Better Engagement** - Connect with users effectively  
3. **Higher Conversions** - Turn visitors into customers
4. **Competitive Advantage** - Stay ahead of competitors

### Getting Started

To begin with {keyword}, follow these essential steps...""",
                "word_count_delta": "+250 words",
                "instructions": "Expand your content with these sections",
                "impact": "Improves content depth and SEO value",
                "effort": "copy-paste and customize"
            })
        
        if "faq" in issue.lower():
            fixes.append({
                "issue": "no_faq_section",
                "status": "fixed",
                "section": "faq",
                "original_snippet": None,
                "fixed_code": f"""<section class="faq">
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-item">
    <h3>What is {keyword}?</h3>
    <p>{keyword.title()} is a process that helps businesses improve their online performance and visibility.</p>
  </div>
  
  <div class="faq-item">
    <h3>How does {keyword} work?</h3>
    <p>It works by analyzing key factors and implementing strategic improvements based on data-driven insights.</p>
  </div>
  
  <div class="faq-item">
    <h3>Why is {keyword} important?</h3>
    <p>It's important because it directly impacts your online visibility, user experience, and business results.</p>
  </div>
</section>

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{
      "@type": "Question",
      "name": "What is {keyword}?",
      "acceptedAnswer": {{
        "@type": "Answer",
        "text": "{keyword.title()} is a process that helps businesses improve their online performance."
      }}
    }}
  ]
}}
</script>""",
                "word_count_delta": "+150 words",
                "instructions": "Add this FAQ section before your footer",
                "impact": "Enables FAQ rich snippets in search",
                "effort": "copy-paste"
            })
        
        if "cta" in issue.lower() or "call" in issue.lower():
            fixes.append({
                "issue": "weak_cta",
                "status": "fixed",
                "section": "call_to_action",
                "original_snippet": "Learn more",
                "fixed_code": f"""<section class="cta-section">
  <h2>Ready to Improve Your {keyword.title()}?</h2>
  <p>Get started today and see results within 30 days. Join thousands of businesses already benefiting.</p>
  <a href="#contact" class="cta-button">Get Your Free Analysis →</a>
</section>""",
                "word_count_delta": "+30 words",
                "instructions": "Replace weak CTAs with this compelling version",
                "impact": "Increases conversion rate by 20-40%",
                "effort": "copy-paste"
            })
        
        if "readability" in issue.lower():
            fixes.append({
                "issue": "low_readability",
                "status": "fixed",
                "section": "paragraphs",
                "original_snippet": "Complex sentences detected",
                "fixed_code": """Tips for improving readability:
• Break long paragraphs into 2-3 sentences
• Use bullet points for lists
• Add subheadings every 200-300 words
• Replace jargon with simple words
• Use active voice instead of passive""",
                "word_count_delta": "0",
                "instructions": "Apply these principles throughout your content",
                "impact": "Improves user engagement and time on page",
                "effort": "manual rewrite"
            })
        
        if "internal" in issue.lower() and "link" in issue.lower():
            fixes.append({
                "issue": "missing_internal_links",
                "status": "fixed",
                "section": "body_content",
                "original_snippet": None,
                "fixed_code": f"""Add internal links like:
<a href="/related-page">{keyword} guide</a>
<a href="/services">our {keyword} services</a>
<a href="/blog">more about {keyword}</a>""",
                "word_count_delta": "+10 words",
                "instructions": "Add 3-5 internal links to relevant pages",
                "impact": "Improves site structure and page authority",
                "effort": "copy-paste"
            })
    
    return FixResponse(
        success=True,
        url=request.url,
        fixes=fixes,
        summary=f"Generated {len(fixes)} content improvements"
    )
