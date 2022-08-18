import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import { ToastContainer } from 'react-toastify';
import { Store } from '../Store';

const EmailVerify = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  return (
    <div>
      <ToastContainer position="bottom-center" limit={1} />
      {userInfo ? (
        <div
          className="justify-content-center text-center"
          md={12}
          xs={12}
          lg={12}
        >
          <img
            src="../success.png"
            alt="success_img"
            width={300}
            height={300}
          />
          <h1>Email verified successfully</h1>
          <Link to={`/login?redirect=${redirect}`}>
            {' '}
            <Button type="submit">view dashboard</Button>
          </Link>
        </div>
      ) : (
        <h1>404 Not Found</h1>
      )}
    </div>
  );
};

export default EmailVerify;
