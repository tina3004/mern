//strictly react components in this file, and the api calling in the AdminUsersPage.js file

import { Row, Col, Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminLinksComponent from "../../../components/admin/AdminLinksComponent"
import { LinkContainer } from "react-router-bootstrap";
import { useState,useEffect } from "react";
import { logout } from "../../../redux/actions/userActions";
  import { useDispatch } from "react-redux";

const UsersPageComponent = ({fetchUsers,deleteUser}) => {
    const [users, setUsers] = useState([]);  //users is initially =empty array
    const [userDeleted,setUserDeleted]=useState(false)
    const dispatch=useDispatch()

    const deleteHandler = async(userId) => {
        if(window.confirm("Are you sure?")){
          const data=await deleteUser(userId)
          if(data==='User removed'){      //this comes from the backend userController.js response
            setUserDeleted(!userDeleted) 
          }
        };
    }

    useEffect(()=>{
      const abctrl=new AbortController()
      fetchUsers(abctrl).then((res)=>setUsers(res)).catch((er)=>{
        dispatch(logout())
        // console.log(er.response.data.message ? er.response.data.message : er.data) 
      })
      return ()=>abctrl.abort()
    },[userDeleted])   //html will be re-rendered when user is deleted the row will be removed automatically otherwise we have to refresh the page
  return (
    <Row className="m-5">
      <Col md={2}>
        <AdminLinksComponent/>
      </Col>
      <Col md={10}>
        <h1>User List</h1>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>IsAdmin</th>
              <th>Edit/Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map(
              (user, idx) => (
                <tr key={idx}>
                  <td>{idx +1}</td>
                  <td>{user.name}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.isAdmin ? <i className="bi bi-check-lg text-success"></i>: <i className="bi bi-x-lg text-danger"></i>}
                    
                  </td>
                  <td>
                    <LinkContainer to={`/admin/edit-user/${user._id}`}> 
                        <Button className="btn-sm">
                            <i className="bi bi-pencil-square"></i>
                        </Button>
                    </LinkContainer>
                    {"/"}
                    <Button variant="danger" className="btn-sm" 
                        onClick={()=>deleteHandler(user._id)}>
                        <i className="bi bi-x-circle"></i>
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default UsersPageComponent;

