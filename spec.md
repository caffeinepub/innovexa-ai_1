# Innovexa AI

## Current State
Full-stack app with a Motoko backend that calls the Gemini 2.5 Flash API via HTTP outcalls and a React frontend with landing page, mode selection, sign-in, and chat. The AI response parser in `extractLastReply` is unreliable: it walks backwards through all `"text":"` occurrences in the entire JSON response, but Gemini 2.5 Flash includes thinking tokens as `text` fields before the actual reply, causing it to return thinking content or fall through to "Request failed."

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend `extractLastReply`: rewrite to reliably extract the final model reply from Gemini 2.5 Flash's JSON response. The strategy: (1) locate the `"candidates":` array, (2) within it find `"content":`, (3) collect ALL `"text":"` segments after `"content":` and return the LAST non-empty decoded one. This ensures thinking tokens (which come first) are skipped and only the real answer (which comes last) is returned. If that fails, fall back to the last non-empty `"text":"` anywhere in the response.

### Remove
- Nothing

## Implementation Plan
1. Rewrite `extractLastReply` in `main.mo` to use the multi-step strategy:
   - Split on `"candidates":`, take the segment after
   - Split that on `"content":`, take the segment after  
   - Split that on `"text":"`, collect all decoded segments, return the last non-empty one
   - Fallback: split full JSON on `"text":"`, return last non-empty decoded segment
2. Keep all other backend logic (buildRequestJson, thinking budgets, API key, URL) identical
3. Keep all frontend code identical
