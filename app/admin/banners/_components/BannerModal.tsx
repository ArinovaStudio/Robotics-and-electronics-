"use client"

import { useState, useEffect, ReactNode } from "react"
import {type Banner } from "./BannerCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  banner?: Banner
  children: ReactNode
  onSubmit: any
  mode: "create" | "edit";
  loading: boolean;
}

export default function BannerModal({ loading, banner, children ,onSubmit,mode}: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [image, setImage] = useState<string | null | File>(null);

  const isEdit = !!banner

  useEffect(() => {
    if (mode==="edit") {
      setTitle(banner!.title)
      setImage(banner!.image)
    } else {
      setTitle("")
      setImage(null)
    }
  }, [banner, open])


  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">

        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Update Banner" : "Create Banner"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Image</Label>
            <Input
              placeholder="https://example.com/banner.jpg"
              type="file"
              onChange={(e) =>{
                const file = e?.target?.files?.[0]!;
                if(file){
                  setImage(file as any);
                }
              }}
            />
          </div>

          {image && (
            <img
              src={image}
              alt="preview"
              className="rounded-md h-40 w-full object-cover"
            />
          )}

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={()=>{
              onSubmit({title,image},mode);
            }}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </DialogFooter>

      </DialogContent>

    </Dialog>
  )
}