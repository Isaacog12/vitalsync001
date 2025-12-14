import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vitals, alerts, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "vitals_analysis") {
      systemPrompt = `You are ARIA, an advanced AI health monitoring assistant integrated into a futuristic medical system. You analyze patient vital signs in real-time and provide concise, actionable medical insights.

Your responses should be:
- Brief and to the point (2-3 sentences max)
- Use medical terminology appropriately
- Highlight any concerning patterns
- Provide actionable recommendations when needed
- Be empathetic but professional

Format your response as JSON with these fields:
{
  "status": "normal" | "attention" | "critical",
  "summary": "Brief one-line status",
  "insights": ["insight 1", "insight 2"],
  "recommendation": "What to do next"
}`;

      userPrompt = `Analyze these vital signs and provide health insights:
${JSON.stringify(vitals, null, 2)}`;
    } else if (type === "alert_analysis") {
      systemPrompt = `You are ARIA, an advanced AI health monitoring assistant. Analyze medical alerts and provide priority assessment and recommended actions.

Format your response as JSON:
{
  "priority": "low" | "medium" | "high" | "critical",
  "summary": "Brief assessment",
  "actions": ["action 1", "action 2"]
}`;

      userPrompt = `Analyze these alerts and prioritize:
${JSON.stringify(alerts, null, 2)}`;
    } else {
      systemPrompt = `You are ARIA, an advanced AI health assistant in a futuristic medical monitoring system. You help healthcare professionals and patients understand health data. Be concise, helpful, and professional.`;
      userPrompt = vitals || alerts || "Provide a general health tip.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse as JSON, otherwise return as text
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { summary: content, status: "normal" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Health AI error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
