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

type SearchInputProps = {
    category: string
    name: string
    stock: string
    onCategoryChange: (value: string) => void
    onNameChange: (value: string) => void
    onStockChange: (value: string) => void
    onSearch: () => void
    onClear: () => void
    disabled?: boolean
}

export function SearchInput({
    category,
    name,
    stock,
    onCategoryChange,
    onNameChange,
    onStockChange,
    onSearch,
    onClear,
    disabled = false,
}: SearchInputProps) {
    return (
        <form
            className="flex justify-between flex-row gap-2 rounded-md border bg-muted/20 p-3 md:flex-row md:items-center"
            onSubmit={(event) => {
                event.preventDefault()
                onSearch()
            }}
        >
            <div className="flex flex-row gap-2">
                <Select
                    value={category || "all"}
                    onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Category</SelectLabel>
                            <SelectItem value="all">All</SelectItem>
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
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Search by item name"
                    className="w-full md:max-w-sm"
                    disabled={disabled}
                />
                <Input
                    id="stock_filter"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(event) => onStockChange(event.target.value)}
                    placeholder="Min stock"
                    className="w-full md:w-64"
                    disabled={disabled}
                />
            </div>

            <div className="flex flex-row gap-4">
                <Button type="submit" className="md:min-w-24" disabled={disabled}>
                    <Search className="mr-1 size-4" />
                    Search
                </Button>
                <Button type="button" variant="outline" className="md:min-w-24" onClick={onClear} disabled={disabled}>
                    <X className="mr-1 size-4" />
                    Clear
                </Button>
            </div>

        </form>
    )
}
