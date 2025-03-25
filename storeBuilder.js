
// Store Builder Module for Etsy Success Suite
class StoreBuilder {
  constructor() {
    this.components = [];
    this.previewPanel = null;
    this.editorPanel = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.previewPanel = document.querySelector('.preview-panel');
    this.editorPanel = document.querySelector('.component-editor');
    
    if (!this.previewPanel || !this.editorPanel) {
      console.error('Required DOM elements not found');
      return;
    }
    
    // Initialize drag and drop
    this.initDragAndDrop();
    
    // Initialize save and export
    this.initSaveExport();
    
    // Style preview panel properly
    this.stylePreviewPanel();
    
    this.initialized = true;
  }
  
  initDragAndDrop() {
    const draggableItems = document.querySelectorAll('.component-item');
    
    draggableItems.forEach(item => {
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
    
    this.previewPanel.addEventListener('dragover', this.handleDragOver.bind(this));
    this.previewPanel.addEventListener('drop', this.handleDrop.bind(this));
  }
  
  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
    // Set a custom ghost image for drag
    const ghostElement = e.target.cloneNode(true);
    ghostElement.style.opacity = '0.7';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    setTimeout(() => document.body.removeChild(ghostElement), 0);
  }
  
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.previewPanel.classList.add('drag-over');
  }
  
  handleDrop(e) {
    e.preventDefault();
    this.previewPanel.classList.remove('drag-over');
    
    const componentType = e.dataTransfer.getData('text/plain');
    const component = this.createComponent(componentType);
    
    if (component) {
      // Calculate drop position for stacking
      const rect = this.previewPanel.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      
      // Position component
      component.style.top = `${relativeY}px`;
      
      this.previewPanel.appendChild(component);
      this.makeComponentEditable(component);
      this.components.push({
        type: componentType,
        id: component.id,
        data: {
          title: '',
          content: '',
          images: []
        }
      });
      
      // Automatically select the dropped component
      this.selectComponent(component);
    }
  }
  
