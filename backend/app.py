from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import spacy
import re
from typing import List, Optional

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

app = FastAPI(title="Legal Aid Expert System", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load legal rules from JSON file
def load_rules():
    try:
        with open("rules.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Pydantic models for request/response
class QueryRequest(BaseModel):
    category: str
    query: str

class QueryResponse(BaseModel):
    answer: str
    suggestion: str
    reasoning: str
    applicable_laws: List[dict]
    action_plan: List[str]
    matched_rule: Optional[str] = None

class ScenarioRequest(BaseModel):
    category: str

class ScenarioResponse(BaseModel):
    scenarios: List[dict]

# Global variable to store rules
RULES = load_rules()

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text using spaCy NLP"""
    doc = nlp(text.lower())
    
    # Extract nouns, verbs, and adjectives
    keywords = []
    for token in doc:
        if token.pos_ in ['NOUN', 'VERB', 'ADJ'] and not token.is_stop:
            keywords.append(token.lemma_)
    
    # Also extract multi-word phrases
    for chunk in doc.noun_chunks:
        keywords.append(chunk.text.lower())
    
    # Add original words for better matching
    for token in doc:
        if not token.is_stop and len(token.text) > 2:
            keywords.append(token.text.lower())
    
    return list(set(keywords))

def calculate_similarity(query_keywords: List[str], rule_keywords: List[str]) -> float:
    """Calculate similarity between query keywords and rule keywords"""
    if not query_keywords or not rule_keywords:
        return 0.0
    
    # Count exact matches (highest weight)
    exact_matches = sum(1 for qk in query_keywords for rk in rule_keywords if qk == rk)
    
    # Count partial matches (lower weight)
    partial_matches = sum(1 for qk in query_keywords for rk in rule_keywords 
                         if qk in rk or rk in qk)
    
    # Count word overlap (lowest weight)
    query_words = set()
    for keyword in query_keywords:
        query_words.update(keyword.split())
    
    rule_words = set()
    for keyword in rule_keywords:
        rule_words.update(keyword.split())
    
    word_overlap = len(query_words.intersection(rule_words))
    
    # Calculate weighted similarity score with stricter weighting
    total_possible = max(len(query_keywords), len(rule_keywords))
    if total_possible == 0:
        return 0.0
    
    # Give much higher weight to exact matches, lower to partial/overlap
    similarity = (exact_matches * 5 + partial_matches * 2 + word_overlap) / (total_possible * 5)
    
    return min(similarity, 1.0)  # Cap at 1.0

def find_best_rule(query: str, category: str) -> Optional[dict]:
    """Find the best matching rule for the query"""
    query_keywords = extract_keywords(query)
    
    best_rule = None
    best_score = 0.0
    
    for rule in RULES:
        # Check if category matches
        if rule["category"].lower() != category.lower():
            continue
        
        # Calculate similarity score
        score = calculate_similarity(query_keywords, rule["keywords"])
        
        # Increase threshold to avoid false matches
        if score > best_score and score > 0.3:  # Increased minimum threshold
            best_score = score
            best_rule = rule
    
    return best_rule

@app.get("/")
async def root():
    return {"message": "Legal Aid Expert System API", "version": "1.0.0"}

@app.get("/categories")
async def get_categories():
    """Get available legal categories"""
    categories = list(set(rule["category"] for rule in RULES))
    return {"categories": categories}

@app.post("/scenarios", response_model=ScenarioResponse)
async def get_scenarios(request: ScenarioRequest):
    scenarios = []
    
    # Map frontend category names to backend category names
    category_mapping = {
        'landlord': 'Housing',
        'housing': 'Housing',
        'rental': 'Housing',
        'tenant': 'Housing',
        'employment': 'Employment',
        'work': 'Employment',
        'job': 'Employment',
        'consumer': 'Consumer',
        'product': 'Consumer',
        'purchase': 'Consumer'
    }
    
    # Determine the actual category
    request_category = request.category.lower()
    actual_category = category_mapping.get(request_category, request.category)
    
    # Get scenarios for the category
    for rule in RULES:
        if rule["category"].lower() == actual_category.lower() and "scenarios" in rule:
            scenarios.extend(rule["scenarios"])
    
    # If no scenarios found, return scenarios from all categories
    if not scenarios:
        for rule in RULES:
            if "scenarios" in rule:
                scenarios.extend(rule["scenarios"])
    
    return ScenarioResponse(scenarios=scenarios)

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process legal query and return expert advice"""
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Check for family law, contract law, personal injury, etc. that we don't cover
    query_lower = request.query.lower()
    family_keywords = ['custody', 'divorce', 'spouse', 'ex-spouse', 'child', 'parenting', 'visitation', 'alimony']
    contract_keywords = ['business contract', 'breach of contract', 'contract violation', 'agreement']
    personal_injury_keywords = ['car accident', 'injury', 'damages', 'compensation', 'insurance']
    
    # If query contains family law keywords, return fallback immediately
    if any(keyword in query_lower for keyword in family_keywords):
        return QueryResponse(
            answer="I apologize, but I don't have sufficient legal knowledge or specific rules in our database to provide a comprehensive analysis of your family law situation. Family law matters like custody agreements, divorce, and parenting arrangements require specialized legal expertise.",
            suggestion="I strongly recommend consulting with a qualified family law attorney who can provide personalized legal advice based on your specific circumstances and the family laws applicable in your jurisdiction.",
            reasoning="Family law queries fall outside our current scope of expertise. This area requires specialized legal knowledge and jurisdiction-specific guidance.",
            applicable_laws=[],
            action_plan=[
                "Schedule a consultation with a qualified family law attorney",
                "Gather all custody agreements and court documents",
                "Document all violations of the custody agreement",
                "Research local family law legal aid services",
                "Consider seeking referrals from family law bar associations"
            ],
            matched_rule=None
        )
    
    # If query contains contract law keywords, return fallback immediately
    if any(keyword in query_lower for keyword in contract_keywords):
        return QueryResponse(
            answer="I apologize, but I don't have sufficient legal knowledge or specific rules in our database to provide a comprehensive analysis of your contract law situation. Contract disputes and business law matters require specialized legal expertise.",
            suggestion="I strongly recommend consulting with a qualified business law attorney who can provide personalized legal advice based on your specific circumstances and the contract laws applicable in your jurisdiction.",
            reasoning="Contract law queries fall outside our current scope of expertise. This area requires specialized legal knowledge and jurisdiction-specific guidance.",
            applicable_laws=[],
            action_plan=[
                "Schedule a consultation with a qualified business law attorney",
                "Gather all contract documents and communications",
                "Document all breaches and damages",
                "Research local business law legal aid services",
                "Consider seeking referrals from business law bar associations"
            ],
            matched_rule=None
        )
    
    # If query contains personal injury keywords, return fallback immediately
    if any(keyword in query_lower for keyword in personal_injury_keywords):
        return QueryResponse(
            answer="I apologize, but I don't have sufficient legal knowledge or specific rules in our database to provide a comprehensive analysis of your personal injury situation. Personal injury and accident cases require specialized legal expertise.",
            suggestion="I strongly recommend consulting with a qualified personal injury attorney who can provide personalized legal advice based on your specific circumstances and the personal injury laws applicable in your jurisdiction.",
            reasoning="Personal injury law queries fall outside our current scope of expertise. This area requires specialized legal knowledge and jurisdiction-specific guidance.",
            applicable_laws=[],
            action_plan=[
                "Schedule a consultation with a qualified personal injury attorney",
                "Gather all medical records and accident documentation",
                "Document all injuries and damages",
                "Research local personal injury legal aid services",
                "Consider seeking referrals from personal injury bar associations"
            ],
            matched_rule=None
        )
    
    # Find the best matching rule for covered areas
    best_rule = find_best_rule(request.query, request.category)
    
    # Debug logging
    print(f"Query: {request.query}")
    print(f"Category: {request.category}")
    print(f"Best rule found: {best_rule['rule_id'] if best_rule else 'None'}")
    
    if best_rule:
        return QueryResponse(
            answer=best_rule["answer"],
            suggestion=best_rule["suggestion"],
            reasoning=best_rule["reasoning"],
            applicable_laws=best_rule.get("applicable_laws", []),
            action_plan=best_rule.get("action_plan", []),
            matched_rule=best_rule["rule_id"]
        )
    else:
        # No matching rule found - provide professional fallback response
        return QueryResponse(
            answer="I apologize, but I don't have sufficient legal knowledge or specific rules in our database to provide a comprehensive analysis of your situation. This area of law may be outside our current scope or may require specialized legal expertise.",
            suggestion="I strongly recommend consulting with a qualified lawyer who specializes in this area of law. They can provide personalized legal advice based on your specific circumstances and the laws applicable in your jurisdiction.",
            reasoning="No matching rule found in our knowledge base for the given category and keywords. This indicates the query falls outside our current areas of expertise.",
            applicable_laws=[],
            action_plan=[
                "Schedule a consultation with a qualified legal professional",
                "Gather all relevant documentation and evidence",
                "Research local legal aid services if cost is a concern",
                "Document all communications and events related to your case",
                "Consider seeking referrals from local bar associations"
            ],
            matched_rule=None
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "rules_loaded": len(RULES)}

@app.get("/test-scenarios")
async def test_scenarios():
    """Test endpoint to check scenarios for all categories"""
    all_scenarios = {}
    for rule in RULES:
        if "scenarios" in rule:
            category = rule["category"]
            if category not in all_scenarios:
                all_scenarios[category] = []
            all_scenarios[category].extend(rule["scenarios"])
    return {"scenarios_by_category": all_scenarios}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
