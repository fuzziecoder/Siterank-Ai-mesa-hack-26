import logging
from typing import Dict, List, Any
from scraper import WebsiteScraper

logger = logging.getLogger(__name__)


async def analyze_speed(url: str) -> Dict[str, Any]:
    """
    Comprehensive speed analysis with optimization recommendations
    """
    scraper = WebsiteScraper(url)
    if not scraper.fetch():
        raise ValueError(scraper.error_message or "Failed to fetch website")
    
    speed_data = scraper.get_speed_data()
    
    # Calculate score
    score = calculate_speed_score(speed_data)
    
    # Build metrics
    metrics = build_metrics(speed_data)
    
    # Detect issues
    issues = detect_speed_issues(speed_data)
    
    # Image analysis
    image_analysis = analyze_images(speed_data)
    
    # Resource analysis
    resource_analysis = analyze_resources(speed_data)
    
    return {
        "url": scraper.url,
        "score": score,
        "load_time": round(speed_data.get('load_time', 0), 2),
        "page_size_kb": speed_data.get('page_size_kb', 0),
        "metrics": metrics,
        "issues": issues,
        "image_analysis": image_analysis,
        "resource_analysis": resource_analysis
    }


def calculate_speed_score(speed_data: Dict[str, Any]) -> int:
    """Calculate overall speed score"""
    score = 100
    
    # Load time scoring
    load_time = speed_data.get('load_time', 5)
    if load_time > 5:
        score -= 30
    elif load_time > 3:
        score -= 15
    elif load_time > 2:
        score -= 5
    
    # Page size scoring
    page_size = speed_data.get('page_size_kb', 3000)
    if page_size > 3000:
        score -= 20
    elif page_size > 2000:
        score -= 10
    elif page_size > 1000:
        score -= 5
    
    # Resource count
    total_requests = speed_data.get('total_requests', 50)
    if total_requests > 80:
        score -= 15
    elif total_requests > 50:
        score -= 10
    elif total_requests > 30:
        score -= 5
    
    # Compression
    if not speed_data.get('has_compression', False):
        score -= 10
    
    # Images
    if speed_data.get('images_count', 0) > 20:
        score -= 5
    
    return max(0, score)


