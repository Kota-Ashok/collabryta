# Collabryta Backend

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations (if Alembic is set up) or let the app create tables (current setup uses auto-create for dev).
   *Note: For production, initialize Alembic.*

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Structure

- `app/main.py`: Application entry point.
- `app/api/`: API endpoints.
- `app/core/`: Settings and security.
- `app/db/`: Database connection.
- `app/models/`: Database models.
- `app/schemas/`: Pydantic schemas.
- `app/services/`: Business logic.
- `tests/`: Unit tests.

## Testing

Run tests with:
```bash
pytest
```
