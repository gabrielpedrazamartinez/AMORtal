import React, { useState, useEffect, use } from "react";
import ajustesIcon from "/ajustesFOTO.png";
import perfilIcon from "/casaFOTO.png";
import personasIcon from "/buscarFOTO.png";
import likesIcon from "/corazónFOTO.png";
import mensajesIcon from "/mensajesFOTO.png";
import amortalLOGO from "/logo.png";
import amortalTÍTULO from "/título.png";
import equis from "/x.png";
import like from "/like.png";
import superlike from "/superlike.png";
import teHaDadoLike from "/teHaDadoLike.png";
import "../styles/Index.css";

export default function Inicio({ id, nombre }) {
  // Estados para manejar la lógica de la aplicación, variables de estado para manejar la vista actual, perfil del usuario, personas disponibles, likes, mensajes, etc.
  const [indicePersona, setIndicePersona] = useState(0);
  const [vista, setVista] = useState("PERFIL");
  const [modo, setModo] = useState("DEFAULT");
  const [sexo, setSexo] = useState("AMBOS");
  const [edadMin, setEdadMin] = useState(18);
  const [edadMax, setEdadMax] = useState(99);
  const [perfil, setPerfil] = useState(null);
  const [personas, setPersonas] = useState(0);
  const [likes, setLikes] = useState([]);
  const [mensajes, setMensajes] = useState(null);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [id_match, setId_match] = useState(0);
  const [mensajeReporte, setMensajeReporte] = useState("");
  const [perfilActivo, setPerfilActivo] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [biografia, setBiografia] = useState("");
  const [intereses, setIntereses] = useState("");
  const [mostrarModalContrasena, setMostrarModalContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarFormularioReporte, setMostrarFormularioReporte] =
    useState(false);
  const [mostrarConfirmacionDeshacer, setMostrarConfirmacionDeshacer] =
    useState(false);

  const FormularioReporte = () => {
    setMostrarFormularioReporte((prev) => !prev);
  };

  const DeshacerMatch = () => {
    setMostrarConfirmacionDeshacer((prev) => !prev);
  };

  const cambiarContrasena = () => {
    if (nuevaContrasena !== confirmarContrasena) {
      alert("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("contrasena_actual", contrasenaActual);
    formData.append("nueva_contrasena", nuevaContrasena);

    fetch("http://localhost/amortal/backend/cambiarContraseña.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Contraseña cambiada exitosamente.");
          setMostrarModalContrasena(false);
          setContrasenaActual("");
          setNuevaContrasena("");
          setConfirmarContrasena("");
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => {
        alert("Error de red o servidor: " + err.message);
      });
  };

  const fechaAhora = new Date().toISOString().slice(0, 19).replace("T", " "); // Formato YYYY-MM-DD HH:MM:SS

  // Función para calcular la edad
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Función para mandar un mensaje
  const mandarMensaje = (id_matche, id_usuario_emisor, mensaje) => {
    console.log(id_matche, id_usuario_emisor, mensaje);
    fetch(
      `http://localhost/amortal/backend/mandarMensaje.php?id_match=${id_matche}&id_usuario_emisor=${id_usuario_emisor}&texto=${mensaje}&fecha_mensaje=${new Date().toISOString()}`
    );

    fetch(`http://localhost/amortal/backend/verMensajes.php?id=${id}`)
      .then((res) => res.json())
      .then((data) => setMensajes(data));
  };

  // Hook useEffect para manejar que elemento se renderizará al cargar cada componente
  useEffect(() => {
    if (vista === "PERFIL") {
      fetch(`http://localhost/amortal/backend/verPerfil.php?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPerfil(data);
          setBiografia(data.biografia || "");
          setIntereses(data.intereses ? data.intereses.join(", ") : "");
        })
        .catch((err) => console.error(err));

      fetch(`http://localhost/amortal/backend/verMensajes.php?id=${id}`)
        .then((res) => res.json())
        .then((data) => setMensajes(data))
        .catch((err) => console.error(err));
    }

    if (vista === "PERSONAS") {
      fetch(
        `http://localhost/amortal/backend/verPersonas.php?id=${id}&sexo=${sexo}&edadMin=${edadMin}&edadMax=${edadMax}`
      )
        .then((res) => res.json())
        .then((data) => setPersonas(data))
        .catch((err) => console.error(err));
    }

    if (vista === "LIKES") {
      fetch(`http://localhost/amortal/backend/quienMeHaDadoLike.php?id=${id}`)
        .then((res) => res.json())
        .then((data) => setLikes(data))
        .catch((err) => console.error(err));
    }

    if (vista === "MENSAJES") {
      fetch(`http://localhost/amortal/backend/verMensajes.php?id=${id}`)
        .then((res) => res.json())
        .then((data) => setMensajes(data))
        .catch((err) => console.error(err));
    }
  }, [vista, id, sexo, edadMin, edadMax]);

  // Segundo  Hook useEffect solo para actualización periódica de mensajes cuando chatActivo está activo
  useEffect(() => {
    if (vista !== "MENSAJES" || !chatActivo) return;

    const intervalo = setInterval(() => {
      fetch(`http://localhost/amortal/backend/verMensajes.php?id=${id}`)
        .then((res) => res.json())
        .then((nuevosMensajes) => {
          setMensajes(nuevosMensajes);
          const conversacionActualizada = nuevosMensajes.find(
            (conv) => conv.id_usuario === chatActivo.id_usuario
          );
          if (conversacionActualizada) setChatActivo(conversacionActualizada);
        })
        .catch((err) => console.error("Error al actualizar mensajes:", err));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [vista, chatActivo, id]);

  // Función para renderizar la vista según la sección seleccionada
  const renderVista = () => {
    // Renderiza el perfil del usuario
    if (vista === "PERFIL" && perfil) {
      const edad = calcularEdad(perfil.fecha_nacimiento);

      const manejarToggleEdicion = () => {
        if (!modoEdicion) {
          // Solo al activar edición, se rellenan los valores actuales
          setBiografia(perfil.biografia || "");
          setIntereses(perfil.intereses ? perfil.intereses.join(", ") : "");
        }
        setModoEdicion(!modoEdicion);
      };

      return (
        <div className="perfil-container">
          <button className="boton" onClick={manejarToggleEdicion}>
            {modoEdicion ? "Cancelar" : "Editar biografía e intereses"}
          </button>

          {modoEdicion ? (
            <>
              <h2 className="titulo-seccion">Editar perfil</h2>

              <p className="info-item">
                <strong>Edad:</strong> {edad} años (no editable)
              </p>

              <div className="form-group">
                <label className="info-item">Biografía:</label>
                <textarea
                  className="textarea-5"
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="info-item">
                  Intereses (separados por coma):
                </label>
                <input
                  type="text"
                  className="textointereses-5"
                  value={intereses}
                  onChange={(e) => setIntereses(e.target.value)}
                />
              </div>

              <button
                className="boton-confirmar"
                onClick={() => {
                  const interesesArray = intereses
                    .split(",")
                    .map((i) => i.trim());
                  const interesesEncoded = encodeURIComponent(
                    interesesArray.join(",")
                  );
                  const biografiaEncoded = encodeURIComponent(biografia);

                  fetch(
                    `http://localhost/amortal/backend/actualizarPerfil.php?id_usuario=${id}&biografia=${biografiaEncoded}&intereses=${interesesEncoded}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        alert("Perfil actualizado correctamente");
                        setModoEdicion(false);
                        setPerfil((prev) => ({
                          ...prev,
                          biografia,
                          intereses: interesesArray,
                        }));
                      } else {
                        alert("Error al actualizar: " + data.message);
                      }
                    })
                    .catch((error) => {
                      alert("Error de red: " + error.message);
                    });
                }}
              >
                Guardar cambios
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setMostrarModalContrasena(true)}>
                Cambiar contraseña
              </button>

              <h2>{perfil.nombre}</h2>
              <p className="info-item">
                <strong>Edad:</strong> {edad} años
              </p>
              <p className="info-item">
                <strong>Biografía:</strong> {perfil.biografia}
              </p>
              <p className="info-item">
                <strong>Intereses:</strong> {perfil.intereses.join(", ")}
              </p>

              <div className="fotos-container">
                <strong>Fotos:</strong>
                <div className="fotos-list">
                  {perfil.fotos.map((ruta, i) => (
                    <img
                      key={i}
                      src={`http://localhost/amortal/backend/${ruta}`}
                      alt={`Foto ${i + 1}`}
                      className="foto-item"
                    />
                  ))}
                </div>
              </div>

              {mostrarModalContrasena && (
                <div className="modal-fondo">
                  <div className="modal-contenido">
                    <h3>Cambiar Contraseña</h3>

                    <label>Contraseña actual:</label>
                    <input
                      type="password"
                      value={contrasenaActual}
                      onChange={(e) => setContrasenaActual(e.target.value)}
                    />

                    <label>Nueva contraseña:</label>
                    <input
                      type="password"
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
                    />

                    <label>Confirmar nueva contraseña:</label>
                    <input
                      type="password"
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                    />

                    <div className="modal-botones">
                      <button onClick={cambiarContrasena}>Guardar</button>
                      <button onClick={() => setMostrarModalContrasena(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Renderiza la lista de personas disponibles a las que dar dislike, like o superlike
    if (vista === "PERSONAS") {
      if (personas.length === 0 || !personas[indicePersona]) {
        return <h2>No hay más personas</h2>;
      }

      const persona = personas[indicePersona];
      const edad = calcularEdad(persona.fecha_nacimiento);

      const manejarAccion = (tipo) => {
        fetch(
          `http://localhost/amortal/backend/like.php?id_emisor=${id}&id_receptor=${persona.id_usuario}&tipo=${tipo}&fecha=${fechaAhora}`
        )
          .then((res) => res.json())
          .then((data) => console.log("Respuesta del servidor:", data))
          .catch((err) => console.error("Error al registrar like:", err));

        setIndicePersona((prev) => prev + 1);
      };

      return (
        <div className="perfil-container">
          <div className="botones-acciones">
            <button onClick={() => manejarAccion("x")} className="botoncico">
              <img src={equis} alt="No me gusta" />
            </button>
            <button onClick={() => manejarAccion("like")} className="botoncico">
              <img src={like} alt="Me gusta" />
            </button>
            <button
              onClick={() => manejarAccion("superlike")}
              className="botoncico"
            >
              <img src={superlike} alt="Superlike" />
            </button>
          </div>

          <h2>{persona.nombre}</h2>
          <p className="info-item">
            <strong>Edad:</strong> {edad} años
          </p>
          <p className="info-item">
            <strong>Biografía:</strong> {persona.biografia}
          </p>
          <p className="info-item">
            <strong>Intereses:</strong> {persona.intereses.join(", ")}
          </p>

          <div className="fotos-container">
            <strong>Fotos:</strong>
            <div className="fotos-list">
              {persona.fotos.map((ruta, i) => (
                <img
                  key={i}
                  src={`http://localhost/amortal/backend/${ruta}`}
                  alt={`Foto ${i + 1}`}
                  className="foto-item"
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Renderiza la lista de personas que te han dado like
    if (vista === "LIKES") {
      return (
        console.log(likes),
        console.log(id),
        (
          <div className="likes-container">
            <h2>Personas que te dieron like</h2>
            <div className="likes-scroll">
              {likes.map((persona, i) => (
                <>
                  <div key={i} className="like-item">
                    <img
                      src={`http://localhost/amortal/backend/${persona.fotos[0]}`}
                      alt={`Foto de ${persona.nombre}`}
                      className="like-foto"
                    />
                    <span className="like-nombre">{persona.nombre}</span>
                    <img
                      src={teHaDadoLike}
                      alt={`Foto de ${persona.nombre}`}
                      className="teHaDadoLike"
                    />
                  </div>
                </>
              ))}
            </div>
          </div>
        )
      );
    }

    // Renderiza la vista de los matches, sus chats y mensajes
    if (vista === "MENSAJES") {
      if (chatActivo) {
        console.log(chatActivo);

        return (
          <div className="likes-scroll chat-contenedor">
            <button
              onClick={() => setChatActivo(null)}
              className="boton-volver"
            >
              Volver a mensajes
            </button>

            <h2>Chat con {chatActivo.nombre}</h2>

            <div className="chat-mensajes">
              {chatActivo.mensajes.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.id_usuario_emisor === id
                      ? "mensaje-izquierda"
                      : "mensaje-derecha"
                  }
                >
                  <img
                    src={`http://localhost/amortal/backend/${
                      msg.id_usuario_emisor === id
                        ? perfil.fotos[0]
                        : chatActivo.fotos[0]
                    }`}
                    alt={`Foto de ${
                      msg.id_usuario_emisor === id
                        ? perfil.nombre
                        : chatActivo.nombre
                    }`}
                    className="like-foto"
                  />
                  <p>{msg.texto}</p>
                </div>
              ))}
            </div>

            <div className="chat-footer">
              <button
                onClick={FormularioReporte}
                className="acciones-negativas"
              >
                Reportar a {chatActivo.nombre}
              </button>

              {mostrarFormularioReporte && (
                <div className="popup-reporte">
                  <div className="popup-contenido">
                    <h3>Reportar a {chatActivo.nombre}</h3>
                    <p className="texto-reporte">
                      ¿Por qué quieres reportar a {chatActivo.nombre}?
                    </p>
                    <textarea
                      placeholder="Escribe el motivo del reporte..."
                      rows={4}
                      value={mensajeReporte}
                      onChange={(e) => setMensajeReporte(e.target.value)}
                    ></textarea>

                    <button
                      onClick={() => {
                        const id_reportante = id;
                        const id_reportado = chatActivo.id_usuario;
                        const mensaje = encodeURIComponent(mensajeReporte); // Reemplaza por el valor real

                        fetch(
                          `http://localhost/amortal/backend/reportar.php?id_reportante=${id_reportante}&id_reportado=${id_reportado}&mensaje=${mensaje}`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.success) {
                              alert("¡Reporte enviado!");
                            } else {
                              alert(
                                "Error al enviar el reporte: " + data.message
                              );
                            }
                            setMostrarFormularioReporte(false);
                          })
                          .catch((error) => {
                            alert("Error de red: " + error.message);
                            setMostrarFormularioReporte(false);
                          });
                      }}
                    >
                      Enviar reporte
                    </button>

                    <button onClick={FormularioReporte}>Cancelar</button>
                  </div>
                </div>
              )}

              <button onClick={DeshacerMatch} className="acciones-negativas">
                Deshacer Match
              </button>

              {mostrarConfirmacionDeshacer && (
                <div className="popup-reporte">
                  <div className="popup-contenido">
                    <h3>
                      ¿ Quieres deshacer el match con {chatActivo.nombre} ?
                    </h3>

                    <button
                      onClick={() => {
                        console.log(id_match);

                        fetch(
                          `http://localhost/amortal/backend/recogerIdMensaje.php?id1=${id}&id2=${chatActivo.id_usuario}`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.id_match) {
                              // Actualiza el estado con el id_match recibido para usarlo luego
                              setId_match(data.id_match);

                              fetch(
                                `http://localhost/amortal/backend/deshacerMatch.php?id_match=${data.id_match}`
                              )
                                .then((res) => res.json())
                                .then((data) => {
                                  if (data.success) {
                                    alert("¡Match eliminado!");
                                    setMostrarConfirmacionDeshacer(false);

                                    // Aquí haces que salga de la conversación
                                    setChatActivo(null);
                                  } else {
                                    alert(
                                      "Error al eliminar el match: " +
                                        data.message
                                    );
                                  }
                                })
                                .catch((error) => {
                                  alert("Error de red: " + error.message);
                                  setMostrarConfirmacionDeshacer(false);
                                });
                            }
                          })
                          .catch((err) => console.error(err));
                      }}
                    >
                      Deshacer Match
                    </button>

                    <button onClick={DeshacerMatch}>Cancelar</button>
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="input-mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />

              <button
                className="boton-enviar"
                onClick={() => {
                  console.log(mensajes);

                  fetch(
                    `http://localhost/amortal/backend/recogerIdMensaje.php?id1=${id}&id2=${chatActivo.id_usuario}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.id_match) {
                        mandarMensaje(data.id_match, id, mensaje);
                        setMensaje("");

                        // Vuelve a cargar los mensajes actualizados
                        fetch(
                          `http://localhost/amortal/backend/verMensajes.php?id=${id}`
                        )
                          .then((res) => res.json())
                          .then((nuevosMensajes) => {
                            setMensajes(nuevosMensajes);

                            // Busca la conversación actualizada con ese usuario
                            const conversacionActualizada = nuevosMensajes.find(
                              (conv) =>
                                conv.id_usuario === chatActivo.id_usuario
                            );
                            if (conversacionActualizada) {
                              setChatActivo(conversacionActualizada);
                            }
                          })
                          .catch((err) =>
                            console.error("Error al actualizar mensajes:", err)
                          );
                      } else {
                        console.error("No se encontró id_match");
                      }
                    })
                    .catch((err) => console.error(err));
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        );
      }

      // Vista general de conversaciones
      return (
        <div className="likes-container">
          <h2>Mensajes</h2>
          <div className="likes-scroll">
            {mensajes.map(
              (persona, i) => (
                console.log(persona),
                (
                  <div key={i} className="like-item">
                    <img
                      src={`http://localhost/amortal/backend/${persona.fotos[0]}`}
                      alt={`Foto de ${persona.nombre}`}
                      className="like-foto"
                    />
                    <span className="like-nombre">{persona.nombre}</span>
                    <button
                      className="boton-icono"
                      onClick={() => setChatActivo(persona)}
                    >
                      <div className="icono-texto">
                        <span>Chat</span>
                        <img src={mensajesIcon} alt="Abrir chat" />
                      </div>
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      );
    }
  };

  // Función para manejar el envío de ajustes
  const handleAjustesSubmit = (e) => {
    e.preventDefault();
    setModo("DEFAULT");
    setVista("PERFIL");
  };

  // Formulario de ajustes de usuario
  const renderFormularioAjustes = () => (
    <form className="app-container" onSubmit={handleAjustesSubmit}>
      <div className="field-group">
        <label>¿Qué te gustaría ver?</label>
        <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <option value="hombre">Hombres</option>
          <option value="mujer">Mujeres</option>
          <option value="AMBOS">Ambos</option>
        </select>
      </div>

      <div className="field-group">
        <label>Edad mínima</label>
        <input
          type="number"
          value={edadMin}
          min="18"
          onChange={(e) =>
            setEdadMin(Math.min(Number(e.target.value), edadMax))
          }
        />
      </div>

      <div className="field-group">
        <label>Edad máxima</label>
        <input
          type="number"
          value={edadMax}
          max="99"
          onChange={(e) =>
            setEdadMax(Math.max(Number(e.target.value), edadMin))
          }
        />
      </div>

      <div className="button-group">
        <button type="submit">Confirmar</button>
      </div>
    </form>
  );

  return (
    <>
      <div className="esquina-izquierda">
        <img src={amortalLOGO} className="fotoInicio" alt="Logo AMortal" />
        <img src={amortalTÍTULO} className="fotoInicio" alt="Título AMortal" />
      </div>

      <div className="esquina-derecha">
        {modo === "DEFAULT" ? (
          <button className="boton-icono" onClick={() => setModo("AJUSTES")}>
            <div className="icono-texto">
              <span>Ajustes</span>
              <img src={ajustesIcon} alt="Ajustes" />
            </div>
          </button>
        ) : (
          <button className="boton-volver" onClick={() => setModo("DEFAULT")}>
            Volver
          </button>
        )}
      </div>

      <div className="inicio-container">
        {modo === "DEFAULT" ? (
          <>
            <div className="contenido-central">{renderVista()}</div>

            <div className="barra-navegacion">
              <button onClick={() => setVista("PERFIL")}>
                <img src={perfilIcon} alt="Perfil" />
              </button>
              <button onClick={() => setVista("PERSONAS")}>
                <img src={personasIcon} alt="Personas" />
              </button>
              <button onClick={() => setVista("LIKES")}>
                <img src={likesIcon} alt="Likes" />
              </button>
              <button onClick={() => setVista("MENSAJES")}>
                <img src={mensajesIcon} alt="Mensajes" />
              </button>
            </div>
          </>
        ) : (
          <div className="contenido-central">{renderFormularioAjustes()}</div>
        )}
      </div>
    </>
  );
}