import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const ProfileIcon = ({ toggleModal, handleSignOut }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <div className='pa4 tc'>
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          className='br-100 h3 w3 dib'
          tag='span'
          data-toggle='dropdown'
          aria-expanded={dropdownOpen}
          style={{
            backgroundImage: 'url(http://tachyons.io/img/logo.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          }}
        ></DropdownToggle>
        <DropdownMenu
          className='b--transparent shadow-5'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <DropdownItem onClick={toggleModal}>View Profile</DropdownItem>
          <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ProfileIcon;
