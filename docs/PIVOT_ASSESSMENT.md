# Product pivot and architecture assessment

## The issue found

The reported single-step browser jobs were a real defect, not user error. The previous design could mark a Playwright codegen file as complete while the recorder was still writing it. It also rewrote volatile Bing flows into a one-step search and then replaced the visible raw step list with that optimized output.

## Repair shipped

- A browser recording remains **Recording** while the UI polls. Only the recorder process closing can promote a completed capture.
- Each new capture writes to a unique temporary file, then promotes atomically. A failed re-record keeps the prior completed capture.
- Raw captured steps and optimized runnable steps are separate durable fields. The UI presents the original capture and explicitly displays both counts.
- The default optimizer only removes identical consecutive navigation/form-entry actions. It no longer silently converts a Bing journey into a one-step template.
- Popup/new-tab actions are included in the capture review.

## New local-productivity lane

```text
Existing resume (.docx/.txt/.md) + job description
                 ↓
   local text extraction and requirement comparison
                 ↓
  evidenced / not-evidenced matrix + human selection
                 ↓
   separate Word-compatible review copy + proof JSON
```

The original resume is not modified. The generated DOCX contains selected review notes and the original content, so the user stays responsible for all factual changes. Deleting the local analysis removes its generated exports.

## Why direct macOS Word control is deferred

The Electron shell currently has no trusted IPC or macOS permission flow. AppleScript/Word control would require Microsoft Word installed, macOS Automation approval, narrow path/action allowlists, audit events, and a separate test plan. It is not represented as working.

## Stock dashboard decision

The dashboard requires two independently reliable inputs: company fundamentals and price history for technical calculations. A read-only validation found that the SEC public endpoint is reachable for US filing facts, while the attempted no-key price sources returned anti-bot pages. Therefore no “thorough live stock analysis” is shipped yet.

Before implementation, the app needs a vetted, terms-compliant price-history provider, a source/freshness/provenance model, a US-market scope decision, caching/rate limits, and a prominent educational—not-investment-advice—boundary. A static mock would be labelled as a layout demo only, not a stock analysis tool.

## Delivery order

1. **Complete:** recorder reliability repair and truthful raw/optimized review.
2. **Complete:** local Resume Alignment proof and DOCX export.
3. **Gated:** live stock fundamentals/technicals dashboard after approved source validation.
4. **Later:** explicit opt-in macOS Word adapter with permission, audit, and rollback controls.
