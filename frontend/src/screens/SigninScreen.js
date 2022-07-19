import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { Col, Figure, Row } from 'react-bootstrap';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error('Invalid Username and Password');
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Login </title>
      </Helmet>
      <Row>
        <Col className="login-image  col-md-6 shadow p-3 mb-5 bg-white rounded mt-n1-2">
          <Figure>
            <img
              src="../images/login.png"
              alt="Login pic"
              width={300}
              height={300}
            />
          </Figure>
        </Col>
        <Col className="  col-md-6  shadow p-3 mb-5 bg-white rounded mt-n1-2">
          <Form onSubmit={submitHandler}>
            <h2 className="my-3 text-center">Login </h2>
            <Form.Group className="mb-3" controlId="email">
              <i className="zmdi zmdi-email material-icons-name"></i>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="John@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <i className="zmdi zmdi-lock material-icons-name"></i>
              <Form.Label>Password</Form.Label>{' '}
              <Form.Control
                type="password"
                placeholder="Enter the password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <div className="mb-3">
              <Button type="submit">Login</Button>
            </div>
            <div className="mb-3">
              New customer?{' '}
              <Link to={`/register?redirect=${redirect}`}>
                Create your account
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
