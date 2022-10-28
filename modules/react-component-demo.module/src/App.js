import React from 'react';
import './App.scss';

/**
 * bg_color
 * text_position
 * price
 */

function App({ moduleData }) {
  console.log(
    'all of your data typically accessed via the "module" keyword in HubL is available as JSON here!',
    moduleData,
  );

  const currentDate = new Date().toISOString();

  return (
    <div
      className="header-main"
      style={{
        'background-color': moduleData.bg_color.color,
        color: moduleData.text_color.color,
      }}
    >
      <p>Today is {currentDate}</p>
      <p>Price: {moduleData.price}$</p>
    </div>
  );
}

export default App;
