"use client";

import React, { useState } from 'react';

const Greeting = ({ initialName }) => {
  const [name, setName] = useState(initialName);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};

export default Greeting;
