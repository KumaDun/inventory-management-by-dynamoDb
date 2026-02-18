import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx"
import {useEffect, useState} from "react";
import {inventoryApi} from "@/api/inventoryApi.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {ItemMedia} from "@/components/ui/item.tsx";
import {SquarePen, Trash2} from 'lucide-react';
import type {InventoryItem} from "@/types/InventoryItem.ts";
import {UpdatePop} from "@/components/component/UpdatePop.tsx";
import axios from "axios";

export function InventoryTable() {
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [items, setItems] = useState([{
        itemId: "INV001",
        name: "iPhone 17 Air",
        description: "iPhone 17 Air",
        price: 1200,
        stockLevel: 200,
        category: "Electronics",
        threshold: 20,
        isAvailable: true,
        currency: "USD",
    },])
    const [item, setItem] = useState<InventoryItem | null>(null)
    useEffect(() => {
        loadItems();
    }, [refreshTrigger])

    const loadItems = async () => {
        try {
            setIsLoading(true)
            const data: InventoryItem[] = await inventoryApi.getAllItems()
            // TODO Think about pagination and partial update
            console.log(data)
            setItems(data)
        } catch (error) {
            console.log(error)
        } finally {
            setTimeout(() => setIsLoading(false), 1000)
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of your inventory items.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="[w-100px]">ItemId</TableHead>
                        <TableHead className="text-left">Name</TableHead>
                        <TableHead className="text-left">Description</TableHead>
                        <TableHead className="text-left">Price</TableHead>
                        <TableHead className="text-left">Stock</TableHead>
                        <TableHead className="text-left">Category</TableHead>
                        <TableHead className="text-left">Threshold</TableHead>
                        <TableHead className="text-left">Available</TableHead>
                        <TableHead className="text-left">Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading &&
                        <TableRow className="h-16" key="SpinnerTablerow">
                            <TableCell colSpan={8} className="items-center">
                                <Spinner className="w-12 h-12"/>
                            </TableCell>

                        </TableRow>
                    }
                    {!isLoading && items.map((item: InventoryItem) => (
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
                                            setItem(item)
                                            setIsUpdating(true)
                                        }}
                                    >
                                        <SquarePen className="size-5"/>
                                    </ItemMedia>
                                    <ItemMedia
                                        className="size-6 hover:bg-gray-200 active:bg-gray-300"
                                        onClick={() => {
                                            inventoryApi.deleteItem(item.itemId).then((responseData) => {
                                                try {
                                                    console.log(responseData)
                                                    setRefreshTrigger(prevState => !prevState)
                                                } catch (error) {
                                                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                                                        console.log(`updateItem error ${error?.code}, ${error?.message}`)
                                                    }
                                                }
                                            })
                                        }}
                                    >
                                        <Trash2 className="size-5 focus-visible:border-ring"/>
                                    </ItemMedia>

                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-left" colSpan={8}>Total</TableCell>
                        <TableCell className="text-left">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <UpdatePop
                isOpen={isUpdating}
                onIsOpenChange={setIsUpdating}
                onRefreshTrigger={() => setRefreshTrigger(prevState => !prevState)}
                item={item}></UpdatePop>
        </div>
    )
}
