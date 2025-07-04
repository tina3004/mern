import { LOGIN_USER , LOGOUT_USER} from "../constants/userConstants";

export const userRegisterLoginReducer=(state={},action)=>{
    switch(action.type){
        case LOGIN_USER:
            return{
                ...state, //destructuring to return old values from the state
                userInfo:action.payload, //new object for state
            }
        case LOGOUT_USER:
            return {}
        default:
            return state;
    }
}