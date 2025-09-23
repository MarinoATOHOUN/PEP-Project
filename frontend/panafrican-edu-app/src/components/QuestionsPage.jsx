import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  User,
  ChevronUp,
  ChevronDown,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/context/AuthContext';
import { questionsService } from '@/services/api';

// Liste locale pour les filtres (si l'API ne fournit pas encore ces listes)
const subjects = [
  'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique', 'Économie', 'Histoire', 'Anglais', 'Français', 'Autre'
];
const levels = ['Lycée', "Licence/Bachelor", 'Master', 'Doctorat'];
const countries = ['Tous les pays', 'Algérie', 'Maroc', 'Tunisie', 'Côte d\'Ivoire', 'Nigeria', 'Kenya', 'Ghana', 'Afrique du Sud'];

const QuestionsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Remplacer le tableau statique par des données provenant de l'API
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal / édition markdown
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', subject: '', level: '' });

  // Expansion des questions / affichage détails
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [questionDetails, setQuestionDetails] = useState({});
  const [answerDrafts, setAnswerDrafts] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionsService.getQuestions({ per_page: 50 });
      // Normalize fields to avoid NaN
      const normalized = (res.questions || []).map(q => ({
        ...q,
        votes: Number(q.votes) || 0,
        answers: Number(q.answers) || q.answers_count || 0,
        createdAt: q.created_at || q.createdAt || new Date().toISOString(),
        author: q.author || null,
      }));
      setQuestions(normalized);
    } catch (e) {
      console.error(e);
      setQuestions([]);
    }
    setLoading(false);
  };

  // Utilitaire pour insérer du Markdown dans un textarea par id
  const insertMarkdown = (editorId, before, after = '', placeholder = '') => {
    const ta = document.getElementById(editorId);
    if (!ta) return;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const selected = ta.value.substring(start, end) || placeholder;
    const newValue = ta.value.substring(0, start) + before + selected + after + ta.value.substring(end);
    ta.value = newValue;
    // Trigger React state update if bound
    const ev = new Event('input', { bubbles: true });
    ta.dispatchEvent(ev);
    ta.focus();
    // place cursor after inserted content
    const cursorPos = start + before.length + selected.length + after.length;
    ta.selectionStart = ta.selectionEnd = cursorPos;
  };

  const handleOpenComment = (questionId) => {
    // Open expand and focus answer textarea
    toggleExpand(questionId);
    setTimeout(() => {
      const el = document.getElementById(`answer-${questionId}`);
      if (el) el.focus();
    }, 150);
  };

  const handleOpenAsk = () => {
    if (!isAuthenticated) return; // empêchez si non connecté
    setShowAskModal(true);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newQuestion.title,
        content: newQuestion.content,
        subject: newQuestion.subject || 'Autre',
        level: newQuestion.level || 'Licence/Bachelor',
        country: newQuestion.country || (user?.country || '')
      };
      const res = await questionsService.createQuestion(payload);
      // Normalize created question to avoid NaN and bad author rendering
      const created = res.question || {};
      created.votes = Number(created.votes) || 0;
      created.answers = Number(created.answers) || created.answers_count || 0;
      created.createdAt = created.created_at || new Date().toISOString();
      // set author object and a string display field to avoid rendering object by mistake
      created.author = created.author || { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name };
      created.author_display = (created.author.first_name || created.author.username) + (created.author.last_name ? ` ${created.author.last_name}` : '');
      setQuestions(prev => [created, ...prev]);
      setShowAskModal(false);
      setNewQuestion({ title: '', content: '', subject: '', level: '' });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erreur lors de la création de la question');
    }
  };

  const toggleExpand = async (questionId) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
      return;
    }
    try {
      const res = await questionsService.getQuestion(questionId);
      setQuestionDetails(prev => ({ ...prev, [questionId]: res.question }));
      setExpandedQuestionId(questionId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVote = async (questionId, type) => {
    try {
      const res = await questionsService.voteQuestion(questionId, type);
      // Mettre à jour localement votes et l'état du vote de l'utilisateur
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, votes: res.votes, user_vote: res.user_vote } : q));
      if (questionDetails[questionId]) {
        setQuestionDetails(prev => ({ ...prev, [questionId]: { ...prev[questionId], votes: res.votes, user_vote: res.user_vote } }));
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Erreur lors du vote');
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    const content = answerDrafts[questionId];
    if (!content) return;
    try {
      const res = await questionsService.createAnswer(questionId, { content });
      // Mettre à jour la liste locale de réponses
      if (questionDetails[questionId]) {
        setQuestionDetails(prev => ({ ...prev, [questionId]: { ...prev[questionId], answers: [...(prev[questionId].answers||[]), res.answer] } }));
      }
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: q.answers + 1 } : q));
      setAnswerDrafts(prev => ({ ...prev, [questionId]: '' }));
    } catch (e) {
      console.error(e);
      alert(e.message || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  // Filtrage inchangé
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || question.subject === selectedSubject;
    const matchesLevel = !selectedLevel || question.level === selectedLevel;
    const matchesCountry = !selectedCountry || selectedCountry === 'Tous les pays' || question.country === selectedCountry;
    return matchesSearch && matchesSubject && matchesLevel && matchesCountry;
  });

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'il y a 1 jour';
    return `il y a ${diffDays} jours`;
  };

  const getDisplayName = (author) => {
    if (!author) return 'Anonyme';
    if (typeof author === 'string') return author;
    // author may be nested object
    return (author.first_name || author.username || author.id) + (author.last_name ? ` ${author.last_name}` : '');
  };

  // Séparer l'aperçu Markdown dans un memo pour éviter de relancer des rendus coûteux
  const MarkdownPreview = React.useMemo(() => ({ content }) => (
    <div className="w-full h-full overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  ), []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Questions & Réponses</h1>
          <p className="text-muted-foreground">
            Posez vos questions et obtenez des réponses de la communauté
          </p>
        </div>
        <Button className="animate-pulse-glow" onClick={handleOpenAsk}>
          <Plus className="mr-2" size={18} />
          Poser une question
        </Button>
      </div>

      {/* Modal: Poser une question (Markdown editor + preview) */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAskModal(false)} />
          <div className="relative w-full max-w-4xl mx-auto bg-card border rounded shadow-lg z-60 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Poser une question</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowAskModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateQuestion} className="p-4 space-y-4">
              <div>
                <input
                  required
                  placeholder="Titre de la question"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  required
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, subject: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Sélectionnez la matière</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  required
                  value={newQuestion.level}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, level: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Sélectionnez le niveau</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <input
                  placeholder="Pays (optionnel)"
                  value={newQuestion.country || ''}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, country: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '# ', '', 'Titre')}>H1</button>
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '## ', '', 'Titre')}>H2</button>
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '**', '**', 'gras')}>B</button>
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '*', '*', 'italique')}>I</button>
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '`', '`', 'code')}>code</button>
                    <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown('newquestion-content', '[', '](https://)', 'texte')}>lien</button>
                  </div>
                  <textarea
                   required
                   placeholder="Rédigez votre question en Markdown..."
                   id="newquestion-content"
                   value={newQuestion.content}
                   onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                   className="w-full h-64 p-3 border border-input rounded-md bg-background text-foreground resize-none"
                 />
                </div>
                <div className="w-full h-64 p-3 border border-input rounded-md bg-background overflow-auto">
                  <MarkdownPreview content={newQuestion.content || '*Aperçu en Markdown*'} />
                </div>
               </div>

              <div className="flex flex-col md:flex-row justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAskModal(false)}>Annuler</Button>
                <Button type="submit">Publier la question</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher des questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Tous les niveaux</option>
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{filteredQuestions.length}</div>
            <div className="text-sm text-muted-foreground">Questions trouvées</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredQuestions.filter(q => q.isAnswered).length}
            </div>
            <div className="text-sm text-muted-foreground">Résolues</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredQuestions.reduce((sum, q) => sum + q.answers, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Réponses totales</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredQuestions.reduce((sum, q) => sum + q.votes, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Votes totaux</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{question.subject}</Badge>
                  <Badge variant="outline">{question.level}</Badge>
                  {question.isAnswered && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                      <Check size={12} className="mr-1" />
                      Résolu
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <button className="hover:text-green-600 transition-colors" onClick={() => handleVote(question.id, 'up')}>
                      <ChevronUp size={16} />
                    </button>
                    <span className="font-medium">{question.votes}</span>
                    <button className="hover:text-red-600 transition-colors" onClick={() => handleVote(question.id, 'down')}>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button className="flex items-center text-sm text-muted-foreground hover:text-foreground" onClick={() => handleOpenComment(question.id)}>
                      <MessageCircle size={14} className="mr-1" />
                      <span className="font-medium">{Number(question.answers) || 0}</span>
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary cursor-pointer" onClick={() => toggleExpand(question.id)}>
                {question.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {question.content}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    {getDisplayName(question.author)}
                  </div>
                  <span>{question.country}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {getTimeAgo(question.createdAt)}
                </div>
              </div>

              {expandedQuestionId === question.id && questionDetails[question.id] && (
                <div className="mt-4">
                  <ReactMarkdown 
                    className="prose prose-sm sm:prose-base text-foreground"
                    remarkPlugins={[remarkGfm]}
                    children={questionDetails[question.id].content}
                  />
                  
                  {/* Formulaire de réponse */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown(`answer-${question.id}`, '# ', '', 'Titre')}>H1</button>
                        <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown(`answer-${question.id}`, '**', '**', 'gras')}>B</button>
                        <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown(`answer-${question.id}`, '*', '*', 'italique')}>I</button>
                        <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertMarkdown(`answer-${question.id}`, '`', '`', 'code')}>code</button>
                      </div>
                      <textarea
                        id={`answer-${question.id}`}
                        value={answerDrafts[question.id] || ''}
                        onChange={(e) => setAnswerDrafts(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder={isAuthenticated ? 'Rédigez votre réponse en Markdown...' : 'Connectez-vous pour répondre'}
                        disabled={!isAuthenticated}
                      />
                    </div>
                     <div className="w-full h-32 p-3 border border-input rounded-md bg-background overflow-auto">
                       <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm">
                         {answerDrafts[question.id] || '*Aperçu en Markdown*'}
                       </ReactMarkdown>
                     </div>
                     <div className="lg:col-span-2 flex justify-end gap-2">
                       <Button variant="ghost" onClick={() => setAnswerDrafts(prev => ({ ...prev, [question.id]: '' }))}>Annuler</Button>
                       <Button onClick={() => handleSubmitAnswer(question.id)} disabled={!isAuthenticated}>Envoyer ma réponse</Button>
                     </div>
                   </div>

                  {/* Affichage des réponses */}
                  {questionDetails[question.id].answers && questionDetails[question.id].answers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {questionDetails[question.id].answers.map(answer => (
                         <div key={answer.id} className="p-3 border border-input rounded-md bg-background">
                           <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                             <div className="flex items-center space-x-2">
                               <User size={14} className="text-muted-foreground" />
                              <span className="font-medium text-foreground">{getDisplayName(answer.author)}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Clock size={14} className="text-muted-foreground" />
                               <span className="text-muted-foreground">{getTimeAgo(answer.createdAt)}</span>
                             </div>
                           </div>
                           <ReactMarkdown 
                             className="prose prose-sm sm:prose-base text-foreground"
                             remarkPlugins={[remarkGfm]}
                             children={answer.content}
                           />
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionsPage;

