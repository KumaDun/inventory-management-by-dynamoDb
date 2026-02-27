import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {ItemMedia} from "@/components/ui/item.tsx";
import {SquarePen, Trash2} from "lucide-react";
import {memo} from "react";
import type {InventoryItem} from "@/types/InventoryItem.ts";

export const ItemRow = memo(function ItemRow({item, onEdit, onDelete}: {
    item: InventoryItem,
    onEdit: (item: InventoryItem) => void,
    onDelete: (item: InventoryItem) => void,
}) {
    console.log("render now", item.itemId)

    return (
        <TableRow onClick={() => {
        }}>
            <TableCell className="text-left font-medium">{item.itemId}</TableCell>
            <TableCell className="text-left font-medium ">{item.name}</TableCell>
            <TableCell className="text-left ">{item.description}</TableCell>
            <TableCell className="text-left ">{item.price}</TableCell>
            <TableCell className="text-left ">{item.stockLevel}</TableCell>
            <TableCell className="text-left">{item.category}</TableCell>
            <TableCell className="text-left">{item.threshold}</TableCell>
            <TableCell className="text-left">{String(item.isAvailable)}</TableCell>
            <TableCell>
                <div className={"flex gap-0.5 justify-around"}>
                    <ItemMedia
                        className="size-6 hover:bg-gray-200 active:bg-gray-300"
                        onClick={() => {
                            onEdit(item)
                        }}
                    >
                        <SquarePen className="size-5"/>
                    </ItemMedia>
                    <ItemMedia
                        className="size-6 hover:bg-gray-200 active:bg-gray-300"
                        onClick={() => {
                            onDelete(item)
                        }}
                    >
                        <Trash2 className="size-5 focus-visible:border-ring"/>
                    </ItemMedia>
                </div>
            </TableCell>
        </TableRow>
    )
})
