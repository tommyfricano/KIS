/**
 * USDA FoodData Central API Service
 * Handles food data searches with caching and rate limiting
 * Follows Single Responsibility Principle - only handles USDA API communication
 */

export interface FoodSearchResult {
  fdcId: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  servingUnit: string;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDASearchResponse {
  foods: USDAFoodItem[];
  totalHits: number;
}

// USDA API endpoint (free tier - no API key required for basic searches)
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY'; // Use DEMO_KEY for development, replace with actual key for production

// Nutrient IDs in USDA database
const NUTRIENT_IDS = {
  ENERGY: 1008, // Energy (calories)
  PROTEIN: 1003, // Protein
  CARBS: 1005, // Carbohydrates
  FATS: 1004, // Total lipid (fat)
};

// Cache for recent searches (in-memory, resets on page refresh)
const searchCache = new Map<string, { results: FoodSearchResult[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Search for foods using USDA FoodData Central API
 */
export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Check cache first
  const cached = searchCache.get(normalizedQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDASearchResponse = await response.json();

    const results = data.foods
      .map((food) => parseUSDAFood(food))
      .filter((food): food is FoodSearchResult => food !== null);

    // Cache results
    searchCache.set(normalizedQuery, { results, timestamp: Date.now() });

    return results;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw new Error('Failed to search foods. Please try manual entry.');
  }
}

/**
 * Parse USDA food item into our format
 */
function parseUSDAFood(food: USDAFoodItem): FoodSearchResult | null {
  try {
    const nutrients = food.foodNutrients;

    const calories = nutrients.find((n) => n.nutrientId === NUTRIENT_IDS.ENERGY)?.value || 0;
    const protein = nutrients.find((n) => n.nutrientId === NUTRIENT_IDS.PROTEIN)?.value || 0;
    const carbs = nutrients.find((n) => n.nutrientId === NUTRIENT_IDS.CARBS)?.value || 0;
    const fats = nutrients.find((n) => n.nutrientId === NUTRIENT_IDS.FATS)?.value || 0;

    return {
      fdcId: food.fdcId.toString(),
      description: food.description,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      servingSize: food.servingSize ? food.servingSize.toString() : '100',
      servingUnit: food.servingSizeUnit || 'g',
    };
  } catch (error) {
    console.error('Error parsing food:', error);
    return null;
  }
}

/**
 * Clear the search cache
 */
export function clearFoodSearchCache(): void {
  searchCache.clear();
}

/**
 * Get cached search results (for offline use)
 */
export function getCachedSearches(): string[] {
  return Array.from(searchCache.keys());
}
