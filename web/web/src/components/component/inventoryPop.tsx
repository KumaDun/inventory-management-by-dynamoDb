import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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

export function InventoryPop() {
    const {register, handleSubmit, reset, formState: {errors}} = useForm<InventoryItem>()
    const [currency, setCurrency] = useState("USD")
    // TODO add currency and availability dropdown menu

    const categories = [
        "Electronics",
        "Furniture",
        "Books",
        "Clothing",
        "Sports"
    ]
    const currencies = ["USD", "EUR", "JPY", "GBP", "CNY"]

    return <Dialog>
        <form>
            <DialogTrigger asChild>
                <Button type="button">Add New Item</Button>
            </DialogTrigger>
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
                            <Input
                                {...register("category",{
                                    required:'Category is required',
                                })}
                                id="category"
                                type="text"
                                list="cate"
                                placeholder="Electronics"
                                required
                            />
                            <datalist id="cate">
                                {categories.map((category) => (
                                    <option key={category} value={category} />
                                ))}
                            </datalist>
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
                                    {...register("available")}
                                    id="available"
                                    type="checkbox"
                                    placeholder="true"
                                />
                            </div>

                        </Field>
                    </FieldGroup>
                        </div>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick = {() => reset(undefined, { keepValues: false })} variant="outline">
                        Clear
                    </Button>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick = {handleSubmit((data: InventoryItem) => {
                                console.log("submit inventoryItem", {...data, currency})
                                const payload = {
                                    ...data,
                                    threshold:
                                        data.threshold == null || Number.isNaN(data.threshold)
                                            ? 0
                                            : data.threshold,
                                    isAvailable: (data.available == null || undefined) ? false : data.available,
                                }
                                inventoryApi.createItem(payload).then((responseData) => {
                                    try {
                                        console.log(responseData)
                                    } catch (error) {
                                        if (axios.isAxiosError(error) && error.response?.status === 404) {
                                            console.log(`createItem error ${error?.code}, ${error?.message}`)
                                        }
                                    }
                                })
                                reset(undefined, { keepValues: false })
                                setCurrency("USD")
                            })}>
                            Submit
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </form>
    </Dialog>
}

