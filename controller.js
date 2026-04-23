import { Person } from './db.js';
import { Op } from 'sequelize';
import { parseNaturalLanguageQuery } from './services/nlp.js';

export const getWorld = (req, res) => {
    res.status(200).json({
        name: 'austin',
        message: 'hello world'
    });
};

const VALID_STANDARD_KEYS = [
  'page', 'limit', 'sort_by', 'order', 'gender', 'age_group', 
  'country_id', 'min_age', 'max_age', 'min_gender_probability', 'min_country_probability'
];

const VALID_SEARCH_KEYS = ['q', 'page', 'limit', 'sort_by', 'order'];

export const validateQueryParameters = (query, allowedKeys) => {
  const keys = Object.keys(query);
  
  // 5. Query Validation: Invalid queries (extraneous params) returns exactly:
  for (const key of keys) {
    if (!allowedKeys.includes(key)) {
      return { code: 400, message: "Invalid query parameters" };
    }
  }

  // Missing or empty parameter (400)
  for (const key of keys) {
    if (query[key] === undefined || query[key] === '') {
      return { code: 400, message: "Missing or empty parameter" };
    }
  }

  // Invalid parameter type (422)
  const integerFields = ['page', 'limit', 'min_age', 'max_age'];
  const floatFields = ['min_gender_probability', 'min_country_probability'];
  
  for (const key of keys) {
    if (integerFields.includes(key)) {
      if (isNaN(parseInt(query[key], 10))) {
        return { code: 422, message: "Invalid parameter type" };
      }
    }
    if (floatFields.includes(key)) {
      if (isNaN(parseFloat(query[key]))) {
        return { code: 422, message: "Invalid parameter type" };
      }
    }
  }

  return null; // Valid
};

const getPaginationAndSorting = (query) => {
  let { page = 1, limit = 10, sort_by = 'created_at', order = 'asc' } = query;
  
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  
  if (limit > 50) limit = 50;

  const validSortColumns = ['age', 'created_at', 'gender_probability'];
  if (!validSortColumns.includes(sort_by)) sort_by = 'created_at';
  
  const validOrder = ['asc', 'desc'];
  order = order.toLowerCase();
  if (!validOrder.includes(order)) order = 'asc';

  return {
    limit,
    offset: (page - 1) * limit,
    page,
    orderOption: [[sort_by, order.toUpperCase()]]
  };
};

export const getProfiles = async (req, res) => {
  try {
    const error = validateQueryParameters(req.query, VALID_STANDARD_KEYS);
    if (error) {
      return res.status(error.code).json({ status: "error", message: error.message });
    }

    const { 
      gender, age_group, country_id, min_age, max_age, min_gender_probability, min_country_probability 
    } = req.query;

    const { limit, offset, page, orderOption } = getPaginationAndSorting(req.query);

    const where = {};
    if (gender) where.gender = gender;
    if (age_group) where.age_group = age_group;
    if (country_id) where.country_id = country_id;
    
    if (min_age || max_age) {
      where.age = {};
      if (min_age) where.age[Op.gte] = parseInt(min_age, 10);
      if (max_age) where.age[Op.lte] = parseInt(max_age, 10);
    }
    
    if (min_gender_probability) {
      where.gender_probability = { [Op.gte]: parseFloat(min_gender_probability) };
    }
    
    if (min_country_probability) {
      where.country_probability = { [Op.gte]: parseFloat(min_country_probability) };
    }

    const { count, rows } = await Person.findAndCountAll({
      where,
      order: orderOption,
      limit,
      offset,
    });

    res.status(200).json({
      status: "success",
      page,
      limit,
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ status: "error", message: "Server failure" });
  }
};

export const searchProfilesNL = async (req, res) => {
  try {
    // strict search constraint limits
    const error = validateQueryParameters(req.query, VALID_SEARCH_KEYS);
    if (error) {
      return res.status(error.code).json({ status: "error", message: error.message });
    }

    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ status: "error", message: "Missing or empty parameter" });
    }

    const filters = parseNaturalLanguageQuery(q);
    
    if (!filters) {
      return res.status(400).json({ status: "error", message: "Unable to interpret query" });
    }

    const { limit, offset, page, orderOption } = getPaginationAndSorting(req.query);
    
    const where = {};
    if (filters.gender) where.gender = filters.gender;
    if (filters.age_group) where.age_group = filters.age_group;
    if (filters.country_id) where.country_id = filters.country_id;
    
    if (filters.min_age || filters.max_age) {
      where.age = {};
      if (filters.min_age) where.age[Op.gte] = filters.min_age;
      if (filters.max_age) where.age[Op.lte] = filters.max_age;
    }

    const { count, rows } = await Person.findAndCountAll({
      where,
      order: orderOption,
      limit,
      offset,
    });

    res.status(200).json({
      status: "success",
      page,
      limit,
      total: count,
      data: rows
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ status: "error", message: "Server failure" });
  }
};