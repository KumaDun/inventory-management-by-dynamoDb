import { Button } from "@/components/ui/button.tsx"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import {useForm} from "react-hook-form"
import type {InventoryItem} from "@/types/InventoryItem.ts";

export function InventoryItemCard({onClose}: {onClose: ()=> void}) {
    const {register, handleSubmit, reset} = useForm<InventoryItem>()

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Add Inventory Item</CardTitle>
                <CardAction>
                    <Button
                        variant="outline"
                        type = "reset"
                        color="primary"
                        onClick={() => reset()}
                    >
                        Clear </Button>
                </CardAction>
                <CardDescription>
                    Enter item details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <Label>Name</Label>
                            <Input
                                {...register("name")}
                                id="name"
                                type="text"
                                // value = {item.name}
                                placeholder="iPhone"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Description</Label>
                            <Input
                                {...register("description")}
                                id="destiption"
                                type="text"
                                // value = {item.description}
                                placeholder="iPhone 17 Air"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Category</Label>
                            <Input
                                {...register("category")}
                                id="category"
                                type="text"
                                // value = {item.category}
                                placeholder="Electronics"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Price</Label>
                            <Input
                                {...register("price")}
                                id="price"
                                type="number"
                                // value = {item.price}
                                placeholder="1200"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Stock</Label>
                            <Input
                                {...register("stockLevel")}
                                id="stock"
                                type="text"
                                // value = {item.stockLevel}
                                placeholder="200"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Threshold</Label>
                            <Input
                                {...register("threshold")}
                                id="threshold"
                                type="number"
                                // value = {String(item.available)}
                                placeholder="20"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label >Availability</Label>
                            <Input
                                {...register("available")}
                                id="status"
                                type="text"
                                // value = {String(item.available)}
                                placeholder="True"
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button
                    type="submit"
                    onClick = {handleSubmit((data: InventoryItem) => {
                        console.log(data)
                        reset()
                    })}
                    className="w-full">
                    Add Item
                </Button>
                <Button variant="outline" className="w-full"
                        onClick = {onClose}
                >
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    )
}
