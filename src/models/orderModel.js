const { pool } = require('../config/db');
const { productModel } = require('./productModel');

const orderModel = {
  async create(userId, items) {
    let total = 0;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const it of items) {
        const p = await productModel.findById(it.product_id);
        if (!p) throw new Error(`Product not found: ${it.product_id}`);
        if (it.quantity <= 0) throw new Error(`Invalid quantity for product ${it.product_id}`);
        if (p.stock < it.quantity) throw new Error(`Insufficient stock for product ${it.product_id}`);

        total += Number(p.price) * Number(it.quantity);
        await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [it.quantity, it.product_id]);
      }

      const [orderRes] = await conn.query(`INSERT INTO orders (user_id, total) VALUES (?, ?)`, [userId, total]);
      const orderId = orderRes.insertId;

      for (const it of items) {
        const p = await productModel.findById(it.product_id);
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
          [orderId, it.product_id, it.quantity, p.price]
        );
      }

      await conn.commit();
      return { id: orderId, user_id: userId, total, items };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  async listByUser(userId) {
    const [orders] = await pool.query(`SELECT id, user_id, total, created_at FROM orders WHERE user_id=? ORDER BY id DESC`, [userId]);
    for (const o of orders) {
      const [items] = await pool.query(
        `SELECT oi.product_id, p.name, oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [o.id]
      );
      o.items = items;
    }
    return orders;
  }
};

module.exports = { orderModel };
