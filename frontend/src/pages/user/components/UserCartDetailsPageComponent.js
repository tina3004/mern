import { Alert, Button, Col, Container, FormSelect, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import CartItemComponent from "../../../components/CartItemComponent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const UserCartDetailsPageComponent=({cartItems,itemsCount,cartSubtotal, addToCart, removeFromCart, reduxDispatch,userInfo,getUser,createOrder})=>{

    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [userAddress, setUserAddress] = useState(false);
    const [missingAddress, setMissingAddress] = useState("");
    const [paymentMethod,setPaymentMethod] = useState("pp");

    const navigate=useNavigate();

    const changeCount=(productID,count)=>{
        reduxDispatch(addToCart(productID,count));
    }
    const removeFromCartHandler=(productID,quantity,price)=>{
        if(window.confirm("Are you sure?")){
            reduxDispatch(removeFromCart(productID,quantity,price))
        }
    }
    useEffect(()=>{
        getUser().then((data)=>{
            if(!data.address || !data.city || !data.country|| !data.state || !data.zipCode || !data.phoneNumber){
                setButtonDisabled(true);
                setMissingAddress("In order to make order, fill out your profile with correct address, city, etc")
            }
            else{
                setUserAddress({address:data.address, city:data.city, country:data.country, state:data.state, zipCode:data.zipCode, phoneNumber:data.phoneNumber});
                setMissingAddress(false)
            }
        })
        .catch((err)=>{
            console.log(err.response.data.message?err.response.data.message: err.response.data)
        })
    },[userInfo._id]);

    const orderHandler=()=>{
        const orderData={
            orderTotal:{
                itemsCount:itemsCount,
                cartSubtotal:cartSubtotal
            },
            cartItems:cartItems.map((items)=>{
                return{
                    productID: items.productID,
                    name: items.name,
                    image: {path: items.image ? (items.image.path ?? null):null},
                    quantity: items.quantity,
                    price: items.price,
                    count: items.count
                }
            }),
            paymentMethod: paymentMethod,
        }
        createOrder(orderData)
        .then((data)=>{
            if(data){
                navigate("/user/order-details/" + data._id);
            }
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    const choosePayment=(e)=>{
        setPaymentMethod(e.target.value);
    }
    return (
        <Container fluid>
            <Row className="mt-4">
                <h1>Cart Details</h1>
                <Col md={8}>
                    <br/>
                    <Row>
                        <Col md={6}>
                            <h2>Shipping</h2>
                            <b>Name</b>: {userInfo.name} {userInfo.lastName} <br/>
                            <b>Address:</b>{userAddress.address} {userAddress.city} {userAddress.state} {userAddress.country} {userAddress.zipCode} <br/>
                            <b>Phone</b>: {userAddress.phoneNumber}<br/>
                        </Col>
                        <Col md={6}>
                            <h2>Payment Method</h2>
                            <FormSelect onChange={choosePayment}>
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
                            <Alert className="mt-3" variant="danger">
                                Not delivered. 
                                {missingAddress}
                            </Alert>
                            </Col>

                            <Col>
                            <Alert className="mt-3" variant="success">
                                Not paid yet
                            </Alert>
                            </Col>
                        </Row>                    
                    </Row> 
                    <br/>
                       
                    <ListGroup variant="flush">
                        <h2>Order Items</h2>
                        {cartItems.map((item,idx)=>(
                            <CartItemComponent item={item} key={idx} removeFromCartHandler={removeFromCartHandler} changeCount={changeCount} />
                        )) }
                    </ListGroup>             
                </Col>
                <Col md={4}>
                    
                    <ListGroup>
                        <ListGroupItem>
                        <h3>Order Summary</h3>
                        </ListGroupItem>
                        <ListGroupItem>
                        Items price(after tax): <span className="fw-bold">${cartSubtotal}</span>
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
                            <Button size="lg" onClick={orderHandler} variant="danger" type="button" disabled={buttonDisabled}>
                                Place order
                            </Button>
                            </div>
                        </ListGroupItem>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}

export default UserCartDetailsPageComponent;