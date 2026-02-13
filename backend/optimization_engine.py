import os
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


async def generate_optimization_blueprint(
    user_url: str,
    user_scores: Dict[str, Any],
    competitors: List[Dict[str, Any]],
    scraped_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Generate a comprehensive AI-powered optimization blueprint
    """
    # Calculate competitor averages
    comp_avg = calculate_competitor_averages(competitors)
    
    # Identify gaps
    gaps = identify_gaps(user_scores, comp_avg)
    
    # Generate blueprint from data analysis
    blueprint = generate_data_driven_blueprint(user_url, user_scores, comp_avg, gaps, scraped_data)
    
    return blueprint


def calculate_competitor_averages(competitors: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculate average scores across competitors"""
    if not competitors:
        return {'seo_score': 50, 'speed_score': 50, 'content_score': 50, 'ux_score': 50, 'overall_score': 50}
    
    totals = {
        'seo_score': 0,
        'speed_score': 0,
        'content_score': 0,
        'ux_score': 0,
        'overall_score': 0
    }
    
    count = 0
    for comp in competitors:
        scores = comp.get('scores', {})
        if scores:
            count += 1
            for key in totals:
                totals[key] += scores.get(key, 50)
    
    if count > 0:
        return {k: round(v / count, 1) for k, v in totals.items()}
    return totals


def identify_gaps(user_scores: Dict[str, Any], comp_avg: Dict[str, float]) -> Dict[str, float]:
    """Identify score gaps between user and competitors (negative = you're behind)"""
    gaps = {}
    for key in ['seo_score', 'speed_score', 'content_score', 'ux_score', 'overall_score']:
        user_val = user_scores.get(key, 50)
        comp_val = comp_avg.get(key, 50)
        gaps[key] = round(user_val - comp_val, 1)  # Positive = ahead, negative = behind
    return gaps


def generate_data_driven_blueprint(
    user_url: str,
    user_scores: Dict[str, Any],
    comp_avg: Dict[str, float],
    gaps: Dict[str, float],
    scraped_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generate blueprint based on data analysis"""
    overall = user_scores.get('overall_score', 50)
    seo = user_scores.get('seo_score', 50)
    speed = user_scores.get('speed_score', 50)
    content = user_scores.get('content_score', 50)
    ux = user_scores.get('ux_score', 50)
    
    # Determine status
    if overall < 40:
        status = "critical"
    elif overall < 60:
        status = "needs_work"
    elif overall < 80:
        status = "good"
    else:
        status = "excellent"
    
    # Build critical fixes based on lowest scores
    critical_fixes = []
    score_categories = [
        ('seo', seo, 'SEO'),
        ('speed', speed, 'Speed'),
        ('content', content, 'Content'),
        ('ux', ux, 'UX')
    ]
    
    # Sort by score (lowest first - these need most attention)
    score_categories.sort(key=lambda x: x[1])
    
    fix_templates = {
        'seo': [
            {
                "title": "Optimize Meta Tags",
                "description": "Meta title and description need optimization for better search visibility",
                "fix": "Add unique, keyword-rich title (50-60 chars) and meta description (150-160 chars) with call-to-action",
                "expected_improvement": "+5-10 SEO points"
            },
            {
                "title": "Add Structured Data (Schema.org)",
                "description": "Missing or incomplete Schema.org markup reduces rich snippet potential",
                "fix": "Implement JSON-LD schema for Organization, WebPage, and relevant content types. Example:\n<script type=\"application/ld+json\">\n{\"@context\": \"https://schema.org\", \"@type\": \"Organization\", \"name\": \"Your Company\", \"url\": \"" + user_url + "\"}\n</script>",
                "expected_improvement": "+3-5 SEO points"
            },
            {
                "title": "Improve Internal Linking Structure",
                "description": "Internal link structure needs optimization for better crawlability",
                "fix": "Add contextual internal links between related pages, use descriptive anchor text, ensure important pages are within 3 clicks",
                "expected_improvement": "+3-5 SEO points"
            }
        ],
        'speed': [
            {
                "title": "Compress & Optimize Images",
                "description": "Large images are significantly slowing down page load",
                "fix": "1. Convert images to WebP format (60-80% smaller)\n2. Resize to actual display dimensions\n3. Add lazy loading: <img loading=\"lazy\" src=\"...\">\n4. Use responsive images with srcset",
                "expected_improvement": "+10-15 Speed points"
            },
            {
                "title": "Enable Browser Caching",
                "description": "Static resources are not being cached effectively",
                "fix": "Add Cache-Control headers:\n- Versioned assets: max-age=31536000 (1 year)\n- HTML: max-age=3600 (1 hour)\n- API responses: no-cache or short max-age",
                "expected_improvement": "+5-8 Speed points"
            },
            {
                "title": "Minify & Bundle Assets",
                "description": "Unminified CSS/JS files increasing page weight",
                "fix": "1. Minify CSS and JavaScript files\n2. Bundle multiple files into single requests\n3. Defer non-critical scripts: <script defer src=\"...\">\n4. Inline critical CSS",
                "expected_improvement": "+5-8 Speed points"
            }
        ],
        'content': [
            {
                "title": "Expand Content Depth",
                "description": "Content lacks depth and comprehensiveness compared to competitors",
                "fix": "1. Add 500-1000 more words covering related subtopics\n2. Include FAQ section with common questions\n3. Add real examples and case studies\n4. Use data and statistics to support points",
                "expected_improvement": "+8-12 Content points"
            },
            {
                "title": "Improve Heading Structure",
                "description": "Heading hierarchy needs optimization for SEO and readability",
                "fix": "1. Use exactly one H1 with primary keyword\n2. Organize content with H2-H3 subheadings\n3. Include keywords naturally in headings\n4. Ensure logical content flow",
                "expected_improvement": "+3-5 Content points"
            },
            {
                "title": "Add Visual & Interactive Content",
                "description": "Page lacks engaging visual elements",
                "fix": "1. Add infographics to visualize data\n2. Include relevant images with alt text\n3. Add video content if applicable\n4. Use charts/graphs for statistics",
                "expected_improvement": "+3-5 Content points"
            }
        ],
        'ux': [
            {
                "title": "Optimize Mobile Experience",
                "description": "Mobile usability issues affecting user experience",
                "fix": "1. Ensure tap targets are at least 44x44px\n2. Text readable without zoom (16px+ font)\n3. No horizontal scrolling\n4. Test on real mobile devices",
                "expected_improvement": "+5-8 UX points"
            },
            {
                "title": "Improve Navigation & Site Structure",
                "description": "Navigation structure could be clearer and more intuitive",
                "fix": "1. Simplify main menu (7±2 items max)\n2. Add breadcrumbs for deeper pages\n3. Ensure important pages within 3 clicks\n4. Add search functionality",
                "expected_improvement": "+3-5 UX points"
            },
            {
                "title": "Enhance Calls-to-Action",
                "description": "CTAs are not prominent or compelling enough",
                "fix": "1. Use contrasting colors for CTA buttons\n2. Action-oriented text (\"Get Started\" vs \"Submit\")\n3. Place CTAs above the fold\n4. A/B test different variations",
                "expected_improvement": "+3-5 UX points"
            }
        ]
    }
    
    fix_id = 1
    for category, score, name in score_categories:
        if score < 80:  # Include fixes for anything below 80
            impact = "critical" if score < 40 else "high" if score < 60 else "medium"
            effort = "low" if category in ['seo'] else "medium"
            for template in fix_templates.get(category, [])[:2]:
                critical_fixes.append({
                    "id": fix_id,
                    "title": template["title"],
                    "category": category,
                    "impact": impact,
                    "effort": effort,
                    "description": template["description"],
                    "fix": template["fix"],
                    "expected_improvement": template["expected_improvement"]
                })
                fix_id += 1
                if len(critical_fixes) >= 5:
                    break
        if len(critical_fixes) >= 5:
            break
    
    # Ensure we have at least 5 fixes
    while len(critical_fixes) < 5:
        for category, templates in fix_templates.items():
            for template in templates:
                exists = any(f["title"] == template["title"] for f in critical_fixes)
                if not exists:
                    critical_fixes.append({
                        "id": len(critical_fixes) + 1,
                        "title": template["title"],
                        "category": category,
                        "impact": "medium",
                        "effort": "medium",
                        "description": template["description"],
                        "fix": template["fix"],
                        "expected_improvement": template["expected_improvement"]
                    })
                if len(critical_fixes) >= 5:
                    break
            if len(critical_fixes) >= 5:
                break
    
    # Quick wins - fast improvements
    quick_wins = [
        {
            "id": 1,
            "title": "Add Missing Alt Tags to Images",
            "category": "seo",
            "time_to_implement": "1-2 hours",
            "description": "Add descriptive alt text to all images for accessibility and SEO",
            "action_steps": ["Audit all images for missing alt tags", "Write descriptive, keyword-relevant alt text", "Update HTML and test"],
            "expected_result": "Better image SEO and accessibility compliance"
        },
        {
            "id": 2,
            "title": "Optimize Page Title",
            "category": "seo",
            "time_to_implement": "30 minutes",
            "description": "Create a compelling, keyword-rich title under 60 characters",
            "action_steps": ["Research primary target keyword", "Write title with keyword near start", "Include brand name at end"],
            "expected_result": "Higher click-through rates from search results"
        },
        {
            "id": 3,
            "title": "Compress Hero Image",
            "category": "speed",
            "time_to_implement": "1 hour",
            "description": "Reduce hero/banner image file size without visible quality loss",
            "action_steps": ["Export hero image as WebP format", "Resize to exact display dimensions", "Test quality and load time"],
            "expected_result": "Faster initial page render and improved LCP score"
        },
        {
            "id": 4,
            "title": "Write Compelling Meta Description",
            "category": "seo",
            "time_to_implement": "30 minutes",
            "description": "Create meta description with keywords and clear call-to-action",
            "action_steps": ["Include primary keyword naturally", "Keep under 160 characters", "Add compelling CTA"],
            "expected_result": "Better SERP appearance and higher CTR"
        },
        {
            "id": 5,
            "title": "Fix Broken Links",
            "category": "ux",
            "time_to_implement": "1-2 hours",
            "description": "Identify and fix any broken internal or external links",
            "action_steps": ["Run a link checker tool", "Update or remove broken links", "Add 301 redirects for changed URLs"],
            "expected_result": "Better user experience and search engine crawlability"
        }
    ]
    
    # Calculate predicted improvements based on gaps
    seo_gap = abs(min(0, gaps.get('seo_score', 0)))
    speed_gap = abs(min(0, gaps.get('speed_score', 0)))
    content_gap = abs(min(0, gaps.get('content_score', 0)))
    
    seo_improvement = min(25, max(5, int(seo_gap * 0.7) + 5))
    speed_improvement = min(25, max(5, int(speed_gap * 0.7) + 5))
    content_improvement = min(20, max(5, int(content_gap * 0.7) + 5))
    overall_improvement = (seo_improvement + speed_improvement + content_improvement) // 3
    
    # Build competitor insights
    advantages = []
    improvements = []
    
    if gaps.get('seo_score', 0) > 0:
        advantages.append(f"SEO strength (+{gaps.get('seo_score', 0):.0f} points vs competitors)")
    else:
        improvements.append(f"SEO optimization (gap: {abs(gaps.get('seo_score', 0)):.0f} points)")
        
    if gaps.get('speed_score', 0) > 0:
        advantages.append(f"Page speed advantage (+{gaps.get('speed_score', 0):.0f} points)")
    else:
        improvements.append(f"Page speed (gap: {abs(gaps.get('speed_score', 0)):.0f} points)")
        
    if gaps.get('content_score', 0) > 0:
        advantages.append(f"Content quality (+{gaps.get('content_score', 0):.0f} points)")
    else:
        improvements.append(f"Content depth (gap: {abs(gaps.get('content_score', 0)):.0f} points)")
    
    if not advantages:
        advantages = ["Opportunity to differentiate with optimization", "First-mover advantage if you optimize quickly"]
    
    return {
        "overall_health": {
            "score": overall,
            "status": status,
            "summary": f"Your website scored {overall}/100. " + (
                "Critical issues need immediate attention to compete effectively." if status == "critical" else
                "Several optimization opportunities exist that could significantly improve your ranking." if status == "needs_work" else
                "Good performance overall with room for competitive improvement." if status == "good" else
                "Excellent performance! Focus on maintaining your competitive edge."
            )
        },
        "critical_fixes": critical_fixes[:5],
        "quick_wins": quick_wins,
        "seven_day_plan": [
            {"day": 1, "focus": "Technical Audit & Quick Wins", "tasks": ["Fix meta tags", "Add missing alt text", "Check mobile responsiveness"], "goal": "Complete technical SEO basics"},
            {"day": 2, "focus": "Speed Optimization", "tasks": ["Compress all images to WebP", "Enable browser caching", "Minify CSS/JS files"], "goal": "Reduce page load time by 30%"},
            {"day": 3, "focus": "Content Audit", "tasks": ["Analyze content vs competitors", "Identify keyword opportunities", "Plan content improvements"], "goal": "Content strategy defined"},
            {"day": 4, "focus": "On-Page SEO", "tasks": ["Optimize heading structure", "Add schema markup", "Improve internal linking"], "goal": "On-page optimization complete"},
            {"day": 5, "focus": "UX Improvements", "tasks": ["Test mobile experience", "Improve navigation flow", "Optimize CTA placement"], "goal": "Enhanced user experience"},
            {"day": 6, "focus": "Content Enhancement", "tasks": ["Expand key pages", "Add FAQ sections", "Include visual content"], "goal": "Content quality improved"},
            {"day": 7, "focus": "Review & Monitor", "tasks": ["Re-run analysis", "Document improvements", "Set up ongoing monitoring"], "goal": "Week 1 optimization complete, baseline established"}
        ],
        "thirty_day_strategy": {
            "week1": {
                "theme": "Foundation & Quick Wins",
                "objectives": ["Fix all critical technical issues", "Implement all quick wins", "Establish baseline metrics"],
                "expected_outcome": f"+{overall_improvement} points overall improvement"
            },
            "week2": {
                "theme": "Content Enhancement",
                "objectives": ["Expand thin content pages", "Optimize for target keywords", "Improve content readability"],
                "expected_outcome": "Higher content score and user engagement"
            },
            "week3": {
                "theme": "Competitive Differentiation",
                "objectives": ["Analyze top competitor strategies", "Create unique value content", "Build topical authority"],
                "expected_outcome": "Improved competitive positioning"
            },
            "week4": {
                "theme": "Scale & Sustain",
                "objectives": ["Document optimization processes", "Set up performance monitoring", "Plan ongoing content calendar"],
                "expected_outcome": "Sustainable growth framework established"
            }
        },
        "competitor_insights": {
            "your_advantages": advantages[:3],
            "areas_to_improve": improvements[:3] if improvements else ["Maintain current performance", "Focus on content freshness"],
            "outrank_strategy": f"Focus on closing the biggest gaps ({improvements[0] if improvements else 'content freshness'}) while amplifying your strengths. Consistent optimization over 30 days can improve your overall score by +{overall_improvement} points and increase organic traffic by {overall_improvement * 2}-{overall_improvement * 3}%."
        },
        "predicted_improvements": {
            "seo_score": f"+{seo_improvement}",
            "speed_score": f"+{speed_improvement}",
            "content_score": f"+{content_improvement}",
            "overall_score": f"+{overall_improvement}",
            "estimated_traffic_increase": f"{overall_improvement * 2}-{overall_improvement * 3}%"
        }
    }
