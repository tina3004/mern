import { useEffect } from "react";
import {useLocation} from "react-router-dom"

export default function ScrollToTop(){
    /*useLocation is a react hook 
    path from url address bar of the browser whenever the path changes
    The location object contains information about the URL, such as pathname, search, and hash.
    The code destructures the pathname property from the object returned by useLocation().*/

    /*useEffect(()=>{
    useEffect:
    This is a React hook used to perform side effects in functional components (e.g., data fetching, DOM manipulation, subscriptions, etc.).
    In this case, the side effect is to scroll the page to the top when the pathname changes.
    The second argument of useEffect is the dependency array. This tells React when to re-run the effect.
    [pathname] means the effect will run only when the value of pathname changes.
    When the URL changes (i.e., pathname changes), the page will automatically scroll to the top.

    */
    const {pathname}=useLocation();
    useEffect(()=>{
        window.scrollTo(0,0)
    },[pathname])
    return null
}