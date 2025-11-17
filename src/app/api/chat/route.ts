import { createClient } from "@/lib/supabase/server";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Perplexity client (OpenAI-compatible)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai",
});

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, nodeId, userId, mode: requestedMode, model } = await req.json();

    // Check if dev mode is enabled
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

    // Auto-detect image generation requests from user prompt
    const lastMessage = messages[messages.length - 1]?.content || "";
    const imageKeywords = /\b(generate|create|draw|make|design|paint|sketch|render|produce|show me|give me)\b.*\b(image|picture|photo|illustration|artwork|drawing|painting|visual|graphic)\b/i;
    const isImageRequest = imageKeywords.test(lastMessage);

    // Override mode to image-video if image request is detected (unless explicitly set to online-search)
    let mode = requestedMode;
    if (isImageRequest && requestedMode !== "online-search") {
      mode = "image-video";
      console.log("[API] Auto-detected image generation request. Switching to image-video mode.");
    }

    // Skip authentication and credit checks in dev mode
    let user = null;
    let supabase = null;

    if (!isDevMode) {
      // Verify user authentication
      supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return new Response("Unauthorized", { status: 401 });
      }

      user = authUser;

      // Check user credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (!profile || profile.credits <= 0) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Determine which API to use based on mode
    const isOnlineSearch = mode === "online-search";
    const isImageGeneration = mode === "image-video";
    const isBusinessMode = mode === "business-mode";

    let response;
    let citations: any[] = [];
    let generatedImageUrl: string | null = null;

    console.log("[API] Mode:", mode, "| Model:", model, "| isOnlineSearch:", isOnlineSearch, "| isImageGeneration:", isImageGeneration, "| isBusinessMode:", isBusinessMode);

    // Map frontend model IDs to actual API model names
    const modelMap: Record<string, string> = {
      "gpt-5.1": "gpt-4-turbo-preview",
      "gpt-5-pro": "gpt-4-turbo-preview",
      "openai-o3": "gpt-4-turbo-preview",
      "openai-o3-pro": "gpt-4-turbo-preview",
      "openai-o4-mini": "gpt-4-turbo-preview",
      "claude-opus-4": "gpt-4-turbo-preview",
      "claude-opus-4.1": "gpt-4-turbo-preview",
      "claude-sonnet-4.5": "gpt-4-turbo-preview",
      "gemini-2.5-flash": "gpt-4-turbo-preview",
      "gpt-4-turbo": "gpt-4-turbo-preview",
      "claude-sonnet-3.5": "gpt-4-turbo-preview",
      "llama-3.1": "gpt-4-turbo-preview",
      "mistral-large": "gpt-4-turbo-preview",
    };

    try {
      if (isImageGeneration) {
        // Use Google Gemini 2.5 Flash Image (Nano Banana) for image generation
        console.log("[API] Using Gemini 2.5 Flash Image (Nano Banana) for image generation");

        try {
          const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

          // Get the user's prompt from the last message
          const userPrompt = messages[messages.length - 1]?.content || "";
          console.log("[IMAGE GEN] Prompt:", userPrompt);

          // Generate image using Gemini 2.5 Flash Image
          const result = await imageModel.generateContent(userPrompt);
          console.log("[IMAGE GEN] Result received:", !!result);

          const imageResponse = await result.response;
          console.log("[IMAGE GEN] Response structure:", JSON.stringify({
            hasCandidates: !!imageResponse.candidates,
            candidatesLength: imageResponse.candidates?.length,
            firstCandidate: imageResponse.candidates?.[0] ? {
              hasContent: !!imageResponse.candidates[0].content,
              partsLength: imageResponse.candidates[0].content?.parts?.length,
            } : null
          }));

          // Extract base64 image data from response - check all parts
          if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64Image = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || "image/png";

                // Validate base64 data
                if (!base64Image || typeof base64Image !== 'string') {
                  console.error("[IMAGE GEN] Invalid base64 data type:", typeof base64Image);
                  continue;
                }

                // Check minimum size (valid images should be at least a few KB)
                if (base64Image.length < 1000) {
                  console.error("[IMAGE GEN] Base64 data too short:", base64Image.length);
                  continue;
                }

                // Check that it looks like valid base64 (alphanumeric + / + = padding)
                if (!/^[A-Za-z0-9+/]+=*$/.test(base64Image)) {
                  console.error("[IMAGE GEN] Invalid base64 characters detected");
                  continue;
                }

                // Validate MIME type
                if (!mimeType.startsWith('image/')) {
                  console.error("[IMAGE GEN] Invalid MIME type:", mimeType);
                  continue;
                }

                generatedImageUrl = `data:${mimeType};base64,${base64Image}`;
                console.log("[IMAGE GEN] Successfully extracted and validated image, size:", base64Image.length, "type:", mimeType);
                break;
              }
            }
          }

          if (!generatedImageUrl) {
            console.error("[IMAGE GEN] Failed to extract valid image from response. Full response:", JSON.stringify(imageResponse, null, 2));
          }
        } catch (imageError) {
          console.error("[IMAGE GEN ERROR] Failed to generate image:", imageError);
          console.error("[IMAGE GEN ERROR] Error details:", {
            name: imageError instanceof Error ? imageError.name : 'Unknown',
            message: imageError instanceof Error ? imageError.message : String(imageError),
            stack: imageError instanceof Error ? imageError.stack : undefined
          });
          // Continue to generate text response even if image generation fails
        }

        // Create an empty response - just send the image with no text
        response = {
          async *[Symbol.asyncIterator]() {
            yield {
              choices: [{
                delta: { content: "" }
              }]
            };
          }
        } as any;
      } else if (isOnlineSearch) {
        // Use Perplexity for online search
        console.log("[API] Using Perplexity API with sonar-pro");
        response = await perplexity.chat.completions.create({
          model: "sonar-pro",
          messages,
          stream: true,
          temperature: 0.2,
          max_tokens: 2000,
        });
      } else {
        // Use OpenAI for regular mode, mapping model IDs to real OpenAI models
        const modelToUse = modelMap[model] || model || "gpt-4-turbo-preview";
        console.log("[API] Using OpenAI API with model:", modelToUse, "(mapped from:", model, ")");

        // For business mode, inject special system prompt for structured response
        let apiMessages = messages;
        if (isBusinessMode) {
          apiMessages = [
            {
              role: "system",
              content: `You are a business planning assistant in BUSINESS MODE. You MUST ALWAYS respond in this exact structured format - no exceptions:

CRITICAL FORMAT REQUIREMENTS:
1. First line MUST be: "TITLE: [Brief project title]"
2. Second line MUST be exactly: "__STEPS__"
3. Third line MUST be a valid JSON array of steps

MANDATORY FORMAT:
TITLE: [Your Title Here]
__STEPS__
[{"title":"Step 1 Title","content":"Step 1 description..."},{"title":"Step 2 Title","content":"Step 2 description..."},{"title":"Step 3 Title","content":"Step 3 description..."}]

RULES:
- ALWAYS use this format for EVERY response in business mode
- Break down any question into 3-6 logical steps
- Each step needs "title" (short, 3-5 words) and "content" (2-3 sentences)
- The JSON array MUST be valid - use escaped quotes if needed
- Do NOT add any text before TITLE or after the JSON array
- Even for simple questions, create at least 3 steps

Example for "How do I start a company?":
TITLE: Starting a Tech Company
__STEPS__
[{"title":"Choose Business Structure","content":"Decide between LLC, Corporation, or Sole Proprietorship based on your needs and tax implications."},{"title":"Register Business Name","content":"File a DBA or check name availability with your state. Ensure the name isn't trademarked."},{"title":"Get EIN","content":"Apply for an Employer Identification Number from the IRS for tax purposes."},{"title":"Open Business Bank Account","content":"Separate personal and business finances by opening a dedicated business account."}]

REMEMBER: This format is MANDATORY for every single response. No exceptions.`
            },
            ...messages
          ];
        }

        response = await openai.chat.completions.create({
          model: modelToUse,
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        });
      }
    } catch (apiError) {
      console.error("[API] Error calling AI service:", apiError);
      throw apiError;
    }

    // Create a readable stream
    const encoder = new TextEncoder();
    let fullCompletion = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";

            // Check for citations in the chunk (Perplexity includes them)
            if (isOnlineSearch && (chunk as any).citations) {
              citations = (chunk as any).citations;
            }

            if (content) {
              fullCompletion += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Send citations as a special marker at the end for online search
          if (isOnlineSearch && citations.length > 0) {
            const citationsMarker = `\n__CITATIONS__${JSON.stringify(citations)}`;
            controller.enqueue(encoder.encode(citationsMarker));
          }

          // Send image URL as a special marker at the end for image generation
          if (isImageGeneration && generatedImageUrl) {
            const imageMarker = `__IMAGE_URL__${generatedImageUrl}`;
            controller.enqueue(encoder.encode(imageMarker));
          }

          // After streaming is complete, save to database (skip in dev mode)
          if (!isDevMode && supabase && user) {
            const tokensUsed = Math.ceil(fullCompletion.length / 4);

            // Deduct credits
            await supabase.rpc("deduct_credits", {
              p_user_id: user.id,
              p_amount: tokensUsed,
              p_description: "AI conversation",
            });

            // Save message to database
            if (nodeId) {
              await supabase.from("messages").insert({
                node_id: nodeId,
                role: "assistant",
                content: fullCompletion,
                tokens_used: tokensUsed,
              });
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
