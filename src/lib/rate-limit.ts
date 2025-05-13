interface TokenData {
  count: number;
  timestamp: number;
}

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval?: number;
}

// 메모리에 저장할 토큰 카운터
const tokens: Map<string, TokenData> = new Map();

export function rateLimit({ interval, uniqueTokenPerInterval = 500 }: RateLimitOptions) {
  return {
    check: async (limit: number, token: string): Promise<number> => {
      const now = Date.now();
      
      // 이전 토큰들 정리
      for (const [key, value] of tokens.entries()) {
        if (value.timestamp < now - interval) {
          tokens.delete(key);
        }
      }

      // 현재 토큰의 카운트 가져오기
      const tokenData = tokens.get(token) || { count: 0, timestamp: now };
      tokenData.count += 1;
      tokens.set(token, tokenData);

      if (tokenData.count > limit) {
        throw new Error('Rate limit exceeded');
      }

      return tokenData.count;
    },
  };
} 