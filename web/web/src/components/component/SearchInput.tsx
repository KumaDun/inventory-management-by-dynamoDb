import { Search, X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {Categories} from "@/types/Categories.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useInventoryFilters} from "@/utilities/useInventoryFilters.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import type {InventoryItem} from "@/types/InventoryItem.ts";
type Category = (typeof Categories) [number]


export function SearchInput(
    {disabled = false, displayResult}:
    { disabled ?: boolean, displayResult: (result: InventoryItem[]) => void}
) {
    const {
        categoryFilter,
        nameFilter,
        // stockFilter,
        setCategoryFilter,
        setNameFilter,
        // setStockFilter,
        handleSearch,
        handleClearSearch,
        isLoading,
    } = useInventoryFilters()


    return (
        <form
            className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-center"
            onSubmit={(event) => {
                event.preventDefault()
                handleSearch().then((result) => {
                    console.log(`searchInput get result length ${result.length}`)
                    displayResult(result);
                }).catch((err) => {
                    console.log(`onSubmit handleSearch error ${err}`)
                })
            }}
        >
            <div className="flex min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center">
                <Select
                    value={categoryFilter}
                    onValueChange={(value: Category) => setCategoryFilter(value)}
                    disabled={disabled || isLoading}
                >
                    <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Category</SelectLabel>
                            <SelectItem value="All">All</SelectItem>
                            {Categories.map((categoryValue) => (
                                <SelectItem key={categoryValue} value={categoryValue}>
                                    {categoryValue}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input
                    id="name_search"
                    type="text"
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.target.value)}
                    placeholder="Search by item name"
                    className="w-full sm:min-w-52 sm:flex-1"
                    disabled={disabled || isLoading}
                />
                {/*<Input*/}
                {/*    id="stock_filter"*/}
                {/*    type="number"*/}
                {/*    min={0}*/}
                {/*    value={stockFilter}*/}
                {/*    onChange={(event) => setStockFilter(Number(event.target.value))}*/}
                {/*    placeholder="Min stock"*/}
                {/*    className="w-full sm:w-32"*/}
                {/*    disabled={disabled || isLoading}*/}
                {/*/>*/}
            </div>

            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
                <Button type="submit" className="flex-1 sm:min-w-24 sm:flex-none" disabled={disabled || isLoading}>
                    {
                        isLoading ?
                        <Spinner className="mr-1 size-4" /> :
                        <Search className="mr-1 size-4" />
                    }
                    Search
                </Button>
                <Button type="button" variant="outline" className="flex-1 sm:min-w-24 sm:flex-none" onClick={() => handleClearSearch()} disabled={disabled}>
                    <X className="mr-1 size-4" />
                    Clear
                </Button>
            </div>
        </form>
    )
}
