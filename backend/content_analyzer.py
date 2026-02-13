import logging
from typing import Dict, List, Any
from scraper import WebsiteScraper

logger = logging.getLogger(__name__)


async def analyze_content(url: str) -> Dict[str, Any]:
    """
    Comprehensive content analysis with AI enhancement suggestions
    """
    scraper = WebsiteScraper(url)
    if not scraper.fetch():
        raise ValueError(scraper.error_message or "Failed to fetch website")
    
    content_data = scraper.get_content_data()
    seo_data = scraper.get_seo_data()
    
    # Calculate score
    score = calculate_content_score(content_data)
    
    # Build metrics
    metrics = build_content_metrics(content_data)
    
    # Detect issues
    issues = detect_content_issues(content_data, seo_data)
    
    # Generate content ideas
    content_ideas = generate_content_ideas(seo_data, url)
    
    # Keyword analysis
    keyword_analysis = analyze_keywords(content_data, seo_data, url)
    
    word_count = content_data.get('word_count', 0)
    reading_time = max(1, word_count // 200)
    
    return {
        "url": scraper.url,
        "score": score,
        "word_count": word_count,
        "reading_time": reading_time,
        "metrics": metrics,
        "issues": issues,
        "content_ideas": content_ideas,
        "keyword_analysis": keyword_analysis
    }


def calculate_content_score(content_data: Dict[str, Any]) -> int:
    """Calculate overall content score"""
    score = 100
    
    # Word count
    word_count = content_data.get('word_count', 0)
    if word_count < 300:
        score -= 25
    elif word_count < 600:
        score -= 15
    elif word_count < 1000:
        score -= 5
    
    # Paragraphs
    paragraphs = content_data.get('paragraph_count', 0)
    if paragraphs < 3:
        score -= 15
    elif paragraphs < 5:
        score -= 5
    
    # Lists
    if not content_data.get('has_lists', False):
        score -= 5
    
    # Images
    if content_data.get('images_count', 0) == 0:
        score -= 10
    
    # FAQ detection (bonus)
    if content_data.get('has_faq', False):
        score += 5
    
    return max(0, min(100, score))


def build_content_metrics(content_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Build content metrics"""
    word_count = content_data.get('word_count', 0)
    paragraphs = content_data.get('paragraph_count', 0)
    
    # Estimate readability (simplified)
    avg_words_per_sentence = 15  # Assume average
    readability = "Good" if avg_words_per_sentence < 20 else "Fair"
    
    return [
        {
            "name": "Word Count",
            "value": f"{word_count}",
            "status": "good" if word_count >= 1000 else "fair" if word_count >= 500 else "poor",
            "description": f"{'Comprehensive' if word_count >= 1000 else 'Could be more detailed'}"
        },
        {
            "name": "Paragraphs",
            "value": f"{paragraphs}",
            "status": "good" if paragraphs >= 5 else "fair" if paragraphs >= 3 else "poor",
            "description": "Content structure"
        },
        {
            "name": "Readability",
            "value": readability,
            "status": "good" if readability == "Good" else "fair",
            "description": "Ease of reading"
        },
        {
            "name": "Has Lists",
            "value": "Yes" if content_data.get('has_lists', False) else "No",
            "status": "good" if content_data.get('has_lists', False) else "fair",
            "description": "Scannable content"
        }
    ]


def detect_content_issues(content_data: Dict[str, Any], seo_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Detect content issues with suggestions"""
    issues = []
    
    word_count = content_data.get('word_count', 0)
    paragraphs = content_data.get('paragraph_count', 0)
    
    # Thin content
    if word_count < 500:
        issues.append({
            "title": "Thin Content Detected",
            "description": f"Your page has only {word_count} words. Aim for at least 1,000 words for comprehensive coverage.",
            "severity": "high",
            "suggestion": f"Expand your content by adding: detailed explanations, examples, FAQs, case studies, or step-by-step guides. Target 1,000-2,000 words for better rankings."
        })
    elif word_count < 1000:
        issues.append({
            "title": "Content Could Be More Detailed",
            "description": f"Your page has {word_count} words. More comprehensive content often ranks better.",
            "severity": "medium",
            "suggestion": "Consider adding more depth: include FAQs, expand on subtopics, add real-world examples, or create a comparison section."
        })
    
    # Short paragraphs / structure
    if paragraphs < 5:
        issues.append({
            "title": "Limited Content Structure",
            "description": f"Only {paragraphs} paragraphs detected. More structured content improves readability.",
            "severity": "medium",
            "suggestion": "Break content into clear sections with descriptive H2/H3 headings. Use short paragraphs (2-3 sentences) for better readability."
        })
    
    # No lists
    if not content_data.get('has_lists', False):
        issues.append({
            "title": "No Lists Detected",
            "description": "Lists make content scannable and are favored by search engines for featured snippets.",
            "severity": "low",
            "suggestion": "Add bullet points or numbered lists to highlight key points. Example: 'Key benefits include: • Faster loading times • Better user experience • Improved conversions'"
        })
    
    # Heading structure
    h1_count = seo_data.get('h1_count', 0)
    h2_count = seo_data.get('h2_count', 0)
    
    if h2_count < 2:
        issues.append({
            "title": "Weak Heading Structure",
            "description": f"Only {h2_count} H2 headings found. Proper headings improve SEO and readability.",
            "severity": "medium",
            "suggestion": "Add H2 subheadings to break up content. Each major section should have its own H2. Use H3 for subsections within H2s."
        })
    
    # No FAQ
    if not content_data.get('has_faq', False):
        issues.append({
            "title": "No FAQ Section",
            "description": "FAQ sections can help capture featured snippets and voice search queries.",
            "severity": "low",
            "suggestion": "Add an FAQ section with 3-5 common questions. Format: Q: [Question]? A: [Concise answer in 1-2 sentences]"
        })
    
    return issues


def generate_content_ideas(seo_data: Dict[str, Any], url: str) -> List[Dict[str, Any]]:
    """Generate content ideas based on the website"""
    domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    title = seo_data.get('title', domain)
    
    # Extract keywords from title
    words = title.lower().replace('-', ' ').replace('|', ' ').split()
    keywords = [w for w in words if len(w) > 3 and w not in ['the', 'and', 'for', 'with', 'your', 'that', 'this', 'from']][:3]
    
    base_topic = keywords[0] if keywords else domain.split('.')[0]
    
    ideas = [
        {
            "title": f"The Complete Guide to {base_topic.title()} in 2025",
            "description": "Comprehensive guide covering everything from basics to advanced strategies.",
            "keywords": [base_topic, f"{base_topic} guide", f"{base_topic} tips"]
        },
        {
            "title": f"{base_topic.title()} vs Competitors: Detailed Comparison",
            "description": "Compare top options in the market with pros, cons, and recommendations.",
            "keywords": [f"{base_topic} comparison", f"best {base_topic}", f"{base_topic} alternatives"]
        },
        {
            "title": f"10 Common {base_topic.title()} Mistakes and How to Avoid Them",
            "description": "Help your audience avoid common pitfalls with actionable advice.",
            "keywords": [f"{base_topic} mistakes", f"{base_topic} errors", f"{base_topic} tips"]
        }
    ]
    
    return ideas


def analyze_keywords(content_data: Dict[str, Any], seo_data: Dict[str, Any], url: str) -> Dict[str, Any]:
    """Analyze and suggest keywords"""
    domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    title = seo_data.get('title', '')
    description = seo_data.get('meta_description', '')
    h1_texts = seo_data.get('h1_texts', [])
    
    # Extract detected keywords
    all_text = f"{title} {description} {' '.join(h1_texts)}".lower()
    words = all_text.replace('-', ' ').replace('|', ' ').split()
    
    # Filter common words
    stop_words = {'the', 'and', 'for', 'with', 'your', 'that', 'this', 'from', 'have', 'are', 'was', 'were', 'been', 'being', 'will'}
    detected = [w for w in words if len(w) > 3 and w not in stop_words]
    
    # Get unique keywords (most frequent)
    from collections import Counter
    keyword_counts = Counter(detected)
    top_keywords = [kw for kw, count in keyword_counts.most_common(6)]
    
    # Generate suggested keywords
    base = domain.split('.')[0]
    suggested = [
        f"{base} guide",
        f"best {base}",
        f"{base} tips",
        f"how to {base}",
        f"{base} 2025",
        f"{base} for beginners"
    ]
    
    return {
        "detected": top_keywords[:6],
        "suggested": suggested[:6]
    }
