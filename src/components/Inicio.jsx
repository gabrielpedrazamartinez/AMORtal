import React from 'react';

export default function Inicio({ id, nombre }) {
  return (
    <div className="app-container">
      <h1>
        Hola {nombre}, bienvenido, código en proceso :/
      </h1>
    </div>
  );
}
