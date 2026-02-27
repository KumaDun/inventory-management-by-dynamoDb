import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

export function DeletePop(
    {isOpenDelete, onIsOpenChange, onDeleted} : {
        isOpenDelete: boolean,
        onIsOpenChange: (isOpenDeleteConfirm: boolean) => void,
        onDeleted: () => void,
    }
) {
    return(
        <Dialog open={isOpenDelete} onOpenChange={onIsOpenChange}>
            <form>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure to delete this item?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                onClick={() => {
                                    onDeleted()
                                }}
                            >Yes. Confirm Delete.</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="outline">No. Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}