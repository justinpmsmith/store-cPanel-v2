// js/services/user.js
// User authentication.
// Extends ServerBase — no DOM interaction here.

class User extends ServerBase {

  /**
   * Authenticates the user against the backend, then exchanges
   * the returned clientSecret for a Keycloak JWT.
   *
   * @param {object} data - { name, passwordHash, password }
   * @returns {{ meta: { success: bool }, data: string|null }}
   */
  static async authUser(data) {
    const response = await this.postRequest(Config.authenticateEndpoint, {
      name:         data.name,
      passwordHash: data.passwordHash,
    });

    if (response && response.meta && response.meta.success) {
      const clientSecret = response.data;
      const tokenResponse = await this.retrieveAccessToken(
        data.name,
        data.password,
        clientSecret
      );
      return tokenResponse;
    }

    // Return the backend response as-is so the UI can show the error message
    return response;
  }
}
