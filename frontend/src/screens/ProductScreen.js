import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import { Store } from '../Store';
import MessageBox from '../components/MessageBox';
import Form from 'react-bootstrap/Form';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import ChatBox from '../components/ChatBox';

//productdetails reducer in old amazona
const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });

  //old amazona detailsproducts actions
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]); //when user switch between pages the fetch data will dispatch  again we will get from backend

  //cart code
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        typ: 'CREATE_SUCCESS',
      });
      toast.success('Review submitted successfully');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={4} m={0} ms={2}>
          <img
            className="img-large shadow-sm p-3 mb-5 bg-white rounded"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={8} m={0} ms={6}>
          <Row>
            <Col
              md={6}
              m={0}
              className="shadow-sm p-3 mb-5 bg-white rounded mt-n1-2"
            >
              <ListGroup variant="flush" className="text-center">
                <ListGroup.Item>
                  <title>{product.name}</title>
                  <h4>{product.name}</h4>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    rating={product.rating}
                    numReviews={product.numReviews}
                  ></Rating>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Col md={8} m={0} className="d-inline-block">
                    Price : ₹{product.price}
                  </Col>
                  <Col md={3} m={0} className="d-inline-block">
                    <Form.Group controlId="size">
                      <Form.Label>Size</Form.Label>
                      {/* <Form.Select>
                        {product.size.map((s) => (
                          <option key={s}>{s.size}</option>
                        ))}
                      </Form.Select> */}

                      <Form.Select
                        aria-label="Size"
                        value={size}
                        className="w-30 p-2"
                        onChange={(e) => setSize(e.target.value)}
                      >
                        <option value="s">S</option>
                        <option value="m">M</option>
                        <option value="l">L</option>
                        <option value="xl">XL</option>
                        <option value="xxl">XXL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Description:</strong>
                  <p>{product.description}</p>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={5} m={0} xs={8}>
              <Card className="shadow-sm p-3 ms-2 mb-5 bg-white rounded">
                {/* <Card.Body> */}
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h5> Seller Brand & Rating</h5>
                    <h5>
                      <Link to={`/seller/${product.seller._id}`}>
                        {product.seller.seller.name}
                      </Link>
                    </h5>
                    <Rating
                      rating={product.seller.seller.rating}
                      numReviews={product.seller.seller.numReviews}
                    ></Rating>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>₹{product.price}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                          <Badge pill bg="success">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge pill bg="danger">
                            Unavailable
                          </Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <div className="d-grid">
                        <Button onClick={addToCartHandler} variant="primary">
                          Add to Cart
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
                {/* </Card.Body> */}
              </Card>
            </Col>
          </Row>
          <Row>
            <ListGroup>
              <h4>Similar Products</h4>
              <Row xs={4} md={5} m={0} className="g-2 ">
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card className="multi-img p-2 ms-1 px-0">
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup>
          </Row>
        </Col>
      </Row>
      <Row>
        <div className="my-3 col-md-12">
          <Col md={4} xs={4}>
            <h3 ref={reviewsRef}>Reviews</h3>
            <div className="mb-3">
              {product.reviews.length === 0 && (
                <MessageBox>There is no review</MessageBox>
              )}
            </div>
            <ListGroup>
              {product.reviews.map((review) => (
                <ListGroup.Item key={review._id}>
                  <strong>{review.name}</strong>
                  <Rating rating={review.rating} caption="rating"></Rating>
                  <p>{review.createdAt.substring(0, 10)}</p>
                  <p>{review.comment}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col md={6} xs={4}>
            <div className="my-3 ">
              {userInfo ? (
                <form onSubmit={submitHandler}>
                  <h3>Customer review</h3>
                  <Form.Group className="mb-3" controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select
                      aria-label="Rating"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">Select....</option>
                      <option value="1">1- Poor</option>
                      <option value="2">2- Fair</option>
                      <option value="3">3- Good</option>
                      <option value="4">4- very good</option>
                      <option value="5">5- Excelent</option>
                    </Form.Select>
                  </Form.Group>
                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="comments"
                    className="mb-3"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Leave a comment here"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </FloatingLabel>
                  <div className="mb-3">
                    <Button disabled={loadingCreateReview} type="submit">
                      Submit
                    </Button>
                    {loadingCreateReview && <LoadingBox></LoadingBox>}
                  </div>
                </form>
              ) : (
                <MessageBox>
                  Please
                  <Link to={`/login?redirect=/product/${product.slug}`}>
                    Login
                  </Link>
                </MessageBox>
              )}
            </div>
          </Col>
        </div>
      </Row>
      <div className="justify-content-right" md={2} lg={4} sm={6}>
        {userInfo && !userInfo.isAdmin && !userInfo.isSeller && (
          <ChatBox userInfo={userInfo} />
        )}
      </div>
    </div>
  );
}
export default ProductScreen;
