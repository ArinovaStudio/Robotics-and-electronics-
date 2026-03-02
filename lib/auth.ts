import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from "@/lib/prisma";

export async function getUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    return user || null;
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}