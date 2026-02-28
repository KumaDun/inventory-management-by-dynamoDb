import { useDeferredValue, useEffect, useEffectEvent, useState } from "react"
import {
  AlertCircle,
  Boxes,
  CircleDashed,
  LoaderCircle,
  PackagePlus,
  PencilLine,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react"

import { inventoryApi } from "@/api/inventoryApi.ts"
import { ItemEditorDialog } from "@/components/item-editor-dialog.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { Categories } from "@/types/Categories.ts"
import type { InventoryItem } from "@/types/InventoryItem.ts"

type StockMode = "all" | "healthy" | "low" | "unavailable"
type EditorState = { mode: "create" | "edit"; open: boolean }

const emptyItem: InventoryItem = {
  name: "",
  description: "",
  price: 0,
  stockLevel: 0,
  category: Categories[0],
  threshold: 0,
  isAvailable: true,
  currency: "USD",
  shardKey: "PK1",
}

function formatCurrency(item: InventoryItem) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency || "USD",
    maximumFractionDigits: 2,
  }).format(item.price || 0)
}

function buildRandomItem(): InventoryItem {
  const prefixes = ["North", "Atlas", "Field", "Cinder", "Orbit", "Signal"]
  const nouns = ["Lamp", "Chair", "Pack", "Reader", "Shelf", "Sensor"]
  const category = Categories[Math.floor(Math.random() * Categories.length)]
  const stockLevel = Math.floor(Math.random() * 180)
  const threshold = Math.floor(Math.random() * 40)
  const seed = Math.random().toString(36).slice(2, 6).toUpperCase()

  return {
    ...emptyItem,
    name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${seed}`,
    description: `${category} item prepared from the dashboard seed action.`,
    category,
    price: Number((Math.random() * 240 + 18).toFixed(2)),
    stockLevel,
    threshold,
    isAvailable: stockLevel > threshold,
    currency: ["USD", "EUR", "GBP"][Math.floor(Math.random() * 3)],
  }
}

async function fetchInventoryPage(
  category: string,
  search: string,
  cursor: string | null | undefined
) {
  if (category !== "all" && search) {
    return inventoryApi.getItemsByCategoryAndName(category, search, cursor)
  }
  if (category !== "all") {
    return inventoryApi.getItemsByCategory(category, cursor)
  }
  if (search) {
    return inventoryApi.getItemsByName(search, cursor)
  }
  return inventoryApi.getAllItemsPage(cursor)
}

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [stockMode, setStockMode] = useState<StockMode>("all")
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [editor, setEditor] = useState<EditorState>({ mode: "create", open: false })
  const [draftItem, setDraftItem] = useState<InventoryItem>(emptyItem)

  async function loadItems(replace: boolean) {
    if (!replace && !hasMore) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const page = await fetchInventoryPage(activeCategory, deferredSearch, replace ? null : cursor)

      setItems((currentItems) => (replace ? page.items : [...currentItems, ...page.items]))
      setCursor(page.lastEvaluatedKey)
      setHasMore(page.lastEvaluatedKey !== null)

      if (replace && page.items[0]?.itemId) {
        setSelectedItemId(page.items[0].itemId)
      }
      if (replace && page.items.length === 0) {
        setSelectedItemId(null)
      }
    } catch (caughtError) {
      console.error(caughtError)
      setError("Inventory data could not be loaded. Check the API server and try again.")
      if (replace) {
        setItems([])
        setSelectedItemId(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const syncInventory = useEffectEvent(() => {
    void loadItems(true)
  })

  useEffect(() => {
    syncInventory()
  }, [activeCategory, deferredSearch])

  const visibleItems = items.filter((item) => {
    if (stockMode === "low") {
      return item.stockLevel <= item.threshold
    }
    if (stockMode === "healthy") {
      return item.isAvailable && item.stockLevel > item.threshold
    }
    if (stockMode === "unavailable") {
      return !item.isAvailable
    }
    return true
  })

  const selectedItem =
    visibleItems.find((item) => item.itemId === selectedItemId) ??
    visibleItems[0] ??
    items.find((item) => item.itemId === selectedItemId) ??
    null

  const totalUnits = visibleItems.reduce((sum, item) => sum + item.stockLevel, 0)
  const lowStockCount = visibleItems.filter((item) => item.stockLevel <= item.threshold).length
  const unavailableCount = visibleItems.filter((item) => !item.isAvailable).length
  const healthyCount = visibleItems.filter(
    (item) => item.isAvailable && item.stockLevel > item.threshold
  ).length
  const inventoryValue = visibleItems.reduce((sum, item) => sum + item.price * item.stockLevel, 0)

  function openCreateDialog(seed?: InventoryItem) {
    setDraftItem(seed ?? { ...emptyItem })
    setEditor({ mode: "create", open: true })
  }

  function openEditDialog(item: InventoryItem) {
    setDraftItem({ ...item })
    setEditor({ mode: "edit", open: true })
  }

  async function handleSubmitEditor() {
    setIsSaving(true)
    setError("")

    const payload = {
      ...draftItem,
      price: Number.isFinite(draftItem.price) ? draftItem.price : 0,
      stockLevel: Number.isFinite(draftItem.stockLevel) ? draftItem.stockLevel : 0,
      threshold: Number.isFinite(draftItem.threshold) ? draftItem.threshold : 0,
      shardKey: draftItem.shardKey || "PK1",
    }

    try {
      if (editor.mode === "create") {
        const created = await inventoryApi.createItem(payload)
        setItems((currentItems) => [created, ...currentItems])
        setSelectedItemId(created.itemId ?? null)
      } else {
        const updated = await inventoryApi.updateItem(payload)
        setItems((currentItems) =>
          currentItems.map((item) => (item.itemId === updated.itemId ? updated : item))
        )
        setSelectedItemId(updated.itemId ?? null)
      }
      setEditor((current) => ({ ...current, open: false }))
    } catch (caughtError) {
      console.error(caughtError)
      setError("Save failed. The inventory API rejected the request.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(item: InventoryItem) {
    if (!item.itemId) {
      return
    }
    if (!window.confirm(`Delete ${item.name}?`)) {
      return
    }

    setError("")
    try {
      await inventoryApi.deleteItem(item.itemId)
      setItems((currentItems) => currentItems.filter((currentItem) => currentItem.itemId !== item.itemId))
      setSelectedItemId((currentId) => (currentId === item.itemId ? null : currentId))
    } catch (caughtError) {
      console.error(caughtError)
      setError("Delete failed. The inventory API rejected the request.")
    }
  }

  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <Card className="overflow-hidden">
              <CardContent className="relative px-6 pt-6 pb-6 sm:px-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_60%)] lg:block" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl space-y-3">
                      <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-900">
                        Dashboard catalog
                      </Badge>
                      <div className="space-y-2">
                        <h1 className="font-[Space_Grotesk,_Avenir_Next,_Segoe_UI,_sans-serif] text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                          Stock Atlas
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                          Separate frontend for the same inventory backend, built as a visual operations dashboard instead of the table-based admin in `web/web`.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => void loadItems(true)} disabled={isLoading}>
                        <RefreshCcw className={isLoading ? "animate-spin" : ""} />
                        Refresh
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => openCreateDialog(buildRandomItem())}>
                        <Sparkles />
                        Seed item
                      </Button>
                      <Button type="button" onClick={() => openCreateDialog()}>
                        <PackagePlus />
                        New item
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Visible items" value={String(visibleItems.length)} hint="Cards after active filters" />
                    <MetricCard label="Units in stock" value={String(totalUnits)} hint="Current inventory count" />
                    <MetricCard label="Low stock alerts" value={String(lowStockCount)} hint="At or below threshold" />
                    <MetricCard
                      label="Inventory value"
                      value={new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(inventoryValue)}
                      hint="Price x stock level"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 text-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <CircleDashed className="size-4 text-cyan-300" />
                  Status
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Quick readout from the active result set.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <StatusLine label="Unavailable" value={String(unavailableCount)} tone="danger" />
                <StatusLine label="Healthy stock" value={String(healthyCount)} tone="success" />
                <StatusLine label="Loaded pages" value={cursor ? "Multiple" : items.length > 0 ? "1" : "0"} tone="neutral" />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <Card className="h-fit xl:sticky xl:top-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Drive API-backed queries, then refine locally by stock health.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Search</span>
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by item name"
                  />
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="all">All categories</SelectItem>
                        {Categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Stock state</span>
                  <div className="grid gap-2">
                    <StockFilterButton label="All inventory" active={stockMode === "all"} onClick={() => setStockMode("all")} />
                    <StockFilterButton label="Healthy stock" active={stockMode === "healthy"} onClick={() => setStockMode("healthy")} />
                    <StockFilterButton label="Low stock" active={stockMode === "low"} onClick={() => setStockMode("low")} />
                    <StockFilterButton label="Unavailable" active={stockMode === "unavailable"} onClick={() => setStockMode("unavailable")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {error ? (
                <Card className="border-rose-200 bg-rose-50/90">
                  <CardContent className="flex items-center gap-3 px-6 py-5 text-rose-800">
                    <AlertCircle className="size-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {visibleItems.map((item) => {
                  const isLow = item.stockLevel <= item.threshold
                  const isActive = selectedItem?.itemId === item.itemId

                  return (
                    <Card
                      key={item.itemId ?? item.name}
                      className={isActive ? "border-cyan-400 bg-cyan-50/80" : ""}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <Badge variant="outline" className="w-fit">
                              {item.category}
                            </Badge>
                            <CardTitle className="text-xl">{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                          </div>
                          <Badge
                            variant={!item.isAvailable ? "danger" : isLow ? "warning" : "success"}
                          >
                            {!item.isAvailable ? "Unavailable" : isLow ? "Low stock" : "Healthy"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <MiniStat label="Price" value={formatCurrency(item)} />
                          <MiniStat label="Stock" value={String(item.stockLevel)} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Threshold</span>
                            <span>{item.threshold}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className={`h-2 rounded-full ${isLow ? "bg-amber-500" : "bg-cyan-500"}`}
                              style={{
                                width: `${Math.min(100, Math.max(10, (item.stockLevel / Math.max(item.threshold || 1, item.stockLevel, 1)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" onClick={() => setSelectedItemId(item.itemId ?? null)}>
                            <Boxes />
                            Focus
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => openEditDialog(item)}>
                            <PencilLine />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {!isLoading && visibleItems.length === 0 ? (
                  <Card className="md:col-span-2 2xl:col-span-3">
                    <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                      <Boxes className="size-8 text-slate-400" />
                      <div className="space-y-1">
                        <p className="text-base font-medium text-slate-900">No items match the current view.</p>
                        <p className="text-sm text-slate-500">Adjust filters or seed a new record into the catalog.</p>
                      </div>
                      <Button type="button" onClick={() => openCreateDialog(buildRandomItem())}>
                        <Sparkles />
                        Seed item
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              <div className="flex justify-center">
                <Button type="button" variant="outline" onClick={() => void loadItems(false)} disabled={isLoading || !hasMore}>
                  {isLoading ? <LoaderCircle className="animate-spin" /> : <RefreshCcw />}
                  {hasMore ? "Load more" : "No more items"}
                </Button>
              </div>
            </div>

            <Card className="h-fit xl:sticky xl:top-6">
              <CardHeader>
                <CardTitle>Item focus</CardTitle>
                <CardDescription>Detail panel for the currently selected card.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {selectedItem ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{selectedItem.category}</Badge>
                        <Badge
                          variant={
                            !selectedItem.isAvailable
                              ? "danger"
                              : selectedItem.stockLevel <= selectedItem.threshold
                                ? "warning"
                                : "success"
                          }
                        >
                          {!selectedItem.isAvailable
                            ? "Unavailable"
                            : selectedItem.stockLevel <= selectedItem.threshold
                              ? "Low stock"
                              : "Healthy"}
                        </Badge>
                      </div>

                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{selectedItem.name}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <DetailRow label="Item ID" value={selectedItem.itemId ?? "Pending"} />
                      <DetailRow label="Price" value={formatCurrency(selectedItem)} />
                      <DetailRow label="Stock level" value={String(selectedItem.stockLevel)} />
                      <DetailRow label="Threshold" value={String(selectedItem.threshold)} />
                      <DetailRow label="Availability" value={selectedItem.isAvailable ? "Available" : "Unavailable"} />
                    </div>

                    <div className="grid gap-2">
                      <Button type="button" onClick={() => openEditDialog(selectedItem)}>
                        <PencilLine />
                        Edit selected item
                      </Button>
                      <Button type="button" variant="destructive" onClick={() => void handleDelete(selectedItem)}>
                        <Trash2 />
                        Delete selected item
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                    <CircleDashed className="size-8 text-slate-400" />
                    <div className="space-y-1">
                      <p className="text-base font-medium text-slate-900">No active selection</p>
                      <p className="text-sm text-slate-500">Pick a card from the catalog grid to inspect it here.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <ItemEditorDialog
        item={draftItem}
        mode={editor.mode}
        open={editor.open}
        isSaving={isSaving}
        onClose={() => setEditor((current) => ({ ...current, open: false }))}
        onChange={setDraftItem}
        onSubmit={() => void handleSubmitEditor()}
      />
    </>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-xs">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function StatusLine({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "success" | "danger" | "neutral"
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-400"
      : tone === "danger"
        ? "bg-rose-400"
        : "bg-cyan-400"

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`size-2 rounded-full ${toneClass}`} />
          <span className="text-sm text-slate-200">{label}</span>
        </div>
        <span className="text-lg font-semibold text-white">{value}</span>
      </div>
    </div>
  )
}

function StockFilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
        active
          ? "border-cyan-400 bg-cyan-50 text-cyan-900"
          : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}
