---
rule_set: Invoice routing policy
version: 1.0
no_touch_amount_limit: 5000
require_purchase_order: true
require_internal_mapping: true
enforce_mapped_po_allowance: true
---

# Invoice routing business rules

This document is the business-readable source of truth for the local demo. The background worker parses the configuration above before routing a queue batch.

1. Every invoice needs a purchase-order number.
2. Every invoice must have a matching supplier + purchase-order entry in the internal mapping workbook.
3. Invoices over the no-touch amount limit are routed to ExceptionDesk.
4. An invoice may not exceed its mapped purchase-order allowance.
5. Records that meet every rule are mapped to ERP fields and loaded to FinanceHub. Every other record retains its reason and is routed to ExceptionDesk.

Change the configuration only through review and UAT. A production version would keep this document under approval, versioning, and change-control policy.
