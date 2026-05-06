import "../styles/botones.css";

export default function SwitchAuto({ auto, setAuto }) {
    const toggle = () => {
        const nuevoEstado = !auto;
        setAuto(nuevoEstado);
    };

    return (
        <div className="auto-container">
            <span>{auto ? "AUTO" : "MANUAL"}</span>

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