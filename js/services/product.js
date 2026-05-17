// js/services/product.js
// All product and category API methods.
// Extends ServerBase — no DOM interaction here.

class Product extends ServerBase {

  // ── Products ─────────────────────────────────────────────────────────────

  static async getAllProducts() {
    return await this.getRequest('/client/getAllProducts');
  }

  static async getProductsByCategory(category) {
    return await this.getRequest('/client/getProductsByCategory', { category });
  }

  static async getProductByProdCode(prodCode) {
    return await this.getRequest('/client/getProductByProdCode', { prodCode });
  }

  static async getProdCodesByCategory(category) {
    return await this.getRequest('/client/getCategoryProdCodes', { category });
  }

  /**
   * @param {object} data        - { name, prodCode, category, price, quantity, info }
   * @param {File[]} imageFiles  - array of File objects
   * @param {File|null} documentFile - PDF File or null
   */
  static async addProduct(data, imageFiles = [], documentFile = null) {
    const formData = new FormData();
    formData.append('name',      data.name);
    formData.append('prod_code', data.prodCode);
    formData.append('category',  data.category);
    formData.append('price',     data.price);
    formData.append('quantity',  data.quantity);
    if (data.info) formData.append('info', data.info);

    imageFiles.forEach(file => formData.append('images', file));
    if (documentFile) formData.append('document', documentFile);

    return await this.postFormRequest('/admin/addProduct', formData);
  }

  /**
   * @param {object} data        - { name, prodCode, category, price, quantity, info }
   * @param {File[]} imageFiles  - new images, or empty array to keep existing
   * @param {File|null} documentFile - new PDF, or null to keep existing
   */
  static async updateProduct(data, imageFiles = [], documentFile = null) {
    const formData = new FormData();
    formData.append('name',      data.name);
    formData.append('prod_code', data.prodCode);
    formData.append('category',  data.category);
    formData.append('price',     data.price);
    formData.append('quantity',  data.quantity);
    if (data.info) formData.append('info', data.info);

    imageFiles.forEach(file => formData.append('images', file));
    if (documentFile) formData.append('document', documentFile);

    return await this.postFormRequest('/admin/updateProduct', formData);
  }

  static async deleteProductByProdCode(prodCode) {
    return await this.deleteRequest('/admin/deleteProductByProdCode', { prodCode });
  }

  // ── Categories ───────────────────────────────────────────────────────────

  static async getCategoryNames() {
    return await this.getRequest('/client/getCategoryNames');
  }

  static async getCategoryByName(name) {
    return await this.getRequest('/client/getCategoryByName', { name });
  }

  /**
   * @param {string} name
   * @param {File|null} imageFile
   */
  static async addCategory(name, imageFile = null) {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) formData.append('image', imageFile);
    return await this.postFormRequest('/admin/addCategory', formData);
  }

  /**
   * @param {string} name
   * @param {File|null} imageFile - null keeps the existing image
   */
  static async updateCategory(name, imageFile = null) {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) formData.append('image', imageFile);
    return await this.postFormRequest('/admin/updateCategory', formData);
  }

  static async deleteCategory(name) {
    return await this.deleteRequest('/admin/deleteCategoryByName', { name });
  }

  // ── Sales ────────────────────────────────────────────────────────────────

  static async getSoldProducts() {
    return await this.getRequest('/admin/getSoldProducts');
  }

  static async getSoldProductById(id) {
    return await this.getRequest('/admin/getSoldProductById', { id });
  }
}
