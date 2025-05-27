import React, { useEffect, useState } from "react";
import "../styles/Index.css";

export default function Admin({ id, nombre }) {
  const [vista, setVista] = useState("general");
  const [reportes, setReportes] = useState([]);
  const [reporteSeleccionado, setRepSel] = useState(null);

  // 1. Cargar reportes en vista general
  useEffect(() => {
    if (vista === "general") {
      fetch("http://localhost/amortal/backend/mostrarReportes.php")
        .then((res) => res.json())
        .then((data) => setReportes(data))
        .catch((err) => console.error("Error al cargar reportes", err));
    }
  }, [vista]);

  // 2. Pasar a vista específica
  const manejarComprobar = (rep) => {
    console.log("DETALLE REPORTE:", rep); // depuración
    setRepSel(rep);
    setVista("especifico");
  };

  // 3. Volver a lista general
  const volver = () => {
    setVista("general");
    setRepSel(null);
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <div className="admin-welcome">
          Bienvenido, <span className="admin-name">{nombre}</span>
        </div>
        <p className="admin-subtext">
          Aquí podrás administrar los reportes y banear a los usuarios que
          consideres necesarios.
        </p>
      </header>

      {vista === "general" && (
        <section className="report-list-section">
          <h2 className="section-title">Reportes Pendientes</h2>
          {reportes.length === 0 ? (
            <div className="empty-state">No hay reportes por ahora.</div>
          ) : (
            <ul className="report-list">
              {reportes.map((rep, idx) => (
                <React.Fragment key={rep.id_reporte}>
                  <li className="report-item">
                    <div className="report-item-header">
                      {rep.reportante.foto && (
                        <img
                          src={rep.reportante.foto}
                          alt={rep.reportante.nombre}
                          className="avatar-small"
                        />
                      )}
                      <span className="reporter-name">
                        {rep.reportante.nombre}
                      </span>
                      <span className="vs-separator">vs</span>
                      {rep.reportado.foto && (
                        <img
                          src={rep.reportado.foto}
                          alt={rep.reportado.nombre}
                          className="avatar-small"
                        />
                      )}
                      <span className="reported-name">
                        {rep.reportado.nombre}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-check"
                      onClick={() => manejarComprobar(rep)}
                    >
                      Comprobar Reporte
                    </button>
                  </li>
                  {idx < reportes.length - 1 && <hr className="separator" />}
                </React.Fragment>
              ))}
            </ul>
          )}
        </section>
      )}

      {vista === "especifico" && reporteSeleccionado && (
        <section className="report-detail-section">
          <h2 className="detail-title">
            Reporte #{reporteSeleccionado.id_reporte}
          </h2>
          <div className="report-item-header detail-header">
            {reporteSeleccionado.reportante.foto && (
              <img
                src={reporteSeleccionado.reportante.foto}
                alt={reporteSeleccionado.reportante.nombre}
                className="avatar-small"
              />
            )}
            <span className="reporter-name">
              {reporteSeleccionado.reportante.nombre}
            </span>
            <span className="vs-separator">vs</span>
            {reporteSeleccionado.reportado.foto && (
              <img
                src={reporteSeleccionado.reportado.foto}
                alt={reporteSeleccionado.reportado.nombre}
                className="avatar-small"
              />
            )}
            <span className="reported-name">
              {reporteSeleccionado.reportado.nombre}
            </span>
          </div>

          <div className="report-message detail-message">
            <h3 className="message-title">Mensaje del Reporte</h3>
            <p className="message-content">
              <em>"{reporteSeleccionado.mensaje_reporte}"</em>
            </p>
          </div>

          <div className="conversation-section">
            <h3 className="conversation-title">Conversación</h3>
            <div className="conversation-list">
              {reporteSeleccionado.mensajes.length > 0 ? (
                reporteSeleccionado.mensajes.map((msg) => (
                  <div
                    key={msg.id_mensaje}
                    className={`message-item ${
                      msg.id_usuario_emisor === id ? "from-me" : "from-other"
                    }`}
                  >
                    <p className="message-text">{msg.texto}</p>
                    <span className="message-time">{msg.fecha_mensaje}</span>
                  </div>
                ))
              ) : (
                <div className="empty-messages">No hay mensajes previos.</div>
              )}
            </div>
          </div>

          <div className="actions-section">
            <button className="btn btn-secondary btn-back" onClick={volver}>
              Volver
            </button>
            <button
              className="btn btn-danger btn-ban"
              onClick={() => {
                console.log(reporteSeleccionado.id_reportado); // depuración
                fetch(
                  `http://localhost/amortal/backend/banearUsuario.php?userId=${reporteSeleccionado.id_reportado}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    alert("Usuario baneado y reporte cerrado.");
                    volver();
                  })
                  .catch(() => alert("Error al banear usuario."));
              }}
            >
              Banear Usuario
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
