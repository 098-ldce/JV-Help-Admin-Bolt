// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.setupLanguageTabs();
        this.setupModals();
    }

    checkAuth() {
        // Check if user is logged in (you can implement proper JWT token checking here)
        const isLoggedIn = localStorage.getItem('admin_logged_in');
        if (isLoggedIn) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Sidebar navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.admin-sidebar');
                sidebar.classList.toggle('show');
            });
        }

        // Hero form
        const heroForm = document.getElementById('hero-form');
        if (heroForm) {
            heroForm.addEventListener('submit', (e) => this.handleHeroUpdate(e));
        }

        // Add buttons
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => this.showActivityModal());
        }

        const addGalleryBtn = document.getElementById('add-gallery-btn');
        if (addGalleryBtn) {
            addGalleryBtn.addEventListener('click', () => this.showGalleryModal());
        }

        // Form submissions
        const activityForm = document.getElementById('activity-form');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => this.handleActivitySubmit(e));
        }

        const galleryForm = document.getElementById('gallery-form');
        if (galleryForm) {
            galleryForm.addEventListener('submit', (e) => this.handleGallerySubmit(e));
        }
    }

    setupLanguageTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.dataset.lang;
                const container = btn.closest('.admin-form') || btn.closest('.modal-body');
                
                // Update tab buttons
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update tab content
                container.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                container.querySelector(`[data-lang="${lang}"]`).classList.add('active');
            });
        });
    }

    setupModals() {
        // Close modal buttons
        const closeBtns = document.querySelectorAll('.close-btn, .cancel-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.dataset.modal;
                if (modalId) {
                    this.hideModal(modalId);
                } else {
                    // Find parent modal
                    const modal = btn.closest('.modal');
                    if (modal) {
                        this.hideModal(modal.id);
                    }
                }
            });
        });

        // Close modal on backdrop click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const loginBtn = document.getElementById('login-btn');
        const loginMessage = document.getElementById('login-message');

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

        try {
            // Here you would implement actual authentication
            // For demo purposes, we'll use a simple check
            if (email === 'admin@jvhelp.org' && password === 'admin123') {
                localStorage.setItem('admin_logged_in', 'true');
                localStorage.setItem('admin_email', email);
                this.currentUser = { email };
                
                this.showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    this.showDashboard();
                    this.loadDashboardData();
                }, 1000);
            } else {
                this.showMessage(loginMessage, 'Invalid email or password. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(loginMessage, 'Login failed. Please try again.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }

    handleLogout() {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_email');
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        const userEmail = localStorage.getItem('admin_email');
        if (userEmail) {
            document.getElementById('user-email').textContent = userEmail;
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            hero: 'Hero Content',
            activities: 'Activities',
            gallery: 'Activities Gallery',
            products: 'Products',
            thoughts: 'User Thoughts',
            settings: 'Settings'
        };
        document.getElementById('page-title').textContent = titles[sectionName] || sectionName;

        this.currentSection = sectionName;

        // Load section data
        this.loadSectionData(sectionName);
    }

    async loadDashboardData() {
        try {
            // Load statistics
            const [activities, gallery, products, thoughts] = await Promise.all([
                this.fetchData('/api/content/activities'),
                this.fetchData('/api/content/activities_gallery'),
                this.fetchData('/api/content/products'),
                this.fetchData('/api/user-thoughts')
            ]);

            document.getElementById('activities-count').textContent = activities.data?.length || 0;
            document.getElementById('gallery-count').textContent = gallery.data?.length || 0;
            document.getElementById('products-count').textContent = products.data?.length || 0;
            document.getElementById('thoughts-count').textContent = thoughts.data?.length || 0;

            // Load recent activity
            this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'hero':
                await this.loadHeroContent();
                break;
            case 'activities':
                await this.loadActivities();
                break;
            case 'gallery':
                await this.loadGallery();
                break;
            case 'products':
                await this.loadProducts();
                break;
            case 'thoughts':
                await this.loadThoughts();
                break;
        }
    }

    async loadHeroContent() {
        try {
            const response = await this.fetchData('/api/hero-content');
            if (response && response.all_languages) {
                const data = response.all_languages;
                
                // Populate form fields
                Object.keys(data).forEach(lang => {
                    const titleField = document.getElementById(`title_${lang}`);
                    const subtitleField = document.getElementById(`subtitle_${lang}`);
                    
                    if (titleField && data[lang].title) {
                        titleField.value = data[lang].title;
                    }
                    if (subtitleField && data[lang].subtitle) {
                        subtitleField.value = data[lang].subtitle;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading hero content:', error);
        }
    }

    async loadActivities() {
        try {
            const response = await this.fetchData('/api/content/activities');
            const tbody = document.getElementById('activities-tbody');
            
            if (!tbody) return;

            if (response.data && response.data.length > 0) {
                tbody.innerHTML = response.data.map(activity => `
                    <tr>
                        <td>${activity.title_en || 'N/A'}</td>
                        <td><span class="status-badge">${activity.category || 'N/A'}</span></td>
                        <td><span class="status-badge ${activity.is_active ? 'status-active' : 'status-inactive'}">
                            ${activity.is_active ? 'Active' : 'Inactive'}
                        </span></td>
                        <td>${activity.display_order || 0}</td>
                        <td class="table-actions">
                            <button class="action-btn edit-btn" onclick="adminPanel.editActivity('${activity.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="adminPanel.deleteActivity('${activity.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No activities found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    async loadGallery() {
        try {
            const response = await this.fetchData('/api/content/activities_gallery');
            const tbody = document.getElementById('gallery-tbody');
            
            if (!tbody) return;

            if (response.data && response.data.length > 0) {
                tbody.innerHTML = response.data.map(item => `
                    <tr>
                        <td>
                            ${item.image ? `<img src="${item.image}" alt="Gallery Image" class="table-image">` : 'No Image'}
                        </td>
                        <td>${item.title_en || 'N/A'}</td>
                        <td><span class="status-badge">${item.category_en || 'N/A'}</span></td>
                        <td>${item.date || 'N/A'}</td>
                        <td><span class="status-badge ${item.is_active ? 'status-active' : 'status-inactive'}">
                            ${item.is_active ? 'Active' : 'Inactive'}
                        </span></td>
                        <td class="table-actions">
                            <button class="action-btn view-btn" onclick="adminPanel.viewGalleryItem('${item.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="adminPanel.editGalleryItem('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="adminPanel.deleteGalleryItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No gallery items found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        }
    }

    async loadProducts() {
        try {
            const response = await this.fetchData('/api/content/products');
            const tbody = document.getElementById('products-tbody');
            
            if (!tbody) return;

            if (response.data && response.data.length > 0) {
                tbody.innerHTML = response.data.map(product => `
                    <tr>
                        <td>
                            ${product.image_url ? `<img src="${product.image_url}" alt="Product Image" class="table-image">` : 'No Image'}
                        </td>
                        <td>${product.name_en || 'N/A'}</td>
                        <td>₹${product.price || 0}</td>
                        <td><span class="status-badge">${product.category_en || 'N/A'}</span></td>
                        <td><span class="status-badge ${product.is_active ? 'status-active' : 'status-inactive'}">
                            ${product.is_active ? 'Active' : 'Inactive'}
                        </span></td>
                        <td class="table-actions">
                            <button class="action-btn view-btn" onclick="adminPanel.viewProduct('${product.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="adminPanel.editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="adminPanel.deleteProduct('${product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    async loadThoughts() {
        try {
            const response = await this.fetchData('/api/user-thoughts');
            const tbody = document.getElementById('thoughts-tbody');
            
            if (!tbody) return;

            if (response.data && response.data.length > 0) {
                tbody.innerHTML = response.data.map(thought => `
                    <tr>
                        <td>${thought.name || (thought.is_anonymous ? 'Anonymous' : 'N/A')}</td>
                        <td>${thought.contact_no || 'N/A'}</td>
                        <td title="${thought.thought}">
                            ${thought.thought ? (thought.thought.length > 50 ? thought.thought.substring(0, 50) + '...' : thought.thought) : 'N/A'}
                        </td>
                        <td><span class="status-badge">${thought.language || 'en'}</span></td>
                        <td>${new Date(thought.created_at).toLocaleDateString()}</td>
                        <td class="table-actions">
                            <button class="action-btn view-btn" onclick="adminPanel.viewThought('${thought.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="adminPanel.deleteThought('${thought.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No thoughts found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading thoughts:', error);
        }
    }

    loadRecentActivity() {
        const recentActivity = document.getElementById('recent-activity');
        if (!recentActivity) return;

        // Mock recent activity data
        const activities = [
            { icon: 'fas fa-plus', title: 'New gallery item added', time: '2 hours ago', type: 'success' },
            { icon: 'fas fa-edit', title: 'Hero content updated', time: '5 hours ago', type: 'info' },
            { icon: 'fas fa-comment', title: 'New user thought received', time: '1 day ago', type: 'primary' },
            { icon: 'fas fa-trash', title: 'Product removed', time: '2 days ago', type: 'danger' }
        ];

        recentActivity.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <h4>${activity.title}</h4>
                    <p>${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    async handleHeroUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const heroMessage = document.getElementById('hero-message');

        try {
            const data = {
                title_en: formData.get('title_en'),
                title_hi: formData.get('title_hi'),
                title_gu: formData.get('title_gu'),
                subtitle_en: formData.get('subtitle_en'),
                subtitle_hi: formData.get('subtitle_hi'),
                subtitle_gu: formData.get('subtitle_gu')
            };

            // Here you would make an API call to update hero content
            // For demo purposes, we'll simulate success
            this.showMessage(heroMessage, 'Hero content updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating hero content:', error);
            this.showMessage(heroMessage, 'Failed to update hero content. Please try again.', 'error');
        }
    }

    showActivityModal(activityId = null) {
        const modal = document.getElementById('activity-modal');
        const title = document.getElementById('activity-modal-title');
        
        if (activityId) {
            title.textContent = 'Edit Activity';
            // Load activity data for editing
            this.loadActivityForEdit(activityId);
        } else {
            title.textContent = 'Add New Activity';
            document.getElementById('activity-form').reset();
        }
        
        this.showModal('activity-modal');
    }

    showGalleryModal(galleryId = null) {
        const modal = document.getElementById('gallery-modal');
        const title = document.getElementById('gallery-modal-title');
        
        if (galleryId) {
            title.textContent = 'Edit Gallery Item';
            // Load gallery data for editing
            this.loadGalleryForEdit(galleryId);
        } else {
            title.textContent = 'Add New Gallery Item';
            document.getElementById('gallery-form').reset();
        }
        
        this.showModal('gallery-modal');
    }

    async handleActivitySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const message = document.getElementById('activity-form-message');

        try {
            const data = {
                title_en: formData.get('title_en'),
                title_hi: formData.get('title_hi'),
                title_gu: formData.get('title_gu'),
                description_en: formData.get('description_en'),
                description_hi: formData.get('description_hi'),
                description_gu: formData.get('description_gu'),
                category: formData.get('category'),
                icon_url: formData.get('icon_url'),
                display_order: parseInt(formData.get('display_order')) || 0,
                is_active: formData.get('is_active') === 'on'
            };

            // Here you would make an API call to save the activity
            // For demo purposes, we'll simulate success
            this.showMessage(message, 'Activity saved successfully!', 'success');
            
            setTimeout(() => {
                this.hideModal('activity-modal');
                this.loadActivities();
            }, 1500);
            
        } catch (error) {
            console.error('Error saving activity:', error);
            this.showMessage(message, 'Failed to save activity. Please try again.', 'error');
        }
    }

    async handleGallerySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const message = document.getElementById('gallery-form-message');

        try {
            const data = {
                title_en: formData.get('title_en'),
                title_hi: formData.get('title_hi'),
                title_gu: formData.get('title_gu'),
                description_en: formData.get('description_en'),
                description_hi: formData.get('description_hi'),
                description_gu: formData.get('description_gu'),
                quote_en: formData.get('quote_en'),
                quote_hi: formData.get('quote_hi'),
                quote_gu: formData.get('quote_gu'),
                category_en: formData.get('category_en'),
                category_hi: formData.get('category_hi'),
                category_gu: formData.get('category_gu'),
                image: formData.get('image'),
                image_lm_1: formData.get('image_lm_1'),
                image_lm_2: formData.get('image_lm_2'),
                image_lm_3: formData.get('image_lm_3'),
                image_lm_4: formData.get('image_lm_4'),
                image_lm_5: formData.get('image_lm_5'),
                date: formData.get('date'),
                display_order: parseInt(formData.get('display_order')) || 0,
                is_active: formData.get('is_active') === 'on'
            };

            // Here you would make an API call to save the gallery item
            // For demo purposes, we'll simulate success
            this.showMessage(message, 'Gallery item saved successfully!', 'success');
            
            setTimeout(() => {
                this.hideModal('gallery-modal');
                this.loadGallery();
            }, 1500);
            
        } catch (error) {
            console.error('Error saving gallery item:', error);
            this.showMessage(message, 'Failed to save gallery item. Please try again.', 'error');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `form-message show ${type}`;
        
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // Placeholder methods for CRUD operations
    editActivity(id) {
        this.showActivityModal(id);
    }

    deleteActivity(id) {
        if (confirm('Are you sure you want to delete this activity?')) {
            // Implement delete logic
            console.log('Deleting activity:', id);
            this.loadActivities();
        }
    }

    viewGalleryItem(id) {
        console.log('Viewing gallery item:', id);
    }

    editGalleryItem(id) {
        this.showGalleryModal(id);
    }

    deleteGalleryItem(id) {
        if (confirm('Are you sure you want to delete this gallery item?')) {
            // Implement delete logic
            console.log('Deleting gallery item:', id);
            this.loadGallery();
        }
    }

    viewProduct(id) {
        console.log('Viewing product:', id);
    }

    editProduct(id) {
        console.log('Editing product:', id);
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            // Implement delete logic
            console.log('Deleting product:', id);
            this.loadProducts();
        }
    }

    viewThought(id) {
        console.log('Viewing thought:', id);
    }

    deleteThought(id) {
        if (confirm('Are you sure you want to delete this thought?')) {
            // Implement delete logic
            console.log('Deleting thought:', id);
            this.loadThoughts();
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
