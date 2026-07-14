import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ Force dark class permanently on html element
document.documentElement.classList.add('dark');

// Prevent any toggle from removing dark class
const observer = new MutationObserver(() => {
  if (!document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark');
  }
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)