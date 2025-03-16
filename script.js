
// Main JavaScript for Etsy Success Suite
document.addEventListener('DOMContentLoaded', async function() {
  // Load Chart.js
  await loadChartJS();
  const api = window.api;

  // Loading state handler
  function setLoading(element, isLoading) {
    element.classList.toggle('loading', isLoading);
    element.disabled = isLoading;
    element.dataset.originalText = element.dataset.originalText || element.textContent;
    element.textContent = isLoading ? 'Loading...' : element.dataset.originalText;
  }

  // Error handler
  function handleError(error, message = 'Operation failed') {
    console.error(error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').insertAdjacentElement('afterbegin', errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Navigation functionality
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Map nav links to corresponding tabs
      const tabMap = {
        'Dashboard': 0,
        'My Products': 0,
        'Store Builder': 1,
        'Account': 3
      };
      const tabIndex = tabMap[link.textContent];
      if (typeof tabIndex !== 'undefined') {
        tabs[tabIndex].click();
      }
    });
  });

  // Tab switching functionality
  const tabs = document.querySelectorAll('.main-tabs .tab');
  const sections = [
    document.querySelector('.search-section'),
    document.querySelector('.store-builder').parentElement,
    document.querySelector('.competitor-analysis').parentElement,
    document.querySelector('.card:last-child').parentElement
  ];

  // Initially hide all sections except the first one
  sections.forEach((section, index) => {
    if (index !== 0) {
      section.style.display = 'none';
    }
  });

  // Add click event listeners to tabs
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide sections
      sections.forEach((section, i) => {
        section.style.display = i === index ? 'block' : 'none';
      });

      // Special case for store builder grid
      if (index === 1) {
        document.querySelector('.store-builder').style.display = 'grid';
      }
    });
  });

  // Search form submission
  const searchForm = document.querySelector('.search-form');
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const keyword = document.getElementById('product-keyword').value;
    const category = document.getElementById('category').value;
    const priceRange = document.getElementById('price-range').value;

    if (!keyword) {
      alert('Please enter a product keyword');
      return;
    }

    // Show loading state
    const submitBtn = searchForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Analyzing...';
    submitBtn.disabled = true;

    try {
      const result = await api.analyzeProduct(keyword, category, priceRange);
      if (!result) throw new Error('No analysis results received');
      
      // Update results section
      document.querySelector('.results-section > p').textContent = 
        `Here's what we found about "${keyword}"${category ? ' in ' + document.getElementById('category').options[document.getElementById('category').selectedIndex].text : ''}`;
      
      // Update metrics
      document.querySelector('.score-high').textContent = result.overallScore;
      document.querySelector('.metric-value:not(.score-high)').textContent = 
        `$${result.pricing.optimal.min}-$${result.pricing.optimal.max}`;
      document.querySelector('.score-medium').textContent = `${result.competition.saturationLevel}%`;

      // Create charts
      // Clear existing content
      document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
        placeholder.innerHTML = '<canvas></canvas>';
      });
      
      const searchCtx = document.querySelector('.chart-placeholder canvas').getContext('2d');
      new Chart(searchCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Search Volume',
            data: result.searchVolume.trend,
            borderColor: '#FF5722',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Search Volume Trend' }
          }
        }
      });

      const seasonalCtx = document.querySelectorAll('.chart-placeholder canvas')[2].getContext('2d');
      new Chart(seasonalCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Seasonal Demand',
            data: result.seasonal.data,
            backgroundColor: '#2E7D32'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Seasonal Demand' }
          }
        }
      });

      // Show results
      document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // AI Deep Analysis button
  const aiAnalysisBtn = document.querySelector('.btn-ai');
  aiAnalysisBtn.addEventListener('click', async function() {
    const keyword = document.getElementById('product-keyword').value;
    if (!keyword) {
      alert('Please enter a product keyword first');
      return;
    }

    aiAnalysisBtn.textContent = 'Analyzing...';
    aiAnalysisBtn.disabled = true;

    try {
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      const competitors = await api.getCompetitors(keyword, config.apiKey);
      
      // Switch to AI Competitor Analysis tab
      tabs[2].click();
      document.querySelector('.competitor-analysis').scrollIntoView({ behavior: 'smooth' });
      
      // Update competitor cards with real data
      updateCompetitorCards(competitors);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('AI analysis failed. Please try again.');
    } finally {
      aiAnalysisBtn.textContent = 'AI-Powered Deep Analysis';
      aiAnalysisBtn.disabled = false;
    }
  });

  // Store Builder functionality
  function initializeStoreBuilder() {
    const draggableItems = document.querySelectorAll('.component-item');
    const previewPanel = document.querySelector('.preview-panel');
    
    if (!draggableItems.length || !previewPanel) return;

    draggableItems.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
    });

    previewPanel.addEventListener('dragover', handleDragOver);
    previewPanel.addEventListener('drop', handleDrop);
    
    // Make preview panel visible
    previewPanel.style.minHeight = '500px';
    previewPanel.style.border = '2px dashed #ccc';
    previewPanel.style.position = 'relative';
  }

  // Initialize store builder when tab is clicked
  const storeBuilderTab = document.querySelectorAll('.tab')[1];
  storeBuilderTab.addEventListener('click', initializeStoreBuilder);

  function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  function handleDrop(e) {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('text/plain');
    const component = createStoreComponent(componentType);
    if (component) {
      component.classList.add('dropped-component');
      previewPanel.appendChild(component);
      makeComponentEditable(component);
    }
    previewPanel.classList.remove('drag-over');
  }

  function makeComponentEditable(component) {
    component.addEventListener('click', () => {
      const editor = document.querySelector('.component-editor');
      editor.innerHTML = createEditorHTML(component);
      setupEditorListeners(component);
    });
  }

  function createEditorHTML(component) {
    return `
      <h3>Edit ${component.className.split(' ')[1]}</h3>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="component-title" value="${component.querySelector('h3')?.textContent || ''}">
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea class="component-content" rows="4">${component.querySelector('p')?.textContent || ''}</textarea>
      </div>
      <button class="btn btn-primary save-component">Save Changes</button>
      <button class="btn btn-danger delete-component">Delete Component</button>
    `;
  }

  function setupEditorListeners(component) {
    const editor = document.querySelector('.component-editor');
    
    editor.querySelector('.save-component').addEventListener('click', () => {
      const title = editor.querySelector('.component-title').value;
      const content = editor.querySelector('.component-content').value;
      
      const titleEl = component.querySelector('h3') || document.createElement('h3');
      const contentEl = component.querySelector('p') || document.createElement('p');
      
      titleEl.textContent = title;
      contentEl.textContent = content;
      
      if (!component.contains(titleEl)) component.appendChild(titleEl);
      if (!component.contains(contentEl)) component.appendChild(contentEl);
    });

    editor.querySelector('.delete-component').addEventListener('click', () => {
      component.remove();
      editor.innerHTML = '<h3>Select a component to edit</h3>';
    });
  }

  async function loadChartJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function createStoreComponent(type) {
    const component = document.createElement('div');
    component.className = 'store-component ' + type;
    switch(type) {
      case 'banner':
        component.innerHTML = `<div class="banner-placeholder">Shop Banner Area</div>`;
        break;
      case 'featured':
        component.innerHTML = `<div class="featured-placeholder">Featured Products Section</div>`;
        break;
      case 'section':
        component.innerHTML = `<div class="section-placeholder">Product Collection</div>`;
        break;
      case 'about':
        component.innerHTML = `<div class="about-placeholder">About Your Shop</div>`;
        break;
      case 'policies':
        component.innerHTML = `<div class="policies-placeholder">Shop Policies</div>`;
        break;
      default:
        return null;
    }
    return component;
  }

  // Image preview functionality
  const imageInputs = document.querySelectorAll('input[type="file"]');
  imageInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        const preview = this.nextElementSibling;
        
        reader.onload = function(e) {
          preview.style.backgroundImage = `url(${e.target.result})`;
          preview.style.backgroundSize = 'cover';
          preview.style.backgroundPosition = 'center';
          preview.innerHTML = '';
        };
        
        reader.readAsDataURL(this.files[0]);
      }
    });
  });

  // Competitor analysis buttons
  const analyzeButtons = document.querySelectorAll('.competitor-card .btn-ai');
  analyzeButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.stopPropagation();
      const card = this.closest('.competitor-card');
      const competitorName = card.querySelector('h3').textContent;

      button.textContent = 'Analyzing...';
      button.disabled = true;

      try {
        const storeData = await api.analyzeStore({ name: competitorName });
        
        // Update suggestions with competitor insights
        const suggestions = document.querySelectorAll('.ai-suggestion');
        suggestions.forEach((suggestion, index) => {
          suggestion.innerHTML = `<strong>${Object.keys(storeData.suggestions)[index]}:</strong> ${Object.values(storeData.suggestions)[index]}`;
        });
        
        alert(`Analysis of ${competitorName} complete! Key insights have been added to your recommendations.`);
      } catch (error) {
        console.error('Competitor analysis failed:', error);
        alert('Analysis failed. Please try again.');
      } finally {
        button.textContent = 'Analyze';
        button.disabled = false;
      }
    });
  });

  // Listing Optimizer functionality
  const listingForm = document.querySelector('.card:last-child form');
  if (listingForm) {
    listingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const title = this.querySelector('input[type="text"]').value;
      const description = this.querySelector('textarea').value;
      const tags = this.querySelector('input[type="text"]:last-child').value;

      try {
        const optimization = await api.optimizeListing(title, description, tags);
        
        // Update suggestions
        const suggestions = this.querySelectorAll('.ai-suggestion');
        suggestions.forEach(suggestion => {
          const type = suggestion.querySelector('strong').textContent.toLowerCase();
          suggestion.innerHTML = `<strong>${type}:</strong> ${optimization[type + 'Suggestions']}`;
        });
      } catch (error) {
        console.error('Optimization failed:', error);
        alert('Optimization failed. Please try again.');
      }
    });
  }

  function updateCompetitorCards(data) {
    const cards = document.querySelectorAll('.competitor-card');
    data.competitors.forEach((competitor, index) => {
      if (cards[index]) {
        const card = cards[index];
        card.querySelector('h3').textContent = competitor.name;
        const metrics = card.querySelectorAll('.competitor-metric');
        metrics[0].innerHTML = `<strong>${competitor.sales}+</strong> sales`;
        metrics[1].innerHTML = `<strong>${competitor.rating}★</strong> rating`;
        metrics[2].innerHTML = `<strong>$${competitor.avgPrice}</strong> avg price`;
        metrics[3].innerHTML = `<strong>${competitor.ranking}</strong> in category`;
      }
    });
  }
});
