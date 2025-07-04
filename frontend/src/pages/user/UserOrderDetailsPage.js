import UserOrderDetailsPageComponent from "./components/UserOrderDetailsPageComponent";
import { useSelector } from "react-redux";
import axios from "axios";
import {loadScript} from "@paypal/paypal-js"

const getOrder=async(orderId)=>{  //this id is  taken from the url
    const {data}=await axios.get("/api/orders/user/" + orderId);
    return data;

}

const loadPayPalScript=(cartSubtotal,cartItems,orderId,updateStateAfterOrder)=>{
    loadScript({
            "client-id": "AZALakyVopKEWbL6vefEZdKWjpMlE1HQCz4s6wQ3v_xjU-5HBlpgs7MgEPv_BbBVA5wzP--7qZxoUqyD",
        })
        .then((paypal)=>{
            // console.log(paypal);

            paypal.Buttons(buttons(cartSubtotal,cartItems,orderId,updateStateAfterOrder)).render("#paypal-container-element");
        })
        .catch((err)=>{
            console.error("Failed to load  the Paypal Js SDK script", err);
        })
}

const buttons=(cartSubtotal,cartItems,orderId,updateStateAfterOrder)=>{
    return{
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: cartSubtotal,
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: cartSubtotal,
                                }
                            }
                        },
                        items: cartItems.map(product => {
                            return {
                               name: product.name,
                                unit_amount: {
                                   currency_code: "USD", 
                                   value: product.price,
                                },
                                quantity: product.quantity,
                            }
                        })
                    }
                ]
            })
        },
        onCancel:onCancelHandler,
        onApprove:function(data,actions){
            return actions.order.capture().then(function(orderData){
                // console.log(orderData);
                var transaction=orderData.purchase_units[0].payments.captures[0];
                if(transaction.status==="COMPLETED" && Number(transaction.amount.value)===Number(cartSubtotal)){
                    updateOrder(orderId)
                        .then((data)=>{
                            if(data.isPaid){
                                updateStateAfterOrder(data.paidAt);
                            }
                        })
                        .catch((err)=>{
                            console.error(err);
                        });
            }})
        },
        onError:onErrorHandler,
    }
}
/*
PayPal Payment Response:

{
  create_time: "2025-06-11T12:57:43Z",
  id: "0L309650XE215351Y",
  intent: "CAPTURE",
  status: "COMPLETED",
  update_time: "2025-06-11T12:58:17Z",
  payer: {
    name: { /* first_name, last_name  },
    email_address: "sb-w5uct43593828@personal.example.com",
    payer_id: "YMEUR7WPRVTAA",
    address: { /* address details  }
  },
  purchase_units: [
    {
      reference_id: "default",
      description: "Product7 Tablet Name Lorem ipsum dolor sit amet",
      amount: {
        currency_code: "USD",
        value: "1000.00",
        breakdown: { /* item_total, tax_total, etc.  }
      },
      items: [
        {
          name: "Product7 Tablet Name Lorem ipsum dolor sit amet",
          unit_amount: { /* currency_code, value  },
          tax: { /* currency_code, value  },
          quantity: "1"
        },
        {
          name: "Product6 Tablet Name Lorem ipsum dolor sit amet",
          unit_amount: { /* currency_code, value  },
          tax: { /* currency_code, value },
          quantity: "2"
        }
      ],
      payee: {
        email_address: "sb-g3ait43548745@business.example.com",
        merchant_id: "PMNHHVDCQJ69J"
      },
      shipping: {
        name: { /* full_name  },
        address: { /* address_line_1, admin_area_2, etc. }
      },
      payments: {
        captures: [
          {
            id: "3WK2505866932444E",
            status: "COMPLETED",
            amount: { /* currency_code, value },
            final_capture: true,
            seller_protection: { /* status, dispute_categories  },
            // ... other capture details
          }
        ]
      }
    }
  ],
  links: [ /* HATEOAS links for self, approval, etc.  ]
}*/

const createPayPalOrderHandler=function(){
    console.log("createPayPalOrderHandler called");
}

const onCancelHandler=function(){
    console.log("onCancelHandler called");
}
const onErrorHandler=function(err){
    console.log(err);
}
const updateOrder=async(orderId)=>{
    const {data}=await axios.put("/api/orders/paid/" + orderId);
    return data;
}
const UserOrderDetailsPage=()=>{
    const userInfo=useSelector((state)=>state.userRegisterLogin.userInfo);

    const getUser=async()=>{
        const {data}=await axios.get("/api/users/profile/" + userInfo._id);
        return data;
    }
    return <UserOrderDetailsPageComponent userInfo={userInfo} getUser={getUser} getOrder={getOrder} loadPayPalScript={loadPayPalScript}/>;
}

export default UserOrderDetailsPage;