import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function Product(props) {
  const navigate = useNavigate();
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  return (
    <Card className="productcard hover shadow p-3 mb-5 bg-white rounded ms-2">
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      {/* <Card.Body> */}
      <Link to={`/product/${product.slug}`}>
        <span>{product.name}</span>
      </Link>

      <Rating rating={product.rating} numReviews={product.numReviews} />

      <div>
        ₹{product.price} &nbsp;&nbsp;
        {product.seller && product.seller.seller && (
          <Link to={`/seller/${product.seller._id}`}>
            {product.seller.seller.name}
          </Link>
        )}
      </div>
      {product.countInStock === 0 ? (
        <Button variant="black" disabled>
          Out of stock
        </Button>
      ) : product.countInStock === 1 ? (
        <Button onClick={() => navigate('/cart')}>Go to cart</Button>
      ) : (
        <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
      )}

      {/* </Card.Body> */}
    </Card>
  );
}
export default Product;
