import RegisterPageComponent from "./components/RegisterPageComponent";
import axios from "axios";
import {useDispatch} from "react-redux";
import {setReduxUserState} from "../redux/actions/userActions";
const RegisterPage = () => {
  const registerUserApiRequest= async(name,lastName,email,password)=>{
    const {data}=await axios.post("/api/users/register",{name,lastName,email,password})
    sessionStorage.setItem("userInfo",JSON.stringify(data.userCreated))
    if(data.success==="User Created"){
        window.location.href="/user"
    }
    return data
  }
  const reduxDispatch=useDispatch()
  return (
    
    <RegisterPageComponent registerUserApiRequest={registerUserApiRequest} reduxDispatch={reduxDispatch} setReduxUserState={setReduxUserState}/>
  );
};

export default RegisterPage;

