'use strict';
const { getPool, sql } = require('../config/db');

const getProducts = async ({ search, categoryId, inStock, page = 1, limit = 12 }) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;
  const req    = pool.request();
  const conds  = ['p.IsActive = 1'];

  if (search) {
    conds.push('(p.Name LIKE @search OR p.SKU LIKE @search OR p.Description LIKE @search)');
    req.input('search', sql.NVarChar(200), `%${search}%`);
  }
  if (categoryId) {
    conds.push('p.CategoryID = @catId');
    req.input('catId', sql.Int, +categoryId);
  }
  if (inStock === 'true') conds.push('p.StockQty > 0');

  const where = `WHERE ${conds.join(' AND ')}`;
  req.input('limit', sql.Int, +limit).input('offset', sql.Int, offset);

  const [data, cnt] = await Promise.all([
    req.query(`
      SELECT p.ProductID, p.SKU, p.Name, p.BasePrice, p.StockQty, p.IsInStock,
             p.HasTrademarkBadge, p.HasVerifiedSupplierLabel, p.IsActive, p.CreatedAt,
             c.Name AS CategoryName, c.Slug AS CategorySlug,
             img.ImageUrl AS PrimaryImageUrl,
             CAST(ISNULL(AVG(CAST(r.Rating AS FLOAT)),0) AS DECIMAL(3,2)) AS AvgRating,
             COUNT(DISTINCT r.ReviewID) AS ReviewCount
      FROM Products p
      JOIN  Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN (SELECT ProductID, MIN(ImageUrl) AS ImageUrl FROM ProductImages WHERE IsPrimary=1 GROUP BY ProductID) img
             ON img.ProductID = p.ProductID
      LEFT JOIN Reviews r ON r.ProductID = p.ProductID AND r.IsApproved = 1
      ${where}
      GROUP BY p.ProductID,p.SKU,p.Name,p.BasePrice,p.StockQty,p.IsInStock,
               p.HasTrademarkBadge,p.HasVerifiedSupplierLabel,p.IsActive,p.CreatedAt,
               c.Name,c.Slug,img.ImageUrl
      ORDER BY p.CreatedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `),
    pool.request().query(`SELECT COUNT(DISTINCT p.ProductID) AS total FROM Products p JOIN Categories c ON p.CategoryID=c.CategoryID ${where}`),
  ]);

  return {
    products:   data.recordset,
    total:      cnt.recordset[0].total,
    page:       +page,
    totalPages: Math.ceil(cnt.recordset[0].total / limit),
  };
};

const getProductById = async (productId) => {
  const pool = await getPool();

  const [prod, variants, images, reviews] = await Promise.all([
    pool.request().input('id', sql.Int, productId).query(`
      SELECT p.*, c.Name AS CategoryName, c.Slug AS CategorySlug
      FROM Products p JOIN Categories c ON p.CategoryID=c.CategoryID
      WHERE p.ProductID=@id AND p.IsActive=1
    `),
    pool.request().input('id', sql.Int, productId)
      .query('SELECT * FROM ProductVariants WHERE ProductID=@id AND IsActive=1'),
    pool.request().input('id', sql.Int, productId)
      .query('SELECT * FROM ProductImages WHERE ProductID=@id ORDER BY IsPrimary DESC, SortOrder ASC'),
    pool.request().input('id', sql.Int, productId).query(`
      SELECT r.ReviewID, r.Rating, r.ReviewText, r.CreatedAt, u.FullName AS ReviewerName
      FROM Reviews r JOIN Users u ON r.UserID=u.UserID
      WHERE r.ProductID=@id AND r.IsApproved=1 ORDER BY r.CreatedAt DESC
    `),
  ]);

  if (!prod.recordset.length) return null;
  return { ...prod.recordset[0], variants: variants.recordset, images: images.recordset, reviews: reviews.recordset };
};

const getAllCategories = async () => {
  const pool = await getPool();
  const res = await pool.request().query('SELECT * FROM Categories WHERE IsActive=1 ORDER BY Name');
  return res.recordset;
};

