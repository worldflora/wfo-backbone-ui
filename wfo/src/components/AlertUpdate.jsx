import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

function AlertUpdate(props) {

    const [show, setShow] = useState(false);
    const [response, setResponse] = useState(null);

    if (response != props.response) {
        setShow(true);
        setResponse(props.response);
    }

    if (show) {
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible >
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                <p>
                    Change this and that and try again. Duis mollis, est non commodo
                    luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
                    Cras mattis consectetur purus sit amet fermentum.
                </p>
            </Alert>
        );
    }
    return null;
}

export default AlertUpdate;