import { Alert, Button } from "react-bootstrap";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AddedToCartMessageComponent = ({showCartMessage , setShowCartMessage}) => {
  const navigate=useNavigate()
  const goBack=()=>{
    navigate(-1)
  }
  return (
    <Alert show={showCartMessage} variant="success" onClose={() => setShowCartMessage(false)} dismissible>
      <Alert.Heading>The product was added to your cart!</Alert.Heading>
      <p>
        <Button variant="success" onClick={goBack}>Go Back</Button> {" "} {/*space between buttons using javascript*/}
        <Link to="/cart">
        <Button variant="danger">Go To Cart</Button>
        </Link>
        
      </p>
    </Alert>
  );
};

export default AddedToCartMessageComponent;
