import { useState, useEffect } from "react";
import titulo from "/título.png";
import logo from "/logo.png";
import "../styles/App.css";
import Inicio from "./Inicio";
import Admin from "./Admin";
import Baneado from "./Baneado";

export default function Registro() {
  const [mode, setMode] = useState("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [orientacion, setOrientacion] = useState("");
  const [biografia, setBiografia] = useState("");
  const [intereses, setIntereses] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolCargado, setRolCargado] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  // Aquí se comprueba el estado del usuario al cargar el componente
  useEffect(() => {
    if (!userId) return;

    setRolCargado(false);

    fetch(`http://localhost/amortal/backend/ifbaneado.php?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.baneado) {
          setIsBanned(true);
          setRolCargado(true);
        } else {
          fetch(
            `http://localhost/amortal/backend/comprobarRol.php?userId=${userId}`
          )
            .then((res) => res.json())
            .then((data) => {
              setIsAdmin(data.isAdmin === true);
              setRolCargado(true);
            })
            .catch(() => {
              setErrorMessage("Error al comprobar rol de usuario");
              setRolCargado(true);
            });
        }
      })
      .catch(() => {
        setErrorMessage("Error al comprobar estado del usuario");
        setRolCargado(true);
      });
  }, [userId]);

  // constante para validar el email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // constante para comprobar si el usuario es mayor de edad
  const isAdult = (fecha) => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const dia = hoy.getDate() - nacimiento.getDate();
    return edad > 18 || (edad === 18 && (mes > 0 || (mes === 0 && dia >= 0)));
  };

  // función para validar las credenciales
  const validateCredentials = () => {
    if (!email || !password) return "Por favor completa todos los campos";
    if (!isValidEmail(email)) return "Introduce un correo electrónico válido";
    return "";
  };

  // función para manejar las solicitudes de registro e inicio de sesión
  const handleRequest = async (url, data, onSuccess) => {
    setErrorMessage("");
    const error = validateCredentials();
    if (error) return setErrorMessage(error);

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        onSuccess(result);
      } else {
        setErrorMessage(`Error: ${result.message}`);
      }
    } catch {
      setErrorMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // función para manejar el registro de la cuenta
  const handleCreateAccount = () => {
    handleRequest(
      "http://localhost/amortal/backend/crearCuenta.php",
      { email, password },
      () => {
        setMode("final-register");
      }
    );
  };

  // función para manejar el inicio de sesión
  const handleLogin = () => {
    handleRequest(
      "http://localhost/amortal/backend/iniciarSesión.php",
      { email, password },
      (result) => {
        setUserId(result.userId);
        setNombre(result.nombre);
        setMode(result.state === "por_terminar" ? "final-register" : "");
        setRegistrationComplete(result.state !== "por_terminar");
      }
    );
  };

  // función para enviar el correo de recuperación
  const enviarRecuperacion = () => {
    if (!email) return alert("Por favor ingresa un correo electrónico.");

    fetch(
      `http://localhost/amortal/backend/siExisteCorreo.php?email=${encodeURIComponent(
        email
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.exists) {
          alert(
            `El correo ${email} está registrado. Se enviará el correo de recuperación.`
          );
          fetch(
            `http://localhost/amortal/backend/correoRecuperación.php?correo=${encodeURIComponent(
              email
            )}`
          )
            .then((res) => res.json())
            .then((data) =>
              alert(data.success ? data.message : "Error: " + data.message)
            )
            .catch((err) => alert("Error al enviar el correo: " + err.message));
          setMostrarPopup(false);
          setEmail("");
        } else {
          alert(
            `El correo ${email} no está registrado en nuestra base de datos.`
          );
        }
      })
      .catch((err) => alert("Error de red: " + err.message));
  };

  // función para manejar el cambio de intereses
  // Se limita a un máximo de 5 intereses
  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    if (checked && intereses.length < 5) {
      setIntereses([...intereses, value]);
    } else if (!checked) {
      setIntereses(intereses.filter((i) => i !== value));
    }
  };

  // función para manejar la carga de fotos
  // Se limita a un máximo de 5 fotos
  const handlePhotoUpload = (e) => {
    setFotos(Array.from(e.target.files));
  };

  // función para finalizar el registro
  // Se valida que se hayan completado todos los campos obligatorios
  const handleFinalRegistration = async () => {
    setErrorMessage("");

    if (!nombre || !fechaNacimiento || !genero || !orientacion)
      return setErrorMessage("Por favor completa los campos obligatorios");

    if (!isAdult(fechaNacimiento))
      return setErrorMessage(
        "Debes ser mayor de edad para entrar en la aplicación"
      );

    if (intereses.length < 3 || intereses.length > 5)
      return setErrorMessage("Selecciona entre 3 y 5 intereses");

    if (fotos.length < 1 || fotos.length > 5)
      return setErrorMessage("Selecciona entre 1 y 5 fotos");

    const formData = new FormData();
    const campos = {
      email,
      nombre,
      orientacion,
      fecha_nacimiento: fechaNacimiento,
      genero,
      biografia,
    };

    Object.entries(campos).forEach(([key, value]) =>
      formData.append(key, value)
    );
    intereses.forEach((i) => formData.append("intereses[]", i));
    fotos.forEach((file) => formData.append("fotos[]", file));

    try {
      const res = await fetch(
        "http://localhost/amortal/backend/finalizarCuenta.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await res.json();

      if (result.success) {
        setUserId(result.userId);
        setRegistrationComplete(true);
      } else {
        setErrorMessage(`Error: ${result.message}`);
      }
    } catch {
      setErrorMessage("Error al conectar con el servidor");
    }
  };

  // Redirecciones según rol/estado
  if (registrationComplete && rolCargado) {
    if (isBanned) return <Baneado nombre={nombre} />;
    if (isAdmin) return <Admin id={userId} nombre={nombre} />;
    return <Inicio id={userId} nombre={nombre} />;
  }

  // Si aún no se ha cargado el rol o el estado del usuario, mostrar un mensaje de carga
  if (registrationComplete && !rolCargado) return <div>Cargando...</div>;

  // Renderizar el formulario de registro o inicio de sesión
  const renderInputForm = (action, actionLabel) => (
    <div className="login-form">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="button-group">
        <button onClick={action} disabled={loading}>
          {loading ? "Cargando..." : actionLabel}
        </button>
        <button onClick={() => setMode("default")}>Volver</button>
      </div>
    </div>
  );

  // Si el usuario no ha iniciado sesión, mostrar el formulario de registro o inicio de sesión
  return (
    <div className="app-container">
      <img src={logo} className="logo" alt="Logo" />
      <img src={titulo} className="titulo react" alt="Título" />
      <div className="contenedor1">
        <p className="subtitle">Sí se muere por amor</p>
        {errorMessage && <div className="error">{errorMessage}</div>}

        {mode === "default" && (
          <>
            <div className="button-group">
              <button onClick={() => setMode("login")}>Iniciar Sesión</button>
              <button onClick={() => setMode("register")}>Registrarse</button>
            </div>
            <button
              className="boton-olvidado"
              onClick={() => setMostrarPopup(true)}
            >
              ¿Has olvidado la contraseña?
            </button>
            {mostrarPopup && (
              <div className="modal-fondo">
                <div className="modal-contenido">
                  <h3>Recuperar contraseña</h3>
                  <input
                    type="email"
                    placeholder="Introduce tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="botones-modal">
                    <button onClick={enviarRecuperacion}>Enviar</button>
                    <button onClick={() => setMostrarPopup(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "login" && renderInputForm(handleLogin, "Entrar")}
        {mode === "register" &&
          renderInputForm(handleCreateAccount, "Crear cuenta")}

        {mode === "final-register" && (
          <div className="formulario2">
            <div className="field-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Fecha de nacimiento:</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Género:</label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>
            <div className="field-group">
              <label>Orientación sexual:</label>
              <select
                value={orientacion}
                onChange={(e) => setOrientacion(e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="heterosexual">Heterosexual</option>
                <option value="homosexual">Homosexual</option>
              </select>
            </div>

            <div className="field-group">
              <label>Biografía (opcional):</label>
              <textarea
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="field-group">
              <label>Intereses (elige entre 3 y 5):</label>
              <div className="checkbox-group">
                {[
                  "cantar",
                  "bailar",
                  "guitarra",
                  "cocinar",
                  "dibujar",
                  "leer",
                  "jugar",
                ].map((i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      value={i}
                      checked={intereses.includes(i)}
                      onChange={handleInterestChange}
                      disabled={!intereses.includes(i) && intereses.length >= 5}
                    />
                    {i}
                  </label>
                ))}
              </div>
            </div>
            <div className="field-group">
              <label>Fotos (entre 1 y 5):</label>
              <p>No se podrán cambiar las fotos, ELIGE BIEN</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="button-group">
              <button onClick={handleFinalRegistration}>
                Finalizar Registro
              </button>
              <button onClick={() => setMode("default")}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">
        © 2025 AMORtal: Aplicación desarrollada por Gabriel Pedraza Martínez.
      </footer>
    </div>
  );
}
