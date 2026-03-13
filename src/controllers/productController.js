const { productModel } = require('../models/productModel');
const { apiError } = require('../utils/errors');

async function list(req, res) {
  const { page, limit, q } = req.validated.query;
  const result = await productModel.list({ page, limit, q });
  return res.json(result);
}

async function create(req, res) {
  const p = await productModel.create(req.validated.body);
  return res.status(201).json(p);
}

async function update(req, res) {
  const { id } = req.validated.params;
  const p = await productModel.update(id, req.validated.body);

  // Standardized error response
  if (!p) return apiError(res, 404, 'NOT_FOUND', 'Product not found');

  return res.json(p);
}

async function remove(req, res) {
  const id = Number(req.params.productId);
  const ok = await productModel.remove(id);

  // Standardized error response
  if (!ok) return apiError(res, 404, 'NOT_FOUND', 'Product not found');

  return res.status(204).send();
}

module.exports = { list, create, update, remove };