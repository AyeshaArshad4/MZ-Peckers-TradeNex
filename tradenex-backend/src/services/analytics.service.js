'use strict';
const { getPool, sql } = require('../config/db');

const getDashboard = async () => {
  const pool = await getPool();

  const [stats, topProducts, recentOrders, pendingApprovals, monthlyRevenue] = await Promise.all([
    pool.request().query(`
      SELECT
        COUNT(DISTINCT o.OrderID)    AS TotalOrders,
        ISNULL(SUM(CASE WHEN o.PaymentStatus='Paid' THEN o.Subtotal END),0) AS TotalRevenue,
        COUNT(DISTINCT CASE WHEN o.OrderStatus='Pending'   THEN o.OrderID END) AS PendingOrders,
        COUNT(DISTINCT CASE WHEN o.OrderStatus='Confirmed' THEN o.OrderID END) AS ConfirmedOrders,
        COUNT(DISTINCT CASE WHEN o.OrderStatus='Shipped'   THEN o.OrderID END) AS ShippedOrders,
        COUNT(DISTINCT CASE WHEN o.OrderStatus='Delivered' THEN o.OrderID END) AS DeliveredOrders,
        COUNT(DISTINCT CASE WHEN o.OrderStatus='Cancelled' THEN o.OrderID END) AS CancelledOrders,
        (SELECT COUNT(*) FROM Users WHERE Role='Customer')         AS TotalCustomers,
        (SELECT COUNT(*) FROM Users WHERE ApprovalStatus='PendingApproval') AS PendingApprovals,
        (SELECT COUNT(*) FROM Quotes WHERE Status='Pending')       AS PendingQuotes,
        (SELECT COUNT(*) FROM Reviews WHERE IsApproved=0)          AS PendingReviews
      FROM Orders o
    `),

    pool.request().query(`
      SELECT TOP 5
        p.ProductID, p.Name AS ProductName, p.SKU,
        SUM(oi.Quantity)              AS TotalUnitsSold,
        SUM(oi.Quantity*oi.UnitPrice) AS TotalRevenue
      FROM OrderItems oi
      JOIN ProductVariants pv ON oi.VariantID=pv.VariantID
      JOIN Products p         ON pv.ProductID=p.ProductID
      JOIN Orders o           ON oi.OrderID=o.OrderID
      WHERE o.OrderStatus NOT IN ('Cancelled')
      GROUP BY p.ProductID, p.Name, p.SKU
      ORDER BY TotalUnitsSold DESC
    `),

    pool.request().query(`
      SELECT TOP 10
        o.OrderID, o.OrderStatus, o.PaymentStatus,
        o.Subtotal, o.OrderPlacedAt,
        u.FullName AS CustomerName
      FROM Orders o JOIN Users u ON o.UserID=u.UserID
      ORDER BY o.OrderPlacedAt DESC
    `),

    pool.request().query(`
      SELECT UserID, Username, Email, FullName, CompanyName, CustomerType, CreatedAt
      FROM Users WHERE ApprovalStatus='PendingApproval' ORDER BY CreatedAt ASC
    `),

    // Last 6 months revenue by month
    pool.request().query(`
      SELECT
        FORMAT(o.OrderPlacedAt, 'yyyy-MM') AS Month,
        COUNT(DISTINCT o.OrderID)           AS Orders,
        ISNULL(SUM(CASE WHEN o.PaymentStatus='Paid' THEN o.Subtotal END),0) AS Revenue
      FROM Orders o
      WHERE o.OrderPlacedAt >= DATEADD(MONTH,-6,GETDATE())
        AND o.OrderStatus NOT IN ('Cancelled')
      GROUP BY FORMAT(o.OrderPlacedAt,'yyyy-MM')
      ORDER BY Month ASC
    `),
  ]);

  return {
    stats:           stats.recordset[0],
    topProducts:     topProducts.recordset,
    recentOrders:    recentOrders.recordset,
    pendingApprovals: pendingApprovals.recordset,
    monthlyRevenue:  monthlyRevenue.recordset,
  };
};

module.exports = { getDashboard };