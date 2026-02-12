from typing import Dict, Any, List
from models import WebsiteScore, CompetitorData
import logging

logger = logging.getLogger(__name__)


class WebsiteAnalyzer:
    """Analyzes website data and calculates scores"""
    
    # Scoring weights
    WEIGHTS = {
        'seo': 0.30,
        'speed': 0.20,
        'content': 0.30,
        'ux': 0.20
    }
    
    def calculate_seo_score(self, data: Dict[str, Any]) -> int:
        """Calculate SEO score (0-100)"""
        if not data:
            return 0
        
        score = 0
        max_score = 100
        
        # Title (15 points)
        title_len = data.get('title_length', 0)
        if 30 <= title_len <= 60:
            score += 15
        elif 20 <= title_len <= 70:
            score += 10
        elif title_len > 0:
            score += 5
        
        # Meta description (15 points)
        desc_len = data.get('meta_description_length', 0)
        if 120 <= desc_len <= 160:
            score += 15
        elif 80 <= desc_len <= 200:
            score += 10
        elif desc_len > 0:
            score += 5
        
        # H1 tags (10 points)
        h1_count = data.get('h1_count', 0)
        if h1_count == 1:
            score += 10
        elif h1_count > 1:
            score += 5
        
        # H2 tags (5 points)
        if data.get('h2_count', 0) >= 2:
            score += 5
        elif data.get('h2_count', 0) >= 1:
            score += 3
        
        # Canonical URL (5 points)
        if data.get('canonical_url'):
            score += 5
        
        # Robots meta (5 points)
        if data.get('has_robots_meta'):
            score += 5
        
        # Open Graph tags (10 points)
        og_tags = data.get('og_tags', {})
        if len(og_tags) >= 4:
            score += 10
        elif len(og_tags) >= 2:
            score += 5
        
        # Links (10 points)
        internal = data.get('internal_links', 0)
        external = data.get('external_links', 0)
        if internal >= 5:
            score += 5
        if external >= 1:
            score += 5
        
        # Image alt ratio (15 points)
        alt_ratio = data.get('image_alt_ratio', 0)
        if alt_ratio >= 90:
            score += 15
        elif alt_ratio >= 70:
            score += 10
        elif alt_ratio >= 50:
            score += 5
        
        # Structured data (10 points)
        if data.get('structured_data'):
            score += 10
        
        return min(max_score, score)
    
    def calculate_speed_score(self, data: Dict[str, Any]) -> int:
        """Calculate speed score (0-100)"""
        if not data:
            return 0
        
        score = 0
        
        # Load time (40 points)
        load_time = data.get('load_time', 10)
        if load_time < 1:
            score += 40
        elif load_time < 2:
            score += 35
        elif load_time < 3:
            score += 25
        elif load_time < 5:
            score += 15
        elif load_time < 8:
            score += 5
        
        # Page size (20 points)
        size_kb = data.get('page_size_kb', 1000)
        if size_kb < 500:
            score += 20
        elif size_kb < 1000:
            score += 15
        elif size_kb < 2000:
            score += 10
        elif size_kb < 5000:
            score += 5
        
        # Number of resources (15 points)
        css_count = data.get('css_files', 0)
        js_count = data.get('js_files', 0)
        total_files = css_count + js_count
        if total_files < 5:
            score += 15
        elif total_files < 10:
            score += 10
        elif total_files < 20:
            score += 5
        
        # Compression (15 points)
        if data.get('has_compression'):
            score += 15
        
        # Caching (10 points)
        if data.get('has_caching'):
            score += 10
        
        return min(100, score)
    
    def calculate_content_score(self, data: Dict[str, Any]) -> int:
        """Calculate content score (0-100)"""
        if not data:
            return 0
        
        score = 0
        
        # Word count (30 points)
        word_count = data.get('word_count', 0)
        if word_count >= 1000:
            score += 30
        elif word_count >= 500:
            score += 25
        elif word_count >= 300:
            score += 20
        elif word_count >= 100:
            score += 10
        
        # Unique words ratio (15 points)
        unique = data.get('unique_words', 0)
        if word_count > 0:
            ratio = unique / word_count
            if ratio >= 0.4:
                score += 15
            elif ratio >= 0.3:
                score += 10
            elif ratio >= 0.2:
                score += 5
        
        # Paragraphs (15 points)
        para_count = data.get('paragraph_count', 0)
        if para_count >= 10:
            score += 15
        elif para_count >= 5:
            score += 10
        elif para_count >= 2:
            score += 5
        
        # Average paragraph length (10 points)
        avg_len = data.get('avg_paragraph_length', 0)
        if 20 <= avg_len <= 50:
            score += 10
        elif 10 <= avg_len <= 80:
            score += 5
        
        # Blog presence (15 points)
        if data.get('has_blog'):
            score += 15
        
        # FAQ presence (10 points)
        if data.get('has_faq'):
            score += 10
        
        # Content to code ratio (5 points)
        ratio = data.get('content_to_code_ratio', 0)
        if ratio >= 20:
            score += 5
        elif ratio >= 10:
            score += 3
        
        return min(100, score)
    
    def calculate_ux_score(self, data: Dict[str, Any]) -> int:
        """Calculate UX score (0-100)"""
        if not data:
            return 0
        
        score = 0
        
        # Mobile viewport (20 points)
        if data.get('has_viewport_meta'):
            score += 20
        
        # Favicon (5 points)
        if data.get('has_favicon'):
            score += 5
        
        # Navigation (15 points)
        nav_count = data.get('navigation_elements', 0)
        if nav_count >= 1:
            score += 15
        
        # Search functionality (10 points)
        if data.get('has_search'):
            score += 10
        
        # Social links (5 points)
        if data.get('has_social_links'):
            score += 5
        
        # Contact info (10 points)
        if data.get('has_contact_info'):
            score += 10
        
        # Forms/CTAs (10 points)
        if data.get('form_count', 0) >= 1 or data.get('button_count', 0) >= 2:
            score += 10
        
        # Mobile-friendly indicators (15 points)
        mobile_score = data.get('mobile_friendly_indicators', 0)
        score += int(mobile_score * 0.15)
        
        # Accessibility (10 points)
        accessibility = data.get('accessibility_score', 0)
        score += int(accessibility * 0.1)
        
        return min(100, score)
    
    def calculate_overall_score(self, seo: int, speed: int, content: int, ux: int) -> int:
        """Calculate weighted overall score"""
        return int(
            seo * self.WEIGHTS['seo'] +
            speed * self.WEIGHTS['speed'] +
            content * self.WEIGHTS['content'] +
            ux * self.WEIGHTS['ux']
        )
    
    def analyze_website(self, scraped_data: Dict[str, Any]) -> WebsiteScore:
        """Analyze scraped website data and return scores"""
        seo_score = self.calculate_seo_score(scraped_data.get('seo', {}))
        speed_score = self.calculate_speed_score(scraped_data.get('speed', {}))
        content_score = self.calculate_content_score(scraped_data.get('content', {}))
        ux_score = self.calculate_ux_score(scraped_data.get('ux', {}))
        overall_score = self.calculate_overall_score(seo_score, speed_score, content_score, ux_score)
        
        return WebsiteScore(
            seo_score=seo_score,
            speed_score=speed_score,
            content_score=content_score,
            ux_score=ux_score,
            overall_score=overall_score,
            seo_details=scraped_data.get('seo', {}),
            speed_details=scraped_data.get('speed', {}),
            content_details=scraped_data.get('content', {}),
            ux_details=scraped_data.get('ux', {})
        )
    
    def compare_websites(self, user_scores: WebsiteScore, competitor_scores: List[WebsiteScore]) -> Dict[str, Any]:
        """Compare user website with competitors"""
        comparison = {
            'user_rank': 1,
            'total_sites': len(competitor_scores) + 1,
            'strengths': [],
            'weaknesses': [],
            'opportunities': []
        }
        
        # Calculate average competitor scores
        if competitor_scores:
            avg_seo = sum(c.seo_score for c in competitor_scores) / len(competitor_scores)
            avg_speed = sum(c.speed_score for c in competitor_scores) / len(competitor_scores)
            avg_content = sum(c.content_score for c in competitor_scores) / len(competitor_scores)
            avg_ux = sum(c.ux_score for c in competitor_scores) / len(competitor_scores)
            avg_overall = sum(c.overall_score for c in competitor_scores) / len(competitor_scores)
            
            # Determine rank
            all_overall = [user_scores.overall_score] + [c.overall_score for c in competitor_scores]
            all_overall.sort(reverse=True)
            comparison['user_rank'] = all_overall.index(user_scores.overall_score) + 1
            
            # Identify strengths (user is 10+ points above average)
            if user_scores.seo_score > avg_seo + 10:
                comparison['strengths'].append('SEO optimization')
            if user_scores.speed_score > avg_speed + 10:
                comparison['strengths'].append('Page speed')
            if user_scores.content_score > avg_content + 10:
                comparison['strengths'].append('Content quality')
            if user_scores.ux_score > avg_ux + 10:
                comparison['strengths'].append('User experience')
            
            # Identify weaknesses (user is 10+ points below average)
            if user_scores.seo_score < avg_seo - 10:
                comparison['weaknesses'].append({'area': 'SEO', 'gap': round(avg_seo - user_scores.seo_score)})
            if user_scores.speed_score < avg_speed - 10:
                comparison['weaknesses'].append({'area': 'Speed', 'gap': round(avg_speed - user_scores.speed_score)})
            if user_scores.content_score < avg_content - 10:
                comparison['weaknesses'].append({'area': 'Content', 'gap': round(avg_content - user_scores.content_score)})
            if user_scores.ux_score < avg_ux - 10:
                comparison['weaknesses'].append({'area': 'UX', 'gap': round(avg_ux - user_scores.ux_score)})
            
            # Opportunities (areas where user is close to average but could improve)
            if avg_seo - 10 <= user_scores.seo_score <= avg_seo + 10:
                comparison['opportunities'].append('SEO - small improvements can differentiate you')
            if avg_content - 10 <= user_scores.content_score <= avg_content + 10:
                comparison['opportunities'].append('Content - enhance to stand out')
        
        return comparison


def analyze_scraped_data(scraped_data: Dict[str, Any]) -> WebsiteScore:
    """Convenience function to analyze scraped data"""
    analyzer = WebsiteAnalyzer()
    return analyzer.analyze_website(scraped_data)


def compare_all(user_scores: WebsiteScore, competitor_scores: List[WebsiteScore]) -> Dict[str, Any]:
    """Convenience function to compare websites"""
    analyzer = WebsiteAnalyzer()
    return analyzer.compare_websites(user_scores, competitor_scores)
