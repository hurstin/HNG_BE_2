/**
 * Basic NLP Engine
 * Parses natural language query strings into standard flat filter objects.
 * Returns null if no rules were matched to flag "Unable to interpret query".
 */

const COUNTRY_MAP = {
  'nigeria': 'NG',
  'angola': 'AO',
  'kenya': 'KE',
  'united kingdom': 'GB',
  'uk': 'GB',
  'united states': 'US',
  'usa': 'US',
  'south africa': 'ZA',
  'ghana': 'GH',
  'tanzania': 'TZ',
  'uganda': 'UG'
};

export const parseNaturalLanguageQuery = (queryString) => {
  if (!queryString || typeof queryString !== 'string') return null;
  
  const query = queryString.toLowerCase();
  const filters = {};

  // 1. Gender Rules
  const hasMale = query.match(/\b(men|male|males|boy|boys)\b/);
  const hasFemale = query.match(/\b(women|female|females|girl|girls)\b/);
  
  if (hasMale && !hasFemale) {
    filters.gender = 'male';
  } else if (hasFemale && !hasMale) {
    filters.gender = 'female';
  } // if both, we skip restricting gender

  // 2. Age Group & "Young" Rule
  if (query.match(/\b(young)\b/)) {
    filters.min_age = 16;
    filters.max_age = 24;
  } else if (query.match(/\b(child|children|kids)\b/)) {
    filters.age_group = 'child';
  } else if (query.match(/\b(teen|teenager|teens)\b/)) {
    filters.age_group = 'teenager';
  } else if (query.match(/\b(adult|adults)\b/)) {
    filters.age_group = 'adult';
  } else if (query.match(/\b(senior|seniors|elderly)\b/)) {
    filters.age_group = 'senior';
  }

  // 3. Age Exact Rules
  const overMatch = query.match(/\b(?:over|above|>|older than) (\d+)\b/);
  if (overMatch) {
    filters.min_age = parseInt(overMatch[1], 10);
    // if strictly "over 30", wait the prompt says "above 30 -> min_age=30" or >30? 
    // The prompt mapped "females above 30" -> "gender=female + min_age=30".
  }

  const underMatch = query.match(/\b(?:under|below|<|younger than) (\d+)\b/);
  if (underMatch) {
    filters.max_age = parseInt(underMatch[1], 10);
  }

  // 4. Location Rules (Country ID)
  // Check explicit map first
  for (const [countryName, code] of Object.entries(COUNTRY_MAP)) {
    if (query.includes(countryName)) {
      filters.country_id = code;
      break;
    }
  }
  
  // Also support explicit 2-letter codes like "from NG"
  if (!filters.country_id) {
    const codeMatch = query.match(/\b(?:from|in) ([a-z]{2})\b/);
    if (codeMatch && !['to','in','on','at','or','is','be'].includes(codeMatch[1])) {
      filters.country_id = codeMatch[1].toUpperCase();
    }
  }

  // If no filters were matched at all, return null
  if (Object.keys(filters).length === 0) {
    return null;
  }

  return filters;
};
