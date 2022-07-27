import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { Col, Row } from 'react-bootstrap';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/forgot-password', {
        email,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error('User Not registered');
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container  container-up">
      <Helmet>
        <title>Forgot Password </title>
      </Helmet>
      <Row>
        <Col className="  col-md-6  shadow p-3 mb-5 bg-white rounded mt-n1-2">
          <Form onSubmit={submitHandler}>
            <h2 className="my-3 text-center">Forgot Password </h2>
            <Form.Group className="mb-3" controlId="password">
              <i className="zmdi zmdi-email material-icons-name"></i>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <div className="mb-3">
              <Button type="submit">Reset Link</Button>
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
