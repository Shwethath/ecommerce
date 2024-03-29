import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export default function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/search/?query=${query}` : '/search');
  };

  return (
    <Form className="d-flex me-auto md-12 ml-4 " onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          width="50px"
          className="lg-search"
          type="text"
          name="q"
          id="q"
          sm={6}
          md={4}
          lg={6}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products...."
          aria-label="Search Products"
          aria-describedby="button-search"
        ></FormControl>
        <Button variant="light" type="submit" id="button-search">
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}
