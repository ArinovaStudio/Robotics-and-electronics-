import "dotenv/config";
import prisma from "../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Scanning database for products without FAQs...");

  const productsWithoutFaqs = await prisma.product.findMany({
    where: {
      faqs: {
        none: {}, 
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      brand: true,
      productHighlights: true,
    },
  });

  if (productsWithoutFaqs.length === 0) {
    console.log("All products already have FAQs! Nothing to seed.");
    return;
  }

  console.log(`Found ${productsWithoutFaqs.length} products needing FAQs. Starting generation...\n`);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  for (const product of productsWithoutFaqs) {
    console.log(`⏳ Generating FAQs for: ${product.title}...`);

    const prompt = `
      You are an expert technical writer for an electronics and robotics e-commerce store.
      Generate 5 to 6 frequently asked questions (FAQs) and detailed, helpful answers for the following product.

      Product Details:
      - Title: ${product.title}
      - Brand: ${product.brand || "Generic"}
      - Description: ${product.description}
      - Highlights: ${product.productHighlights.join(", ")}

      Return ONLY a JSON array containing objects with 'question' and 'answer' string keys.
      Format: [{"question": "...", "answer": "..."}]
    `;

    let success = false;
    let retries = 0;
    const maxRetries = 3;

    while (!success && retries < maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const faqs: { question: string; answer: string }[] = JSON.parse(responseText);

        if (!faqs || faqs.length === 0) {
          success = true; 
          continue; 
        }

        const faqData = faqs.map((faq, index) => ({
          productId: product.id,
          question: faq.question,
          answer: faq.answer,
          order: index, 
        }));

        await prisma.productFaq.createMany({
          data: faqData,
        });

        console.log(`✅ Saved ${faqs.length} FAQs for ${product.title}`);
        success = true; 

        await sleep(5000); 

      } catch (error: any) {
        if (error.status === 429 || error.message?.includes("429")) {
          retries++;
          console.warn(`⚠️ Rate limited! Pausing for 10 seconds before retry ${retries}/${maxRetries}...`);
          await sleep(10000); 
        } else {
          console.error(`❌ Failed to generate FAQs for ${product.title}:`, error);
          break;
        }
      }
    }
  }

  console.log("\n🎉 FAQ Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("Fatal Script Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });