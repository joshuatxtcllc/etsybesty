
// Main JavaScript for Etsy Success Suite
document.addEventListener('DOMContentLoaded', async function() {
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
      
      // Update results section
      document.querySelector('.results-section > p').textContent = 
        `Here's what we found about "${keyword}"${category ? ' in ' + document.getElementById('category').options[document.getElementById('category').selectedIndex].text : ''}`;
      
      // Update metrics
      document.querySelector('.score-high').textContent = result.overallScore;
      document.querySelector('.metric-value:not(.score-high)').textContent = 
        `$${result.pricing.optimal.min}-$${result.pricing.optimal.max}`;
      document.querySelector('.score-medium').textContent = `${result.competition.saturationLevel}%`;

      // Create charts
      const searchCtx = document.querySelector('.chart-placeholder').getContext('2d');
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

      const seasonalCtx = document.querySelectorAll('.chart-placeholder')[2].getContext('2d');
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
      const competitors = await api.getCompetitors(keyword);
      
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
  const bannerInput = document.querySelector('input[type="file"]');
  if (bannerInput) {
    bannerInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          // Update preview
          const preview = document.querySelector('.preview-panel img');
          preview.src = e.target.result;
          preview.alt = 'Store Preview';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

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
