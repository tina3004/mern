import { Outlet,Navigate } from "react-router-dom";
import UserChatComponent from "./user/UserChatComponent";
import axios from "axios";
import React,{useState,useEffect} from "react";
import LoginPage from "../pages/LoginPage";

const ProtectedRoutesComponent=({admin})=>{
    // let auth=false;
    // if(admin){
    //     let AdminAuth=true;
    //     if(AdminAuth) auth=true;
    // }
    // else{
    //     let UserAuth=true;
    //     if(UserAuth) auth=true;
    // }
    // return auth ? <Outlet/> : <Navigate to="/login" />

    const [isAuth,setIsAuth]=useState();

    useEffect(() => {
        axios.get("/api/get-token").then(function (data) {
            if (data.data.token) {
                setIsAuth(data.data.token);
            }
            return isAuth;
        }) 
    }, [isAuth])

    if(isAuth===undefined) return <LoginPage/>

    return isAuth && admin && isAuth!=="admin" ? (
        <Navigate to ="/login"/>
    ): isAuth && admin ? (
        <Outlet/> //all the other routes from that page
    ): isAuth && !admin ?(
        <>
        <UserChatComponent/>
        <Outlet/>
        </>
    ):(
        <Navigate to="/login"/>
    )
};

export default ProtectedRoutesComponent;
//outlet is the contents of the ProtectedRoutesComponent in app.js