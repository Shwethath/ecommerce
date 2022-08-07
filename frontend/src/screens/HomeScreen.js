import { useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import '../index.css';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
//import CategoryHeader from './CategoryHeader';
//usestate depends on previews state

//product reducer in oldamazona
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        product: action.payload.product,
        sellers: action.payload.sellers,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

function HomeScreen() {
  //to get objects from reducer
  const [{ loading, error, products, sellers, product }, dispatch] = useReducer(
    logger(reducer),
    {
      products: [], //by default product is array
      loading: true, //by default loading is true
      error: '',
    }
  );

  //old amazona listproducts actions
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data: products } = await axios.get('/api/products');
        const { data: product } = await axios.get('/api/products/top-products');
        const { data: sellers } = await axios.get('/api/users/top-sellers');
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { products, sellers, product },
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="products">
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="carousel-slide container-fluid size-carousel">
            <Row className="col-md-6 justify-content-between text-left">
              <h3>Top Sellers</h3>
            </Row>
            {sellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
            <Carousel
              showArrows={false}
              autoPlay
              infiniteLoop={true}
              interval={1300}
              showThumbs={false}
              md={6}
            >
              {sellers.map((seller) => (
                <div key={seller._id}>
                  <Link to={`/seller/${seller._id}`}>
                    <img src={seller.seller.logo} alt={seller.seller.name} />
                    <p className="legend size-carousel">{seller.seller.name}</p>
                  </Link>
                </div>
              ))}
            </Carousel>
          </div>
          {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
          <Row className="bg-tpcolor shadow p-3 mb-5 rounded mt-n1-2">
            <h3>Top Products</h3>
            {product.map((product) => (
              <Col key={product._id} md={4} lg={3} sm={5}>
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
          <Row>
            <h3 className="carousel text-left">Featured Products</h3>
            {products.map((product) => (
              <Col key={product._id} md={4} lg={3} sm={5}>
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        </>
      )}
      <Footer />
    </div>
  );
}
export default HomeScreen;
