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
import {useEffect, useMemo, useState} from "react";
import {inventoryApi} from "@/api/inventoryApi.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {ItemMedia} from "@/components/ui/item.tsx";
import {SquarePen, Trash2} from 'lucide-react';
import type {InventoryItem} from "@/types/InventoryItem.ts";
import {UpdatePop} from "@/components/component/UpdatePop.tsx";
import axios from "axios";
import type {ScanItemsPage} from "@/types/ScanItemsPage.ts";
import {Button} from "@/components/ui/button.tsx";
import {SearchInput} from "@/components/component/SearchInput.tsx";

export function InventoryTable() {
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [items, setItems] = useState<InventoryItem[]>([])
    const [lastEvaluatedKey, setlastEvaluatedKey] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [item, setItem] = useState<InventoryItem | null>(null)
    const [categoryFilter, setCategoryFilter] = useState("")
    const [nameFilter, setNameFilter] = useState("")
    const [stockFilter, setStockFilter] = useState("")
    const [appliedCategoryFilter, setAppliedCategoryFilter] = useState("")
    const [appliedNameFilter, setAppliedNameFilter] = useState("")
    const [appliedStockFilter, setAppliedStockFilter] = useState("")

    useEffect(() => {
        void loadItems(true)
    }, [refreshTrigger])

    const loadItems = async (replace: boolean) => {
        if (!replace && !hasMore) return
        try {
            setIsLoading(true)
            const cursor = replace ? null : lastEvaluatedKey
            console.log('cursor sent', cursor)
            let data: ScanItemsPage
            if (!cursor) {
                data = await inventoryApi.getAllItemsPageWithoutEvaluatedKey()
            } else {
                data = await inventoryApi.getAllItemsPage(cursor)
            }
            setlastEvaluatedKey(data.lastEvaluatedKey)
            setHasMore(data.lastEvaluatedKey != null)
            console.log('lastEvaluatedKey', data.lastEvaluatedKey)
            if (replace) {
                setItems(data.items)
                return
            }
            // TODO replacing items causes rendering cost, optimization needed, use React.memo or Virtualization
            setItems((prev) => replace ? data.items : [...prev, ...data.items]);
        } catch (error) {
            console.log(error)
        } finally {
            setTimeout(() => setIsLoading(false), 1000)
        }
    }

    const filteredItems = useMemo(() => {
        const normalizedName = appliedNameFilter.trim().toLowerCase()
        const parsedStock = Number(appliedStockFilter)
        const hasStockFilter = appliedStockFilter.trim() !== "" && !Number.isNaN(parsedStock)
        return items.filter((inventoryItem) => {
            const categoryMatch = !appliedCategoryFilter || inventoryItem.category === appliedCategoryFilter
            const nameMatch = !normalizedName || inventoryItem.name.toLowerCase().includes(normalizedName)
            const stockMatch = !hasStockFilter || inventoryItem.stockLevel >= parsedStock
            return categoryMatch && nameMatch && stockMatch
        })
    }, [items, appliedCategoryFilter, appliedNameFilter, appliedStockFilter])

    const handleSearch = () => {
        setAppliedCategoryFilter(categoryFilter)
        setAppliedNameFilter(nameFilter)
        setAppliedStockFilter(stockFilter)
    }

    const handleClearSearch = () => {
        setCategoryFilter("")
        setNameFilter("")
        setStockFilter("")
        setAppliedCategoryFilter("")
        setAppliedNameFilter("")
        setAppliedStockFilter("")
    }

    return (
        <div>
            <div className="mb-3">
                <SearchInput
                    category={categoryFilter}
                    name={nameFilter}
                    stock={stockFilter}
                    onCategoryChange={setCategoryFilter}
                    onNameChange={setNameFilter}
                    onStockChange={setStockFilter}
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    disabled={isLoading}
                />
            </div>
            <Table>
                <TableCaption>A list of your inventory items.</TableCaption>
                <TableHeader
                    className = 'bg-accent shadow-xs dark:bg-input/30'
                >
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
                            <TableCell colSpan={9} className="items-center">
                                <Spinner className="w-12 h-12"/>
                            </TableCell>

                        </TableRow>
                    }
                    {!isLoading && filteredItems.map((item: InventoryItem) => (
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
                    {!isLoading && filteredItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No items match the current filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-align" colSpan={9}>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading || !hasMore}
                                onClick={() => void loadItems(false)}
                            >
                                {hasMore ? "Load more" : "No more items"}
                            </Button>
                        </TableCell>
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
