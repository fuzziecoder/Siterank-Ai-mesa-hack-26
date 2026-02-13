import os
import logging
from typing import Dict, List, Any, Optional
from scraper import WebsiteScraper

logger = logging.getLogger(__name__)


async def analyze_seo(url: str) -> Dict[str, Any]:
    """
    Comprehensive SEO analysis with AI-generated fixes
    """
    scraper = WebsiteScraper(url)
    if not scraper.fetch():
        raise ValueError(scraper.error_message or "Failed to fetch website")
    
    seo_data = scraper.get_seo_data()
    
    # Calculate score
    score = calculate_seo_score(seo_data)
    
    # Detect issues and generate fixes
    issues = detect_seo_issues(seo_data, url)
    
    # Generate meta analysis with suggestions
    meta_analysis = generate_meta_analysis(seo_data, url)
    
    # Generate schema suggestions
    schema_suggestions = generate_schema_markup(seo_data, url)
    
    # Link analysis
    link_analysis = analyze_links(seo_data)
    
    passed_count = len([i for i in get_all_checks(seo_data) if i['passed']])
    
    return {
        "url": scraper.url,
        "score": score,
        "issues_count": len(issues),
        "passed_count": passed_count,
        "issues": issues,
        "meta_analysis": meta_analysis,
        "schema_suggestions": schema_suggestions,
        "link_analysis": link_analysis
    }


def calculate_seo_score(seo_data: Dict[str, Any]) -> int:
    """Calculate overall SEO score"""
    score = 100
    
    # Title checks (-15 max)
    title = seo_data.get('title', '')
    if not title:
        score -= 15
    elif len(title) < 30 or len(title) > 60:
        score -= 5
    
    # Meta description (-15 max)
    desc = seo_data.get('meta_description', '')
    if not desc:
        score -= 15
    elif len(desc) < 120 or len(desc) > 160:
        score -= 5
    
    # H1 (-10 max)
    h1_count = seo_data.get('h1_count', 0)
    if h1_count == 0:
        score -= 10
    elif h1_count > 1:
        score -= 5
    
    # Headings structure (-5)
    if seo_data.get('heading_count', 0) < 3:
        score -= 5
    
    # Images without alt (-10 max)
    images_without_alt = seo_data.get('images_without_alt', 0)
    if images_without_alt > 5:
        score -= 10
    elif images_without_alt > 0:
        score -= 5
    
    # Structured data (-10)
    if not seo_data.get('structured_data', False):
        score -= 10
    
    # Internal links (-5)
    if seo_data.get('internal_links', 0) < 3:
        score -= 5
    
    # Canonical (-5)
    if not seo_data.get('canonical_url'):
        score -= 5
    
    return max(0, score)


