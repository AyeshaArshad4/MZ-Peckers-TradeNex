'use strict';

module.exports = {
  ROLES: {
    ADMIN:    'Admin',
    CUSTOMER: 'Customer',
  },

  APPROVAL_STATUS: {
    PENDING:  'PendingApproval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  },

  ORDER_STATUS: {
    PENDING:   'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSED: 'Processed',
    SHIPPED:   'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  },

  PAYMENT_STATUS: {
    UNPAID: 'Unpaid',
    PAID:   'Paid',
  },

  QUOTE_STATUS: {
    PENDING:   'Pending',
    RESPONDED: 'Responded',
    ACCEPTED:  'Accepted',
    REJECTED:  'Rejected',
  },

  CART_STATUS: {
    ACTIVE:    'Active',
    CONVERTED: 'Converted',
    ABANDONED: 'Abandoned',
  },

  QUERY_STATUS: {
    OPEN:     'Open',
    ANSWERED: 'Answered',
    CLOSED:   'Closed',
  },

  // Statuses where customer can still request cancellation
  CANCELLABLE_STATUSES: ['Pending', 'Confirmed'],

  SALT_ROUNDS: 12,

  // 7 days in milliseconds
  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000,

  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT:     100,
};