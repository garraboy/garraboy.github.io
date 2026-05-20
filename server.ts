import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini client lazily to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to client-side mocks.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
// 1. Generate elegant, nostalgic story from selected images
app.post("/api/story", async (req: Request, res: Response) => {
  try {
    const { photos, albumTitle, language = "ar" } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: "Missing photos array" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback response for mock
      const mockStory = language === "ar" 
        ? `قصة عائلية دافئة لألبوم "${albumTitle || "ذكرياتنا العائلية"}": تجمعنا هذه اللحظات الرائعة لتذكرنا بأن العائلة هي الملاذ الدافئ والضحكات المشتركة التي لا تنتهي أبداً. من نزهات الحدائق المشمسة إلى لحظات التخرج الفخورة وضحكات الشاطئ الباسمة، كل صورة تروي فصلاً من حكايتنا المليئة بالحب والترابط.`
        : `A warm family story for the album "${albumTitle || "Our Family Memories"}": These beautiful moments gather us to remind us that family is our warm sanctuary and endless shared laughter. From sunny garden picnics to proud graduation moments and smiling beach laughter, every photo tells a chapter of our tale filled with love and cohesion.`;
      return res.json({ story: mockStory });
    }

    const ai = getAi();
    
    // Prepare textual context of the photos for Gemini
    const photosContext = photos.map((p, idx) => 
      `Photo ${idx + 1}: Title "${p.title || "Untitled"}", Description "${p.description || "N/A"}", Date "${p.date || "N/A"}", Tags/People: ${JSON.stringify(p.tags || [])}`
    ).join("\n");

    const systemPrompt = language === "ar"
      ? "أنت كاتب أدبي محترف متخصص في صياغة قصص وخواطر عائلية دافئة ومؤثرة جداً. صِغ قصة أو خاطرة أدبية متماسكة تربط هذه الصور العائلية ببعضها بأسلوب رائع مليء بالدفء والترابط الأسري."
      : "You are a professional literary writer specializing in weaving beautiful, touchingly nostalgic, warm family stories and narratives. Craft a cohesive family story or piece of memoir prose that binds these family photos together, in a warm, sentimentally rich tone.";

    const userPrompt = language === "ar"
      ? `العنوان الرئيسي للألبوم: "${albumTitle || "ذكرياتنا العائلية"}"\n\nتفاصيل الصور العائلية المتوفرة:\n${photosContext}\n\nاكتب قصة عائلية قصيرة (لا تزيد عن 200 كلمة) باللغة العربية تجمع كل هذه اللحظات بلغة بليغة وعاطفية دافئة.`
      : `Main Album Title: "${albumTitle || "Our Family Memories"}"\n\nProvided Family Photo Context:\n${photosContext}\n\nWrite a short, heartwarming family narrative (max 200 words) in English that weaves all these moments together beautifully.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    res.json({ story: response.text });
  } catch (error: any) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: error.message || "Internal server error during story generation" });
  }
});

// 2. Generate a professional sentiment caption for a single image with tags
app.post("/api/caption", async (req: Request, res: Response) => {
  try {
    const { title, description, tags, language = "ar" } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      const mockCaption = language === "ar"
        ? `الدفء العائلي يتجسد في تلك الضحكات الصادقة والقلوب المجتمعة دائماً تحت سقف الحب. ${title ? `- ${title}` : ""}`
        : `Family warmth embodied in those genuine laughs and hearts always gathered under the roof of love. ${title ? `- ${title}` : ""}`;
      return res.json({ caption: mockCaption });
    }

    const ai = getAi();
    
    const systemPrompt = language === "ar"
      ? "أنت خبير صياغة تعليقات وصور عائلية دافئة وشاعرية. مهمتك كتابة عبارة أو تعليق قصير عميق ومعبر جداً (سطرين كحد أقصى) لتوضيح الصورة العائلية."
      : "You are an expert at drafting short, touching, warm family sentiments and photographic captions. Craft a beautiful, poetic caption (max 2 lines) that perfectly fits a family photo.";

    const userPrompt = language === "ar"
      ? `عنوان الصورة: ${title || "غير معنون"}\nالوصف الحالي: ${description || "لا يوجد"}\nأشخاص/وسوم: ${JSON.stringify(tags || [])}\n\nصغ تعليقاً عائلياً دافئاً وجميلاً باللغة العربية يناسب هذه الصورة.`
      : `Photo Title: ${title || "Untitled"}\nDescription: ${description || "N/A"}\nPeople/Tags: ${JSON.stringify(tags || [])}\n\nGenerate a beautiful, touchingly warm caption in English fitting this photo.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      }
    });

    res.json({ caption: response.text });
  } catch (error: any) {
    console.error("Error generating caption:", error);
    res.status(500).json({ error: error.message || "Internal server error during caption generation" });
  }
});

// 3. Generate a beautiful family photo using AI (Text-to-Image)
app.post("/api/generate-image", async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Warm atmospheric family photo fallback using Lorem Picsum
      const seed = Math.floor(Math.random() * 10000);
      const mockSrc = `https://picsum.photos/seed/family-gen-${seed}/800/600`;
      return res.json({ image: mockSrc, mock: true });
    }

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K"
        }
      }
    });

    let imageBase64: string | null = null;
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageBase64) {
      res.json({ image: imageBase64 });
    } else {
      let msg = "";
      if (candidates && candidates[0]?.content?.parts) {
        for (const p of candidates[0].content.parts) {
          if (p.text) msg += p.text;
        }
      }
      res.status(500).json({ error: msg || "Could not generate photo. Please try another prompt description." });
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// 4. Modifying or editing an image by adding effects/details via AI
app.post("/api/edit-image", async (req: Request, res: Response) => {
  try {
    const { image, prompt } = req.body;
    if (!image || !prompt) {
      return res.status(400).json({ error: "Missing image or change prompt" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Mock warning return
      return res.json({ image: image, warning: "GEMINI_API_KEY not configured. Mocking editing behavior." });
    }

    let rawData = image;
    let mimeType = "image/png";
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        rawData = match[2];
      }
    }

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: rawData,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    let imageBase64: string | null = null;
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageBase64) {
      res.json({ image: imageBase64 });
    } else {
      let msg = "";
      if (candidates && candidates[0]?.content?.parts) {
        for (const p of candidates[0].content.parts) {
          if (p.text) msg += p.text;
        }
      }
      res.status(500).json({ error: msg || "Gemini was unable to modify the image based on that prompt." });
    }
  } catch (error: any) {
    console.error("Error editing image:", error);
    res.status(500).json({ error: error.message || "Failed to edit image" });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Family Album Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
