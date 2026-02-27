import {useState} from "react";
import type {ScanItemsPage} from "@/types/ScanItemsPage.ts";
import {inventoryApi} from "@/api/inventoryApi.ts";
import {Categories} from "@/types/Categories.ts";
import type {InventoryItem} from "@/types/InventoryItem.ts";

type Category = (typeof Categories) [number]

export function useInventoryFilters() {
    const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')
    const [nameFilter, setNameFilter] = useState<string>("")
    const [stockFilter, setStockFilter] = useState<number>(0)
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null)
    const [searchResult, setSearchResult] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSearch = (): Promise<InventoryItem[]> => {
        return loadSearchItems(true)
    }

    const loadSearchItems = async (replace: boolean):Promise<InventoryItem[]> => {
        const name: string = nameFilter;
        const category: string = categoryFilter;
        // const stock = stockFilter;
        setIsLoading(true);
        console.log(`loadSearchItems with category: ${category}, name: ${name}, replace: ${replace}`);
        try {
            const cursor = replace ? null : lastEvaluatedKey
            console.log('cursor sent', cursor)
            let data: ScanItemsPage
            if (category === "" && name === '') {
                // No category, No name, Invalid
                data = await inventoryApi.getAllItemsPage(null);
            } else if (category !== '' && nameFilter === '') {
                // Only category, No name
                data = await inventoryApi.getItemsByCategory(category, cursor);
            } else if (category !== '' && name !== '') {
                // Both category and name
                data = await inventoryApi.getItemsByCategoryAndName(category, name, cursor);
            } else {
                // Only name, No category
                data = await inventoryApi.getItemsByName(name, cursor);
            }
            setLastEvaluatedKey(data.lastEvaluatedKey)
            // setHasMore(data.lastEvaluatedKey != null)
            console.log(`lastEvaluatedKey ${data.lastEvaluatedKey}, result length ${data.items.length}`)
            // TODO replacing items causes rendering cost, optimization needed, use React.memo or Virtualization
            const newResult: InventoryItem[] = replace ? data.items : [...searchResult, ...data.items];
            setSearchResult(newResult);
            return newResult;
        } catch (error) {
            console.log(error)
            return [];
        }
        finally {
            setTimeout(() => {
                setNameFilter('');
                setCategoryFilter('')
                setIsLoading(false);
            }, 1000)
        }
    }

    const handleClearSearch = () => {
        setCategoryFilter("")
        setNameFilter("")
        setStockFilter(0)
    }

    return {
        categoryFilter,
        nameFilter,
        stockFilter,
        setCategoryFilter,
        setNameFilter,
        setStockFilter,
        handleSearch,
        handleClearSearch,
        isLoading,
    }
}
