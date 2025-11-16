from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, requests: int = 10, period: int = 60):
        self.requests = requests
        self.period = period
        self.store = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def check_rate_limit(self, identifier: str) -> bool:
        """Check if request is within rate limit"""
        async with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(seconds=self.period)
            
            # Clean old entries
            self.store[identifier] = [
                timestamp for timestamp in self.store[identifier]
                if timestamp > cutoff
            ]
            
            if len(self.store[identifier]) >= self.requests:
                return False
            
            self.store[identifier].append(now)
            return True
    
    async def __call__(self, request: Request):
        # Use IP address as identifier
        client_ip = request.client.host
        
        if not await self.check_rate_limit(client_ip):
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {self.requests} requests per {self.period}s"
            )
