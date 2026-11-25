import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ArrowDown, 
  AlertCircle,
  Menu,
  X,
  Code2
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Explain React useEffect with an example",
  "Teach me Python functions",
  "Test my JavaScript knowledge",
  "Help me understand REST APIs",
  "Explain linked lists in simple terms",
  "Create a beginner-friendly DSA learning plan"
];

// Helper component for Code Block with Copy button
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#070b14] text-xs font-mono">
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-indigo-100">
          <pre {...props}>
            <code>{children}</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs" {...props}>
      {children}
    </code>
  );
};

const TutorPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proficiency, setProficiency] = useState(user?.experience_level || 'Beginner');
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/tutor/history');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConversationId(convId);
    setSidebarOpen(false);
    setError('');
    try {
      setLoading(true);
      const res = await api.get(`/tutor/history/${convId}`);
      setMessages(res.data.messages || []);
      if (res.data.proficiency_level) {
        setProficiency(res.data.proficiency_level);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load messages for this conversation.');
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError('');
    setSidebarOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/tutor/history/${convId}`);
      setConversations(prev => prev.filter(c => c.conversation_id !== convId));
      if (activeConversationId === convId) {
        startNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    setError('');

    // Optimistically append user message to UI
    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/tutor/chat', {
        conversation_id: activeConversationId,
        message: text,
        proficiency_level: proficiency
      });

      const { conversation_id, message: assistantMsg } = res.data;
      setActiveConversationId(conversation_id);
      setMessages(prev => [...prev, assistantMsg]);

      // Refresh conversations list to update titles & last message
      fetchConversations();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'SkillGraph AI Assistant failed to respond. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl border border-slate-800 bg-[#090e1a] overflow-hidden shadow-2xl relative">
      {/* Top Chat Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>SkillGraph AI Assistant</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400">Powered by Groq High-Speed LLM Inference</p>
          </div>
        </div>

        {/* Proficiency calibrated dropdown */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400">Calibrated for:</span>
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Beginner">Beginner Level</option>
            <option value="Intermediate">Intermediate Level</option>
            <option value="Advanced">Advanced Level</option>
          </select>
        </div>
      </div>

      {/* Main Area: Sidebar + Messages Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat History Left Sidebar */}
        <div className={`
          absolute md:relative z-30 inset-y-0 left-0 w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* New Chat Button */}
          <div className="p-3 border-b border-slate-800">
            <button
              onClick={startNewConversation}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingHistory ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading history...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = conv.conversation_id === activeConversationId;
                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => selectConversation(conv.conversation_id)}
                    className={`group w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                      <span className="truncate">{conv.title || 'Conversation'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => deleteConversation(conv.conversation_id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 text-xs text-slate-500">
                No past conversations. Start a fresh chat!
              </div>
            )}
          </div>
        </div>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 z-20"
          />
        )}

        {/* Conversation Stream Area */}
        <div className="flex-1 flex flex-col bg-[#070b15] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.length === 0 ? (
              /* Welcome Prompt Screen */
              <div className="max-w-xl mx-auto py-8 sm:py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">How can I help you learn today?</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Ask any programming question, request step-by-step code breakdowns, or explore interview questions.
                </p>

                {/* Suggested Prompt Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 text-xs text-slate-300 transition-all flex items-center justify-between group"
                    >
                      <span className="line-clamp-2">{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages stream */
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start gap-3 max-w-3xl ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                        : 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    }`}>
                      {isUser ? (user?.name ? user.name[0] : 'U') : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[78%] ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0">
                          <ReactMarkdown components={{ code: CodeBlock }}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex items-start gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>SkillGraph AI Assistant is formulating response...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/70">
            <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-2 focus-within:border-indigo-500 transition-colors shadow-lg">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask technical question, paste code to debug, or request an explanation... (Press Enter to send)"
                className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-none p-2 max-h-32 min-h-[38px]"
              />

              <button
                type="button"
                disabled={!inputMessage.trim() || loading}
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Shift + Enter for new line • Explanations calibrated for {proficiency} level
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;
