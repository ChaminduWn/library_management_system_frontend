"use client";

import React, { useState } from 'react';

interface GreetingProps {
  initialName: string;
}

const Greeting = ({ initialName }: GreetingProps) => {
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

