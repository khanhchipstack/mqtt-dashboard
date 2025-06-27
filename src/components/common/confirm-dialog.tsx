"use client";

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export default function ConfirmDialog() {
  const { isOpen, title, description, onConfirm, closeConfirm } = useConfirmDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeConfirm}>
      <DialogContent className="max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6">
        
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-red-500">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 mb-6">{description}</p>

        <DialogFooter className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={closeConfirm} className="text-gray-300 hover:text-white">
            Hủy
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              onConfirm();
              closeConfirm();
            }}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
