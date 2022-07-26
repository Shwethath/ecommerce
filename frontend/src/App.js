import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import './index.css';
import Container from 'react-bootstrap/Container';
import HomeScreen from './screens/HomeScreen';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import { useContext } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ShippingAddS from './screens/ShippingAddS';
import SignupScreen from './screens/SignupScreen';
import SearchBox from './components/SearchBox';
import Button from 'react-bootstrap/Button';
//import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import SellerDashboard from './screens/SellerDashboard';
//import NavbarToggle from 'react-bootstrap/NavbarToggle';
//import NavbarCollapse from 'react-bootstrap/NavbarCollapse';
import SearchScreen from './screens/SearchScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderS from './screens/PlaceOrderS';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import UserListScreen from './screens/UserListScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserEditScreen from './screens/UserEditScreen';
//import SupportScreen from './screens/SupportScreen';
import MapScreen from './screens/MapScreen';
import SellerRoute from './components/SellerRoutes';
import SellerScreen from './screens/SellerScreen';
//import ChatBox from './components/ChatBox';
import SellerProductlist from './screens/SellerProductlist';
import SellerOrderlist from './screens/SellerOrderlist';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state; //fullbox

  const logoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    // localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/login';
  };
  //side bar nav
  //const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  // const [setCategories] = useState([]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const { data } = await axios.get(`/api/products/categories`);
  //       setCategories(data);
  //     } catch (err) {
  //       toast.error(err.message);
  //     }
  //   };
  //   fetchCategories();
  // }, [ctxDispatch, setCategories]);
  return (
    <BrowserRouter>
      <ToastContainer position="bottom-center" limit={0} />
      <div
        className={
          fullBox
            ? 'site-container d-flex flex-column active-cont full-box'
            : 'site-container flex-column d-flex   '
          // : fullBox
          // ? 'site-container d-flex flex-column  full-box '
          // : 'site-container flex-column d-flex '
        }
      >
        <header>
          <Navbar expand="lg">
            <Container>
              {/* <Button
                variant="blue"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              ></Button> */}
              <Link to="/">
                <Navbar.Brand>
                  <span className="white-color">Shopee Day</span>
                </Navbar.Brand>
              </Link>
              &nbsp;
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />

                {/* Cart pages */}
                <Nav className="justify-content-end">
                  <Link to="/cart" className="nav-link">
                    <i
                      className="fa fa-shopping-cart white-color"
                      width="20"
                      height="20"
                    ></i>
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <Link to="/profile" className="dropdown-item">
                        User Profile
                      </Link>
                      <Link to="/orderhistory" className="dropdown-item">
                        Order History
                      </Link>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#logout"
                        onClick={logoutHandler}
                      >
                        Log Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/login">
                      <Button variant="light">Log In </Button>
                    </Link>
                  )}
                  {userInfo && userInfo.isSeller && (
                    <NavDropdown title="Seller" id="seller-nav-dropdown">
                      <Link to=" /seller/dashboard" className="dropdown-item">
                        Dashboard
                      </Link>
                      <Link to="/products/seller" className="dropdown-item">
                        Products
                      </Link>
                      <Link to="/orders/seller" className="dropdown-item">
                        Orders
                      </Link>
                    </NavDropdown>
                  )}

                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <Link to="/admin/dashboard" className="dropdown-item">
                        Dashboard
                      </Link>
                      <Link to="/products/admin" className="dropdown-item">
                        Products
                      </Link>
                      <Link to="/orders/admin" className="dropdown-item">
                        Orders
                      </Link>
                      <Link to="/users/admin" className="dropdown-item">
                        Users
                      </Link>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        {/* <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <Link
                  to={`/search?category=${category}`}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </Link>
              </Nav.Item>
            ))}
          </Nav>
        </div> */}
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/login" element={<SigninScreen />} />
              <Route path="/shipping" element={<ShippingAddS />} />
              <Route path="/register" element={<SignupScreen />} />
              <Route path="/seller/:id" element={<SellerScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/placeorder" element={<PlaceOrderS />} />
              <Route path="/orderhistory" element={<OrderHistoryScreen />} />
              <Route
                path="/product/:id/edit"
                element={<ProductEditScreen />}
              ></Route>
              <Route
                path="/products/admin"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/order/:id"
                element={
                  <AdminRoute>
                    <OrderScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/user/:id/edit"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>
              {/*Seller Route */}
              <Route
                path="/products/seller"
                element={
                  <SellerRoute>
                    <SellerProductlist />
                  </SellerRoute>
                }
              />
              <Route
                path="/orders/seller"
                element={
                  <SellerRoute>
                    <SellerOrderlist />
                  </SellerRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/seller/dashboard"
                element={
                  <AdminRoute>
                    <SellerDashboard />
                  </AdminRoute>
                }
              ></Route>
              {/* Order Routes */}
              <Route
                path="/orders/admin"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              ></Route>{' '}
              <Route path="/order/details/:id" element={<OrderScreen />} />
              {/* User Routes */}
              <Route
                path="/users/admin"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
            </Routes>
          </Container>
        </main>
        <footer className="footer">
          {/* {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />} */}

          <div
            className="text-center p-4text-black"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
          >
            Created By <Link to="/"> Shwetha T H </Link> | © 2022 Copyright:
            <Link className="text-reset fw-bold" to="https://mdbootstrap.com/">
              All rights reserved.
            </Link>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
