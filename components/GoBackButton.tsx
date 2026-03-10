"use client";

import React from "react";
import useGoBack from "./useGoBack";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export default function GoBackButton() {
  const goBack = useGoBack();

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className="
         p-0!
        rounded-full
        transition-all
        duration-200
        hover:bg-muted
        hover:scale-105
        active:scale-95
      "
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
}