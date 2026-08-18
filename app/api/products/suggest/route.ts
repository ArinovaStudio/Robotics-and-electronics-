import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";

        if (search.length < 2) {
            return NextResponse.json({ success: true, data: { products: [] } });
        }

        const products = await prisma.$queryRaw<
            Array<{
                id: string;
                title: string;
                link: string;
                imageLink: string;
            }>
        >`
  SELECT id, title, link, "imageLink"
  FROM "Product"
  WHERE "isActive" = true
    AND (
      title % ${search}
      OR word_similarity(${search}, title) > 0.3
      OR title ILIKE ${'%' + search + '%'}
    )
  ORDER BY GREATEST(
    similarity(title, ${search}),
    word_similarity(${search}, title)
  ) DESC
  LIMIT 5;
`;

        return NextResponse.json({
            success: true,
            data: {
                products: products.map((p) => ({
                    id: p.id,
                    title: p.title,
                    link: p.link,
                    image: p.imageLink,
                })),
            },
        });
    } catch (err) {
        console.error("Suggest error:", err);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}