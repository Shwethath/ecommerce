import { useNavigate } from 'react-router-dom';

import { useParams } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
//import { Store } from '../Store';
import { toast } from 'react-toastify';
import { Col, Figure, Row } from 'react-bootstrap';
import { getError } from '../utils';

export default function ResetPassword() {
  const navigate = useNavigate();

  const params = useParams();
  const { token } = params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
      } else {
        const { data } = await axios.post('/api/users/reset-password', {
          password,
          token,
        });
        //ctxDispatch({ type: 'USER_SIGNIN', payload: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success('Reset Password successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };
  return (
    <Container className="small-container  forgot-mt-3 col-sm-10 container-up shadow p-3 mb-5 bg-white rounded mt-n1-2">
      <Helmet>
        <title>Reset Password </title>
      </Helmet>
      <h2 className="my-3 text-center">Reset Password</h2>
      <Row className="justify-content-center col-md-12 col-lg-12 ">
        <Col sm={8} xs={8} className="login-image  col-md-6 lg-6 ">
          <Figure>
            <img src="../forgot.jpg" alt="Login pic" width={300} height={200} />
          </Figure>
        </Col>
        <Col sm={8} xs={8} className="  col-md-6 lg-6  ">
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="password">
              <i className="zmdi zmdi-email material-icons-name"></i>
              <Form.Label>New password</Form.Label>
              <Form.Control
                type="password"
                placeholder="New password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="Cpassword">
              <i className="zmdi zmdi-lock material-icons-name"></i>
              <Form.Label>Confirm Password</Form.Label>{' '}
              <Form.Control
                type="password"
                placeholder="Confirm password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            <div className="mb-3">
              <Button type="submit">Reset Password</Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