const createProduct = async (data, imageFiles) => {
  const pool = await getPool();

  // Coerce types — FormData sends everything as strings
  const categoryId               = parseInt(data.categoryId);
  const sku                      = String(data.sku).trim();
  const name                     = String(data.name).trim();
  const description              = data.description  || null;
  const specifications           = data.specifications || null;
  const basePrice                = parseFloat(data.basePrice);
  const stockQty                 = parseInt(data.stockQty) || 0;
  const hasTrademarkBadge        = data.hasTrademarkBadge === true || data.hasTrademarkBadge === 'true' ? 1 : 0;
  const hasVerifiedSupplierLabel = data.hasVerifiedSupplierLabel === true || data.hasVerifiedSupplierLabel === 'true' ? 1 : 0;

  const res = await pool.request()
    .input('catId',     sql.Int,            categoryId)
    .input('sku',       sql.NVarChar(50),   sku)
    .input('name',      sql.NVarChar(120),  name)
    .input('desc',      sql.NVarChar(2000), description)
    .input('specs',     sql.NVarChar(2000), specifications)
    .input('price',     sql.Decimal(10,2),  basePrice)
    .input('stock',     sql.Int,            stockQty)
    .input('trademark', sql.Bit,            hasTrademarkBadge)
    .input('verified',  sql.Bit,            hasVerifiedSupplierLabel)
    .query(`
      INSERT INTO Products
        (CategoryID, SKU, Name, Description, Specifications,
         BasePrice, StockQty, HasTrademarkBadge, HasVerifiedSupplierLabel)
      OUTPUT INSERTED.ProductID
      VALUES
        (@catId, @sku, @name, @desc, @specs,
         @price, @stock, @trademark, @verified)
    `);

  const productId = res.recordset[0].ProductID;

  // Insert variants
  if (data.variants) {
    try {
      const parsed = typeof data.variants === 'string'
        ? JSON.parse(data.variants)
        : data.variants;

      for (const v of parsed) {
        if (!v.variantName?.trim() || !v.variantValue?.trim()) continue;
        await pool.request()
          .input('pid',   sql.Int,           productId)
          .input('vName', sql.NVarChar(60),  String(v.variantName).trim())
          .input('vVal',  sql.NVarChar(60),  String(v.variantValue).trim())
          .input('delta', sql.Decimal(10,2), parseFloat(v.variantPriceDelta) || 0)
          .input('stock', sql.Int,           v.variantStockQty != null && v.variantStockQty !== ''
            ? parseInt(v.variantStockQty) : null)
          .query(`
            INSERT INTO ProductVariants
              (ProductID, VariantName, VariantValue, VariantPriceDelta, VariantStockQty)
            VALUES (@pid, @vName, @vVal, @delta, @stock)
          `);
      }
    } catch (e) {
      console.error('Variant insert error:', e.message);
    }
  }

  // Insert images
  if (imageFiles?.length) {
    for (let i = 0; i < imageFiles.length; i++) {
      await pool.request()
        .input('pid',       sql.Int,          productId)
        .input('url',       sql.NVarChar(500), `/uploads/${imageFiles[i].filename}`)
        .input('isPrimary', sql.Bit,           i === 0 ? 1 : 0)
        .input('sort',      sql.Int,           i)
        .query(`
          INSERT INTO ProductImages (ProductID, ImageUrl, IsPrimary, SortOrder)
          VALUES (@pid, @url, @isPrimary, @sort)
        `);
    }
  }

  return getProductById(productId);
};

const updateProduct = async (productId, fields) => {
  const pool = await getPool();
  const sets = [];
  const req  = pool.request().input('id', sql.Int, productId);

  if (fields.name        != null) { sets.push('Name=@name');         req.input('name',      sql.NVarChar(120),  fields.name); }
  if (fields.description != null) { sets.push('Description=@desc');  req.input('desc',      sql.NVarChar(2000), fields.description); }
  if (fields.specifications != null) { sets.push('Specifications=@specs'); req.input('specs', sql.NVarChar(2000), fields.specifications); }
  if (fields.basePrice   != null) { sets.push('BasePrice=@price');   req.input('price',     sql.Decimal(10,2),  +fields.basePrice); }
  if (fields.stockQty    != null) { sets.push('StockQty=@stock');    req.input('stock',     sql.Int,            +fields.stockQty); }
  if (fields.categoryId  != null) { sets.push('CategoryID=@catId');  req.input('catId',     sql.Int,            +fields.categoryId); }
  if (fields.hasTrademarkBadge        != null) { sets.push('HasTrademarkBadge=@tm');       req.input('tm',       sql.Bit, fields.hasTrademarkBadge ? 1 : 0); }
  if (fields.hasVerifiedSupplierLabel != null) { sets.push('HasVerifiedSupplierLabel=@vs'); req.input('vs',       sql.Bit, fields.hasVerifiedSupplierLabel ? 1 : 0); }
  if (fields.isActive    != null) { sets.push('IsActive=@active');   req.input('active',    sql.Bit,            fields.isActive ? 1 : 0); }

  if (!sets.length) throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
  sets.push('UpdatedAt=GETDATE()');

  await req.query(`UPDATE Products SET ${sets.join(',')} WHERE ProductID=@id`);
  return getProductById(productId);
};

const deleteProduct = async (productId) => {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, productId)
    .query('UPDATE Products SET IsActive=0, UpdatedAt=GETDATE() WHERE ProductID=@id');
};

module.exports = { getProducts, getProductById, getAllCategories, createProduct, updateProduct, deleteProduct };