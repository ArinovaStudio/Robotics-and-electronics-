import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    const [categories, totalFiltered, allCategories] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true, children: true } },
        },
        skip,
        take: limit,
        orderBy: [
          { sortOrder: { sort: 'asc', nulls: 'last' } }, 
          { name: "asc" }
        ],
      }),
      prisma.category.count({ where }),
      prisma.category.findMany({
        select: { 
          id: true, 
          parentId: true, 
          isActive: true, 
          _count: { select: { products: true } } 
        }
      })
    ]);

    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, totalRecursiveProducts: 0 });
    });

    const getRecursiveCount = (catId: string): number => {
      const cat = categoryMap.get(catId);
      if (!cat) return 0;

      let count = cat._count.products;

      // recursively counting chidren category products
      const children = allCategories.filter(c => c.parentId === catId);
      children.forEach(child => {
        count += getRecursiveCount(child.id);
      });

      return count;
    };

    const totalCategories = allCategories.length;
    let activeCategories = 0;
    let emptyCategories = 0;

    allCategories.forEach(cat => {
      if (cat.isActive) activeCategories++;
      if (getRecursiveCount(cat.id) === 0) emptyCategories++;
    });

    return NextResponse.json({
      success: true,
      message: "Categories fetched successfully",
      data: {
        categories: categories.map(cat => ({
          ...cat,
          _count: {
            ...cat._count,
            products: getRecursiveCount(cat.id)
          }
        })),
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
    const sortOrderRaw = formData.get("sortOrder");
    const imageFile = formData.get("image") as File | null;

    let finalSortOrder: number | null = null;

    if (sortOrderRaw && sortOrderRaw !== "" && sortOrderRaw !== "null") {
      finalSortOrder = parseInt(sortOrderRaw as string);
      
      if (isNaN(finalSortOrder) || finalSortOrder < 1) {
        return NextResponse.json({ success: false, message: "Sort order must be 1 or greater" }, { status: 400 });
      }

      const duplicateSortOrder = await prisma.category.findFirst({ 
        where: { sortOrder: finalSortOrder } 
      });

      if (duplicateSortOrder) {
        return NextResponse.json({ success: false, message: `Sort order ${finalSortOrder} is already in use` }, { status: 400 });
      }
    }

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
        sortOrder: finalSortOrder,
        parentId: parentId && parentId !== "null" ? parentId : null,
        image: imageUrl,
      },
    });

    return NextResponse.json({ success: true, message: "Category created successfully" },{ status: 201 });
    
  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" },{ status: 500 });
  }
}