  createComponent(type) {
    const component = document.createElement('div');
    const id = `component-${Date.now()}`;
    component.id = id;
    component.className = `store-component ${type}`;
    component.draggable = true; // Allow repositioning
    
    switch(type) {
      case 'banner':
        component.innerHTML = `
          <div class="component-header">
            <span class="component-type">Banner</span>
            <div class="component-controls">
              <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="banner-placeholder">
            <h3>Shop Banner</h3>
            <p>Upload your banner image here</p>
          </div>
        `;
        break;
      case 'featured':
        component.innerHTML = `
          <div class="component-header">
            <span class="component-type">Featured Products</span>
            <div class="component-controls">
              <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="featured-placeholder">
            <h3>Featured Products</h3>
            <p>Showcase your best-selling items</p>
            <div class="featured-grid">
              <div class="product-placeholder"></div>
              <div class="product-placeholder"></div>
              <div class="product-placeholder"></div>
            </div>
          </div>
        `;
        break;
      case 'section':
        component.innerHTML = `
          <div class="component-header">
            <span class="component-type">Product Section</span>
            <div class="component-controls">
              <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="section-placeholder">
            <h3>Product Collection</h3>
            <p>Group similar products together</p>
          </div>
        `;
        break;
      case 'about':
        component.innerHTML = `
          <div class="component-header">
            <span class="component-type">About</span>
            <div class="component-controls">
              <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="about-placeholder">
            <h3>About Your Shop</h3>
            <p>Tell customers your story and what makes your products special</p>
          </div>
        `;
        break;
      case 'policies':
        component.innerHTML = `
          <div class="component-header">
            <span class="component-type">Policies</span>
            <div class="component-controls">
              <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="policies-placeholder">
            <h3>Shop Policies</h3>
            <p>Share your shipping, return, and payment policies</p>
          </div>
        `;
        break;
      default:
        return null;
    }
    
    // Add event listeners for component controls
    component.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      this.handleComponentDragStart(e, component);
    });
    
    component.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteComponent(component);
    });
    
    return component;
  }
  
  makeComponentEditable(component) {
    component.addEventListener('click', () => {
      this.selectComponent(component);
    });
  }
  
  selectComponent(component) {
    // Remove selection from other components
    document.querySelectorAll('.store-component.selected').forEach(comp => {
      comp.classList.remove('selected');
    });
    
    // Add selection to this component
    component.classList.add('selected');
    
    // Show editor
    this.showComponentEditor(component);
  }
  
  showComponentEditor(component) {
    const componentType = component.className.split(' ')[1];
    const componentData = this.components.find(c => c.id === component.id)?.data || {
      title: component.querySelector('h3')?.textContent || '',
      content: component.querySelector('p')?.textContent || ''
    };
    
    let editorHTML = '';
    
    // Common editor elements
    editorHTML = `
      <h3>Edit ${this.formatComponentType(componentType)}</h3>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="component-title" value="${componentData.title || component.querySelector('h3')?.textContent || ''}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="component-content" rows="3">${componentData.content || component.querySelector('p')?.textContent || ''}</textarea>
      </div>
    `;
    
    // Component-specific editor elements
    switch(componentType) {
      case 'banner':
        editorHTML += `
          <div class="form-group">
            <label>Banner Image</label>
            <input type="file" class="image-upload" accept="image/*">
            <div class="image-preview banner-preview"></div>
          </div>
          <div class="form-group">
            <label>Shop Icon</label>
            <input type="file" class="icon-upload" accept="image/*">
            <div class="image-preview icon-preview circle"></div>
          </div>
          <div class="suggestion-item ai-suggestion">
            <strong>AI Suggestion:</strong> Use a banner that clearly shows what you sell. Clean, bright images perform best.
          </div>
        `;
        break;
      case 'featured':
        editorHTML += `
          <div class="form-group">
            <label>Featured Products (up to 3)</label>
            <div class="featured-editor">
              <div class="featured-item">
                <input type="file" accept="image/*">
                <input type="text" placeholder="Product Name">
                <input type="text" placeholder="Price">
              </div>
              <div class="featured-item">
                <input type="file" accept="image/*">
                <input type="text" placeholder="Product Name">
                <input type="text" placeholder="Price">
              </div>
              <div class="featured-item">
                <input type="file" accept="image/*">
                <input type="text" placeholder="Product Name">
                <input type="text" placeholder="Price">
              </div>
            </div>
          </div>
          <div class="suggestion-item ai-suggestion">
            <strong>AI Suggestion:</strong> Feature your bestsellers or seasonal items. Vary prices to appeal to different customers.
          </div>
        `;
        break;
      case 'about':
        editorHTML += `
          <div class="form-group">
            <label>Shop Story</label>
            <textarea class="shop-story" rows="5" placeholder="Tell customers about yourself and your passion...">${componentData.story || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Profile Image</label>
            <input type="file" class="profile-upload" accept="image/*">
            <div class="image-preview profile-preview circle"></div>
          </div>
          <div class="suggestion-item ai-suggestion">
            <strong>AI Suggestion:</strong> Share your personal connection to your craft. Customers value authenticity.
          </div>
        `;
        break;
      case 'section':
      case 'policies':
        // Use default editor for these types
        break;
    }
    
    // Add save button
    editorHTML += `
      <div class="editor-actions">
        <button class="btn btn-primary save-component">Save Changes</button>
        <button class="btn btn-danger delete-component">Delete Component</button>
      </div>
    `;
    
    this.editorPanel.innerHTML = editorHTML;
    
    // Set up listeners for the editor
    this.setupEditorListeners(component);
  }
  
  setupEditorListeners(component) {
    // Save button handler
    this.editorPanel.querySelector('.save-component').addEventListener('click', () => {
      this.saveComponentChanges(component);
    });
    
    // Delete button handler
    this.editorPanel.querySelector('.delete-component').addEventListener('click', () => {
      this.deleteComponent(component);
    });
    
    // Image upload preview
    const imageUploads = this.editorPanel.querySelectorAll('input[type="file"]');
    imageUploads.forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          const previewEl = input.nextElementSibling;
          
          reader.onload = (e) => {
            previewEl.style.backgroundImage = `url(${e.target.result})`;
            previewEl.innerHTML = '';
          };
          
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    });
  }
  
  saveComponentChanges(component) {
    const title = this.editorPanel.querySelector('.component-title').value;
    const content = this.editorPanel.querySelector('.component-content').value;
    
    // Update component in the preview
    const titleEl = component.querySelector('h3');
    const contentEl = component.querySelector('p');
    
    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.textContent = content;
    
    // Update component data in storage
    const componentIndex = this.components.findIndex(c => c.id === component.id);
    if (componentIndex !== -1) {
      this.components[componentIndex].data = {
        ...this.components[componentIndex].data,
        title,
        content
      };
      
      // Handle component-specific data
      const componentType = component.className.split(' ')[1];
      if (componentType === 'about' && this.editorPanel.querySelector('.shop-story')) {
        this.components[componentIndex].data.story = this.editorPanel.querySelector('.shop-story').value;
      }
    }
    
    // Show success message
    this.showToast('Component updated successfully');
  }
  
  deleteComponent(component) {
    // Remove from DOM
    component.remove();
    
    // Remove from storage
    const componentIndex = this.components.findIndex(c => c.id === component.id);
    if (componentIndex !== -1) {
      this.components.splice(componentIndex, 1);
    }
    
    // Reset editor
    this.editorPanel.innerHTML = '<h3>Select a component to edit</h3>';
    
    // Show success message
    this.showToast('Component deleted');
  }
  
  handleComponentDragStart(e, component) {
    e.dataTransfer.setData('text/plain', 'move-component');
    e.dataTransfer.setData('component-id', component.id);
    component.classList.add('dragging');
  }
  
  initSaveExport() {
    const saveBtn = document.querySelector('.store-builder .btn-primary');
    const exportBtn = document.querySelector('.store-builder .btn-secondary');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', this.saveStore.bind(this));
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportToEtsy.bind(this));
    }
  }
  
  saveStore() {
    // Save the current store configuration
    localStorage.setItem('etsy-store-components', JSON.stringify(this.components));
    this.showToast('Store layout saved');
    
    // Update preview
    this.updateStorePreview();
  }
  
  exportToEtsy() {
    // This would typically involve an API call to Etsy
    // For now, just show a success message
    this.showToast('Store ready for export to Etsy!');
    
    // In a real implementation, this would send the store data to the server
    // which would then use the Etsy API to create/update the store
    fetch('/api/export-to-etsy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        components: this.components
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.showToast('Successfully exported to Etsy!');
      } else {
        this.showToast('Export failed: ' + data.error, 'error');
      }
    })
    .catch(error => {
      console.error('Export error:', error);
      this.showToast('Export failed. Please try again.', 'error');
    });
  }
  
  updateStorePreview() {
    // Generate a complete store preview image
    const previewImage = document.createElement('img');
    previewImage.src = 'https://via.placeholder.com/600x800/E5E5E5/888888?text=Updated+Store+Preview';
    previewImage.alt = 'Store Preview';
    previewImage.style.width = '100%';
    previewImage.style.borderRadius = '8px';
    
    const previewContainer = document.querySelector('.preview-panel > div');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.appendChild(previewImage);
    }
  }
  
  stylePreviewPanel() {
    this.previewPanel.innerHTML = `
      <h3>Store Preview</h3>
      <p>Drag components from the left panel to build your store</p>
      <div class="preview-container" style="min-height: 400px; border: 2px dashed #ccc; border-radius: 8px; margin-top: 15px; padding: 20px; position: relative;"></div>
    `;
  }
  
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  formatComponentType(type) {
    switch(type) {
      case 'banner': return 'Banner';
      case 'featured': return 'Featured Products';
      case 'section': return 'Product Section';
      case 'about': return 'About Section';
      case 'policies': return 'Shop Policies';
      default: return type;
    }
  }
  
  // Load store from saved state
  loadSavedStore() {
    try {
      const savedComponents = localStorage.getItem('etsy-store-components');
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents);
        
        // Clear existing components
        this.previewPanel.querySelectorAll('.store-component').forEach(comp => comp.remove());
        this.components = [];
        
        // Recreate components from saved data
        parsedComponents.forEach(component => {
          const newComponent = this.createComponent(component.type);
          if (newComponent) {
            this.previewPanel.appendChild(newComponent);
            newComponent.id = component.id;
            
            // Restore component data
            const titleEl = newComponent.querySelector('h3');
            const contentEl = newComponent.querySelector('p');
            
            if (titleEl && component.data.title) titleEl.textContent = component.data.title;
            if (contentEl && component.data.content) contentEl.textContent = component.data.content;
            
            this.makeComponentEditable(newComponent);
            this.components.push(component);
          }
        });
        
        this.showToast('Store layout loaded');
      }
    } catch (error) {
      console.error('Error loading saved store:', error);
    }
  }
}

// Initialize the store builder when tab is clicked
document.addEventListener('DOMContentLoaded', function() {
  const storeBuilder = new StoreBuilder();
  
  // Initialize when store builder tab is clicked
  const storeBuilderTab = document.querySelectorAll('.main-tabs .tab')[1];
  if (storeBuilderTab) {
    storeBuilderTab.addEventListener('click', () => {
      storeBuilder.init();
      // Try to load any saved store
      setTimeout(() => storeBuilder.loadSavedStore(), 100);
    });
  }
  
  // Make available globally
  window.storeBuilder = storeBuilder;
});
