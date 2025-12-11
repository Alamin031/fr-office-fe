"use client"

import { Dialog, DialogContent, DialogTitle, VisuallyHiddenTitle } from "../ui/dialog"

interface CompanyDealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDealModal({ open, onOpenChange }: CompanyDealModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <VisuallyHiddenTitle>Company Deal</VisuallyHiddenTitle>
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold text-foreground">Company Deal</h2>
          <p className="text-lg text-muted-foreground">This picture is coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
