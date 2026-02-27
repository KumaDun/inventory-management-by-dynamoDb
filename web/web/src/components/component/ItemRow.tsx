import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {ItemMedia} from "@/components/ui/item.tsx";
import {SquarePen, Trash2} from "lucide-react";
import {inventoryApi} from "@/api/inventoryApi.ts";
import axios from "axios";
import {UpdatePop} from "@/components/component/UpdatePop.tsx";
import {useState} from "react";
import type {InventoryItem} from "@/types/InventoryItem.ts";


export function ItemRow({item, setRefreshTrigger}: {
    item: InventoryItem,
    setRefreshTrigger: () => void
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <TableRow key={item.itemId} onClick={() => {
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
                            setIsEditing(true)
                        }}
                    >
                        <SquarePen className="size-5"/>
                    </ItemMedia>
                    <ItemMedia
                        className="size-6 hover:bg-gray-200 active:bg-gray-300"
                        onClick={() => {
                            setIsDeleting(true)
                            inventoryApi.deleteItem(item.itemId).then((responseData) => {
                                try {
                                    console.log(responseData)
                                    setRefreshTrigger()
                                } catch (error) {
                                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                                        console.log(`updateItem error ${error?.code}, ${error?.message}`)
                                    }
                                } finally {
                                    setIsDeleting(false)
                                }
                            })
                        }}
                    >
                        <Trash2 className="size-5 focus-visible:border-ring"/>
                    </ItemMedia>
                </div>
            </TableCell>
            <UpdatePop
            isOpen={isEditing}
            onIsOpenChange={setIsEditing}
            onRefreshTrigger={() => setRefreshTrigger()}
            item={item}></UpdatePop>
        </TableRow>
    )
}