def build_metrics(speed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Build performance metrics with thresholds"""
    load_time = speed_data.get('load_time', 3)
    page_size = speed_data.get('page_size_kb', 1500)
    requests = speed_data.get('total_requests', 40)
    
    # Estimate TTFB (usually 10-30% of load time)
    ttfb = round(load_time * 0.2, 2)
    
    # Estimate LCP (usually 50-70% of load time)
    lcp = round(load_time * 0.6, 2)
    
    return [
        {
            "name": "Load Time",
            "value": round(load_time, 2),
            "unit": "s",
            "description": "Total page load time",
            "thresholds": {"good": 2.5, "fair": 4.0}
        },
        {
            "name": "Page Size",
            "value": page_size,
            "unit": "KB",
            "description": "Total page weight",
            "thresholds": {"good": 1500, "fair": 3000}
        },
        {
            "name": "Requests",
            "value": requests,
            "unit": "",
            "description": "HTTP requests",
            "thresholds": {"good": 40, "fair": 70}
        },
        {
            "name": "Est. LCP",
            "value": lcp,
            "unit": "s",
            "description": "Largest Contentful Paint",
            "thresholds": {"good": 2.5, "fair": 4.0}
        }
    ]


def detect_speed_issues(speed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Detect speed issues with recommendations"""
    issues = []
    
    load_time = speed_data.get('load_time', 0)
    page_size = speed_data.get('page_size_kb', 0)
    total_requests = speed_data.get('total_requests', 0)
    has_compression = speed_data.get('has_compression', False)
    css_files = speed_data.get('css_stylesheets', 0)
    js_files = speed_data.get('js_scripts', 0)
    
    # Slow load time
    if load_time > 3:
        issues.append({
            "title": "Slow Page Load Time",
            "description": f"Your page takes {load_time:.1f}s to load. Aim for under 3 seconds.",
            "impact": "high",
            "savings": f"{(load_time - 2.5):.1f}s potential",
            "fix": "Optimize images, enable caching, minify resources, and consider a CDN.",
            "code": None
        })
    
    # Large page size
    if page_size > 2000:
        issues.append({
            "title": "Large Page Size",
            "description": f"Your page is {page_size}KB. Aim for under 2MB for optimal performance.",
            "impact": "high",
            "savings": f"{page_size - 1500}KB potential",
            "fix": "Compress images (use WebP), minify CSS/JS, remove unused code.",
            "code": None
        })
    
    # No compression
    if not has_compression:
        issues.append({
            "title": "Compression Not Enabled",
            "description": "Gzip/Brotli compression is not detected. This can reduce transfer size by 70-90%.",
            "impact": "high",
            "savings": "60-90% smaller files",
            "fix": "Enable Gzip or Brotli compression on your server.",
            "code": """# Apache (.htaccess)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Nginx
gzip on;
gzip_types text/plain text/css application/javascript;"""
        })
    
    # Too many requests
    if total_requests > 50:
        issues.append({
            "title": "Too Many HTTP Requests",
            "description": f"Your page makes {total_requests} requests. Reducing this improves load time.",
            "impact": "medium",
            "savings": f"Reduce by {total_requests - 40} requests",
            "fix": "Bundle CSS/JS files, use CSS sprites, lazy load images below the fold.",
            "code": None
        })
    
    # Multiple CSS files
    if css_files > 3:
        issues.append({
            "title": "Multiple CSS Files",
            "description": f"{css_files} CSS files detected. Consider bundling them.",
            "impact": "medium",
            "savings": f"{css_files - 1} fewer requests",
            "fix": "Bundle CSS files into a single minified file, or use critical CSS inline.",
            "code": '<link rel="stylesheet" href="bundle.min.css">'
        })
    
    # Multiple JS files
    if js_files > 5:
        issues.append({
            "title": "Multiple JavaScript Files",
            "description": f"{js_files} JavaScript files detected. Consider bundling and deferring.",
            "impact": "medium",
            "savings": f"{js_files - 2} fewer requests",
            "fix": "Bundle scripts and use defer/async attributes for non-critical scripts.",
            "code": '<script src="bundle.min.js" defer></script>'
        })
    
    # Recommend lazy loading
    images_count = speed_data.get('images_count', 0)
    if images_count > 5:
        issues.append({
            "title": "Consider Lazy Loading Images",
            "description": f"{images_count} images detected. Lazy loading below-fold images improves initial load.",
            "impact": "medium" if images_count < 15 else "high",
            "savings": "Faster initial render",
            "fix": "Add loading='lazy' to images that are below the fold.",
            "code": '<img src="image.jpg" alt="Description" loading="lazy">'
        })
    
    # Browser caching
    issues.append({
        "title": "Enable Browser Caching",
        "description": "Ensure static assets are cached by browsers for returning visitors.",
        "impact": "medium",
        "savings": "Faster repeat visits",
        "fix": "Set appropriate Cache-Control headers for static assets.",
        "code": """# Cache for 1 year (versioned assets)
Cache-Control: public, max-age=31536000

# Cache for 1 week (non-versioned)
Cache-Control: public, max-age=604800"""
    })
    
    return issues


def analyze_images(speed_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze image optimization opportunities"""
    images_count = speed_data.get('images_count', 0)
    # Estimate image size as 60% of page size
    page_size = speed_data.get('page_size_kb', 1000)
    estimated_image_size = int(page_size * 0.6)
    
    # Estimate potential savings (usually 40-60% possible)
    potential_savings = int(estimated_image_size * 0.5)
    
    recommendations = []
    
    if images_count > 0:
        recommendations.append(f"Convert {images_count} images to WebP format for 25-35% smaller files.")
    
    if estimated_image_size > 500:
        recommendations.append("Resize images to their display dimensions - don't serve larger images than needed.")
    
    recommendations.append("Use responsive images with srcset to serve appropriate sizes for each device.")
    recommendations.append("Implement lazy loading for images below the fold.")
    
    if images_count > 10:
        recommendations.append("Consider using a CDN with automatic image optimization.")
    
    return {
        "total_images": images_count,
        "total_size_kb": estimated_image_size,
        "potential_savings_kb": potential_savings,
        "recommendations": recommendations
    }


def analyze_resources(speed_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze CSS, JS, and other resources"""
    return {
        "css_files": speed_data.get('css_stylesheets', 0),
        "js_files": speed_data.get('js_scripts', 0),
        "total_requests": speed_data.get('total_requests', 0),
        "has_compression": speed_data.get('has_compression', False)
    }
