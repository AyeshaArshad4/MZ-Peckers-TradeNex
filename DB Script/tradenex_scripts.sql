-- TradeNex DATABASE SCRIPT
-- Schema creation and seed data

-- OPTIONAL: UNCOMMENT TO RESET DATABASE BEFORE RECREATION

-- DROP DATABASE TradeNex;
-- GO

-- DATABASE CREATION & SELECTION

CREATE DATABASE TradeNex;
GO 

USE TradeNex;
GO

-- FOUNDATION TABLES
-- Core system entities (users, categories, products, variants, images)

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Role NVARCHAR(20) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    Email NVARCHAR(254) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    ApprovalStatus NVARCHAR(20) NOT NULL DEFAULT 'PendingApproval',
    RejectionReason NVARCHAR(255) NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    CompanyName NVARCHAR(120) NULL,
    CustomerType NVARCHAR(30) NULL,
    Country NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_Users_Username UNIQUE (Username),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),

    CONSTRAINT CHK_Users_Role
        CHECK (Role IN ('Admin','Customer')),

    CONSTRAINT CHK_Users_ApprovalStatus
        CHECK (ApprovalStatus IN ('PendingApproval','Approved','Rejected'))
);

CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(80) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Categories_Name UNIQUE (Name)
);

CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT NOT NULL,
    SKU NVARCHAR(50) NOT NULL,
    Name NVARCHAR(120) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Specifications NVARCHAR(1000) NULL,
    BasePrice DECIMAL(10,2) NOT NULL,
    StockQty INT NOT NULL DEFAULT 0,
    IsInStock AS (CASE WHEN StockQty > 0 THEN 1 ELSE 0 END),
    HasTrademarkBadge BIT NOT NULL DEFAULT 0,
    HasVerifiedSupplierLabel BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID)
    REFERENCES Categories(CategoryID),
    CONSTRAINT UQ_Products_SKU UNIQUE (SKU),
    CONSTRAINT CHK_Products_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CHK_Products_StockQty CHECK (StockQty >= 0)
);

CREATE TABLE ProductVariants (
    VariantID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    VariantName NVARCHAR(60) NOT NULL,
    VariantValue NVARCHAR(60) NOT NULL,
    VariantPriceDelta DECIMAL(10,2) NOT NULL DEFAULT 0,
    VariantStockQty INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ProductVariants_Products FOREIGN KEY (ProductID)
    REFERENCES Products(ProductID),
    CONSTRAINT CHK_ProductVariants_PriceDelta  CHECK (VariantPriceDelta >= 0),
    CONSTRAINT CHK_ProductVariants_Stock CHECK (VariantStockQty IS NULL OR VariantStockQty >= 0),
    CONSTRAINT UQ_ProductVariants_Product UNIQUE (ProductID, VariantName, VariantValue)
  );

CREATE TABLE ProductImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductID)
    REFERENCES Products(ProductID)  
        
);

-- SEED DATA FOR FOUNDATION TABLES
-- Initial users, categories, products, variants, and product images

INSERT INTO Users(Role, Username, Email, PasswordHash, ApprovalStatus, FullName, Phone, CustomerType, CompanyName, Country, IsActive)
VALUES
('Admin','admin1','admin@mzpeckers.com','HASHED_PASSWORD_123','Approved','System Admin','0300-0000001',NULL,'MZ Peckers','Pakistan',1),
('Customer','ali_contractor','ali.contractor@gmail.com','HASHED_PASSWORD_123','Approved','Ali Raza','0300-0000002','Contractor','Raza Builders','Pakistan',1),
('Customer','sara_tileshop','sara.tileshop@gmail.com','HASHED_PASSWORD_123','Approved','Sara Khan','0300-0000003','ShopOwner','Khan Tiles Center','Pakistan',1),
('Customer','usman_installer','usman.installer@gmail.com','HASHED_PASSWORD_123','Approved','Usman Ahmed','0300-0000004','Installer',NULL,'Pakistan',1),
('Customer','fatima_pending','fatima.pending@gmail.com','HASHED_PASSWORD_123','PendingApproval','Fatima Noor','0300-0000005','Contractor','Noor Construction','Pakistan',1);

USE TradeNex;
SELECT * FROM Users;

INSERT INTO Categories (Name) VALUES
('Tile Leveling'),
('Tile Grout');

INSERT INTO Products (CategoryID, SKU, Name, BasePrice, StockQty, HasTrademarkBadge, HasVerifiedSupplierLabel, IsActive)
VALUES
(1,'TL-CLIP-BOX','Tile Leveling Clips (200 pcs box)',1200,200,1,1,1),
(1,'TL-WEDGE-BOX','Tile Leveling Wedges (200 pcs box)',900,300,1,1,1),
(1,'TL-SCRAPER-01','Tile Scraper Tool',2500,40,1,1,1),
(2,'GRT-5KG','Tile Grout (5kg)',700,150,1,1,1);

INSERT INTO ProductVariants (ProductID, VariantName, VariantValue, VariantStockQty)
VALUES
(1,'GroutWidth','1.5 mm', 50),
(1,'GroutWidth','2.0 mm', 60),
(1,'GroutWidth','2.5 mm', 45),
(1,'GroutWidth','3.0 mm', 40),
(4,'Colour','White', 35),
(4,'Colour','Light Grey', 30),
(4,'Colour','Dark Grey', 25),
(4,'Colour','Beige', 20);

INSERT INTO ProductImages (ProductID, ImageUrl, IsPrimary)
VALUES
(1,'https://example.com/clips1.jpg',1),
(2,'https://example.com/wedges1.jpg',1),
(3,'https://example.com/scraper1.jpg',1),
(4,'https://example.com/grout1.jpg',1),
(1,'https://example.com/clips2.jpg',0),
(4,'https://example.com/grout2.jpg',0);

GO 

-- TRANSACTION AND INTERACTION TABLES
-- Tables supporting carts, orders, quotes, reviews, queries, and status history

CREATE TABLE Carts (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT CHK_Carts_Status CHECK (Status IN ('Active','Converted','Abandoned')),
    CONSTRAINT UQ_Carts_User_Status UNIQUE (UserID, Status)
);

CREATE TABLE CartItems (
    CartItemID INT IDENTITY(1,1) PRIMARY KEY,
    CartID INT NOT NULL,
    VariantID INT NOT NULL,
    Quantity INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartID) REFERENCES Carts(CartID),
    CONSTRAINT FK_CartItems_ProductVariants FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID),
    CONSTRAINT CHK_CartItems_Qty CHECK (Quantity > 0),
    CONSTRAINT UQ_CartItems_Cart_Variant UNIQUE (CartID, VariantID)
);

CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    OrderPlacedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    OrderStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    PaymentStatus NVARCHAR(10) NOT NULL DEFAULT 'Unpaid',
    Subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    CancellationType NVARCHAR(20) NULL,
    CancellationReason NVARCHAR(255) NULL,
    CancellationRequestedAt DATETIME2 NULL,
    CancellationDecision NVARCHAR(20) NULL,
    CancellationReviewedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT CHK_Orders_PaymentStatus CHECK (PaymentStatus IN ('Unpaid','Paid')),
    CONSTRAINT CHK_Orders_OrderStatus CHECK (OrderStatus IN ('Pending','Confirmed','Processed','Shipped','Delivered','Cancelled')),
    CONSTRAINT CHK_Orders_Subtotal CHECK (Subtotal >= 0),
    CONSTRAINT CHK_Orders_CancellationType
    CHECK (CancellationType IS NULL OR CancellationType IN ('Auto','Request')),
    CONSTRAINT CHK_Orders_CancellationDecision
    CHECK (CancellationDecision IS NULL  OR CancellationDecision IN ('Approved','Rejected')),
    CONSTRAINT CHK_Orders_CancellationRequested CHECK (
    (CancellationType = 'Request' AND CancellationRequestedAt IS NOT NULL)
    OR CancellationType IS NULL OR CancellationType = 'Auto')
);

