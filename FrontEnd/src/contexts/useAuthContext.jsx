
import AuthContext from "./authContext"
import { useContext } from "react"

export const useAuthContext = ()=>{
    const ctx=useContext(AuthContext)
    if(!ctx){
    throw new Error("context must be provided")
    }
    return ctx
}