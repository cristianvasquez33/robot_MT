// src/pages/Control.js

import React from "react";
import JoystickControl from "../components/Joystick";
import { useRobotControl } from "../hooks/useRobotControl";
import "../styles/control.css";

const Control = () => {

    const { handleMove, handleStop } = useRobotControl();

    return (
        <div className="control-container">
            <h1>🤖 Control Robot</h1>

            <JoystickControl
                onMove={handleMove}
                onStop={handleStop}
            />
        </div>
    );
};

export default Control;