# Legal Aid Expert System - Backend

A FastAPI-based expert system that provides legal guidance for Consumer Rights, Rental Laws, and Employment Issues using NLP and rule-based inference.

## Features

- **NLP Processing**: Uses spaCy for keyword extraction and natural language understanding
- **Rule-Based Inference**: IF-THEN rules for legal guidance
- **RESTful API**: FastAPI endpoints for query processing
- **CORS Support**: Configured for frontend integration
- **Comprehensive Legal Rules**: Covers Consumer, Rental, and Employment law

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

### 3. Run the Server

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### GET /
- **Description**: Root endpoint
- **Response**: API information

### GET /categories
- **Description**: Get available legal categories
- **Response**: List of categories (Consumer, Rental, Employment)

### POST /query
- **Description**: Process legal query
- **Request Body**:
  ```json
  {
    "category": "Consumer",
    "query": "My product is defective"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "Under the Consumer Protection Act...",
    "suggestion": "Contact the seller in writing...",
    "reasoning": "Your query contains keywords...",
    "matched_rule": "C001"
  }
  ```

### GET /health
- **Description**: Health check endpoint
- **Response**: Server status and rules count

## Legal Categories

### Consumer Rights
- Defective products
- Delivery issues
- Warranty problems

### Rental Laws
- Deposit return issues
- Rent increases
- Eviction procedures

### Employment Issues
- Unpaid salary
- Experience certificates
- Termination
- Overtime compensation

## Technical Details

- **Framework**: FastAPI
- **NLP Library**: spaCy
- **Rule Engine**: Custom Python implementation
- **Data Format**: JSON-based rules
- **CORS**: Enabled for frontend integration

## File Structure

```
backend/
├── app.py              # Main FastAPI application
├── rules.json          # Legal rules database
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Error Handling

- Invalid queries return appropriate error messages
- No matching rules provide fallback responses
- Network errors are handled gracefully

## Security Notes

- This is for educational purposes only
- Not intended for real legal advice
- All responses include appropriate disclaimers 