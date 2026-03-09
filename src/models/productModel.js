const { getConn } = require('../config/db');

const productModel = {
  // ISSUE-0014 FIX: Added pagination logic
  async list({ page = 1, limit = 10, q }) {
    const conn = await getConn();
    try {
      // 1. I-convert ang page ug limit ngadto sa numbers, ug i-compute ang offset
      const numPage = parseInt(page, 10) || 1;
      const numLimit = parseInt(limit, 10) || 10;
      const offset = (numPage - 1) * numLimit;

      const like = `%${q}%`;
      const where = q ? 'WHERE name LIKE ? OR category LIKE ?' : '';
      
      // 2. Kuhaon ang total count sa products aron sakto ang 'total' nga e-return
      const countParams = q ? [like, like] : [];
      const [countRows] = await conn.query(
        `SELECT COUNT(*) as count FROM products ${where}`, 
        countParams
      );
      const totalItems = countRows[0].count;

      // 3. I-apil ang numLimit ug offset parameters para sa main query
      const params = q ? [like, like, numLimit, offset] : [numLimit, offset];

      // 4. I-add ang LIMIT ug OFFSET sa SQL Query
      const [rows] = await conn.query(
        `SELECT id, name, category, price, stock, image_url, created_at
         FROM products ${where}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        params
      );

      // 5. I-return ang sakto nga pagination data
      return { page: numPage, limit: numLimit, total: totalItems, items: rows };
    } finally {
      await conn.end();
    }
  },

  async create({ name, category, price, stock, image_url }) {
    const conn = await getConn();
    try {
      // ISSUE-0003: negative prices allowed (no model-level validation)
      const [r] = await conn.query(
        `INSERT INTO products (name, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`,
        [name, category, price, stock, image_url ?? null]
      );
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=?`, [r.insertId]);
      return rows[0];
    } finally {
      await conn.end();
    }
  },

  async update(id, patch) {
    const conn = await getConn();
    try {
      const [r] = await conn.query(
        `UPDATE products SET name=?, category=?, price=?, stock=?, image_url=? WHERE id=?`,
        [patch.name, patch.category, patch.price, patch.stock, patch.image_url ?? null, id]
      );
      if (r.affectedRows === 0) return null;
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=?`, [id]);
      return rows[0];
    } finally {
      await conn.end();
    }
  },

  async remove(id) {
    const conn = await getConn();
    try {
      const [r] = await conn.query(`DELETE FROM products WHERE id=?`, [id]);
      return r.affectedRows > 0;
    } finally {
      await conn.end();
    }
  },

  async findById(id) {
    const conn = await getConn();
    try {
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=? LIMIT 1`, [id]);
      return rows[0] || null;
    } finally {
      await conn.end();
    }
  }
};

module.exports = { productModel };