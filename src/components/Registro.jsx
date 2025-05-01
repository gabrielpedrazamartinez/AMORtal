import { useState } from 'react';
import titulo from '/título.png';
import logo from '/logo.png';
import '../styles/App.css';
import Inicio from './Inicio';

export default function Registro() {
  const [mode, setMode] = useState('default');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [orientacion, setOrientacion] = useState('');
  const [biografia, setBiografia] = useState('');
  const [intereses, setIntereses] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isAdult = fecha => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const dia = hoy.getDate() - nacimiento.getDate();
    return edad > 18 || (edad === 18 && (mes > 0 || (mes === 0 && dia >= 0)));
  };

  const validateCredentials = () => {
    if (!email || !password) return 'Por favor completa todos los campos';
    if (!isValidEmail(email)) return 'Introduce un correo electrónico válido';
    return '';
  };

  const handleRequest = async (url, data, onSuccess) => {
    setErrorMessage('');
    const error = validateCredentials();
    if (error) return setErrorMessage(error);

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        onSuccess(result);
      } else {
        setErrorMessage(`Error: ${result.message}`);
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    handleRequest('http://localhost/amortal/backend/crearCuenta.php', { email, password }, () => {
      setMode('final-register');
    });
  };

  const handleLogin = () => {
    handleRequest('http://localhost/amortal/backend/iniciarSesión.php', { email, password }, result => {
      setUserId(result.userId);
      setNombre(result.nombre);
      setMode(result.state === 'por_terminar' ? 'final-register' : '');
      setRegistrationComplete(result.state !== 'por_terminar');
    });
  };

  const handleInterestChange = e => {
    const { value, checked } = e.target;
    if (checked && intereses.length < 5) {
      setIntereses([...intereses, value]);
    } else if (!checked) {
      setIntereses(intereses.filter(i => i !== value));
    }
  };

  const handlePhotoUpload = e => {
    setFotos(Array.from(e.target.files));
  };

  const handleFinalRegistration = async () => {
    setErrorMessage('');

    if (!nombre || !fechaNacimiento || !genero || !orientacion)
      return setErrorMessage('Por favor completa los campos obligatorios');
    if (!isAdult(fechaNacimiento))
      return setErrorMessage('Debes ser mayor de edad para entrar en la aplicación');
    if (intereses.length < 3 || intereses.length > 5)
      return setErrorMessage('Selecciona entre 3 y 5 intereses');
    if (fotos.length < 1 || fotos.length > 5)
      return setErrorMessage('Selecciona entre 1 y 5 fotos');

    const formData = new FormData();
    const campos = {
      email,
      nombre,
      orientacion,
      fecha_nacimiento: fechaNacimiento,
      genero,
      biografia
    };

    Object.entries(campos).forEach(([key, value]) => formData.append(key, value));
    intereses.forEach(i => formData.append('intereses[]', i));
    fotos.forEach(file => formData.append('fotos[]', file));

    try {
      const res = await fetch('http://localhost/amortal/backend/finalizarCuenta.php', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        setRegistrationComplete(true);
      } else {
        setErrorMessage(`Error: ${result.message}`);
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  if (registrationComplete) return <Inicio id={userId} nombre={nombre} />;

  const renderInputForm = (action, actionLabel) => (
    <div className="login-form">
      <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="button-group">
        <button onClick={action} disabled={loading}>{loading ? 'Cargando...' : actionLabel}</button>
        <button onClick={() => setMode('default')}>Volver</button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <img src={logo} className="logo" alt="Logo" />
      <img src={titulo} className="titulo react" alt="Título" />
      <div className="contenedor1">
        <p className="subtitle">Si se muere por amor</p>
        {errorMessage && <div className="error">{errorMessage}</div>}

        {mode === 'default' && (
          <div className="button-groupx">
            <button onClick={() => setMode('login')}>Iniciar Sesión</button>
            <button onClick={() => setMode('register')}>Registrarse</button>
          </div>
        )}

        {mode === 'login' && renderInputForm(handleLogin, 'Entrar')}
        {mode === 'register' && renderInputForm(handleCreateAccount, 'Crear cuenta')}

        {mode === 'final-register' && (
          <div className="formulario2">
            {[
              { label: 'Nombre:', type: 'text', value: nombre, onChange: setNombre },
              { label: 'Fecha de nacimiento:', type: 'date', value: fechaNacimiento, onChange: setFechaNacimiento }
            ].map(({ label, type, value, onChange }) => (
              <div className="field-group" key={label}>
                <label>{label}</label>
                <input type={type} value={value} onChange={e => onChange(e.target.value)} />
              </div>
            ))}

            {[
              { label: 'Género:', value: genero, onChange: setGenero, options: ['', 'hombre', 'mujer'] },
              { label: 'Orientación sexual:', value: orientacion, onChange: setOrientacion, options: ['', 'heterosexual', 'homosexual'] }
            ].map(({ label, value, onChange, options }) => (
              <div className="field-group" key={label}>
                <label>{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt || 'Seleccionar'}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="field-group">
              <label>Biografía:</label>
              <textarea value={biografia} onChange={e => setBiografia(e.target.value)} />
            </div>

            <div className="field-group">
              <label>Intereses (3–5):</label>
              <div className="checkbox-group">
                {[
                  'Política','Familia','Dinero','Coches',
                  'Deportes','Videojuegos','Arte','Música','Viajes'
                ].map(item => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      value={item}
                      checked={intereses.includes(item)}
                      onChange={handleInterestChange}
                      disabled={!intereses.includes(item) && intereses.length >= 5}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Fotos (1-5):</label>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className="button-group">
              <button onClick={handleFinalRegistration}>Finalizar Registro</button>
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
