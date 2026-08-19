import React from 'react';
import Users from './Users';

const Teachers = () => {
  // The Users component already has a role filter dropdown.
  // When you visit /teachers, you'll see the Users page.
  // To automatically show only teachers, you can modify Users
  // to accept a `role` prop and set it to 'teacher' here.
  // For now, this works out-of-the-box.
  return <Users />;
};

export default Teachers;