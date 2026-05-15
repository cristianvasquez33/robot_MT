import "../styles/botones.css";

export default function SwitchAuto({ auto, setAuto }) {

    const toggle = async () => {

        const nuevoEstado = !auto;

        setAuto(nuevoEstado);

        try {

            await fetch("http://192.168.100.128:5000/auto", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    auto: nuevoEstado
                })

            });

            console.log("AUTO:", nuevoEstado);

        } catch (error) {

            console.log("ERROR AUTO:", error);
        }
    };

    return (

        <div className="auto-container">

            <span>
                {auto ? "AUTO" : "MANUAL"}
            </span>

            <label className="switch">

                <input
                    type="checkbox"
                    checked={auto}
                    onChange={toggle}
                />

                <span className="slider"></span>

            </label>

        </div>
    );
}