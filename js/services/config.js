// js/services/config.js
// Central configuration — edit apiUrl to switch between environments.
// Exposed as window.Config so all other scripts can access it without imports.

const Config = {
  // apiUrl: 'https://as.backend.code-smith.co.za/api/v1',  // production
  // apiUrl: 'https://stage.backend.code-smith.co.za/api/v1', // staging
  apiUrl: 'http://localhost:8000/api/v1',                     // development

  authenticateEndpoint: '/client/authenticateUser',
};
