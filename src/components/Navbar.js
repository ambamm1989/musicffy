import React from 'react';
import "./Navbar.css"

const Navbar = ({ handleLogout }) => {
  return (
    <nav>
      <div className="nav-left">
        <button className='sign-out' onClick={handleLogout}>Sign Out</button>
      </div>
      <div className="nav-right">
        {/* other navigation links */}
      </div>
    </nav>
  );
};

export default Navbar;
