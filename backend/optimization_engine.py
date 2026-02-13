import os
import logging
from typing import Dict, List, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        logger.error("EMERGENT_LLM_KEY not found")
        return get_fallback_blueprint(user_scores)
    
    # Calculate competitor averages
    comp_avg = calculate_competitor_averages(competitors)
    
    # Identify gaps
    gaps = identify_gaps(user_scores, comp_avg)
    
    # Build context for AI
    context = build_analysis_context(user_url, user_scores, competitors, gaps, scraped_data)
    
    prompt = f"""You are an expert website optimization consultant. Analyze this website data and generate a comprehensive optimization blueprint.

{context}

Generate an optimization blueprint with the following structure (respond in valid JSON only):

{{
  "overall_health": {{
    "score": <0-100>,
    "status": "<critical/needs_work/good/excellent>",
    "summary": "<2-3 sentence overview>"
  }},
  "critical_fixes": [
    {{
      "id": 1,
      "title": "<fix title>",
      "category": "<seo/speed/content/ux>",
      "impact": "<high/critical>",
      "effort": "<low/medium/high>",
      "description": "<what's wrong>",
      "fix": "<exact fix with code/text if applicable>",
      "expected_improvement": "<specific metric improvement>"
    }}
  ],
  "quick_wins": [
    {{
      "id": 1,
      "title": "<action title>",
      "category": "<seo/speed/content/ux>",
      "time_to_implement": "<hours>",
      "description": "<brief description>",
      "action_steps": ["<step 1>", "<step 2>"],
      "expected_result": "<what will improve>"
    }}
  ],
  "seven_day_plan": [
    {{
      "day": 1,
      "focus": "<area>",
      "tasks": ["<task 1>", "<task 2>"],
      "goal": "<daily goal>"
    }}
  ],
  "thirty_day_strategy": {{
    "week1": {{
      "theme": "<focus theme>",
      "objectives": ["<obj 1>", "<obj 2>"],
      "expected_outcome": "<outcome>"
    }},
    "week2": {{
      "theme": "<focus theme>",
      "objectives": ["<obj 1>", "<obj 2>"],
      "expected_outcome": "<outcome>"
    }},
    "week3": {{
      "theme": "<focus theme>",
      "objectives": ["<obj 1>", "<obj 2>"],
      "expected_outcome": "<outcome>"
    }},
    "week4": {{
      "theme": "<focus theme>",
      "objectives": ["<obj 1>", "<obj 2>"],
      "expected_outcome": "<outcome>"
    }}
  }},
  "competitor_insights": {{
    "your_advantages": ["<advantage 1>", "<advantage 2>"],
    "areas_to_improve": ["<area 1>", "<area 2>"],
    "outrank_strategy": "<strategy to outrank competitors>"
  }},
  "predicted_improvements": {{
    "seo_score": "+<points>",
    "speed_score": "+<points>",
    "content_score": "+<points>",
    "overall_score": "+<points>",
    "estimated_traffic_increase": "<percentage>%"
  }}
}}

IMPORTANT:
- Provide 5 critical fixes ordered by impact
- Provide 5 quick wins that can be done in 24 hours
- Make the 7-day plan actionable and specific
- Base all recommendations on the actual data provided
- Include specific code snippets or text where applicable
- Return ONLY valid JSON, no markdown or explanations"""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"optimize_{user_url}",
            system_message="You are an expert website optimization consultant. Always respond with valid JSON only."
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON response
        import json
        import re
        
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            blueprint = json.loads(json_match.group())
            return blueprint
        
        return get_fallback_blueprint(user_scores)
        
    except Exception as e:
        logger.error(f"Error generating optimization blueprint: {str(e)}")
        return get_fallback_blueprint(user_scores)


