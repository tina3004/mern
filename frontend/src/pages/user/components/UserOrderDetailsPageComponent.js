import { Alert, Button, Col, Container, FormSelect, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import CartItemComponent from "../../../components/CartItemComponent";
import {useEffect,useState,useRef} from "react";
import { useParams } from "react-router-dom";

const UserOrderDetailsPageComponent=({userInfo,getUser,getOrder,loadPayPalScript})=>{

    const [userAddress, setUserAddress] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isPaid, setIsPaid] = useState(false);
    const [orderButtonMessage, setOrderButtonMessage] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [isDelivered, setIsDelivered] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const paypalContainer=useRef();
    // console.log(paypalContainer);
    const {id} = useParams(); // Get the order ID from the URL

    useEffect(()=>{
        getUser()
        .then(data=>{
            setUserAddress({address:data.address, city:data.city, country:data.country, state:data.state, zipCode:data.zipCode, phoneNumber:data.phoneNumber});
        })
        .catch((err)=>{
            console.log(err);
        })
    },[])
    /*
    this is the data object when you console.log(data) in the getOrder function
    {orderTotal: {…}, _id: '6847d5bb783f4aeae3ae0f3b', user: {…}, cartItems: Array(3), paymentMethod: 'pp', …}
    cartItems: (3) [{…}, {…}, {…}]
    createdAt:"2025-06-10T06:50:35.989Z"
    isDelivered:false
    isPaid:false
    orderTotal: {itemsCount: 4, cartSubtotal: 1200}
    paymentMethod:"pp"
    updatedAt:"2025-06-10T06:50:35.989Z"
    user:{name: 'John11', lastName: 'Doe', email: 'john@doe.com', address: 'a', city: 'a', …}
    _id:"6847d5bb783f4aeae3ae0f3b"
    */
    useEffect(()=>{
        getOrder(id)
        .then((data)=>{
            setPaymentMethod(data.paymentMethod);
            setCartItems(data.cartItems);
            setCartSubtotal(data.orderTotal.cartSubtotal);
            data.isDelivered ? setIsDelivered(data.deliveredAt): setIsDelivered(false);
            data.isPaid ? setIsPaid(data.paidAt): setIsPaid(false);
            if(data.isPaid){
                setOrderButtonMessage("Your Order is finished");
                setButtonDisabled(true);
            }
            else{
                if(data.paymentMethod === "pp"){
                    setOrderButtonMessage("Pay for the order");
                }
                else if(data.paymentMethod === "cod"){
                    setButtonDisabled(true);
                    setOrderButtonMessage("Wait for your order. You pay on delivery");
                }

            }
        })
        .catch((err)=>{
            console.log(err);
        })
    },[])

    const orderHandler=()=>{
        setButtonDisabled(true);
        if(paymentMethod==='pp'){
            setOrderButtonMessage("To pay for your order click one of the buttons below");
            if(!isPaid){
                loadPayPalScript(cartSubtotal,cartItems,id,updateStateAfterOrder)
            }
        }
        else{
            setOrderButtonMessage("Your order was placed. Thank you")
        }
    }

    const updateStateAfterOrder=(paidAt)=>{
        setOrderButtonMessage("Thank you for your payment!");
        setIsPaid(paidAt);
        setButtonDisabled(true);
        paypalContainer.current.style="display:none";
    }
    return (
        <Container fluid>
            <Row className="mt-4">
                <h1>Order Details</h1>
                <Col md={8}>
                    <br/>
                    <Row>
                        <Col md={6}>
                            <h2>Shipping</h2>
                            <b>Name</b>:{userInfo.name} {userInfo.lastName} <br/>
                            <b>Address:</b>: {userAddress.address} {userAddress.city} {userAddress.state} {userAddress.country} {userAddress.zipCode}<br/>
                            <b>Phone</b>:{userAddress.phoneNumber}<br/>
                        </Col>
                        <Col md={6}>
                            <h2>Payment Method</h2>
                            <FormSelect value={paymentMethod} disabled={true}>
                                <option value="pp">
                                    PayPal
                                </option>
                                <option value="cod">
                                    Cash on Delivery(delivery may be delayed)
                                </option>
                            </FormSelect>
                        </Col>
                        <Row>
                            <Col>
                            <Alert className="mt-3" variant={isDelivered ? "success" : "danger"}>
                                {isDelivered ? <>Delivered at {isDelivered}</>: <>Not Delivered</>}
                            </Alert>
                            </Col>

                            <Col>
                            <Alert className="mt-3" variant={isPaid ? "success" : "danger"}>
                                {isPaid ? <>Paid on {isPaid}</> : <>Not Paid yet</>} 
                            </Alert>
                            </Col>
                        </Row>                    
                    </Row> 
                    <br/>
                       
                    <ListGroup variant="flush">
                        <h2>Order Items</h2>
                        {cartItems.map((item,idx)=>(
                            <CartItemComponent item={item} key={idx} orderCreated={true}/>
                        )) }
                    </ListGroup>             
                </Col>
                <Col md={4}>
                    
                    <ListGroup>
                        <ListGroupItem>
                        <h3>Order Summary</h3>
                        </ListGroupItem>
                        <ListGroupItem>
                        Items price(after tax): <span className="fw-bold">$892</span>
                        </ListGroupItem>
                        <ListGroupItem>
                        Shipping: <span className="fw-bold">included</span>
                        </ListGroupItem>
                        <ListGroupItem>
                        Tax: <span className="fw-bold">included</span>
                        </ListGroupItem>
                        <ListGroupItem className="text-danger">
                        Total Price: <span className="fw-bold">${cartSubtotal}</span>
                        </ListGroupItem>
                        <ListGroupItem>
                            <div className="d-grid gap-2">
                            <Button size="lg" onClick={orderHandler} variant="danger" disabled={buttonDisabled}>
                                {orderButtonMessage}
                            </Button>
                            </div>
                            <div style={{position:'relative',zIndex:1}}>

                                <div ref={paypalContainer} id="paypal-container-element"></div>
                            </div>
                        </ListGroupItem>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}

export default UserOrderDetailsPageComponent;