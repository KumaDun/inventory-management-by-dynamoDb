import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Header} from '@/components/ui/header.tsx'
import { InventoryItemCard} from "@/components/component/inventoryItemCard.tsx";
import { InventoryTable } from "@/components/component/inventoryTable.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
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
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";


function App() {
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);


    return (
    <>
        <div>
            <Header>
            </Header>
        </div>
        {isAddingItem &&
            <div className = "w-96 mx-auto">
                <InventoryItemCard
                    onClose = {() => setIsAddingItem(false)}
                ></InventoryItemCard>
            </div>
        }

        <div className="h-10"></div>

        <div className= "w-auto mx-auto">
            <Card>
                 <CardHeader>
                     <CardTitle>
                         Inventory Items
                     </CardTitle>
                 </CardHeader>
                <CardContent>
                    <InventoryTable>
                    </InventoryTable>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-end">
                        <Button
                            onClick = {() => setIsAddingItem(true)}
                        >Add New Item</Button>
                    </div>
                </CardFooter>
            </Card>

            <Dialog>
                <form>
                    <DialogTrigger asChild>
                        <Button variant="outline">Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you&apos;re
                                done.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="name-1">Name</Label>
                                <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                            </Field>
                            <Field>
                                <Label htmlFor="username-1">Username</Label>
                                <Input id="username-1" name="username" defaultValue="@peduarte" />
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                        {/*<InventoryItemCard*/}
                        {/*    onClose = {() => setIsAddingItem(false)}*/}
                        {/*></InventoryItemCard>*/}
                    </DialogContent>
                </form>
            </Dialog>

        </div>


        <p className="read-the-docs">
            Powered By Vite and React
        </p>
      <div className="flex items-center justify-center">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

    </>
  )
}

export default App
