import React from 'react';
import { isMobile, isTablet } from 'react-device-detect';

const DeviceRestriction = ({ children }) => {
  if (isMobile || isTablet) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Access Restricted</h1>
        <p>You are not able to use this app from a mobile or tablet. Please log in from a computer.</p>
      </div>
    );
  }
  
  return children;
};

export default DeviceRestriction;
