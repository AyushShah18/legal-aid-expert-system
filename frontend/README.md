# Legal Aid Expert System - Frontend

A beautiful, modern React application for the Legal Aid Expert System with a chat-style interface for legal guidance.

## Features

- **Modern UI**: Clean, professional design with Tailwind CSS
- **Chat Interface**: Real-time conversation with the legal expert system
- **Category Selection**: Choose from Consumer, Rental, or Employment law
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Smooth animations and loading indicators
- **Error Handling**: Graceful error handling with user-friendly messages

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Usage

1. **Select Category**: Choose from Consumer Rights, Rental Laws, or Employment Issues
2. **Ask Questions**: Type your legal query in natural language
3. **Get Expert Advice**: Receive structured responses with:
   - Legal Answer (green bubble)
   - Next Steps (yellow bubble)
   - Reasoning (gray bubble)
4. **Reset Chat**: Clear conversation history with the reset button

## Technical Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Custom styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## API Integration

The frontend communicates with the backend API at `http://localhost:8000`:

- **POST /query**: Send legal queries for processing
- **GET /categories**: Fetch available legal categories
- **GET /health**: Check backend health status

## Features in Detail

### Chat Interface
- Real-time message display
- Auto-scroll to latest messages
- Message timestamps
- Loading indicators during processing

### Category Selection
- Dropdown menu for legal categories
- Visual feedback for selected category
- Responsive design for mobile devices

### Message Types
- **User Messages**: Blue bubbles on the right
- **Bot Responses**: Structured cards with:
  - Legal Answer (green)
  - Next Steps (yellow)
  - Reasoning (gray)

### Error Handling
- Network error detection
- User-friendly error messages
- Graceful fallbacks

## Styling

The application uses Tailwind CSS for styling with:
- Soft color palette (grays, blues, greens)
- Rounded corners and shadows
- Smooth transitions and animations
- Responsive breakpoints
- Custom scrollbars

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Variables

No environment variables required for basic setup. The backend URL is hardcoded to `http://localhost:8000`.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend server is running on port 8000
   - Check CORS configuration
   - Verify network connectivity

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes only. Not intended for real legal advice.
