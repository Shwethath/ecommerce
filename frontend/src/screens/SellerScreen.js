import Axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import { Link, useLocation, useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';
import Rating from '../components/Rating';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        products: action.payload.products.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SellerScreen() {
  const [{ loading, error, products, user, pages }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  );

  const params = useParams();
  const { id: sellerId } = params;
  const { search } = useLocation();
  // const sellerMode = pathname.indexOf('/seller') >= 0;
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data: user } = await Axios.get(
          `/api/users/sellers/${sellerId}`
        );
        const { data: products } = await Axios.get(
          `/api/products/sellers/${sellerId}?page=${page}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: { user, products } });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [dispatch, page, sellerId]);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <Row>
      <Col md={3} sm={6} xs={6}>
        <Card>
          <Card.Body>
            <img
              className="img-small"
              src={user.seller.logo}
              alt={user.seller.name}
            ></img>
            <Card.Title>
              <h1>{user.seller.name}</h1>
            </Card.Title>
            <Rating
              rating={user.seller.rating}
              numReviews={user.seller.numReviews}
            ></Rating>
            <div>
              <a href={`mailto:${user.email}`}>Contact Seller</a>
            </div>
            <div>{user.seller.description}</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={9} sm={8} xs={6}>
        {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
        <Row>
          {products.map((product) => (
            <Col sm={6} lg={4} className="mb-3" key={product._id}>
              <Product product={product}></Product>
            </Col>
          ))}
        </Row>
        <div>
          {[...Array(pages).keys()].map((x) => (
            <Link
              className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
              key={x + 1}
              to={`/seller/${sellerId}?page=${x + 1}`}
            >
              {x + 1}
            </Link>
          ))}
        </div>
      </Col>
    </Row>
  );
}
