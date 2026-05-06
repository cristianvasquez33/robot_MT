// src/pages/Control.js

import React from "react";
import { useState } from "react";
import JoystickControl from "../components/Joystick";
import { useRobotControl } from "../hooks/useRobotControl";
import SwitchAuto from "../components/SwitchAuto";
import BrazoControl from "../components/BrazoControl";
import SwitchColor from "../components/SwitchColor";

import "../styles/control.css";
import "../styles/layout.css";
import "../styles/camara.css";

const Control = () => {

    const { handleMove, handleStop } = useRobotControl();

    const [auto, setAuto] = useState(false);




    return (
        <div className="contenedor">
            <div className="panel-izquierdo">



                <div className="stream-video">
                    📷 Stream aquí
                </div>

                <div >
                    hlola
                </div>

            </div>

            {/* ///////////////////////////// PANEL DERECHO */}
            <div className="panel-derecho">

                <div className="contenedor_cotrol" >  <h1 className="info">Control Robot</h1>

                <div>
                    <JoystickControl
                        onMove={handleMove}
                        onStop={handleStop}
                    />
                </div>
                <div className="alinear_derecha" ><SwitchAuto auto={auto} setAuto={setAuto} /> <SwitchColor /></div>
                <div ></div>
                </div>
                <div className="brazo">
                    <BrazoControl />
                </div>



                


            </div>



        </div>
    );
};

export default Control;