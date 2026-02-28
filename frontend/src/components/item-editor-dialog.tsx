import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import { Categories } from "@/types/Categories.ts"
import type { InventoryItem } from "@/types/InventoryItem.ts"

type EditorMode = "create" | "edit"

interface ItemEditorDialogProps {
  item: InventoryItem
  mode: EditorMode
  open: boolean
  isSaving: boolean
  onClose: () => void
  onChange: (item: InventoryItem) => void
  onSubmit: () => void
}

const currencies = ["USD", "EUR", "JPY", "GBP", "CNY"]

export function ItemEditorDialog({
  item,
  mode,
  open,
  isSaving,
  onClose,
  onChange,
  onSubmit,
}: ItemEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create inventory item" : "Edit inventory item"}</DialogTitle>
          <DialogDescription>
            Update the catalog data shown in the dashboard cards and detail panel.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={item.name}
              onChange={(event) => onChange({ ...item, name: event.target.value })}
              placeholder="Atlas Desk Lamp"
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={item.description}
              onChange={(event) => onChange({ ...item, description: event.target.value })}
              placeholder="Short description"
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={item.category} onValueChange={(value) => onChange({ ...item, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {Categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={item.currency} onValueChange={(value) => onChange({ ...item, currency: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Currencies</SelectLabel>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={Number.isNaN(item.price) ? "" : item.price}
              onChange={(event) => onChange({ ...item, price: Number(event.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stockLevel">Stock level</Label>
            <Input
              id="stockLevel"
              type="number"
              min="0"
              value={Number.isNaN(item.stockLevel) ? "" : item.stockLevel}
              onChange={(event) => onChange({ ...item, stockLevel: Number(event.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="threshold">Threshold</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              value={Number.isNaN(item.threshold) ? "" : item.threshold}
              onChange={(event) => onChange({ ...item, threshold: Number(event.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Availability</Label>
            <div className="flex gap-2 rounded-2xl border border-input bg-white/75 p-1">
              <Button
                type="button"
                variant={item.isAvailable ? "default" : "ghost"}
                className="flex-1 rounded-xl"
                onClick={() => onChange({ ...item, isAvailable: true })}
              >
                Available
              </Button>
              <Button
                type="button"
                variant={!item.isAvailable ? "secondary" : "ghost"}
                className="flex-1 rounded-xl"
                onClick={() => onChange({ ...item, isAvailable: false })}
              >
                Unavailable
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : mode === "create" ? "Create item" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
