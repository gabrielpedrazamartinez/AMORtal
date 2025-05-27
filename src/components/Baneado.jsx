// Baneado.jsx

import React from 'react';
import '../styles/App.css'; // Asegúrate de tener estilos apropiados aquí

export default function Baneado({ nombre }) {
  return (
    <div className="app-container">
      <div className="contenedor1">
        <h2 className="titulo-baneado">Cuenta suspendida</h2>
        <p className="mensaje-baneado">
          Hola <strong>{nombre}</strong>, lamentablemente tu cuenta ha sido <span className="baneado">baneada</span> y no puedes acceder a la aplicación.
        </p>
        <p className="motivo-baneado">
          Si crees que esto es un error, por favor contacta al soporte de <strong>AMORtal</strong>.
        </p>
      </div>

      <footer className="footer">
        © 2025 AMORtal: Aplicación desarrollada por Gabriel Pedraza Martínez.
      </footer>
    </div>
  );
}
