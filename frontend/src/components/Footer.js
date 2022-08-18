import { MDBFooter, MDBIcon } from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <MDBFooter
      bgColor="light"
      className="text-center container-fluid text-lg-start text-muted"
    >
      <section className="d-flex justify-content-center justify-content-lg-between p-2 border-bottom">
        <div className="me-5 d-none d-lg-block">
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#3b5998' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="facebook-f" />
          </Link>

          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#55acee' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="twitter" />
          </Link>

          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#dd4b39' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="google" />
          </Link>
          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#ac2bac' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="instagram" />
          </Link>

          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#0082ca' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="linkedin-in" />
          </Link>

          <Link
            className="btn btn-primary btn-floating m-1 p-2 btn-circle btn-sm"
            style={{ backgroundColor: '#333333' }}
            to="#!"
            role="button"
          >
            <MDBIcon fab icon="github" />
          </Link>
        </div>
      </section>

      <section className="">
        <div className="container text-center text-md-start mt-2 ">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-2">
              <h6 className="text-uppercase fw-bold mb-2">
                <i className="fas fa-gem me-3"></i>Shopee Day
              </h6>
              <p>
                E-commerce is revolutionizing the way we all shop in India. Why
                do you want to hop from one store to another in search of the
                latest phone when you can find it on the Internet in a single
                click?. Order for customized or personalized products.
              </p>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-2">
              <h6 className="text-uppercase fw-bold mb-4">Products</h6>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Cloths
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Shoes
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Electronics
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Diy
                </Link>
              </p>
            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-2">
              <h6 className="text-uppercase fw-bold mb-4">About</h6>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  About Us
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Policy
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Security
                </Link>
              </p>
              <p>
                <Link to="#!" className="text-reset text-decoration-none">
                  Help
                </Link>
              </p>
            </div>

            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-2">
              <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
              <p>
                <i className="fas fa-home me-3"></i> Bangalore, karnataka,
                India.
              </p>
              <p>
                <i className="fas fa-envelope me-3"></i>
                info@shopeeday.com
              </p>
              <p>
                <i className="fas fa-phone me-3"></i> + 01 234 567 88
              </p>
              <p>
                <i className="fas fa-print me-3"></i> + 01 234 567 89
              </p>
            </div>
          </div>
        </div>
      </section>
    </MDBFooter>
  );
}
