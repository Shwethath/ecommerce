import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Product from '../components/Product';
import '../index.css';
import { getError } from '../utils';
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const prices = [
  {
    name: '₹100 to ₹500',
    value: '100-500',
  },
  {
    name: '₹501 to ₹1000',
    value: '501-1000',
  },
  {
    name: '₹1001 to ₹5k',
    value: '1001-5000',
  },
  {
    name: '₹5k to ₹10k',
    value: '5001-10000',
  },
  {
    name: '₹10k to ₹50k',
    value: '10001-50000',
  },
  {
    name: '₹50k to ₹100k',
    value: '50001-100000',
  },
];

export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search); // /search?category=tops
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [category, dispatch, order, page, price, query, rating]); //dependencies

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchCategories();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };
  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>
      <Row>
        <Col
          md={3}
          lg={2}
          sm={4}
          xs={4}
          className="shadow p-3 mb-5 bg-white rounded text-decoration-none "
        >
          <h5>Categories</h5>
          <div>
            <ul>
              <div className="list-unstyled  fs-8 ">
                <Link
                  className={
                    'all' === category ? 'text-bold ' : 'text-decoration-none'
                  }
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </div>

              {categories.map((c) => (
                <div className="list-unstyled  fs-8 " key={c}>
                  <Link
                    className={
                      c === category
                        ? 'text-bold text-decoration-none'
                        : 'text-decoration-none'
                    }
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </div>
              ))}
            </ul>
          </div>
          <div>
            <h5>Price</h5>
            <ul>
              <li className="list-unstyled fs-8 text-decoration-none">
                <Link
                  className={
                    'all' === price ? 'text-bold' : 'text-decoration-none'
                  }
                  to={getFilterUrl({ price: 'all' })}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li
                  key={p.value}
                  className="list-unstyled  text-decoration-none "
                >
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={
                      p.value === price ? 'text-bold' : 'text-decoration-none'
                    }
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Avg. Customer Review</h5>
            <div>
              {ratings.map((r) => (
                <li
                  className="list-unstyled  fs-8 text-decoration-none "
                  key={r.name}
                >
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={
                      `${r.rating}` === `${rating}`
                        ? 'text-bold'
                        : 'text-decoration-none'
                    }
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li className="list-unstyled  fs-8 text-decoration-none ">
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={
                    rating === 'all' ? 'text-bold' : 'text-decoration-none'
                  }
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </div>
          </div>
        </Col>

        <Col md={9} sm={8} xs={8} lg={10}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between ">
                <Col md={10}>
                  <div>
                    {countProducts === 0 ? 'No' : countProducts} Results
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {price !== 'all' && ' : Price ' + price}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Sort by{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                    <option value="brand">Top Brand</option>
                    <option value="toprated">Avg. Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {products.length === 0 && (
                <MessageBox>No Product Found</MessageBox>
              )}

              <Row>
                {products.map((product) => (
                  <Col sm={8} lg={4} md={6} className="mb-2" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>

              <div>
                {[...Array(pages).keys()].map((x) => (
                  <Link
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
