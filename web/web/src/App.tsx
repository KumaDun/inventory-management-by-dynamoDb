import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Header} from '@/components/ui/header.tsx'
import { InventoryItemCard} from "@/components/component/inventoryItemCard.tsx";
import { InventoryTable } from "@/components/component/inventoryTable.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {InventoryPop} from "@/components/component/inventoryPop.tsx";


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
                        <InventoryPop></InventoryPop>
                    </div>
                </CardFooter>
            </Card>

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