CREATE TABLE OrderItems (
    OrderItemID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    VariantID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    LineTotal AS (Quantity * UnitPrice),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    CONSTRAINT FK_OrderItems_ProductVariants FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID),
    CONSTRAINT CHK_OrderItems_Qty CHECK (Quantity > 0),
    CONSTRAINT CHK_OrderItems_UnitPrice CHECK (UnitPrice >= 0),
    CONSTRAINT UQ_OrderItems_Order_Variant UNIQUE (OrderID, VariantID)
);

CREATE TABLE Quotes (
    QuoteID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CustomerNotes NVARCHAR(500) NULL,
    TargetPrice DECIMAL(10,2) NULL,
    AdminQuotedTotal DECIMAL(10,2) NULL,
    AdminNotes NVARCHAR(500) NULL,
    RespondedAt DATETIME2 NULL,
    ConvertedOrderID INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Quotes_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Quotes_Orders FOREIGN KEY (ConvertedOrderID) REFERENCES Orders(OrderID),
    CONSTRAINT CHK_Quotes_Status CHECK (Status IN ('Pending','Responded','Accepted','Rejected')),
    CONSTRAINT CHK_Quotes_TargetPrice CHECK (TargetPrice IS NULL OR TargetPrice >= 0),
    CONSTRAINT CHK_Quotes_AdminQuotedTotal CHECK (AdminQuotedTotal IS NULL OR AdminQuotedTotal >= 0),
    CONSTRAINT CHK_Quotes_ConvertedOrder CHECK (NOT (Status = 'Accepted' AND ConvertedOrderID IS NULL))
);

CREATE TABLE QuoteItems (
    QuoteItemID INT IDENTITY(1,1) PRIMARY KEY,
    QuoteID INT NOT NULL,
    VariantID INT NOT NULL,
    Quantity INT NOT NULL,
    RequestedUnitPrice DECIMAL(10,2) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_QuoteItems_Quotes FOREIGN KEY (QuoteID) REFERENCES Quotes(QuoteID),
    CONSTRAINT FK_QuoteItems_ProductVariants FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID),
    CONSTRAINT CHK_QuoteItems_Qty CHECK (Quantity > 0),
    CONSTRAINT CHK_QuoteItems_RequestedUnitPrice CHECK (RequestedUnitPrice IS NULL OR RequestedUnitPrice >= 0),
    CONSTRAINT UQ_QuoteItems_Quote_Variant UNIQUE (QuoteID, VariantID)
);

CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ProductID INT NOT NULL,
    Rating TINYINT NOT NULL,
    ReviewText NVARCHAR(1000) NULL,
    IsApproved BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Reviews_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CHK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT UQ_Reviews_User_Product UNIQUE (UserID, ProductID)
);

CREATE TABLE CustomerQueries (
    QueryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ProductID INT NULL,
    Question NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Open',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_CustomerQueries_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_CustomerQueries_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CHK_CustomerQueries_Status CHECK (Status IN ('Open','Answered','Closed'))
);

CREATE TABLE QueryResponses (
    ResponseID INT IDENTITY(1,1) PRIMARY KEY,
    QueryID INT NOT NULL,
    AdminUserID INT NOT NULL,
    ResponseText NVARCHAR(1000) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_QueryResponses_Queries FOREIGN KEY (QueryID) REFERENCES CustomerQueries(QueryID),
    CONSTRAINT FK_QueryResponses_AdminUser FOREIGN KEY (AdminUserID) REFERENCES Users(UserID),
    CONSTRAINT UQ_QueryResponses_Query UNIQUE (QueryID)
);

CREATE TABLE OrderStatusHistory (
    OrderStatusHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    ChangedByAdminUserID INT NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_OrderStatusHistory_Orders FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    CONSTRAINT FK_OrderStatusHistory_AdminUser FOREIGN KEY (ChangedByAdminUserID) REFERENCES Users(UserID),
    CONSTRAINT CHK_OrderStatusHistory_Status
        CHECK (Status IN ('Pending','Confirmed','Processed','Shipped','Delivered','Cancelled'))
);

-- SEED DATA FOR TRANSACTION TABLES
-- Sample carts, orders, quotes, reviews, queries, and status history