def detect_seo_issues(seo_data: Dict[str, Any], url: str) -> List[Dict[str, Any]]:
    """Detect SEO issues and generate AI fixes"""
    issues = []
    domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    
    # Title issues
    title = seo_data.get('title', '')
    if not title:
        issues.append({
            "title": "Missing Page Title",
            "description": "Your page doesn't have a title tag, which is critical for SEO and click-through rates.",
            "category": "Meta Tags",
            "priority": "critical",
            "current_value": None,
            "fix": f"Add a compelling title under 60 characters that includes your main keyword.",
            "fix_code": f'<title>{domain.title()} - Your Main Keyword | Brand Name</title>'
        })
    elif len(title) > 60:
        issues.append({
            "title": "Title Too Long",
            "description": f"Your title is {len(title)} characters. Google typically displays 50-60 characters.",
            "category": "Meta Tags",
            "priority": "medium",
            "current_value": title,
            "fix": "Shorten your title to under 60 characters while keeping the main keyword.",
            "fix_code": f'<title>{title[:57]}...</title>'
        })
    elif len(title) < 30:
        issues.append({
            "title": "Title Too Short",
            "description": f"Your title is only {len(title)} characters. Aim for 50-60 characters for better CTR.",
            "category": "Meta Tags",
            "priority": "medium",
            "current_value": title,
            "fix": "Expand your title to include more relevant keywords and compelling copy."
        })
    
    # Meta description issues
    desc = seo_data.get('meta_description', '')
    if not desc:
        issues.append({
            "title": "Missing Meta Description",
            "description": "No meta description found. This is your chance to write compelling ad copy for search results.",
            "category": "Meta Tags",
            "priority": "critical",
            "current_value": None,
            "fix": "Add a meta description of 150-160 characters with a clear call-to-action.",
            "fix_code": f'<meta name="description" content="Discover {domain} - your solution for [benefit]. Get started today and see results. Click to learn more!">'
        })
    elif len(desc) > 160:
        issues.append({
            "title": "Meta Description Too Long",
            "description": f"Your meta description is {len(desc)} characters. Google typically shows 150-160.",
            "category": "Meta Tags",
            "priority": "low",
            "current_value": desc[:100] + "...",
            "fix": "Trim your meta description to 155 characters while keeping the main message.",
            "fix_code": f'<meta name="description" content="{desc[:155]}...">'
        })
    
    # H1 issues
    h1_count = seo_data.get('h1_count', 0)
    if h1_count == 0:
        issues.append({
            "title": "Missing H1 Heading",
            "description": "Your page has no H1 tag. Every page should have exactly one H1 that describes the main topic.",
            "category": "Headings",
            "priority": "critical",
            "current_value": None,
            "fix": "Add an H1 heading at the top of your main content area.",
            "fix_code": f'<h1>Your Main Keyword - Compelling Headline</h1>'
        })
    elif h1_count > 1:
        issues.append({
            "title": "Multiple H1 Headings",
            "description": f"Your page has {h1_count} H1 tags. Best practice is to have exactly one H1.",
            "category": "Headings",
            "priority": "medium",
            "current_value": f"{h1_count} H1 tags found",
            "fix": "Keep one main H1 and convert others to H2 or H3 tags."
        })
    
    # Images without alt
    images_without_alt = seo_data.get('images_without_alt', 0)
    if images_without_alt > 0:
        issues.append({
            "title": "Images Missing Alt Text",
            "description": f"{images_without_alt} images don't have alt attributes, which hurts SEO and accessibility.",
            "category": "Images",
            "priority": "high" if images_without_alt > 5 else "medium",
            "current_value": f"{images_without_alt} images without alt",
            "fix": "Add descriptive alt text to all images.",
            "fix_code": '<img src="image.jpg" alt="Descriptive text about the image content">'
        })
    
    # Structured data
    if not seo_data.get('structured_data', False):
        issues.append({
            "title": "No Structured Data Found",
            "description": "Your page lacks Schema.org markup, missing out on rich snippets in search results.",
            "category": "Structured Data",
            "priority": "high",
            "current_value": None,
            "fix": "Add JSON-LD structured data to help search engines understand your content. See the Schema Generator section below."
        })
    
    # Canonical URL
    if not seo_data.get('canonical_url'):
        issues.append({
            "title": "Missing Canonical URL",
            "description": "No canonical tag found. This helps prevent duplicate content issues.",
            "category": "Technical SEO",
            "priority": "medium",
            "current_value": None,
            "fix": "Add a canonical tag pointing to the preferred URL.",
            "fix_code": f'<link rel="canonical" href="https://{domain}/">'
        })
    
    # Internal links
    internal_links = seo_data.get('internal_links', 0)
    if internal_links < 3:
        issues.append({
            "title": "Low Internal Linking",
            "description": f"Only {internal_links} internal links found. More internal links help with navigation and SEO.",
            "category": "Links",
            "priority": "medium",
            "current_value": f"{internal_links} internal links",
            "fix": "Add more contextual internal links to related content on your site."
        })
    
    return issues


