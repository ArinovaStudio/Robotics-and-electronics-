import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getAdminUser } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (status === "active") where.isActive = true;
    else if (status === "hidden") where.isActive = false;

    const [categories, totalFiltered, allCategoriesForMetrics] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true, children: true } },
        },
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.category.count({ where }),
      prisma.category.findMany({
        select: { isActive: true, _count: { select: { products: true } } }
      })
    ]);

    const totalCategories = allCategoriesForMetrics.length;
    let activeCategories = 0;
    let emptyCategories = 0;

    allCategoriesForMetrics.forEach(cat => {
      if (cat.isActive) activeCategories++;
      if (cat._count.products === 0) emptyCategories++;
    });

    return NextResponse.json({
      success: true,
      message: "Categories fetched successfully",
      data: {
        categories,
        metrics: {
          totalCategories,
          activeCategories,
          emptyCategories
        },
        pagination: {
          page,
          limit,
          total: totalFiltered,
          totalPages: Math.ceil(totalFiltered / limit) || 1,
        }
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const parentId = formData.get("parentId") as string | null;
    const isActive = formData.get("isActive") !== "false";
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
    const imageFile = formData.get("image") as File | null;

    if (!name || name.trim() === "") {
      return NextResponse.json( { success: false, message: "Category name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ slug }, { name }] },
    });
    
    if (existingCategory) {
      return NextResponse.json({ success: false, message: "Category name already exists" }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadFile(imageFile, "categories");
      } catch {
        return NextResponse.json( { success: false, message: "Failed to upload image" }, { status: 400 });
      }
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        isActive,
        sortOrder,
        parentId: parentId && parentId !== "null" ? parentId : null,
        image: imageUrl,
      },
    });

    return NextResponse.json({ success: true, message: "Category created successfully" },{ status: 201 });
    
  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" },{ status: 500 });
  }
}