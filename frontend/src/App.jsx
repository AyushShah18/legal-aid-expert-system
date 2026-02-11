import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showScenarioPopup, setShowScenarioPopup] = useState(false);
  const [selectedScenarioCategory, setSelectedScenarioCategory] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const messagesEndRef = useRef(null);

  const categories = ['All', 'Housing', 'Employment', 'Consumer'];

  const testCases = {
    'Housing': [
      {
        title: 'Landlord Dispute',
        description: 'Tenant rights and rental issues',
        icon: '🏠',
        tags: ['Housing', 'medium']
      },
      {
        title: 'Security Deposit',
        description: 'Deposit return and deductions',
        icon: '💰',
        tags: ['Housing', 'simple']
      },
      {
        title: 'Rent Increase',
        description: 'Unfair rent hikes and rent control',
        icon: '📈',
        tags: ['Housing', 'medium']
      },
      {
        title: 'Maintenance Issues',
        description: 'Repair requests and habitability',
        icon: '🔧',
        tags: ['Housing', 'complex']
      }
    ],
    'Employment': [
      {
        title: 'Wrongful Termination',
        description: 'Unfair dismissal and severance',
        icon: '💼',
        tags: ['Employment', 'complex']
      },
      {
        title: 'Unpaid Wages',
        description: 'Salary and overtime disputes',
        icon: '💵',
        tags: ['Employment', 'medium']
      },
      {
        title: 'Discrimination',
        description: 'Workplace discrimination and harassment',
        icon: '⚖️',
        tags: ['Employment', 'complex']
      },
      {
        title: 'Overtime Pay',
        description: 'Unpaid overtime and work hours',
        icon: '⏰',
        tags: ['Employment', 'medium']
      }
    ],
    'Consumer': [
      {
        title: 'Defective Product',
        description: 'Product returns and warranties',
        icon: '💻',
        tags: ['Consumer', 'simple']
      },
      {
        title: 'False Advertising',
        description: 'Misleading product claims',
        icon: '📢',
        tags: ['Consumer', 'medium']
      },
      {
        title: 'Service Dispute',
        description: 'Poor service and refunds',
        icon: '🔧',
        tags: ['Consumer', 'medium']
      },
      {
        title: 'Contract Cancellation',
        description: 'Breaking service contracts',
        icon: '📋',
        tags: ['Consumer', 'simple']
      }
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

         try {
       // Determine category from input or use default
       let category = 'Consumer'; // Default
       if (inputMessage.toLowerCase().includes('landlord') || inputMessage.toLowerCase().includes('rent') || inputMessage.toLowerCase().includes('tenant') || 
           inputMessage.toLowerCase().includes('deposit') || inputMessage.toLowerCase().includes('maintenance') || inputMessage.toLowerCase().includes('eviction')) {
         category = 'Housing';
       } else if (inputMessage.toLowerCase().includes('employer') || inputMessage.toLowerCase().includes('work') || inputMessage.toLowerCase().includes('job') ||
                  inputMessage.toLowerCase().includes('fired') || inputMessage.toLowerCase().includes('termination') || inputMessage.toLowerCase().includes('salary') ||
                  inputMessage.toLowerCase().includes('wages') || inputMessage.toLowerCase().includes('discrimination')) {
         category = 'Employment';
       } else if (inputMessage.toLowerCase().includes('product') || inputMessage.toLowerCase().includes('purchase') || inputMessage.toLowerCase().includes('refund') ||
                  inputMessage.toLowerCase().includes('warranty') || inputMessage.toLowerCase().includes('advertising') || inputMessage.toLowerCase().includes('service')) {
         category = 'Consumer';
       }
       // For family law, contract law, personal injury, etc. - let backend handle with fallback response

      const response = await axios.post(`${API_BASE}/query`, {
        category: category,
        query: inputMessage
      });

             const botMessage = {
         id: Date.now() + 1,
         type: 'bot',
         content: {
           answer: response.data.answer,
           suggestion: response.data.suggestion,
           reasoning: response.data.reasoning,
           applicable_laws: response.data.applicable_laws,
           action_plan: response.data.action_plan,
           matched_rule: response.data.matched_rule
         },
         timestamp: new Date().toLocaleTimeString()
       };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
             const errorMessage = {
         id: Date.now() + 1,
         type: 'bot',
         content: {
           answer: 'Sorry, I encountered an error processing your request. Please try again.',
           suggestion: 'Check your internet connection and ensure the backend server is running.',
           reasoning: 'Network or server error occurred.',
           applicable_laws: [],
           action_plan: [],
           matched_rule: null
         },
         timestamp: new Date().toLocaleTimeString()
       };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  const openScenarioPopup = async (title) => {
    setSelectedScenarioCategory(title);
    setShowScenarioPopup(true);
    setLoadingScenarios(true);
    
    // Map title to category
    let category = 'Consumer'; // default
    if (title.includes('Landlord') || title.includes('Security') || title.includes('Rent') || title.includes('Maintenance')) {
      category = 'Housing';
    } else if (title.includes('Wrongful') || title.includes('Unpaid') || title.includes('Discrimination') || title.includes('Overtime')) {
      category = 'Employment';
    } else if (title.includes('Defective') || title.includes('False') || title.includes('Service') || title.includes('Contract')) {
      category = 'Consumer';
    }
    
    try {
      console.log('Fetching scenarios for category:', category);
      const response = await axios.post(`${API_BASE}/scenarios`, {
        category: category
      });
      console.log('Scenarios received:', response.data.scenarios);
      if (response.data.scenarios && response.data.scenarios.length > 0) {
        setScenarios(response.data.scenarios);
      } else {
        // Fallback scenarios if none returned from backend
        const fallbackScenarios = [
          {
            title: "General Legal Question",
            description: "Ask about your specific situation",
            query: "I have a legal question about my situation. Can you help me understand my rights and options?"
          }
        ];
        setScenarios(fallbackScenarios);
      }
          } catch (error) {
        console.error('Error fetching scenarios:', error);
        setScenarios([]);
      } finally {
        setLoadingScenarios(false);
      }
  };

  const selectScenario = (scenario) => {
    setInputMessage(scenario.query);
    setShowScenarioPopup(false);
  };

  const getFilteredTestCases = () => {
    if (selectedCategory === 'All') {
      return Object.values(testCases).flat();
    }
    return testCases[selectedCategory] || [];
  };

  // Voice Assistant Functions
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setInputMessage(prev => prev + (prev ? ' ' : '') + finalTranscript);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interimTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };
    
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const speakResponse = (text, sectionId) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // If already speaking this section, stop it
    if (isSpeaking === sectionId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      setIsSpeaking(sectionId);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
         <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)', 
        padding: '1rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginRight: '1rem', color: '#fbbf24' }}>⚖️</div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              Legal Aid Expert System
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
              Get instant legal guidance powered by AI. Understand your rights, discover applicable laws, and learn your next steps.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{ 
          width: '300px', 
          background: 'white', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
                                           <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
             <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center' }}>
               <span style={{ marginRight: '0.5rem' }}>📚</span>
               Example Scenarios
             </h2>
            
            {/* Category Filter */}
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.625rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      ...(selectedCategory === category
                        ? {
                            backgroundColor: '#1e3a8a',
                            color: 'white'
                          }
                        : {
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280'
                          })
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0.75rem' }}>
            {getFilteredTestCases().map((testCase, index) => (
              <div
                key={index}
                onClick={() => openScenarioPopup(testCase.title)}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '1rem', marginRight: '0.5rem' }}>{testCase.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.125rem 0' }}>
                      {testCase.title}
                    </h4>
                    <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>
                      {testCase.description}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {testCase.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        padding: '0.125rem 0.375rem',
                        borderRadius: '9999px',
                        fontSize: '0.5rem',
                        fontWeight: '500',
                        backgroundColor: tag === 'simple' ? '#dcfce7' : tag === 'medium' ? '#fef3c7' : '#fee2e2',
                        color: tag === 'simple' ? '#166534' : tag === 'medium' ? '#92400e' : '#991b1b'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                     {/* Chat Header */}
           <div style={{ 
             padding: '2rem 1.5rem', 
             borderBottom: '1px solid #e5e7eb',
             background: 'white',
             flexShrink: 0
           }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>🔧</span>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    Legal Expert Consultation
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>
                    Professional AI-powered legal guidance
                  </p>
                </div>
              </div>
                             <button
                 onClick={resetChat}
                 style={{
                   padding: '0.5rem 1rem',
                   background: '#f3f4f6',
                   border: '1px solid #e5e7eb',
                   borderRadius: '0.375rem',
                   color: '#6b7280',
                   fontSize: '0.875rem',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                 onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
               >
                 New Chat
               </button>
            </div>
          </div>

                     {/* Chat Messages Area */}
           <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: '350px' }}>
                         {messages.length === 0 && (
               <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#1e3a8a' }}>⚖️</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
                   Welcome to Your Legal Expert
                 </h3>
                 <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto', lineHeight: '1.5' }}>
                   Describe your legal situation and receive expert analysis with applicable laws and actionable next steps.
                 </p>
               </div>
             )}

                         {messages.map((message) => (
               <div key={message.id} style={{ marginBottom: '1rem' }}>
                {message.type === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: '#1e3a8a',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      maxWidth: '70%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4' }}>{message.content}</p>
                    </div>
                  </div>
                ) : (
                                     <div style={{
                     background: '#f8fafc',
                     border: '1px solid #e5e7eb',
                     borderRadius: '0.5rem',
                     padding: '1.25rem',
                     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                   }}>
                                         <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
                       <div style={{ fontSize: '1.5rem', marginRight: '0.75rem', color: '#1e3a8a' }}>⚖️</div>
                                               <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                            Legal Expert Analysis
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            Professional legal guidance
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => speakResponse(message.content.answer, 'main-answer')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              background: isSpeaking === 'main-answer' ? '#ef4444' : '#f3f4f6',
                              color: isSpeaking === 'main-answer' ? 'white' : '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '50%',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: isSpeaking === 'main-answer' ? 0.9 : 1
                            }}
                            title={isSpeaking === 'main-answer' ? "Stop Speaking" : "Read Answer"}
                          >
                            {isSpeaking === 'main-answer' ? '⏹' : '🔊'}
                          </button>
                        </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         background: '#fef3c7',
                         color: '#92400e',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: '500'
                       }}>
                         medium case
                       </span>
                     </div>
                    
                                         <div style={{ marginBottom: '1rem' }}>
                       <p style={{ color: '#374151', lineHeight: '1.5', margin: 0, fontSize: '0.875rem' }}>
                         {message.content.matched_rule ? 
                           "Based on my analysis of your legal query, I've identified the applicable laws and regulations that govern your situation. Here's a comprehensive breakdown of your legal position, the relevant statutory provisions, and the specific steps you should take to protect your rights and achieve the best possible outcome." :
                           "I've reviewed your legal query, but this area falls outside our current scope of expertise. Here's what I can advise based on general legal principles and the importance of seeking professional guidance."
                         }
                       </p>
                     </div>

                                                                 <div style={{
                          background: '#fefce8',
                          border: '1px solid #fde68a',
                          borderRadius: '0.375rem',
                          padding: '0.875rem',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ marginRight: '0.5rem', fontSize: '1.25rem' }}>⚠️</span>
                              <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#92400e', margin: 0 }}>
                                In Simple Terms
                              </h5>
                            </div>
                            <button
                              onClick={() => speakResponse(message.content.answer, 'simple-terms')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                background: isSpeaking === 'simple-terms' ? '#ef4444' : '#f3f4f6',
                                color: isSpeaking === 'simple-terms' ? 'white' : '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '50%',
                                fontSize: '0.625rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isSpeaking === 'simple-terms' ? 0.9 : 1
                              }}
                              title={isSpeaking === 'simple-terms' ? "Stop Speaking" : "Read Simple Terms"}
                            >
                              {isSpeaking === 'simple-terms' ? '⏹' : '🔊'}
                            </button>
                          </div>
                          <p style={{ color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                            {message.content.answer}
                          </p>
                        </div>

                                                                                                                             {message.content.applicable_laws && message.content.applicable_laws.length > 0 && (
                       <div style={{ marginBottom: '0.75rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                           <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                             Applicable Laws & Regulations
                           </h5>
                           <button
                             onClick={() => speakResponse(
                               message.content.applicable_laws.map(law => `${law.name}, ${law.section}: ${law.description}`).join('. '),
                               'applicable-laws'
                             )}
                             style={{
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               width: '24px',
                               height: '24px',
                               background: isSpeaking === 'applicable-laws' ? '#ef4444' : '#f3f4f6',
                               color: isSpeaking === 'applicable-laws' ? 'white' : '#6b7280',
                               border: '1px solid #d1d5db',
                               borderRadius: '50%',
                               fontSize: '0.625rem',
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               opacity: isSpeaking === 'applicable-laws' ? 0.9 : 1
                             }}
                             title={isSpeaking === 'applicable-laws' ? "Stop Speaking" : "Read Laws"}
                           >
                             {isSpeaking === 'applicable-laws' ? '⏹' : '🔊'}
                           </button>
                         </div>
                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                           {message.content.applicable_laws.map((law, index) => (
                             <div key={index} style={{
                               background: 'white',
                               border: '1px solid #e5e7eb',
                               borderRadius: '0.375rem',
                               padding: '1rem'
                             }}>
                                                             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                 <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', marginRight: '0.5rem' }}></div>
                                 <h6 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a', margin: 0 }}>
                                   {law.name}
                                 </h6>
                                 <span style={{
                                   padding: '0.25rem 0.5rem',
                                   background: '#f3f4f6',
                                   color: '#6b7280',
                                   borderRadius: '9999px',
                                   fontSize: '0.75rem',
                                   marginLeft: '0.5rem'
                                 }}>
                                   {law.section}
                                 </span>
                               </div>
                               <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5', margin: 0 }}>
                                 {law.description}
                               </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                                                                   {message.content.action_plan && message.content.action_plan.length > 0 && (
                        <div style={{ 
                          marginTop: '0.75rem',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '0.375rem',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', margin: 0 }}>
                              Action Plan
                            </h5>
                            <button
                              onClick={() => speakResponse(
                                message.content.action_plan.join('. '),
                                'action-plan'
                              )}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                background: isSpeaking === 'action-plan' ? '#ef4444' : '#f3f4f6',
                                color: isSpeaking === 'action-plan' ? 'white' : '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '50%',
                                fontSize: '0.625rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isSpeaking === 'action-plan' ? 0.9 : 1
                              }}
                              title={isSpeaking === 'action-plan' ? "Stop Speaking" : "Read Action Plan"}
                            >
                              {isSpeaking === 'action-plan' ? '⏹' : '🔊'}
                            </button>
                          </div>
                                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {message.content.action_plan.map((action, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  background: '#16a34a', 
                                  borderRadius: '50%', 
                                  marginTop: '0.5rem',
                                  flexShrink: 0
                                }}></div>
                                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5', margin: 0 }}>
                                  {action}
                                </p>
                              </div>
                            ))}
                          </div>
                       </div>
                     )}
                  </div>
                )}
              </div>
            ))}

                         {isLoading && (
               <div style={{
                 background: '#f8fafc',
                 border: '1px solid #e5e7eb',
                 borderRadius: '0.5rem',
                 padding: '1.25rem',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.75rem'
               }}>
                                 <div style={{ position: 'relative' }}>
                   <div style={{ width: '24px', height: '24px', border: '2px solid #e5e7eb', borderRadius: '50%' }}></div>
                   <div style={{ 
                     position: 'absolute', 
                     top: 0, 
                     left: 0, 
                     width: '24px', 
                     height: '24px', 
                     border: '2px solid #1e3a8a', 
                     borderRadius: '50%', 
                     borderTopColor: 'transparent', 
                     animation: 'spin 1s linear infinite' 
                   }}></div>
                 </div>
                                 <div>
                   <p style={{ color: '#374151', fontWeight: '500', margin: 0, fontSize: '1rem' }}>Analyzing your legal query...</p>
                   <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Searching our knowledge base</p>
                 </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

                     {/* Input Area */}
           <div style={{ 
             padding: '0.75rem', 
             borderTop: '1px solid #e5e7eb',
             background: 'white',
             flexShrink: 0
           }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                Ask Your Legal Question
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                Provide detailed information about your situation for the most accurate legal guidance
              </p>
            </div>

                         <div style={{ marginBottom: '0.75rem' }}>
                               <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                     <textarea
                     value={inputMessage + (interimTranscript ? ' ' + interimTranscript : '')}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Describe your legal situation in detail..."
                     style={{
                       flex: 1,
                       minHeight: '60px',
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '0.375rem',
                       fontSize: '0.875rem',
                       lineHeight: '1.4',
                       resize: 'vertical',
                       outline: 'none',
                       transition: 'border-color 0.2s ease',
                       color: interimTranscript ? '#6b7280' : '#374151'
                     }}
                     onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                     onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                   />
                 <button
                   onClick={isListening ? stopListening : startListening}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     width: '40px',
                     height: '40px',
                     background: isListening ? '#ef4444' : '#f3f4f6',
                     color: isListening ? 'white' : '#6b7280',
                     border: '1px solid #d1d5db',
                     borderRadius: '50%',
                     fontSize: '1rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     opacity: isListening ? 0.9 : 1,
                     boxShadow: isListening ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none'
                   }}
                   title={isListening ? "Stop Recording" : "Voice Input"}
                 >
                   {isListening ? '⏹' : '🎤'}
                 </button>
                 <button
                   onClick={sendMessage}
                   disabled={!inputMessage.trim() || isLoading}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.375rem',
                     padding: '0.75rem 1rem',
                     background: '#1e3a8a',
                     color: 'white',
                     border: 'none',
                     borderRadius: '0.375rem',
                     fontSize: '0.875rem',
                     fontWeight: '600',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1,
                     whiteSpace: 'nowrap',
                     height: 'fit-content'
                   }}
                   onMouseEnter={(e) => {
                     if (inputMessage.trim() && !isLoading) {
                       e.target.style.background = '#1e40af';
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (inputMessage.trim() && !isLoading) {
                       e.target.style.background = '#1e3a8a';
                     }
                   }}
                 >
                   <span>📤</span>
                   Get Expert Analysis
                 </button>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
                 <div style={{ color: '#6b7280', fontSize: '0.625rem' }}>
                   {inputMessage.length}/1000
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Scenario Popup */}
      {showScenarioPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {selectedScenarioCategory} Scenarios
              </h3>
              <button
                onClick={() => setShowScenarioPopup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Select a scenario or customize your own query:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {loadingScenarios ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                  <p style={{ color: '#6b7280' }}>Loading scenarios...</p>
                </div>
              ) : scenarios.map((scenario, index) => (
                <div
                  key={index}
                  onClick={() => selectScenario(scenario)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                    {scenario.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                    {scenario.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', margin: 0 }}>
                    {scenario.query}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                Customize Your Query
              </h4>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your specific situation..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '0.75rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowScenarioPopup(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowScenarioPopup(false);
                    sendMessage();
                  }}
                  disabled={!inputMessage.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#1e3a8a',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    opacity: inputMessage.trim() ? 1 : 0.5
                  }}
                >
                  Get Expert Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
