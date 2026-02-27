import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import type {InventoryItem} from "@/types/InventoryItem.ts";
import {useState} from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {inventoryApi} from "@/api/inventoryApi.ts";
import axios from "axios";
import {Categories} from "@/types/Categories.ts";

export function InventoryPop({disable = true}: {disable: boolean}) {
    const defaultFormValues: InventoryItem = {
        itemId: "placeholderId",
        name: "",
        description: "",
        category: "",
        price: 0,
        stockLevel: 0,
        threshold: 0,
        isAvailable: false,
        currency: "USED",
        shardKey: "PK1"
    }

    const {register, handleSubmit, reset, formState: {errors}, setValue} = useForm<InventoryItem>({
        defaultValues: defaultFormValues,
    })
    const [currency, setCurrency] = useState("USD")
    const [categoryValue, setCategoryValue] = useState("")
    const [open, setOpen] = useState(false)
    // TODO add currency and availability dropdown menu

    const currencies = ["USD", "EUR", "JPY", "GBP", "CNY"]
    const randomNamePrefixes = ["Neo", "Ultra", "Prime", "Smart", "Eco", "Pro", "Lite"]
    const randomNameBases = ["Widget", "Desk", "Reader", "Jacket", "Tracker", "Lamp", "Kit"]

    const clearForm = () => {
        reset(defaultFormValues)
        setCategoryValue("")
        setCurrency("USD")
    }

    const onSubmit = async (data: InventoryItem) => {
        console.log("submit inventoryItem for creating", {...data, currency})
        const payload = {
            ...data,
            currency,
            threshold:
                data.threshold == null || Number.isNaN(data.threshold)
                    ? 0
                    : data.threshold,
            isAvailable: (data.isAvailable == null || undefined) ? false : data.isAvailable,
        }

        try {
            const responseData = await inventoryApi.createItem(payload)
            console.log(responseData)
            clearForm()
            setOpen(false)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`createItem error ${error?.code}, ${error?.message}`)
            }
        }
    }

    const openAddNew = () => {
        clearForm()
        setOpen(true)
    }

    const openAddRandom = () => {
        const randomCategory = Categories[Math.floor(Math.random() * Categories.length)]
        const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)]
        const salt = Math.random().toString(36).slice(2, 8).toUpperCase()
        const randomPrefix = randomNamePrefixes[Math.floor(Math.random() * randomNamePrefixes.length)]
        const randomBase = randomNameBases[Math.floor(Math.random() * randomNameBases.length)]
        const randomName = `${randomPrefix} ${randomBase} ${salt}`
        const randomPrice = Number((Math.random() * 400 + 10).toFixed(2))
        const randomStock = Math.floor(Math.random() * 300)
        const randomThreshold = Math.floor(Math.random() * 50)
        const randomAvailable = randomStock > randomThreshold

        reset({
            ...defaultFormValues,
            name: randomName,
            description: `${randomCategory} item ${salt}`,
            category: randomCategory,
            price: randomPrice,
            stockLevel: randomStock,
            threshold: randomThreshold,
            isAvailable: randomAvailable,
            currency: randomCurrency,
        })
        setCategoryValue(randomCategory)
        setCurrency(randomCurrency)
        setOpen(true)
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <form>
            <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={openAddRandom} disabled={disable}>
                    Add Random Item
                </Button>
                <Button type="button" onClick={openAddNew} disabled={disable}>
                    Add New Item
                </Button>
            </div>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit new Inventory</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-144 pr-4">
                    <div className="p-1">
                    <FieldGroup>
                        <Field>
                            <Label >Name</Label>
                            <Input
                                {...register("name", {
                                    required:"Name is required",
                                })}
                                id="name"
                                type="text"
                                // value = {item.name}
                                placeholder="iPhone"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {String(errors.name.message)}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <Label >Description</Label>
                            <Input
                                className = "p-2"
                                {...register("description",{
                                    required:"Description is required",
                                })}
                                id="destiption"
                                type="text"
                                // value = {item.description}
                                placeholder="iPhone 17 Air"
                                required
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">
                                    {String(errors.description.message)}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <Label >Category</Label>
                            <Select
                                value={categoryValue}
                                onValueChange={(value) => {
                                    setCategoryValue(value)
                                    setValue("category", value, {shouldValidate: true})
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        {Categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Input
                                {...register("category", {
                                    required: "Category is required",
                                })}
                                type="hidden"
                                required
                            />
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-500">
                                    {String(errors.category.message)}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <Label >Price</Label>
                            <div className="flex gap-2">
                                <Input
                                    className="flex-1"
                                    {...register("price",{
                                        required:'Price is required',
                                        valueAsNumber: true,
                                        min: {
                                            value: 0,
                                            message: "Minimal stock level is 0"
                                        },
                                    })}
                                    id="price"
                                    type="number"
                                    // value = {item.price}
                                    placeholder="1200"
                                    min={0}
                                    required
                                />
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Currency</SelectLabel>
                                        {currencies.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-500">
                                    {String(errors.price.message)}
                                </p>
                            )}
                        </Field>
                        <Field>
                        <Label >Stock</Label>
                        <Input
                            {...register("stockLevel",{
                                required:'Stock is required',
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: "Minimal stock level is 0"
                                },
                                max: {
                                    value: 999,
                                    message: "Maximal stock level is 999"
                                }
                            })}
                            id="stock"
                            type="number"
                            // value = {item.stockLevel}
                            placeholder="200"
                            min={0}
                            required
                        />
                            {errors.stockLevel && (
                                <p className="mt-1 text-sm text-red-500">
                                    {String(errors.stockLevel.message)}
                                </p>
                            )}
                    </Field>
                        <Field>
                            <Label >Threshold</Label>
                            <Input
                                {...register("threshold")}
                                id="threshold"
                                type="number"
                                placeholder="20"
                            />
                        </Field>
                        <Field>
                            <div className = "flex items-center gap-2">
                                <Label>Availability</Label>
                                <Input className = "w-4 h-4"
                                    {...register("isAvailable")}
                                    id="isAvailable"
                                    type="checkbox"
                                    placeholder="true"
                                />
                            </div>

                        </Field>
                    </FieldGroup>
                        </div>
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" onClick={clearForm} variant="outline">
                        Clear
                    </Button>
                    <Button type="button" onClick={handleSubmit(onSubmit)}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </form>
    </Dialog>
}

