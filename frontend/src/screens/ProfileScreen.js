import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import { getError } from '../utils';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import MessageBox from '../components/MessageBox';
//import { useParams } from 'react-router-dom';
//import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSeller, setIsSeller] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerLogo, setSellerLogo] = useState('');
  const [sellerDescription, setSellerDescription] = useState('');

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,

    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/users/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setName(data.name);
        setEmail(data.email);
        if (data.seller) {
          setIsSeller(data.isSeller);
          setSellerName(data.seller.name);
          setSellerLogo(data.seller.logo);
          setSellerDescription(data.seller.description);
        }
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [dispatch, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_REQUEST' });
    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
      } else {
        const { data } = await axios.put(
          '/api/users/profile',
          {
            name,
            email,
            password,
            sellerName,
            sellerLogo,
            sellerDescription,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({
          type: 'UPDATE_SUCCESS',
        });

        ctxDispatch({ type: 'USER_SIGNIN', payload: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h3 className="my-3 text-center">Profile</h3>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <form
          onSubmit={submitHandler}
          className="shadow p-3 mb-5 bg-white rounded mt-n1-2"
        >
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Reset Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          {isSeller && (
            <>
              <h4>Seller</h4>
              <Form.Group className="mb-3" controlId="sellerName">
                <Form.Label>Seller Brand Name</Form.Label>
                <Form.Control
                  placeholder="Enter Brand Name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="sellerLogo">
                <Form.Label>Seller Brand Logo</Form.Label>
                <Form.Control
                  placeholder="Enter Seller Logo"
                  value={sellerLogo}
                  onChange={(e) => setSellerLogo(e.target.value)}
                  required
                />
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Description"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Write a description"
                  value={sellerDescription}
                  onChange={(e) => setSellerDescription(e.target.value)}
                />
              </FloatingLabel>
            </>
          )}
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
          </div>
          {loadingUpdate && <LoadingBox></LoadingBox>}
        </form>
      )}
    </div>
  );
}
