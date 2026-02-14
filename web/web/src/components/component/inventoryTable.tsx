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

const items = [
    {
        itemId: "INV001",
        name: "iPhone 17 Air",
        description: "iPhone 17 Air",
        price: 1200,
        stockLevel: 200,
        category: "Electronics",
        threshold: 20,
        available: true,
    },
]

export function InventoryTable() {
    return (
        <Table>
            <TableCaption>A list of your inventory items.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="[w-100px]">ItemId</TableHead>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className= "text-left">Description</TableHead>
                    <TableHead className= "text-left">Price</TableHead>
                    <TableHead className="text-left">Stock</TableHead>
                    <TableHead className="text-left">Category</TableHead>
                    <TableHead className="text-left">Threshold</TableHead>
                    <TableHead className="text-left">Available</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.itemId}>
                        <TableCell className="text-left font-medium">{item.itemId}</TableCell>
                        <TableCell className="text-left font-medium">{item.name}</TableCell>
                        <TableCell className= "text-left ">{item.description}</TableCell>
                        <TableCell className= "text-left">{item.price}</TableCell>
                        <TableCell className="text-left">{item.stockLevel}</TableCell>
                        <TableCell className="text-left">{item.category}</TableCell>
                        <TableCell className="text-left">{item.threshold}</TableCell>
                        <TableCell className="text-left">{String(item.available)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell className="text-left" colSpan={7}>Total</TableCell>
                    <TableCell className="text-left">$2,500.00</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}
