"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImageAction(prompt: string): Promise<{ success?: boolean; url?: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { error: "OpenAI API-nøkkel mangler. Sjekk .env.local" };
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1792x1024", // Bredere for blogg-bilder
      quality: "standard",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      return { error: "Kunne ikke generere bilde" };
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      return { error: "Kunne ikke generere bilde" };
    }

    // Last ned bildet
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return { error: "Kunne ikke laste ned generert bilde" };
    }

    const imageBlob = await imageResponse.blob();

    // Last opp til vår upload API
    const formData = new FormData();
    formData.append("image", imageBlob, `generated-${Date.now()}.png`);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      return { error: "Kunne ikke laste opp bildet" };
    }

    const { url } = await uploadResponse.json();
    return { success: true, url };
  } catch (error) {
    console.error("Image generation error:", error);
    return { error: "Feil ved bildegenerering. Prøv igjen." };
  }
}