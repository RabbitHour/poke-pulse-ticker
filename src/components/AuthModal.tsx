import {Dialog,DialogContent,DialogTitle} from "@/components/ui/dialog";
import AccountForm from "./AccountForm";
export default function AuthModal({onClose}:{onClose:()=>void}){return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="bright-market max-w-md"><DialogTitle className="sr-only">Collector account</DialogTitle><AccountForm initialMode="signin" onSuccess={onClose}/></DialogContent></Dialog>;}
