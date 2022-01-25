
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

function LoginLogout(props) {

    const [orcidButtonOn, setOrcidButtonOn] = useState(false);

    const user = props.user;

    if (!user) return null;

    let orcidButtonStyle = {
        border: "1px solid #D3D3D3",
        padding: "0.3em",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "1px 1px 3px #999",
        cursor: "pointer",
        color: "#999",
        fontWeight: "bold",
        fontSize: "0.8em",
        lineHeight: "24px",
        verticalAlign: "middle"
    }

    const orcidButtonHoverStyle = {
        border: "1px solid #338caf",
        color: "#338caf"
    }

    const orcidButtonImageStyle = {
        display: "block",
        margin: "0 .5em 0 0",
        padding: "0",
        float: "left"
    }

    if (orcidButtonOn) {
        orcidButtonStyle = { ...orcidButtonStyle, ...orcidButtonHoverStyle }
    }

    function toggleButton() {
        setOrcidButtonOn(!orcidButtonOn)
    }

    // default is user not logged in
    let link =
        <OverlayTrigger
            key="logout"
            placement="bottom"
            overlay={
                <Tooltip id={`tooltip-logout`}>
                    Click to log in using your ORCID ID or register with ORCID.
                </Tooltip>
            }
        >
            <Button
                style={orcidButtonStyle}
                onMouseOver={toggleButton}
                onMouseOut={toggleButton}
                id="connect-orcid-button"
                onClick={
                    e => {
                        window.open(
                            user.orcidLogInUri,
                            "_blank",
                            "toolbar=no, scrollbars=yes, width=500, height=600, top=100, left=500"
                        );

                        // we start polling the server for a change in the user
                        // we need to do this because the popped open window is in another
                        // domain to the API server and so we lose control of it
                        props.startPolling(1000);// poll every second
                        setTimeout(() => { props.stopPolling() }, 10 * 60 * 1000); // stop after 10 minutes - long enough for them to register with ORCID?
                    }
                }>
                Login with ORCID
                <img
                    style={orcidButtonImageStyle}
                    id="orcid-id-icon"
                    src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                    width="24" height="24" alt="ORCID iD icon"
                /></Button>
        </OverlayTrigger>
        ;


    // user is logged in so present log out button
    if (user.isAnonymous === false) {

        // if the user is logged in we should stop any polling of the server
        props.stopPolling();

        // build a log out button
        link =
            <OverlayTrigger
                key="logout"
                placement="bottom"
                overlay={
                    <Tooltip id={`tooltip-logout`}>
                        Click to log out.
                    </Tooltip>
                }
            >
                <Button
                    style={orcidButtonStyle}
                    onMouseOver={toggleButton}
                    onMouseOut={toggleButton}
                    id="connect-orcid-button"
                    onClick={
                        e => {

                            // we can just call the log out uri on the API server and then
                            // refresh ourselves. There is no need of polling because
                            // we aren't handling the pop out windows in another domain
                            fetch(user.orcidLogOutUri, {
                                method: 'GET',
                                credentials: 'include'
                            })
                                .then(response => response.json())
                                .then(data => console.log(data))
                                .then(props.refeshUser());
                        }
                    }>
                    {user.name}
                    <img
                        style={orcidButtonImageStyle}
                        id="orcid-id-icon"
                        src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                        width="24" height="24" alt="ORCID iD icon"
                    /></Button>
            </OverlayTrigger>;
    }

    return (
        <div style={{ textAlign: "right", marginBottom: "-1.5em", marginTop: "-0.5em" }}>
            {link}
        </div>
    )

}
export default LoginLogout