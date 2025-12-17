// OpenAI Sentiment Analysis Service
// Uses OpenAI API to detect sentiment and generate tags for tickets

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  tags: string[];
  summary: string;
}

class SentimentAnalyzer {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SentimentAnalyzer: OPENAI_API_KEY not found. Sentiment analysis will be disabled.');
    }
  }

  async analyzeSentiment(
    ticketTitle: string,
    ticketDescription: string,
    clientMood?: string
  ): Promise<SentimentAnalysisResult> {
    try {
      if (!this.apiKey) {
        console.warn('SentimentAnalyzer: Cannot analyze sentiment - missing API key');
        return this.getDefaultResult();
      }

      const prompt = `Analyze the following support ticket and generate tags. Return a JSON object with:
- sentiment (positive, negative, or neutral)
- confidence (0-1)
- tags (array of 2-5 short tags)
- summary (one sentence summary of the issue)

Ticket Title: ${ticketTitle}
Ticket Description: ${ticketDescription}
${clientMood ? `Client Mood: ${clientMood}` : ''}

Return ONLY valid JSON, no other text.`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes customer support tickets and generates tags. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', response.status, error);
        return this.getDefaultResult();
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      try {
        const result = JSON.parse(content);
        return {
          sentiment: result.sentiment || 'neutral',
          confidence: result.confidence || 0.5,
          tags: Array.isArray(result.tags) ? result.tags : ['support'],
          summary: result.summary || 'Support ticket',
        };
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        return this.getDefaultResult();
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.getDefaultResult();
    }
  }

  private getDefaultResult(): SentimentAnalysisResult {
    return {
      sentiment: 'neutral',
      confidence: 0,
      tags: ['support', 'ticket'],
      summary: 'Support ticket',
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
