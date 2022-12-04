import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { useContext, useEffect, useState } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { Col, Row } from "react-bootstrap";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/reset-password";

  const [email, setEmail] = useState("");
  //const [password, setPassword] = useState('');

  const { state } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/users/forgot-password", {
        email,
      });
      toast.success("Reset Link sent to your mail ");
      //ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));

      //navigate('/reset-password');
    } catch {
      toast.error("User Not registered");
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container  forgot-mt-3 ">
      <Helmet>
        <title>Forgot Password </title>
      </Helmet>
      <Row className="justify-content-center md-6">
        <Col className="  col-md-8 col-xs-8 col-sm-8 shadow p-3 mb-5 bg-white rounded mt-n1-2">
          <Form onSubmit={submitHandler}>
            <h2 className="my-3 text-center">Forgot Password ?</h2>
            <Form.Group className="mb-3 text-center" controlId="password">
              <i className="zmdi zmdi-email material-icons-name"></i>
              <Form.Label>
                Enter your email address below to verify and reset password{" "}
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Your Email Address"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <div className="mb-3  text-center">
              <Button type="submit">Send</Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
