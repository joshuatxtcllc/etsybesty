// Mock API for Etsy Success Suite
// In a real implementation, this would be replaced with actual API calls

class MockApi {
  constructor() {
    this.delay = 800; // Simulate network delay in ms
  }

  // Simulate API call with delay
  async simulateCall(data) {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), this.delay);
    });
  }

  // Get market analysis for a product
  async analyzeProduct(keyword, category, priceRange) {
    console.log(`Analyzing: ${keyword} in ${category} at ${priceRange}`);
    
    // Mock response data
    const data = {
      overallScore: 85,
      searchVolume: {
        current: 2500,
        trend: [1800, 2100, 2300, 2500, 2600, 2400, 2200, 2500],
        growth: 12.5
      },
      competition: {
        activeListings: 850,
        saturationLevel: 65,
        topSellers: 12
      },
      pricing: {
        optimal: {
          min: 15,
          max: 35
        },
        average: 24.50,
        premium: 45.75
      },
      seasonal: {
        peak: ["November", "December"],
        data: [65, 70, 75, 80, 85, 90, 95, 100, 90, 95, 110, 120]
      },
      keywords: [
        "wooden coasters",
        "personalized coasters",
        "custom wood coasters",
        "engraved coasters",
        "wedding gift"
      ],
      profitMargin: 78
    };
    
    return this.simulateCall(data);
  }

  // Get competitor analysis
  async getCompetitors(keyword, category) {
    // Mock competitors data
    const data = {
      competitors: [
        {
          name: "WoodcraftersDeluxe",
          sales: 2500,
          rating: 4.9,
          avgPrice: 28.50,
          ranking: "Top 5%",
          url: "#",
          avatar: "assets/charts/competitor1.png" 
        },
        {
          name: "CustomCoasterCo",
          sales: 1800,
          rating: 4.8,
          avgPrice: 32.00,
          ranking: "Top 12%",
          url: "#",
          avatar: "assets/charts/competitor2.png"
        },
        {
          name: "EngravedMemories",
          sales: 3200,
          rating: 4.7,
          avgPrice: 26.50,
          ranking: "Top 8%",
          url: "#",
          avatar: "assets/charts/competitor3.png"
        }
      ],
      insights: {
        layout: "Top performers arrange products in 3-4 main sections with clear categorization by usage (e.g., 'Gifts for Him,' 'Wedding Gifts').",
        visual: "Natural light photography with minimalist styling performs 38% better than busy backgrounds. Wood grain visibility is emphasized.",
        pricing: "Most successful stores offer a base model at $22-26 with premium customization options that increase average order value by 40%.",
        opportunity: "Only 8% of competitors offer bundle deals with matching items. This represents a market gap you could fill."
      }
    };
    
    return this.simulateCall(data);
  }

  // Get SEO optimization suggestions
  async optimizeListing(title, description, tags) {
    // Mock SEO optimization data
    const data = {
      titleScore: 85,
      titleSuggestions: "Add 'Personalized Gift' to capture more gift-oriented searches",
      descriptionScore: 72,
      descriptionSuggestions: "Add specific dimensions and care instructions to reduce customer questions. Consider mentioning 'water-resistant finish' based on common customer searches.",
      tagScore: 80,
      tagSuggestions: "Add 'anniversary gift' and 'rustic home decor' tags to capture additional high-volume searches.",
      photoSuggestions: "Add a photo showing the coasters in use with drinks on them. Most successful listings include contextual usage photos."
    };
    
    return this.simulateCall(data);
  }

  // Get store optimization suggestions
  async analyzeStore(storeData) {
    // Mock store optimization data
    const data = {
      overallScore: 68,
      suggestions: {
        banner: "Use warm earth tones in your banner to match top-performing shops in your niche. Include your product visibly in the banner.",
        sections: "Start with Bestsellers, followed by New Arrivals, then organize by product type or theme.",
        about: "Based on successful shops in your niche, emphasize handmade quality and sustainability. Include a personal connection to your craft."
      },
      improvements: [
        "Add a shop announcement highlighting your bestsellers",
        "Include more detailed production process in your About section",
        "Add a section specifically for gift-ready items"
      ]
    };
    
    return this.simulateCall(data);
  }
}

// Create global instance
window.api = new MockApi();
