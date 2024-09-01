import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./alert-dialog";

interface ModalProps {
    title: string,
    description: string,
    destructive?: boolean,
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function Modal({ title, description, onCancel, onConfirm, isOpen, destructive = false }: ModalProps) {
    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onCancel}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-black">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-black">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="px-4 py-2 text-black font-semibold bg-gray-200 rounded-lg shadow-sm transition-colors duration-200 hover:bg-blue-500 hover:text-white"
                    >
                        Cancel
                    </AlertDialogCancel>
                    {destructive ? (<AlertDialogAction
                        onClick={onConfirm}
                        className="ml-3 px-4 py-2 text-white font-semibold bg-red-500 rounded-lg shadow-sm transition-colors duration-200 hover:bg-red-600"
                    >
                        Continue
                    </AlertDialogAction>)
                    :
                    (<AlertDialogAction
                        onClick={onConfirm}
                        className="ml-3 px-4 py-2 text-white font-semibold bg-blue-500 rounded-lg shadow-sm transition-colors duration-200 hover:bg-red-600"
                    >
                        Continue
                    </AlertDialogAction>)
                    }

                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
