import os
import logging
from typing import List, Dict, Any
from urllib.parse import urlparse
import re

logger = logging.getLogger(__name__)


async def detect_competitors(user_site_url: str, industry_hint: str = "") -> List[str]:
    """
    Use AI to detect top 5 relevant competitors for a given website
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        logger.error("EMERGENT_LLM_KEY not found")
        return []
    
    # Extract domain for better context
    try:
        parsed = urlparse(user_site_url if user_site_url.startswith('http') else f'https://{user_site_url}')
        domain = parsed.netloc.replace('www.', '')
    except:
        domain = user_site_url
    
    prompt = f"""Analyze the website "{domain}" and identify its TOP 5 direct competitors.

Context:
- Website URL: {user_site_url}
- Industry hint: {industry_hint if industry_hint else "Not specified - please infer from the domain"}

Requirements:
1. Identify 5 REAL, currently active competitor websites
2. Focus on direct competitors in the same industry/niche
3. Consider market position, target audience, and service offerings
4. Only include legitimate business websites (no aggregators or directories)
5. Prefer well-known competitors that would be meaningful to compare against

Return ONLY a JSON array of 5 competitor domain names, nothing else.
Example format: ["competitor1.com", "competitor2.com", "competitor3.com", "competitor4.com", "competitor5.com"]

Important: Return valid domain names only, no explanations."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"competitor_detect_{domain}",
            system_message="You are an expert business analyst specializing in competitive analysis. Return only valid JSON arrays of competitor domains."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response to extract competitor URLs
        competitors = parse_competitor_response(response)
        return competitors[:5]  # Ensure max 5
        
    except Exception as e:
        logger.error(f"Error detecting competitors: {str(e)}")
        return []


def parse_competitor_response(response: str) -> List[str]:
    """Parse AI response to extract competitor URLs"""
    import json
    
    # Try to find JSON array in response
    try:
        # Look for array pattern
        match = re.search(r'\[.*?\]', response, re.DOTALL)
        if match:
            competitors = json.loads(match.group())
            if isinstance(competitors, list):
                # Clean and validate URLs
                valid_competitors = []
                for comp in competitors:
                    if isinstance(comp, str):
                        # Clean the URL
                        comp = comp.strip().lower()
                        comp = re.sub(r'^https?://', '', comp)
                        comp = re.sub(r'^www\.', '', comp)
                        comp = comp.rstrip('/')
                        
                        # Basic domain validation
                        if '.' in comp and len(comp) > 3:
                            valid_competitors.append(comp)
                
                return valid_competitors
    except json.JSONDecodeError:
        pass
    
    # Fallback: try to extract domains from text
    domain_pattern = r'(?:https?://)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)'
    matches = re.findall(domain_pattern, response)
    
    # Filter and clean
    valid_domains = []
    for domain in matches:
        domain = domain.lower().strip()
        if domain and '.' in domain and len(domain) > 3:
            valid_domains.append(domain)
    
    return list(set(valid_domains))[:5]


async def get_industry_insights(user_url: str, competitors: List[str]) -> Dict[str, Any]:
    """
    Get AI-powered industry insights and recommendations
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        return {}
    
    try:
        parsed = urlparse(user_url if user_url.startswith('http') else f'https://{user_url}')
        domain = parsed.netloc.replace('www.', '')
    except:
        domain = user_url
    
    prompt = f"""Analyze the competitive landscape for "{domain}" against these competitors: {', '.join(competitors)}

Provide:
1. Industry category
2. Market position assessment
3. Key differentiators to focus on
4. Growth opportunities
5. Potential threats

Return as JSON with keys: industry, market_position, differentiators, opportunities, threats"""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"industry_insights_{domain}",
            system_message="You are a strategic business consultant. Provide concise, actionable insights."
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Try to parse as JSON
        import json
        try:
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                return json.loads(match.group())
        except:
            pass
        
        return {"raw_insights": response}
        
    except Exception as e:
        logger.error(f"Error getting industry insights: {str(e)}")
        return {}
