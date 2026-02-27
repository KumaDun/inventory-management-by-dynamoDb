import './App.css'
import {Header} from '@/components/ui/header.tsx'
import { InventoryTable } from "@/components/component/InventoryTable.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {InventoryPop} from "@/components/component/InventoryPop.tsx";
import {useState} from "react";


function App() {
    const [isLoading, setIsLoading] = useState(true);
    return (
    <>
        <div>
            <Header>
            </Header>
        </div>

        <div className="h-10"></div>

        <div className= "w-auto mx-auto">
            <Card>
                 <CardHeader>
                     <CardTitle>
                         Inventory Items
                     </CardTitle>
                 </CardHeader>
                <CardContent>
                    <InventoryTable isLoadingLinker = {(isLoading: boolean)  => {setIsLoading(isLoading)}}>
                    </InventoryTable>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-end">
                        <InventoryPop disable={isLoading}></InventoryPop>
                    </div>
                </CardFooter>
            </Card>

        </div>


      {/*  <p className="read-the-docs">*/}
      {/*      Powered By Vite and React*/}
      {/*  </p>*/}
      {/*<div className="flex items-center justify-center">*/}
      {/*  <a href="https://vite.dev" target="_blank">*/}
      {/*    <img src={viteLogo} className="logo" alt="Vite logo" />*/}
      {/*  </a>*/}
      {/*  <a href="https://react.dev" target="_blank">*/}
      {/*    <img src={reactLogo} className="logo react" alt="React logo" />*/}
      {/*  </a>*/}
      {/*</div>*/}

    </>
  )
}

export default App
