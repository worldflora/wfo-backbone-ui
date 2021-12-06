import React from "react";
import Breadcrumb from "react-bootstrap/Breadcrumb";


function CardAncestors(props) {


    function renderPath() {

        const { ancestors } = props;

        let ants = [...ancestors].reverse();

        if (ants && ants.length > 0) {
            return ants.map((ancestor) => {
                if (ancestor.acceptedName) {
                    return (
                        <Breadcrumb.Item key={ancestor.id} href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ancestor.acceptedName.wfo; }} >
                            <span dangerouslySetInnerHTML={{ __html: ancestor.acceptedName.fullNameString }} />
                        </Breadcrumb.Item>
                    );
                } else {
                    return <Breadcrumb.Item>Home</Breadcrumb.Item>
                }


            });
        } else {
            return <Breadcrumb.Item>No Trail</Breadcrumb.Item>
        }
    }

    // finally render
    const { ancestors } = props;

    return (<Breadcrumb style={{ marginTop: "1em" }} >
        {renderPath()}
    </Breadcrumb>);

}
export default CardAncestors;