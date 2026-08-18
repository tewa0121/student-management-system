const { pool } = require('../config/db');

const LibraryBook = {
  findAll: async (filters = {}) => {
    let query = `SELECT b.*, a.name as authorName, c.name as categoryName, p.name as publisherName 
                 FROM library_books b
                 JOIN library_authors a ON b.authorId = a.id
                 JOIN library_categories c ON b.categoryId = c.id
                 LEFT JOIN library_publishers p ON b.publisherId = p.id`;
    const params = [];
    const conditions = [];
    if (filters.categoryId) { conditions.push('b.categoryId = ?'); params.push(filters.categoryId); }
    if (filters.authorId) { conditions.push('b.authorId = ?'); params.push(filters.authorId); }
    if (filters.search) {
      conditions.push('(b.title LIKE ? OR b.isbn LIKE ? OR a.name LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY b.title';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM library_books WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { isbn, title, authorId, categoryId, publisherId, publicationYear, edition, pages, description, shelfLocation, totalCopies } = data;
    const [result] = await pool.query(
      `INSERT INTO library_books 
       (isbn, title, authorId, categoryId, publisherId, publicationYear, edition, pages, description, shelfLocation, totalCopies, availableCopies) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isbn, title, authorId, categoryId, publisherId, publicationYear, edition, pages, description, shelfLocation, totalCopies || 1, totalCopies || 1]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['isbn', 'title', 'authorId', 'categoryId', 'publisherId', 'publicationYear', 'edition', 'pages', 'description', 'shelfLocation', 'totalCopies', 'availableCopies'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_books SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_books WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = LibraryBook;