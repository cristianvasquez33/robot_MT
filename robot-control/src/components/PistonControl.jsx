import "../styles/piston.css";

export default function PistonControl() {

    // ============================================
    // ENVIAR
    // ============================================

    const enviar = async (valor) => {

        try {

            await fetch(
                "http://192.168.100.128:5000/piston",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        valor: valor
                    })
                }
            );

        } catch (e) {

            console.log("ERROR PISTON:", e);
        }
    };

    // ============================================
    // UI
    // ============================================

    return (

        <div className="piston-container">

            <h2>Pistón</h2>

            {/* ================================= */}
            {/* EXTENDER */}
            {/* ================================= */}

            <button

                className="btn-extender"

                onMouseDown={() => enviar(120)}
                onMouseUp={() => enviar(0)}

                onTouchStart={() => enviar(120)}
                onTouchEnd={() => enviar(0)}

            >
                EXTENDER
            </button>

            {/* ================================= */}
            {/* RETRAER */}
            {/* ================================= */}

            <button

                className="btn-retraer"

                onMouseDown={() => enviar(-120)}
                onMouseUp={() => enviar(0)}

                onTouchStart={() => enviar(-120)}
                onTouchEnd={() => enviar(0)}

            >
                RETRAER
            </button>

        </div>
    );
}