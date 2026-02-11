# Legal Aid Expert System

A comprehensive rule-based expert system that provides legal guidance for Consumer Rights, Rental Laws, and Employment Issues. Built with modern web technologies and AI-powered natural language processing.

## 🎯 Project Overview

The Legal Aid Expert System is an intelligent chatbot that helps users understand their legal rights and provides guidance on common legal issues. It uses NLP (Natural Language Processing) and rule-based inference to analyze user queries and provide structured legal advice.

### Key Features

- **🤖 AI-Powered**: Uses spaCy NLP for intelligent query understanding
- **📋 Rule-Based**: Comprehensive IF-THEN rules for legal guidance
- **💬 Chat Interface**: Modern, responsive chat UI with real-time responses
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **⚖️ Legal Categories**: Covers Consumer Rights, Rental Laws, and Employment Issues
- **🎨 Beautiful UI**: Clean, professional design with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend│ ◄──────────────► │  FastAPI Backend│
│   (Port 5173)   │                 │   (Port 8000)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Tailwind CSS  │                 │   spaCy NLP     │
│   Chat UI       │                 │   Rule Engine   │
└─────────────────┘                 └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AIIndividualProject
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```

The backend will start at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📋 Legal Categories Covered

### 🛒 Consumer Rights
- **Defective Products**: Refunds, replacements, warranty claims
- **Delivery Issues**: Late deliveries, missing packages
- **Warranty Problems**: Expired warranties, repair services

### 🏠 Rental Laws
- **Deposit Issues**: Non-returned deposits, deductions
- **Rent Increases**: Unfair hikes, rent control
- **Eviction**: Notice periods, illegal evictions

### 💼 Employment Issues
- **Unpaid Salary**: Delayed payments, wage disputes
- **Experience Certificates**: Non-issuance, relieving letters
- **Termination**: Wrongful dismissal, notice periods
- **Overtime**: Unpaid overtime, compensation rates

## 🎨 User Interface

### Features
- **Category Selection**: Dropdown to choose legal area
- **Chat Interface**: Real-time conversation with the system
- **Structured Responses**: Three-part responses with:
  - 💡 **Legal Answer**: Direct legal guidance
  - 📋 **Next Steps**: Actionable recommendations
  - 🔍 **Reasoning**: Explanation of why the rule applies
- **Loading States**: Smooth animations during processing
- **Error Handling**: Graceful error messages
- **Reset Functionality**: Clear chat history

### Design Principles
- **Professional**: Clean, trustworthy appearance
- **Accessible**: Easy to use for all users
- **Responsive**: Works on all device sizes
- **Intuitive**: Clear navigation and feedback

## 🔧 Technical Implementation

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance API
- **NLP**: spaCy for natural language processing
- **Rule Engine**: Custom Python implementation
- **CORS**: Configured for frontend integration
- **Error Handling**: Comprehensive error management

### Frontend (React + Vite)
- **Framework**: React 19 with modern hooks
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for utility-first design
- **HTTP Client**: Axios for API communication
- **State Management**: React hooks for local state

### NLP Processing
1. **Keyword Extraction**: spaCy extracts relevant terms
2. **Similarity Matching**: Compares query with rule keywords
3. **Rule Selection**: Finds best matching legal rule
4. **Response Generation**: Returns structured legal advice

## 📊 API Endpoints

### Backend API (`http://localhost:8000`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/categories` | GET | Available legal categories |
| `/query` | POST | Process legal query |
| `/health` | GET | Health check |

### Example API Usage

```bash
# Get categories
curl http://localhost:8000/categories

# Process query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Consumer",
    "query": "My product is defective"
  }'
```

## 🧪 Testing the System

### Sample Queries

**Consumer Rights:**
- "My phone stopped working after 2 months"
- "The delivery is 3 days late"
- "Warranty expired but product is faulty"

**Rental Laws:**
- "Landlord didn't return my deposit"
- "Rent increased by 50%"
- "Got eviction notice with only 7 days"

**Employment Issues:**
- "Salary not paid for 2 months"
- "Company refused to give experience letter"
- "Fired without any notice"

## 🔒 Security & Disclaimers

### Important Notes
- ⚠️ **Educational Use Only**: This system is for educational purposes
- ⚖️ **Not Legal Advice**: Not a substitute for professional legal counsel
- 📚 **General Information**: Provides general legal information only
- 🔍 **Consult Professionals**: Always consult qualified lawyers for specific cases

### Data Privacy
- No personal data is stored
- Queries are processed in real-time
- No persistent user sessions

## 🛠️ Development

### Project Structure
```
AIIndividualProject/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── rules.json          # Legal rules database
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Custom styles
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

### Adding New Rules

1. Edit `backend/rules.json`
2. Add new rule with:
   - `rule_id`: Unique identifier
   - `category`: Legal category
   - `keywords`: Relevant keywords
   - `answer`: Legal guidance
   - `suggestion`: Next steps
   - `reasoning`: Explanation

### Customization

- **Styling**: Modify `frontend/src/App.css`
- **Rules**: Update `backend/rules.json`
- **NLP**: Adjust similarity thresholds in `backend/app.py`
- **UI**: Customize components in `frontend/src/App.jsx`

## 🚨 Troubleshooting

### Common Issues

1. **Backend Won't Start**
   - Check Python version (3.8+)
   - Install dependencies: `pip install -r requirements.txt`
   - Download spaCy model: `python -m spacy download en_core_web_sm`

2. **Frontend Won't Start**
   - Check Node.js version (16+)
   - Install dependencies: `npm install`
   - Clear cache: `npm run dev -- --force`

3. **API Connection Errors**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify network connectivity

4. **No Matching Rules**
   - Check query keywords
   - Verify category selection
   - Review rule database

## 🔮 Future Enhancements

- [ ] **Machine Learning**: Train custom models for better understanding
- [ ] **Database Integration**: Store conversation history
- [ ] **Multi-language Support**: Support for multiple languages
- [ ] **Document Upload**: Allow users to upload legal documents
- [ ] **Voice Interface**: Speech-to-text and text-to-speech
- [ ] **Advanced Analytics**: Track common legal issues
- [ ] **Integration APIs**: Connect with legal service providers

## 📝 License

This project is developed for educational purposes as part of a college AI project. Not intended for commercial use or real legal advice.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review the documentation
- Open an issue on GitHub

---

**⚖️ Ready to provide legal guidance! Start the system and begin helping users with their legal questions.** 