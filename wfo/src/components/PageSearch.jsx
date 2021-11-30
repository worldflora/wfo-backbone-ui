import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";



import {
    gql
} from "@apollo/client";

//import OrcidCard from "./OrcidCard";
//import AssignmentsCard from "./AssignmentsCard";


class PageSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            queryString: "",
            lastSearch: "",
            loading: false,
            names: null,
            nameParts: null,
            distances: null,
            rank: null
        };

        console.log("PageSearch Constructed");
    }

    handleChange = (event) => {
        this.setState({ queryString: event.target.value }, () => {
            if (this.state.queryString.length > 4) {
                this.doSearch(this.state.queryString);
            }
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.doSearch(this.state.queryString);
    }

    doSearch = (queryString) => {

        // are we still loading
        if (this.state.loading) return;

        // did the query string change
        if (this.state.lastSearch == queryString) return;

        console.log(queryString);

        // set the state.
        this.setState({
            lastSearch: queryString,
            loading: true
        });

        this.props.graphClient.query({
            query: gql`
            query{
getNamesByStringMatch(queryString: "${queryString}"){
  distances,
  nameParts,
  authors,
  rank,
  names{
    wfo,
    status,
    fullNameString,
    taxonPlacement{
      id,
      acceptedName{
        wfo
        fullNameString
      }
      family: ancestorAtRank(rank: "family"){
        acceptedName{
          wfo,
          fullNameString(authors: false)
        }
      }
      order: ancestorAtRank(rank: "order"){
        acceptedName{
          wfo,
          fullNameString(authors: false)
        }
      }
    }
  }
}
}
`
        }).then(result => {
            console.log(result);
            // update the state with our new list
            this.setState({
                names: result.data.getNamesByStringMatch.names,
                nameParts: result.data.getNamesByStringMatch.nameParts,
                distances: result.data.getNamesByStringMatch.distances,
                rank: result.data.getNamesByStringMatch.rank
            });
        }).finally(() => {
            this.setState({ loading: false });
        }
        );


    }

    getParsedName = () => {

        if (this.state.nameParts === null) {
            return <span>Nothing submitted.</span>;
        };

        if (this.state.nameParts.length == 0) {
            return <span>No name parts</span>;
        }

        return (
            this.state.nameParts.map(part => {
                return <span>{part} </span>
            })
        );

    }

    getParsedRank = () => {

        if (this.state.rank === null) {
            return <span>Nothing found.</span>;
        };

        return (<span>{this.state.rank} </span>);

    }

    getResultRows = () => {

        // do nothing if we have now content
        if (this.state.names === null) {
            return <p>No names</p>;
        };

        return (
            this.state.names.map((name, index) => {
                return this.getNameRendered(name, index);
            })

        );

    }

    getNameLink = (nameString, wfo) => {
        //return <a href={"#" + wfo} onClick={(e) => { e.preventDefault(); window.location.hash = wfo; }, dangerouslySetInnerHTML={{ __html: nameString }} />
        return < a href={"#" + wfo} onClick={(e) => { e.preventDefault(); window.location.hash = wfo; }} dangerouslySetInnerHTML={{ __html: nameString }} />

    }

    getNameRendered = (name, index) => {


        // what is the state of this name?
        let placement = null;

        if (name.taxonPlacement) {

            let family = name.taxonPlacement.family;
            let order = name.taxonPlacement.order;

            if (name.taxonPlacement.acceptedName.wfo == name.wfo) {
                placement = <span>Accepted taxon name.
                    {" "} [{this.getNameLink(family.acceptedName.fullNameString, family.acceptedName.wfo)}{", "}{this.getNameLink(order.acceptedName.fullNameString, order.acceptedName.wfo)}]
                </span>
            } else {
                let accepted = name.taxonPlacement.acceptedName;
                placement = <span>
                    A synonym of {' '}
                    {this.getNameLink(accepted.fullNameString, accepted.wfo)}
                    {" "} [{family.acceptedName.fullNameString}{", "}{order.acceptedName.fullNameString}]
                </span>
            }
        } else {
            if (name.status == 'deprecated') {
                placement = <span>Deprecated name. Do not use.</span>;
            } else {
                if (name.status) {
                    placement = <span>This name has not been placed in taxonomy. Nomenclatural status: {name.status}</span>;
                } else {
                    placement = <span>This name has not been placed in taxonomy. The nomenclatural status has not been set.</span>;
                }
                placement = <span>This name has not been placed in taxonomy.</span>;
            }
        }


        return (<Row>
            <Col>
                <Card style={{ marginBottom: '0.5em' }}>
                    <Card.Body>
                        <Card.Text>
                            <p>
                                <Badge pill variant="secondary">{this.state.distances[index]}</Badge>{" "}
                                {this.getNameLink(name.fullNameString, name.wfo)}
                                {" "}
                                {placement}
                            </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        );
    }

    render() {

        if (this.props.hash != 'search') return null;

        return (
            <Container style={{ marginTop: "2em" }}>
                <Row>
                    <Col>
                        <Form onSubmit={this.handleSubmit}>
                            <Row className="align-items-center">
                                <Col>
                                    <Form.Control type="text" placeholder="Enter a name of interest" value={this.state.queryString} onChange={this.handleChange} />
                                </Col>
                                <Col xs="auto">
                                    <Button type="submit">Search</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <div><strong>Name parts: </strong>{this.getParsedName()} <strong>Rank: </strong> {this.getParsedRank()}</div>
                <hr />
                {this.getResultRows()}
            </Container>
        );


    }


}
export default PageSearch