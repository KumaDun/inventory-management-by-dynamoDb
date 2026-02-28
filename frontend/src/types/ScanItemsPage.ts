import type { InventoryItem } from "@/types/InventoryItem.ts"

export interface ScanItemsPage {
  items: InventoryItem[]
  lastEvaluatedKey: string | null
}
