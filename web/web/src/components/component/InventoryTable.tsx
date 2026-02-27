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
import {ItemRow} from "@/components/component/ItemRow.tsx"
import type {InventoryItem} from "@/types/InventoryItem.ts";
import {Button} from "@/components/ui/button.tsx";
import {SearchInput} from "@/components/component/SearchInput.tsx";

export function InventoryTable(
    {isLoadingLinker} : {isLoadingLinker: (isLoading: boolean) => void}
) {
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<InventoryItem[]>([])
    const [lastEvaluatedKey, setlastEvaluatedKey] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        void loadItems(true)
    }, [refreshTrigger])

    const loadItems = async (replace: boolean) => {
        if (!replace && !hasMore) return
        try {
            setIsLoading(true)
            isLoadingLinker(true)
            const cursor = replace ? null : lastEvaluatedKey
            console.log('cursor sent', cursor)
            // let data: ScanItemsPage
            // if (!cursor) {
                const data = await inventoryApi.getAllItemsPage(cursor)
            // } else {
            //     data = await inventoryApi.getAllItemsPage(cursor)
            // }
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
            setTimeout(() => {
                setIsLoading(false);
                isLoadingLinker(false);
            }, 1000)
        }
    }

    return (
        <div>
            <div className="mb-3">
                <SearchInput
                    disabled={isLoading}
                    displayResult={(result: InventoryItem[]) => {
                        setItems(result)
                        console.log(`table received ${result.length} result from SearchInput`)
                    }}
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
                    {!isLoading && items.map((item: InventoryItem) => (
                        <ItemRow
                            item ={item}
                            setRefreshTrigger={() => setRefreshTrigger(prevState => !prevState)}
                        />
                    ))}
                    {!isLoading && items.length === 0 && (
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
        </div>
    )
}
