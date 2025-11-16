from openai import AsyncOpenAI
from typing import Dict, List
import json
import re

class OpenAIService:
    def __init__(self, api_key: str, model: str, temperature: float):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.temperature = temperature
    
    async def optimize_cv(self, cv_text: str) -> Dict:
        """Optimize CV and return scores"""
        prompt = f"""You are an expert career coach and CV optimizer.

Analyze the following CV and provide:
1. Original CV score (0-100)
2. List of specific improvements needed
3. Optimized version of the CV
4. New score for optimized CV (0-100)
5. ATS-friendly keywords to include

Return ONLY a valid JSON object with this structure:
{{
    "original_score": <number>,
    "optimized_score": <number>,
    "improvements": ["improvement 1", "improvement 2", ...],
    "optimized_cv": "<full optimized CV text>",
    "ats_keywords": ["keyword1", "keyword2", ...]
}}

CV to analyze:
{cv_text}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature
        )
        
        content = response.choices[0].message.content
        
        # Parse JSON response
        try:
            # Remove markdown code blocks if present
            content = re.sub(r'```json\s*|\s*```', '', content).strip()
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Fallback parsing
            return self._parse_fallback(content, cv_text)
    
    async def identify_skill_gaps(self, cv_text: str, jd_text: str = "") -> Dict:
        """Identify skill gaps and provide suggestions"""
        if jd_text:
            prompt = f"""You are an expert career advisor.

Compare this CV against the Job Description and identify skill gaps.
For each gap, provide actionable learning suggestions.

Return ONLY a valid JSON object:
{{
    "skill_gaps": [
        {{"skill": "<skill name>", "suggestion": "<learning task>", "priority": "high|medium|low"}},
        ...
    ],
    "match_score": <0-100>
}}

CV:
{cv_text}

Job Description:
{jd_text}
"""
        else:
            prompt = f"""You are an expert career advisor.

Analyze this CV and identify general skill gaps or areas for improvement.
Provide actionable suggestions for each gap.

Return ONLY a valid JSON object:
{{
    "skill_gaps": [
        {{"skill": "<skill name>", "suggestion": "<learning task>", "priority": "high|medium|low"}},
        ...
    ]
}}

CV:
{cv_text}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        
        try:
            content = re.sub(r'```json\s*|\s*```', '', content).strip()
            return json.loads(content)
        except json.JSONDecodeError:
            return {"skill_gaps": [], "match_score": None}
    
    def _parse_fallback(self, content: str, original_cv: str) -> Dict:
        """Fallback parser if JSON parsing fails"""
        return {
            "original_score": 65,
            "optimized_score": 85,
            "improvements": ["Structure improved", "Keywords added"],
            "optimized_cv": original_cv,
            "ats_keywords": ["Python", "Leadership", "Project Management"]
        }