INSERT INTO Carts (UserID, Status)
VALUES
(2,'Active'),   
(3,'Active'); 

INSERT INTO CartItems (CartID, VariantID, Quantity) 
VALUES
(1,2,5),   
(1,3,3);

INSERT INTO CartItems (CartID, VariantID, Quantity)
VALUES
(2,5,6);

INSERT INTO Orders (UserID, OrderStatus, PaymentStatus, Subtotal)
VALUES
(2,'Pending','Unpaid',15500),   
(3,'Shipped','Paid',5600);

INSERT INTO OrderItems (OrderID, VariantID, Quantity, UnitPrice)
VALUES
(1,4,10,1200),  
(1,5,5,700);     

INSERT INTO OrderItems (OrderID, VariantID, Quantity, UnitPrice)
VALUES
(2,6,8,700);  

INSERT INTO Quotes
(UserID, Status, CustomerNotes)
VALUES
(4,'Pending','Need bulk price for upcoming site work');

INSERT INTO Quotes
(UserID, Status, AdminQuotedTotal, AdminNotes, RespondedAt)
VALUES
(2,'Responded',16500,'Bulk discount applied',GETDATE());

INSERT INTO QuoteItems (QuoteID, VariantID, Quantity)
VALUES
(1,1,15),   
(1,7,12);   

INSERT INTO QuoteItems (QuoteID, VariantID, Quantity)
VALUES
(2,8,10); 

INSERT INTO Reviews
(UserID, ProductID, Rating, ReviewText, IsApproved)
VALUES
(3,4,5,'Good finish and consistent color',1),  
(2,4,4,'Good quality grout for floor tiles',0);

INSERT INTO CustomerQueries
(UserID, ProductID, Question, Status)
VALUES
(2, NULL, 'Do you deliver to Lahore construction sites?','Answered');

INSERT INTO CustomerQueries
(UserID, ProductID, Question, Status)
VALUES
(4, 1, 'Are the 2mm clips suitable for large tiles?','Open');

INSERT INTO QueryResponses
(QueryID, AdminUserID, ResponseText)
VALUES
(1,1,'Yes, delivery is available. Admin will update delivery status after dispatch');

INSERT INTO OrderStatusHistory (OrderID, Status, ChangedByAdminUserID)
VALUES
(1,'Pending',1),
(2,'Confirmed',1),
(2,'Shipped',1);

GO

SELECT * FROM Carts
SELECT * FROM CartItems
SELECT * FROM  Orders
SELECT * FROM OrderItems
SELECT * FROM Quotes
SELECT * FROM QuoteItems
SELECT * FROM Reviews
SELECT * FROM CustomerQueries
SELECT * FROM QueryResponses
SELECT * FROM OrderStatusHistory 

-- VERIFICATION QUERIES
-- For creation of tables and seed data

-- SELECT name FROM sys.tables;

 SELECT * FROM Users;
 SELECT * FROM Products;
 SELECT * FROM ProductVariants;
 SELECT * FROM Orders;
 SELECT * FROM OrderStatusHistory;

/*SELECT
    port = CAST(value AS INT)
FROM sys.dm_os_performance_counters
WHERE object_name LIKE '%General%'
AND counter_name = 'Connection Reset/sec';  */ 

USE master;
SELECT local_tcp_port 
FROM sys.dm_exec_connections 
WHERE session_id = @@SPID;

 
-- from readme
USE master;
CREATE LOGIN tradenex_user WITH PASSWORD = 'TradeNex@2024!';
GO

USE TradeNex;
CREATE USER tradenex_user FOR LOGIN tradenex_user;
ALTER ROLE db_datareader ADD MEMBER tradenex_user;
ALTER ROLE db_datawriter ADD MEMBER tradenex_user;
GO

USE TradeNex;
CREATE TABLE RefreshTokens (
    TokenID      INT IDENTITY(1,1) PRIMARY KEY,
    UserID       INT NOT NULL,
    Token        NVARCHAR(500) NOT NULL,
    ExpiresAt    DATETIME NOT NULL,
    CreatedAt    DATETIME DEFAULT GETDATE(),
    IsRevoked    BIT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);