import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  title: string;
  description: string;
  feedback?: string;
  trainerName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, feedback, trainerName }: AnalysisRequest = await req.json();

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          sentiment: 'neutral',
          score: 50,
          tags: ['pending-analysis'],
          insights: 'AI analysis is not available. Please configure the OpenAI API key.'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentToAnalyze = feedback || `${title}\n\n${description}`;
    
    const systemPrompt = trainerName 
      ? `You are an expert sentiment analyzer for fitness trainer feedback. Analyze the feedback about trainer "${trainerName}" and provide:
1. Overall sentiment (positive, negative, neutral, mixed)
2. A score from 0-100 (0 being extremely negative, 100 being extremely positive)
3. 3-5 relevant tags (e.g., "professionalism", "technique", "motivation", "punctuality", "communication")
4. Key insights and recommendations
5. Areas of strength
6. Areas for improvement

Return as JSON with keys: sentiment, score, tags, insights, strengths, improvements`
      : `You are an expert sentiment analyzer for customer support tickets. Analyze the ticket and provide:
1. Overall sentiment (positive, negative, neutral, mixed)
2. A score from 0-100 (0 being extremely negative, 100 being extremely positive)
3. 3-5 relevant tags for categorization
4. A brief summary of the issue
5. Recommended priority (critical, high, medium, low)
6. Suggested department routing

Return as JSON with keys: sentiment, score, tags, summary, priority, department`;

    console.log('Analyzing content:', contentToAnalyze.substring(0, 100));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contentToAnalyze }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'AI analysis failed',
          sentiment: 'neutral',
          score: 50,
          tags: ['error'],
          insights: 'Failed to analyze content. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    console.log('Analysis complete:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        sentiment: 'neutral',
        score: 50,
        tags: ['error'],
        insights: 'An error occurred during analysis.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
