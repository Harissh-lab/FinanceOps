# Sample Test Data for Recruiters

This folder contains ready-to-import demo files for FinanceOps.

## Files
- `finance_records test data.xlsx`
- `finance_records_test_data.json`

## How to Use
1. Login as `admin@finance.com` or `analyst@finance.com`.
2. Open `Records` page.
3. Choose either sample file from this folder.
4. Click:
   - `Import and Replace` to archive active records and import this dataset, or
   - `Import and Append` to add these rows to current active records.

## Expected Columns
Each row contains:
- `amount`
- `type` (`INCOME` or `EXPENSE`)
- `category`
- `date` (YYYY-MM-DD)
- `notes`
