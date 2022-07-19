import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button, Row } from 'react-bootstrap';
import { getError } from '../utils';
import { toast } from 'react-toastify';

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
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function SellerProductlist() {
  const navigate = useNavigate();
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { search, pathname } = useLocation();
  const sellerMode = pathname.indexOf('/seller') >= 0;
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/products/admin?page=${page}&sellerMode=${sellerMode} `,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [dispatch, page, userInfo, successDelete, sellerMode, error]);

  const createHandler = async () => {
    if (window.confirm('Do you want to create products?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const {
          data: { product },
        } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('Product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/product/${product._id}/edit`);
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure to delete products?')) {
      dispatch({ type: 'DELETE_REQUEST' });
      try {
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Product deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
    <div>
      <Row>
        <h1>Products</h1>
        <div>
          <Button
            type="button"
            onClick={createHandler}
            className="float-end mb-6 btn btn-primary"
          >
            Create Product
          </Button>
        </div>
      </Row>
      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table  table-responsive{-sm|-md|-lg|-xl} mt-4  shadow p-3 mb-5 bg-white rounded mt-n1-2">
            <thead className="table-active">
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigate(`/product/${product._id}/edit`)}
                    >
                      Edit
                    </Button>
                    &nbsp;
                    {/* space between edit and delete */}
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => deleteHandler(product)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {userInfo.isSeller
              ? [...Array(pages).keys()].map((x) => (
                  <Link
                    className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                    key={x + 1}
                    to={`/products/seller?page=${x + 1}`}
                  >
                    {x + 1}
                  </Link>
                ))
              : [...Array(pages).keys()].map((x) => (
                  <Link
                    className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                    key={x + 1}
                    to={`/products/admin?page=${x + 1}`}
                  >
                    {x + 1}
                  </Link>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