def calculate_competitor_averages(competitors: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculate average scores across competitors"""
    if not competitors:
        return {}
    
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
                totals[key] += scores.get(key, 0)
    
    if count > 0:
        return {k: round(v / count, 1) for k, v in totals.items()}
    return totals


def identify_gaps(user_scores: Dict[str, Any], comp_avg: Dict[str, float]) -> Dict[str, float]:
    """Identify score gaps between user and competitors"""
    gaps = {}
    for key in ['seo_score', 'speed_score', 'content_score', 'ux_score', 'overall_score']:
        user_val = user_scores.get(key, 0)
        comp_val = comp_avg.get(key, 0)
        gaps[key] = round(comp_val - user_val, 1)
    return gaps


def build_analysis_context(
    user_url: str,
    user_scores: Dict[str, Any],
    competitors: List[Dict[str, Any]],
    gaps: Dict[str, float],
    scraped_data: Dict[str, Any] = None
) -> str:
    """Build context string for AI analysis"""
    context = f"""
WEBSITE BEING ANALYZED: {user_url}

YOUR CURRENT SCORES:
- Overall Score: {user_scores.get('overall_score', 0)}/100
- SEO Score: {user_scores.get('seo_score', 0)}/100
- Speed Score: {user_scores.get('speed_score', 0)}/100
- Content Score: {user_scores.get('content_score', 0)}/100
- UX Score: {user_scores.get('ux_score', 0)}/100

COMPETITOR ANALYSIS:
"""
    
    for i, comp in enumerate(competitors[:5], 1):
        scores = comp.get('scores', {})
        context += f"""
Competitor {i}: {comp.get('url', 'Unknown')}
- Overall: {scores.get('overall_score', 0)}/100
- SEO: {scores.get('seo_score', 0)}/100
- Speed: {scores.get('speed_score', 0)}/100
- Content: {scores.get('content_score', 0)}/100
- UX: {scores.get('ux_score', 0)}/100
"""

    context += f"""
SCORE GAPS (negative means you're behind):
- SEO Gap: {gaps.get('seo_score', 0)} points
- Speed Gap: {gaps.get('speed_score', 0)} points
- Content Gap: {gaps.get('content_score', 0)} points
- UX Gap: {gaps.get('ux_score', 0)} points
- Overall Gap: {gaps.get('overall_score', 0)} points
"""

    if scraped_data:
        seo_data = scraped_data.get('seo', {})
        context += f"""
DETECTED ISSUES:
- Title: {seo_data.get('title', 'Missing')[:60]}
- Meta Description: {'Present' if seo_data.get('meta_description') else 'Missing'}
- H1 Count: {seo_data.get('h1_count', 0)}
- Total Headings: {seo_data.get('heading_count', 0)}
- Images without Alt: {seo_data.get('images_without_alt', 0)}
- Internal Links: {seo_data.get('internal_links', 0)}
- External Links: {seo_data.get('external_links', 0)}
- Page Size: {scraped_data.get('speed', {}).get('page_size_kb', 0)}KB
- Load Time: {scraped_data.get('speed', {}).get('load_time', 0)}s
- Word Count: {scraped_data.get('content', {}).get('word_count', 0)}
"""

    return context


def get_fallback_blueprint(user_scores: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a basic blueprint when AI fails"""
    overall = user_scores.get('overall_score', 50)
    
    status = "critical" if overall < 40 else "needs_work" if overall < 60 else "good" if overall < 80 else "excellent"
    
    return {
        "overall_health": {
            "score": overall,
            "status": status,
            "summary": f"Your website scored {overall}/100. There are optimization opportunities to improve your competitive position."
        },
        "critical_fixes": [
            {
                "id": 1,
                "title": "Optimize Meta Tags",
                "category": "seo",
                "impact": "high",
                "effort": "low",
                "description": "Meta tags need optimization for better search visibility",
                "fix": "Add unique, keyword-rich title (50-60 chars) and meta description (150-160 chars)",
                "expected_improvement": "+5-10 SEO points"
            },
            {
                "id": 2,
                "title": "Improve Page Speed",
                "category": "speed",
                "impact": "high",
                "effort": "medium",
                "description": "Page load time affects user experience and rankings",
                "fix": "Compress images, enable caching, minify CSS/JS",
                "expected_improvement": "+10-15 Speed points"
            },
            {
                "id": 3,
                "title": "Enhance Content Quality",
                "category": "content",
                "impact": "high",
                "effort": "high",
                "description": "Content needs to be more comprehensive",
                "fix": "Add more detailed content with relevant keywords",
                "expected_improvement": "+5-10 Content points"
            },
            {
                "id": 4,
                "title": "Add Structured Data",
                "category": "seo",
                "impact": "medium",
                "effort": "low",
                "description": "Structured data helps search engines understand your content",
                "fix": "Implement JSON-LD schema markup",
                "expected_improvement": "+3-5 SEO points"
            },
            {
                "id": 5,
                "title": "Improve Mobile Experience",
                "category": "ux",
                "impact": "high",
                "effort": "medium",
                "description": "Mobile optimization is crucial for rankings",
                "fix": "Ensure responsive design and touch-friendly elements",
                "expected_improvement": "+5-8 UX points"
            }
        ],
        "quick_wins": [
            {
                "id": 1,
                "title": "Add Missing Alt Tags",
                "category": "seo",
                "time_to_implement": "1-2 hours",
                "description": "Add descriptive alt text to all images",
                "action_steps": ["Identify images without alt tags", "Write descriptive alt text", "Update HTML"],
                "expected_result": "Better image SEO and accessibility"
            },
            {
                "id": 2,
                "title": "Optimize Title Tags",
                "category": "seo",
                "time_to_implement": "30 minutes",
                "description": "Create compelling, keyword-rich titles",
                "action_steps": ["Research target keywords", "Write unique titles under 60 chars", "Include brand name"],
                "expected_result": "Higher click-through rates"
            },
            {
                "id": 3,
                "title": "Compress Images",
                "category": "speed",
                "time_to_implement": "1-2 hours",
                "description": "Reduce image file sizes without quality loss",
                "action_steps": ["Use WebP format", "Resize to display dimensions", "Use compression tools"],
                "expected_result": "Faster page loads"
            },
            {
                "id": 4,
                "title": "Add Meta Descriptions",
                "category": "seo",
                "time_to_implement": "1 hour",
                "description": "Write compelling meta descriptions for all pages",
                "action_steps": ["List pages without descriptions", "Write 150-160 char descriptions", "Include call-to-action"],
                "expected_result": "Better SERP appearance"
            },
            {
                "id": 5,
                "title": "Fix Broken Links",
                "category": "ux",
                "time_to_implement": "1-2 hours",
                "description": "Find and fix any broken internal or external links",
                "action_steps": ["Run link checker", "Update or remove broken links", "Add redirects if needed"],
                "expected_result": "Better user experience and crawlability"
            }
        ],
        "seven_day_plan": [
            {"day": 1, "focus": "SEO Audit", "tasks": ["Fix meta tags", "Add alt text", "Check headings"], "goal": "Complete on-page SEO basics"},
            {"day": 2, "focus": "Speed Optimization", "tasks": ["Compress images", "Enable caching", "Minify code"], "goal": "Reduce load time by 30%"},
            {"day": 3, "focus": "Content Review", "tasks": ["Audit content quality", "Identify gaps", "Plan improvements"], "goal": "Content strategy defined"},
            {"day": 4, "focus": "Technical SEO", "tasks": ["Add schema markup", "Fix crawl errors", "Update sitemap"], "goal": "Technical foundation solid"},
            {"day": 5, "focus": "UX Improvements", "tasks": ["Mobile testing", "Navigation review", "CTA optimization"], "goal": "Better user experience"},
            {"day": 6, "focus": "Content Creation", "tasks": ["Write new content", "Optimize existing pages", "Add internal links"], "goal": "Content enhanced"},
            {"day": 7, "focus": "Review & Plan", "tasks": ["Measure improvements", "Document changes", "Plan next steps"], "goal": "Week 1 complete"}
        ],
        "thirty_day_strategy": {
            "week1": {
                "theme": "Foundation & Quick Wins",
                "objectives": ["Complete technical SEO audit", "Fix all critical issues", "Optimize page speed"],
                "expected_outcome": "+10-15 overall score improvement"
            },
            "week2": {
                "theme": "Content Enhancement",
                "objectives": ["Improve existing content", "Add new valuable content", "Optimize for target keywords"],
                "expected_outcome": "Better content score and engagement"
            },
            "week3": {
                "theme": "Competitor Analysis",
                "objectives": ["Deep dive into competitor strategies", "Identify differentiation opportunities", "Implement competitive advantages"],
                "expected_outcome": "Competitive positioning improved"
            },
            "week4": {
                "theme": "Scale & Monitor",
                "objectives": ["Scale successful optimizations", "Set up monitoring", "Plan ongoing strategy"],
                "expected_outcome": "Sustainable growth framework"
            }
        },
        "competitor_insights": {
            "your_advantages": ["Unique value proposition", "Brand recognition"],
            "areas_to_improve": ["Content depth", "Page speed", "SEO optimization"],
            "outrank_strategy": "Focus on creating more comprehensive content and improving technical performance to close the gap with competitors."
        },
        "predicted_improvements": {
            "seo_score": "+15",
            "speed_score": "+20",
            "content_score": "+10",
            "overall_score": "+15",
            "estimated_traffic_increase": "25-40%"
        }
    }
