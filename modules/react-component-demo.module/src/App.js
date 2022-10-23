import React from 'react';
import './App.scss';

function App({ moduleData }) {
  console.log(
    'all of your data typically accessed via the "module" keyword in HubL is available as JSON here!',
    moduleData,
  );

  return (
    <div className="header-main">
      <p>This code is using react.</p>
    </div>
  );
}

export default App;
