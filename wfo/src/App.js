import './App.css';
import React, { Component } from "react";
import PageHome from "./components/PageHome";
import PageSearch from "./components/PageSearch";
import PageForm from "./components/PageForm";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// client for the graphql
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "home",
      item: null,
      user: null
    };

    // set up an client to 
    this.graphClient = new ApolloClient({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
      cache: new InMemoryCache()
    });

    // watch the hash tag - it is how we change state
    window.onhashchange = () => {
      let newHash = window.location.hash.substr(1);
      console.log(newHash);

      let pattern = /^wfo-[0-9]{10}$/;

      if (pattern.test(newHash)) {
        // the hash is a wfo id so we navigate to that item
        // if it is not the current one
        if (!this.state.item || newHash !== this.state.item.wfoId) {
          this.setState({ 'page': "form", "wfo": newHash });
        }
      } else {
        // the hash is not a wfo id so assume it is a page
        this.setState({ 'page': newHash });
      }
    }

  } // end constructor

  render() {
    return (
      <div className="App">
        <ApolloProvider client={client}>
          <Navbar bg="light" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto" >
                <Nav.Link href="#home" >Home</Nav.Link>
                <Nav.Link href="#search"  >Search</Nav.Link>
                <Nav.Link href="#wfo-9499999999"  >Browse</Nav.Link>
                <Nav.Link href="#editors" >Editors</Nav.Link>
                <Nav.Link href="#data" >Data</Nav.Link>
                <Nav.Link href="#help" >Help</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <PageHome hash={this.state.page} user={this.state.user} />
          <PageForm hash={this.state.page} wfo={this.state.wfo} user={this.state.user} graphClient={this.graphClient} />
          <PageSearch hash={this.state.page} user={this.state.user} graphClient={this.graphClient} />
        </ApolloProvider>
      </div>
    );
  }

}

export default App;
