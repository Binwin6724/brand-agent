import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SideNavigation.css';
const navItems = [
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className=" "><path d="m17.13 5.734-5.75-4.472c-.812-.631-1.948-.632-2.76 0L2.87 5.735h-.002C2.324 6.157 2 6.821 2 7.511v8.239C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V7.51c0-.689-.324-1.353-.87-1.776ZM11.5 16.5h-3v-4.75c0-.413.337-.75.75-.75h1.5c.413 0 .75.337.75.75v4.75Zm5-.75c0 .413-.337.75-.75.75H13v-4.75c0-1.24-1.01-2.25-2.25-2.25h-1.5C8.01 9.5 7 10.51 7 11.75v4.75H4.25c-.413 0-.75-.337-.75-.75V7.51c0-.229.108-.45.29-.592l5.75-4.47c.272-.213.65-.21.92-.002l5.75 4.472c.182.142.29.363.29.593v8.239Z" fill="#fff"></path></svg>, 
    label: 'Home',
    path: '/home'
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className=" "><path d="M16.795 19h-7.5c-1.24 0-2.25-1.01-2.25-2.25v-7.5c0-1.24 1.01-2.25 2.25-2.25h7.5c1.24 0 2.25 1.01 2.25 2.25v7.5c0 1.24-1.01 2.25-2.25 2.25Zm-7.5-10.5c-.413 0-.75.337-.75.75v7.5c0 .413.337.75.75.75h7.5c.414 0 .75-.337.75-.75v-7.5c0-.413-.336-.75-.75-.75h-7.5Z" fill="#fff"></path><path d="M4.795 14.5c-.414 0-.75-.336-.75-.75v-7.5c0-1.24 1.01-2.25 2.25-2.25h7.5c.414 0 .75.336.75.75s-.336.75-.75.75h-7.5c-.413 0-.75.337-.75.75v7.5c0 .414-.336.75-.75.75Z" fill="#fff"></path><path d="M1.795 11.5c-.414 0-.75-.336-.75-.75v-7.5c0-1.24 1.01-2.25 2.25-2.25h7.5c.414 0 .75.336.75.75s-.336.75-.75.75h-7.5c-.413 0-.75.337-.75.75v7.5c0 .414-.336.75-.75.75Z" fill="#fff"></path></svg>, 
    label: 'Content',
    path: '/content'
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className=" "><path d="M10.007 19c-.084 0-.168-.002-.253-.004-4.422-.25-7.818-3.902-7.753-8.311V3.25c0-1.24 1.01-2.25 2.25-2.25H15.75C16.99 1 18 2.01 18 3.25l-.003 7.99c-.066 2.14-.959 4.123-2.516 5.587C13.985 18.233 12.05 19 10.007 19ZM4.25 2.5c-.413 0-.75.337-.75.75v7.445c-.054 3.615 2.722 6.598 6.32 6.802 1.706.052 3.367-.573 4.632-1.763s1.991-2.8 2.044-4.537L16.5 11V3.25c0-.413-.337-.75-.75-.75H4.251Z" fill="#fff"></path><path d="M14.25 12h-5.5c-.265 0-.51-.14-.645-.367-.135-.228-.14-.51-.013-.742l2.75-5.04c.133-.24.385-.39.659-.39s.527.15.658.39l2.75 5.04c.126.232.121.514-.014.742-.135.227-.38.367-.645.367Zm-4.236-1.5h2.972l-1.485-2.724-1.487 2.724ZM5.749 12c-.121 0-.244-.03-.358-.092-.364-.198-.497-.654-.3-1.017l1.982-3.63c.198-.363.654-.497 1.018-.298.363.198.497.654.299 1.017l-1.982 3.63c-.136.248-.393.39-.659.39Z" fill="#fff"></path></svg>, 
    label: 'Brand',
    path: '/search-ad'
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className=""><path d="M2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1-.5-.5m2.5.5v1a3.5 3.5 0 0 0 1.989 3.158c.533.256 1.011.791 1.011 1.491v.702s.18.149.5.149.5-.15.5-.15v-.7c0-.701.478-1.236 1.011-1.492A3.5 3.5 0 0 0 11.5 3V2z" fill="#fff"/></svg>, 
    label: 'Sandbox',
    path: '/sandbox'
  },
];

function SideNavigation({ isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  return (
    <nav className={`side-nav-root${isCollapsed ? ' collapsed' : ''}`}>
      <ul className="side-nav-list">
        {navItems.map((item, idx) => (
          <li 
            key={idx} 
            className={`side-nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="side-nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="side-nav-label">{item.label}</span>}
          </li>
        ))}
      </ul>
      {!isCollapsed && (
        <div className="side-nav-footer">
          <span className="side-nav-user">Genstudio Engineering 01</span>
        </div>
      )}
    </nav>
  );
}

export default SideNavigation;
