import React from "react";

export interface Banner {
  id: string;
  title: string;
  image: string;
}

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BannerCard({ banner }: { banner: Banner }) {
  return (
    <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
      </div>

      {/* Title */}
      <CardContent className="py-4">
        <h3 className="text-lg font-semibold line-clamp-1">{banner.title}</h3>
      </CardContent>

      {/* Actions */}
      <CardFooter className="grid w-full xl:grid-cols-2 gap-4 justify-between pt-0">
        <Button variant="outline" size="sm" className="gap-2 w-full!">
          <Edit size={16} />
          Edit
        </Button>

        <Button variant="destructive" size="sm" className="gap-2 w-full!">
          <Trash2 size={16} />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