def generate_meta_analysis(seo_data: Dict[str, Any], url: str) -> Dict[str, Any]:
    """Generate meta tag analysis with AI suggestions"""
    domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    title = seo_data.get('title', '')
    desc = seo_data.get('meta_description', '')
    
    # Generate suggested title
    suggested_title = None
    if not title or len(title) < 30:
        suggested_title = f"{domain.replace('.com', '').replace('.', ' ').title()} - Leading Solution for Your Needs | Official Site"
    elif len(title) > 60:
        suggested_title = title[:57] + "..."
    
    # Generate suggested description
    suggested_description = None
    if not desc:
        suggested_description = f"Discover what {domain} has to offer. Get started today with our proven solutions. Join thousands of satisfied customers. Learn more now!"
    elif len(desc) > 160:
        suggested_description = desc[:155] + "..."
    
    return {
        "title": title,
        "title_length": len(title) if title else 0,
        "suggested_title": suggested_title,
        "description": desc,
        "description_length": len(desc) if desc else 0,
        "suggested_description": suggested_description,
        "h1_texts": seo_data.get('h1_texts', [])[:3],
        "has_og_tags": seo_data.get('og_title') is not None,
        "has_twitter_tags": seo_data.get('twitter_title') is not None
    }


def generate_schema_markup(seo_data: Dict[str, Any], url: str) -> str:
    """Generate Schema.org JSON-LD markup"""
    domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    title = seo_data.get('title', domain.title())
    desc = seo_data.get('meta_description', f'Welcome to {domain}')
    
    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": desc[:160] if desc else f"Official website of {domain}",
        "url": f"https://{domain}/",
        "publisher": {
            "@type": "Organization",
            "name": domain.replace('.com', '').replace('.', ' ').title(),
            "url": f"https://{domain}/"
        }
    }
    
    import json
    return f'<script type="application/ld+json">\n{json.dumps(schema, indent=2)}\n</script>'


def analyze_links(seo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze link structure"""
    internal = seo_data.get('internal_links', 0)
    external = seo_data.get('external_links', 0)
    images_without_alt = seo_data.get('images_without_alt', 0)
    
    suggestions = []
    
    if internal < 5:
        suggestions.append("Add more internal links to help visitors discover related content and improve crawlability.")
    
    if external == 0:
        suggestions.append("Consider adding relevant external links to authoritative sources to build trust.")
    elif external > 20:
        suggestions.append("You have many external links. Ensure they're all relevant and consider using nofollow for untrusted sources.")
    
    if images_without_alt > 0:
        suggestions.append(f"Add descriptive alt text to {images_without_alt} images for better accessibility and image SEO.")
    
    total_links = internal + external
    if total_links > 0 and internal / total_links < 0.5:
        suggestions.append("Your internal-to-external link ratio is low. Focus on adding more internal links.")
    
    return {
        "internal_links": internal,
        "external_links": external,
        "images_without_alt": images_without_alt,
        "suggestions": suggestions
    }


def get_all_checks(seo_data: Dict[str, Any]) -> List[Dict[str, bool]]:
    """Get all SEO checks with pass/fail status"""
    checks = [
        {"name": "Has Title", "passed": bool(seo_data.get('title'))},
        {"name": "Title Length", "passed": 30 <= len(seo_data.get('title', '')) <= 60},
        {"name": "Has Meta Description", "passed": bool(seo_data.get('meta_description'))},
        {"name": "Description Length", "passed": 120 <= len(seo_data.get('meta_description', '')) <= 160},
        {"name": "Has H1", "passed": seo_data.get('h1_count', 0) == 1},
        {"name": "Has Headings", "passed": seo_data.get('heading_count', 0) >= 3},
        {"name": "Images Have Alt", "passed": seo_data.get('images_without_alt', 0) == 0},
        {"name": "Has Structured Data", "passed": seo_data.get('structured_data', False)},
        {"name": "Has Canonical", "passed": bool(seo_data.get('canonical_url'))},
        {"name": "Internal Links", "passed": seo_data.get('internal_links', 0) >= 3},
    ]
    return checks
