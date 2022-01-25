import './App.css';
import React, { Component } from "react";
import PageTabs from "./components/PageTabs";

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// client for the graphql
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
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
      headers: {
        "wfo_access_token": process.env.REACT_APP_GRAPHQL_ACCESS_TOKEN
      },
      cache: new InMemoryCache(),
      connectToDevTools: true,
      credentials: 'include'
    });

    /*
    // watch the hash tag - it is how we change state
    window.onhashchange = () => {
      let newHash = window.location.hash.substring(1);
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

    */

  } // end constructor

  render() {
    return (
      <div className="App">
        <ApolloProvider client={this.graphClient}>
          <PageTabs />
        </ApolloProvider>
      </div>
    );
  }

}

export default App;
