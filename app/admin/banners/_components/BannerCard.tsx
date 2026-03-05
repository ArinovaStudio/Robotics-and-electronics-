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
import BannerModal from "./BannerModal";
import WarningModal from "./WarningModal";

export default function BannerCard({ banner,pending,onSubmit,onDelete }: { banner: Banner,pending: boolean, onSubmit: any,onDelete: any }) {
  return (
    <Card className="overflow-hidden pt-0 pb-4 gap-1 border hover:shadow-lg transition-all duration-300 group">
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
      <CardFooter className="flex gap-4 justify-end pt-0">
        <BannerModal loading={pending} banner={banner} mode={"edit"} onSubmit={onSubmit}>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit size={16} />
          Edit
        </Button>
        </BannerModal>
        <WarningModal pending={pending} onDelete={async ()=>await onDelete(banner.id)}>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 size={16} />
          Delete
        </Button>
        </WarningModal>
      </CardFooter>
    </Card>
  );
}
