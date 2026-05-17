// js/ui.js
// Shared UI utilities used across all pages.
// DOM interaction only — no API calls here.
//
// Sections:
//   1. Sidebar component  — UI.renderSidebar()
//   2. Toast              — UI.toast()
//   3. Spinner            — UI.showSpinner() / UI.hideSpinner()
//   4. Confirm dialog     — UI.confirmDelete()
//   5. Custom dropdown    — UI.initDropdown()
//   6. Dropzone           — UI.initDropzone()
//   7. PDF chip           — UI.setPdfChip()
//   8. Helpers            — UI.formatDate(), UI.initials(), UI.getParam()

const UI = {

  // ── 1. Sidebar component ───────────────────────────────────────────────────
  // Injects the full sidebar HTML into #sidebar-mount, sets the active nav
  // item, wires up sign-out, and sets up the mobile hamburger toggle.
  //
  // Usage: place <div id="sidebar-mount"></div> in the shell, then call
  //   UI.renderSidebar();

  renderSidebar() {
    const mount = document.getElementById('sidebar-mount');
    if (!mount) return;

    mount.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="logo-row">
            <div class="logo-mark"><i class="ti ti-package"></i></div>
            <div>
              <div class="brand-name">SportVest</div>
              <div class="brand-sub">Admin Portal</div>
            </div>
          </div>
        </div>

        <span class="nav-label">Catalogue</span>
        <a class="nav-item" href="products.html" data-page="products,add-product,edit-product">
          <i class="ti ti-layout-grid"></i> Products
        </a>
        <a class="nav-item" href="categories.html" data-page="categories,add-category,edit-category">
          <i class="ti ti-tag"></i> Categories
        </a>

        <span class="nav-label">Sales</span>
        <a class="nav-item" href="sold-products.html" data-page="sold-products,view-sold-product">
          <i class="ti ti-receipt"></i> Sold products
        </a>

        <span class="nav-label">Other</span>
        <a class="nav-item" href="coupons.html" data-page="coupons">
          <i class="ti ti-ticket"></i> Coupons
          <span class="nav-badge amber">Soon</span>
        </a>

        <span class="nav-label">Account</span>
        <a class="nav-item" href="#" id="signout-btn">
          <i class="ti ti-logout"></i> Sign out
        </a>

        <div class="sidebar-footer">
          <div class="user-row">
            <div class="avatar">AD</div>
            <div>
              <div class="user-name">Admin</div>
              <div class="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mobile overlay — tap to close sidebar -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    // Set active nav item
    this.setActiveNav();

    // Sign out
    document.getElementById('signout-btn').addEventListener('click', e => {
      e.preventDefault();
      ServerBase.clearAccessToken();
      window.location.replace('login.html');
    });

    // Mobile overlay closes sidebar
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      this.closeSidebar();
    });

    // Wire up hamburger button if present
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => this.toggleSidebar());
    }
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.contains('sidebar-open')
      ? this.closeSidebar()
      : this.openSidebar();
  },

  openSidebar() {
    document.getElementById('sidebar')?.classList.add('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.add('overlay-visible');
    document.body.classList.add('sidebar-is-open');
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.remove('overlay-visible');
    document.body.classList.remove('sidebar-is-open');
  },

  // ── Active nav ─────────────────────────────────────────────────────────────

  setActiveNav() {
    const current = window.location.pathname.split('/').pop().replace('.html', '');
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      const pages = item.dataset.page.split(',').map(p => p.trim());
      item.classList.toggle('active', pages.includes(current));
    });
  },

  // ── 2. Toast ───────────────────────────────────────────────────────────────

  toast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: 'ti-circle-check',
      error:   'ti-circle-x',
      warning: 'ti-alert-triangle',
    };

    toast.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}"></i><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-show'));

    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  },

  // ── 3. Spinner ─────────────────────────────────────────────────────────────

  showSpinner() {
    let overlay = document.getElementById('spinner-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'spinner-overlay';
      overlay.innerHTML = `<div class="spinner"></div>`;
      document.body.appendChild(overlay);
    }
    overlay.classList.add('spinner-visible');
  },

  hideSpinner() {
    const overlay = document.getElementById('spinner-overlay');
    if (overlay) overlay.classList.remove('spinner-visible');
  },

  // ── 4. Confirm delete dialog ───────────────────────────────────────────────

  confirmDelete(message, onConfirm) {
    let overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon"><i class="ti ti-alert-triangle"></i></div>
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('confirm-visible'));

    const close = () => {
      overlay.classList.remove('confirm-visible');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    };

    document.getElementById('confirm-cancel').addEventListener('click', close);
    document.getElementById('confirm-ok').addEventListener('click', async () => {
      close();
      await onConfirm();
    });

    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  },

  // ── 5. Custom dropdown ─────────────────────────────────────────────────────
  // Replaces a hidden <select> with a fully styled custom dropdown.
  // The underlying <select> stays in the DOM (hidden) and stays in sync so
  // selectEl.value still works normally in page scripts.
  //
  // Usage:
  //   UI.initDropdown('category', { placeholder: 'Select category…' });
  //
  // Call AFTER any async options have been appended, or rely on the
  // MutationObserver which auto-refreshes when options are added.

  initDropdown(selectId, { placeholder = 'Select…' } = {}) {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    // Hide native select
    selectEl.style.display = 'none';

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    wrapper.setAttribute('tabindex', '0');

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';

    const optionsPanel = document.createElement('div');
    optionsPanel.className = 'custom-select-options';

    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsPanel);
    selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

    const updateTrigger = () => {
      const sel      = selectEl.options[selectEl.selectedIndex];
      const hasValue = sel && sel.value !== '';
      trigger.innerHTML = `
        <span style="color:${hasValue ? 'var(--text-1)' : 'var(--text-3)'}">
          ${hasValue ? sel.text : placeholder}
        </span>
        <i class="ti ti-chevron-down custom-select-arrow"></i>
      `;
    };

    const buildOptions = () => {
      optionsPanel.innerHTML = '';
      Array.from(selectEl.options).forEach((opt, i) => {
        const item = document.createElement('div');
        item.className = 'custom-select-option';
        if (!opt.value) item.classList.add('custom-select-placeholder');
        if (selectEl.selectedIndex === i) item.classList.add('selected');
        item.textContent  = opt.text;
        item.dataset.value = opt.value;
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          selectEl.selectedIndex = i;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          close();
          updateTrigger();
          buildOptions();
        });
        optionsPanel.appendChild(item);
      });
    };

    const open = () => {
      document.querySelectorAll('.custom-select.open').forEach(el => {
        if (el !== wrapper) el.classList.remove('open');
      });
      buildOptions();
      wrapper.classList.add('open');
    };

    const close  = () => wrapper.classList.remove('open');
    const toggle = () => wrapper.classList.contains('open') ? close() : open();

    trigger.addEventListener('mousedown', e => { e.preventDefault(); toggle(); });
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape') close();
    });

    document.addEventListener('mousedown', e => {
      if (!wrapper.contains(e.target)) close();
    });

    // Stay in sync if options added asynchronously (e.g. category load)
    new MutationObserver(() => { updateTrigger(); }).observe(selectEl, { childList: true });

    // Stay in sync if value set programmatically
    selectEl.addEventListener('change', updateTrigger);

    updateTrigger();

    return {
      refresh: () => { buildOptions(); updateTrigger(); },
    };
  },

  // ── 6. Dropzone ────────────────────────────────────────────────────────────

  initDropzone({ dropzoneEl, previewEl, accept = 'image/*', multiple = true, onFiles }) {
    if (!dropzoneEl) return;

    let files = [];

    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    document.body.appendChild(input);

    const notify = () => onFiles && onFiles([...files]);

    const addFiles = newFiles => {
      const arr = Array.from(newFiles);
      if (!multiple) {
        files.forEach(f => f._previewUrl && URL.revokeObjectURL(f._previewUrl));
        files = [];
      }
      arr.forEach(f => {
        if (accept.startsWith('image')) f._previewUrl = URL.createObjectURL(f);
        files.push(f);
      });
      renderPreviews();
      notify();
    };

    const removeFile = index => {
      if (files[index]?._previewUrl) URL.revokeObjectURL(files[index]._previewUrl);
      files.splice(index, 1);
      renderPreviews();
      notify();
    };

    const renderPreviews = () => {
      if (!previewEl) return;
      previewEl.innerHTML = '';
      files.forEach((file, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumb';

        if (file._previewUrl) {
          const img = document.createElement('img');
          img.src = file._previewUrl;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
          thumb.appendChild(img);
        } else {
          thumb.innerHTML = `
            <i class="ti ti-file-type-pdf" style="font-size:22px;color:var(--danger);"></i>
            <span style="font-size:9px;color:var(--text-2);margin-top:3px;text-align:center;word-break:break-all;padding:0 2px;">
              ${file.name.length > 12 ? file.name.substring(0, 12) + '…' : file.name}
            </span>
          `;
          thumb.style.flexDirection = 'column';
        }

        const removeBtn = document.createElement('div');
        removeBtn.className   = 'thumb-x';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeFile(i));
        thumb.appendChild(removeBtn);
        previewEl.appendChild(thumb);
      });
    };

    dropzoneEl.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (input.files.length) addFiles(input.files);
      input.value = '';
    });
    dropzoneEl.addEventListener('dragover',  e  => { e.preventDefault(); dropzoneEl.classList.add('dragover'); });
    dropzoneEl.addEventListener('dragleave', () => dropzoneEl.classList.remove('dragover'));
    dropzoneEl.addEventListener('drop', e => {
      e.preventDefault();
      dropzoneEl.classList.remove('dragover');
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    return {
      getFiles: () => [...files],
      clear: () => {
        files.forEach(f => f._previewUrl && URL.revokeObjectURL(f._previewUrl));
        files = [];
        renderPreviews();
        notify();
      },
      setExistingUrls: (urls = []) => {
        if (!previewEl) return;
        previewEl.innerHTML = '';
        urls.forEach(url => {
          const thumb = document.createElement('div');
          thumb.className = 'thumb';
          thumb.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
          previewEl.appendChild(thumb);
        });
      },
    };
  },

  // ── 7. PDF chip ────────────────────────────────────────────────────────────

  setPdfChip(containerEl, filename, onRemove) {
    if (!containerEl) return;
    const short = filename.length > 28 ? filename.substring(0, 28) + '…' : filename;
    containerEl.innerHTML = `
      <div class="pdf-chip">
        <i class="ti ti-file-type-pdf"></i>
        <span>${short}</span>
        <span class="pdf-remove ti ti-x"></span>
      </div>
    `;
    containerEl.querySelector('.pdf-remove').addEventListener('click', () => {
      containerEl.innerHTML = '';
      onRemove && onRemove();
    });
  },

  // ── 8. Helpers ─────────────────────────────────────────────────────────────

  formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-ZA', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  },

  initials(name = '') {
    return name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  },

  getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },
};