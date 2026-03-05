const { pool } = require('../config/db');

const productModel = {
  async list({ page, limit, q }) {
    const offset = (page - 1) * limit;
    const like = `%${q}%`;
    const where = q ? 'WHERE name LIKE ? OR category LIKE ?' : '';
    const params = q ? [like, like] : [];

    const [[countRow]] = await pool.query(`SELECT COUNT(*) as total FROM products ${where}`, params);
    const [rows] = await pool.query(
      `SELECT id, name, category, price, stock, image_url, created_at
       FROM products ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { page, limit, total: countRow.total, items: rows };
  },

  async create({ name, category, price, stock, image_url }) {
    const [r] = await pool.query(
      `INSERT INTO products (name, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`,
      [name, category, price, stock, image_url ?? null]
    );
    const [rows] = await pool.query(`SELECT id, name, category, price, stock, image_url, created_at FROM products WHERE id=?`, [r.insertId]);
    return rows[0];
  },

  async update(id, patch) {
    const [r] = await pool.query(
      `UPDATE products SET name=?, category=?, price=?, stock=?, image_url=? WHERE id=?`,
      [patch.name, patch.category, patch.price, patch.stock, patch.image_url ?? null, id]
    );
    if (r.affectedRows === 0) return null;
    const [rows] = await pool.query(`SELECT id, name, category, price, stock, image_url, created_at FROM products WHERE id=?`, [id]);
    return rows[0];
  },

  async remove(id) {
    const [r] = await pool.query(`DELETE FROM products WHERE id=?`, [id]);
    return r.affectedRows > 0;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM products WHERE id=? LIMIT 1`, [id]);
    return rows[0] || null;
  }
};

module.exports = { productModel };
