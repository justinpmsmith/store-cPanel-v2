// js/services/serverBase.js
// Base class for all API communication.
// Handles token storage, auth checking, and all HTTP methods.
// Adapted from the Vue/Nuxt version — Pinia replaced with localStorage.

class ServerBase {

  // ── Token ────────────────────────────────────────────────────────────────

  static getAccessToken() {
    return localStorage.getItem('token') || null;
  }

  static setAccessToken(token) {
    localStorage.setItem('token', token);
  }

  static clearAccessToken() {
    localStorage.removeItem('token');
  }

  // ── Auth check ───────────────────────────────────────────────────────────

  static async amAuthenticated() {
    const token = this.getAccessToken();

    if (!token || token.length < 10) {
      return false;
    }

    try {
      const url = Config.apiUrl + '/admin/amAuth';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('amAuthenticated error:', error);
      return false;
    }
  }

  static async requireAuth() {
    const authed = await this.amAuthenticated();
    if (!authed) {
      // Determine correct path depth for redirect
      const depth = window.location.pathname.includes('/pages/') ? '../' : '';
      window.location.href = depth + 'pages/login.html';
    }
    return authed;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  static getServerPath() {
    return Config.apiUrl;
  }

  static _isAdminEndpoint(endpoint) {
    return endpoint.includes('/admin');
  }

  static _buildHeaders(endpoint, isForm = false) {
    const headers = {};

    if (!isForm) {
      headers['Content-Type'] = 'application/json';
    }

    if (this._isAdminEndpoint(endpoint)) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ── GET ──────────────────────────────────────────────────────────────────

  static async getRequest(endpoint, params = null) {
    if (this._isAdminEndpoint(endpoint)) {
      const authed = await this.amAuthenticated();
      if (!authed) {
        await this.requireAuth();
        return null;
      }
    }

    try {
      let url = this.getServerPath() + endpoint;

      if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this._buildHeaders(endpoint),
      });

      return response.status === 200 ? await response.json() : null;
    } catch (error) {
      console.error(`GET ${endpoint}:`, error.message);
      return null;
    }
  }

  // ── POST (JSON) ──────────────────────────────────────────────────────────

  static async postRequest(endpoint, data) {
    try {
      const url = this.getServerPath() + endpoint;

      const response = await fetch(url, {
        method: 'POST',
        headers: this._buildHeaders(endpoint),
        body: JSON.stringify(data),
      });

      return response.status === 200 ? await response.json() : null;
    } catch (error) {
      console.error(`POST ${endpoint}:`, error.message);
      return null;
    }
  }

  // ── POST (multipart/form-data) ───────────────────────────────────────────
  // Do NOT set Content-Type manually — fetch sets it automatically
  // with the correct boundary when given a FormData object.

  static async postFormRequest(endpoint, formData) {
    if (this._isAdminEndpoint(endpoint)) {
      const authed = await this.amAuthenticated();
      if (!authed) {
        await this.requireAuth();
        return null;
      }
    }

    try {
      const url = this.getServerPath() + endpoint;

      const headers = {};
      if (this._isAdminEndpoint(endpoint)) {
        const token = this.getAccessToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return response.status === 200 ? await response.json() : null;
    } catch (error) {
      console.error(`POST (form) ${endpoint}:`, error.message);
      return null;
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────

  static async deleteRequest(endpoint, params = null) {
    if (this._isAdminEndpoint(endpoint)) {
      const authed = await this.amAuthenticated();
      if (!authed) {
        await this.requireAuth();
        return null;
      }
    }

    try {
      let url = this.getServerPath() + endpoint;

      if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this._buildHeaders(endpoint),
      });

      return response.status === 200 ? await response.json() : null;
    } catch (error) {
      console.error(`DELETE ${endpoint}:`, error.message);
      return null;
    }
  }

  // ── Keycloak token exchange ───────────────────────────────────────────────

  static async retrieveAccessToken(username, password, clientSecret) {
    try {
      const tokenUrl = 'https://keycloack.code-smith.co.za/auth/realms/codesmith/protocol/openid-connect/token';
      const clientId  = 'allianceseeds';

      const params = new URLSearchParams();
      params.append('grant_type',    'password');
      params.append('client_id',     clientId);
      params.append('client_secret', clientSecret);
      params.append('username',      username);
      params.append('password',      password);

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data.access_token) {
          return { meta: { success: true }, data: data.access_token };
        }
      }

      return { meta: { success: false }, data: null };
    } catch (error) {
      console.error('retrieveAccessToken error:', error.message);
      return { meta: { success: false }, data: null };
    }
  }
}
