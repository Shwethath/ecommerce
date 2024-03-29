import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { Col, Figure, Row } from 'react-bootstrap';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state } = useContext(Store); //dispatch: ctxDispatch
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { data } = await axios.post('/api/users/register', {
        name,
        email,
        password,
      });
      // ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Verification Link sent to your mail ');
      navigate(`/login?redirect=${redirect}`);
    } catch {
      toast.error('User already registred');
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container container-up">
      <Helmet>
        <title>Register</title>
      </Helmet>
      <Row md={12} className=" shadow p-3 mb-5 bg-white rounded mt-n1-2">
        <h2 className="my-3 text-center">Register</h2>
        <Col md={6} xs={12}>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-2" controlId="name">
              <i className="zmdi zmdi-account material-icons-name"></i>
              <Form.Label> Full Name</Form.Label>
              <Form.Control
                placeholder="Your Name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="email">
              {/* <i className="zmdi zmdi-email material-icons-name"></i> */}
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Your Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="password">
              {/* <i className="zmdi zmdi-lock material-icons-name"></i> */}
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                placeholder="Set Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Form.Group className="mb-2 mt-3" controlId="confirmPassword">
                {/* <i className="zmdi zmdi-lock material-icons-name"></i> */}
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
            </Form.Group>
            <div className="mb-3">
              <Button type="submit">Register</Button>
            </div>
            <div className="mb-3">
              Already have an account?{' '}
              <Link to={`/login?redirect=${redirect}`}>Log-In</Link>
            </div>
          </Form>
        </Col>
        <Col md={6} xs={12} className="login-image    ">
          <Figure>
            <img
              src="../images/signup.jpg"
              alt="Register pic"
              width={250}
              height={400}
            />
          </Figure>
        </Col>
      </Row>
    </Container>
  );
}
