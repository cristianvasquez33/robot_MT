import React from "react";
import { Joystick } from "react-joystick-component";

const JoystickControl = ({ onMove, onStop }) => {
    return (
        <div style={{ marginTop: "50px" }}>
            <Joystick
                size={100}
                baseColor="#eee"
                stickColor="#333"
                move={(e) => onMove(e)}
                stop={onStop}
            />
        </div>
    );
};

export default JoystickControl;