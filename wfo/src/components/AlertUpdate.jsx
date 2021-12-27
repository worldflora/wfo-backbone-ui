import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";


function AlertUpdate(props) {

    const [wfo, setWfo] = useState(null);
    const [show, setShow] = useState(false);
    const [response, setResponse] = useState(null);

    // we hide if this is a new wfo
    if (props.wfo !== wfo) {
        setWfo(props.wfo);
        setShow(false);
    }

    // update the response data if it is new.
    if (props.response !== response) {
        setResponse(props.response);
    }

    // if we aren't showing but the mutation starts loading then show us
    if (!show && props.loading) {
        setShow(true);
    }

    let variant = 'danger';
    let heading = "Failure";
    let txt = "Unknown error";

    if (response && response.success) {
        variant = 'success';
        heading = "Success";
        txt = response.message;
    }

    if (show) {
        return (
            <Alert variant={variant} onClose={() => setShow(false)} dismissible style={{ marginTop: "1em" }}>
                <Alert.Heading>{heading}</Alert.Heading>
                <p>
                    {txt}
                </p>
            </Alert>
        );
    }
    return null;
}

export default AlertUpdate;