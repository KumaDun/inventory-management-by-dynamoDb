import type {InventoryItem} from "@/types/InventoryItem.ts"

export function isEqualItem(
    a: InventoryItem,
    b: InventoryItem
): boolean {
    return (
        a.itemId === b.itemId &&
        a.name === b.name &&
        a.description === b.description &&
        a.price === b.price &&
        a.stockLevel === b.stockLevel &&
        a.category === b.category &&
        a.threshold === b.threshold &&
        a.isAvailable === b.isAvailable
    )
}