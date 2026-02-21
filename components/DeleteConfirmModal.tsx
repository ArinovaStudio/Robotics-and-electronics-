import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    itemName?: string;
    warningMessage?: string; 
    isDeleting?: boolean;
}

export function DeleteConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    itemName = "Item", 
    warningMessage = "This action cannot be undone.", 
    isDeleting 
}: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            Delete {itemName}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="pt-3 text-slate-500 text-base">
                        Are you sure you want to delete <span className="font-semibold text-slate-800">"{title}"</span>? 
                        {" "}{warningMessage}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onClose} className="mr-2" disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button type="button" className="bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}