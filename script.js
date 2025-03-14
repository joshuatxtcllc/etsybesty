// Main JavaScript for Etsy Success Suite

document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabs = document.querySelectorAll('.main-tabs .tab');
  const sections = [
    document.querySelector('.search-section'), // Market Research tab content
    document.querySelector('.store-builder').parentElement, // Store Builder tab section
    document.querySelector('.competitor-analysis').parentElement, // AI Competitor Analysis tab section
    document.querySelector('.card:last-child').parentElement // Listing Optimizer tab section
  ];
  
  // Initially hide all sections except the first one
  for (let i = 1; i < sections.length; i++) {
    const sectionHeader = sections[i].querySelector('h2');
    const sectionContent = Array.from(sections[i].children).filter(el => el.tagName !== 'H2' && el.tagName !== 'P');
    
    sectionContent.forEach(el => {
      el.style.display = 'none';
    });
  }
  
  // Add click event listeners to tabs
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Hide all sections first
      sections.forEach((section, i) => {
        const sectionHeader = section.querySelector('h2');
        const sectionContent = Array.from(section.children).filter(el => el.tagName !== 'H2' && el.tagName !== 'P');
        
        if (i === 0) {
          // Special handling for first section which doesn't have an h2
          section.style.display = index === 0 ? 'block' : 'none';
          document.querySelector('.dashboard').style.display = index === 0 ? 'grid' : 'none';
          document.querySelector('.results-section > .result-card').style.display = index === 0 ? 'grid' : 'none';
        } else {
          // Show/hide section content based on selected tab
          sectionContent.forEach(el => {
            el.style.display = i === index ? 'block' : 'none';
          });
          
          // Special case for grid layouts
          if (i === 1 && index === 1) { // Store Builder
            document.querySelector('.store-builder').style.display = 'grid';
          }
        }
      });
    });
  });
  
  // Search form submission
  const searchForm = document.querySelector('.search-form');
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const keyword = document.getElementById('product-keyword').value;
    const category = document.getElementById('category').value;
    const priceRange = document.getElementById('price-range').value;
    
    // Mock analytics - in real app this would call the backend
    console.log('Analyzing:', {
      keyword, 
      category, 
      priceRange
    });
    
    // Update results section to show it's for the searched item
    if (keyword) {
      document.querySelector('.results-section > p').textContent = 
        `Here's what we found about "${keyword}"${category ? ' in ' + document.getElementById('category').options[document.getElementById('category').selectedIndex].text + ' category' : ''}`;
    }
    
    // In a real app, you would fetch results from backend here
    // For demo, we'll just scroll to results
    document.querySelector('.results-section').scrollIntoView({
      behavior: 'smooth'
    });
  });
  
  // AI Deep Analysis button
  const aiAnalysisBtn = document.querySelector('.btn-ai');
  aiAnalysisBtn.addEventListener('click', function() {
    const keyword = document.getElementById('product-keyword').value;
    if (!keyword) {
      alert('Please enter a product keyword first');
      return;
    }
    
    // Show loading state
    aiAnalysisBtn.textContent = 'Analyzing...';
    aiAnalysisBtn.disabled = true;
    
    // Simulate AI analysis (would call backend in real app)
    setTimeout(() => {
      aiAnalysisBtn.textContent = 'AI-Powered Deep Analysis';
      aiAnalysisBtn.disabled = false;
      
      // Switch to AI Competitor Analysis tab and scroll to it
      tabs[2].click();
      document.querySelector('.competitor-analysis').scrollIntoView({
        behavior: 'smooth'
      });
    }, 2000);
  });
  
  // Competitor analysis button handlers
  const analyzeButtons = document.querySelectorAll('.competitor-card .btn-ai');
  analyzeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent card click
      const competitorName = this.closest('.competitor-card').querySelector('h3').textContent;
      
      // Show loading state
      button.textContent = 'Analyzing...';
      button.disabled = true;
      
      // Simulate analysis (would call backend in real app)
      setTimeout(() => {
        button.textContent = 'Analyze';
        button.disabled = false;
        
        // Show success message
        alert(`Analysis of ${competitorName} complete! Key insights have been added to your recommendations.`);
      }, 1500);
    });
  });
  
  // Initialize store preview when banner image is selected
  const bannerInput = document.querySelector('input[type="file"]');
  if (bannerInput) {
    bannerInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        alert('In a full implementation, this would preview your banner in the store preview panel.');
      }
    });
  }
});
