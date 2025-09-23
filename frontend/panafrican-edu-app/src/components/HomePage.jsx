import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Globe,
  Star,
  ArrowRight,
  Heart,
  Lightbulb
} from 'lucide-react';
import africaEducationImg from '../assets/ckJ5vFRaxjpA.jpg';
import teacherStudentsImg from '../assets/4qKjnfQiDiLf.jpg';
import mentorshipImg from '../assets/Lehm1ziozoh2.jpg';
import { questionsService, mentorsService, badgesService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const HomePage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Questions résolues', value: '...', icon: MessageCircle, color: 'text-blue-600' },
    { label: 'Mentors actifs', value: '...', icon: Users, color: 'text-green-600' },
    { label: 'Badges attribués', value: '...', icon: Award, color: 'text-yellow-600' },
    { label: 'Pays représentés', value: '...', icon: Globe, color: 'text-purple-600' }
  ]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // Récupérer les stats dynamiques
    questionsService.getQuestions({ limit: 3 })
      .then(res => {
        setRecentQuestions(res.questions || []);
        // Utiliser le champ 'total' du backend
        setStats(prev => prev.map((s, i) => i === 0 ? { ...s, value: res.total || '...' } : s));
      })
      .catch(err => {
        setApiError('Impossible de récupérer les questions récentes.');
        setRecentQuestions([]);
        setStats(prev => prev.map((s, i) => i === 0 ? { ...s, value: '...' } : s));
      });

    mentorsService.getMentors({ limit: 3 })
      .then(res => {
        setTopMentors(res.mentors || []);
        // Utiliser le champ 'total' du backend
        setStats(prev => prev.map((s, i) => i === 1 ? { ...s, value: res.total || '...' } : s));
      })
      .catch(err => {
        setApiError('Impossible de récupérer les mentors populaires.');
        setTopMentors([]);
        setStats(prev => prev.map((s, i) => i === 1 ? { ...s, value: '...' } : s));
      });

    badgesService.getBadges()
      .then(res => {
        setStats(prev => prev.map((s, i) => i === 2 ? { ...s, value: Array.isArray(res.badges) ? res.badges.length : '...' } : s));
      })
      .catch(err => {
        setApiError('Impossible de récupérer les badges.');
        setStats(prev => prev.map((s, i) => i === 2 ? { ...s, value: '...' } : s));
      });

    // Pays représentés (mock)
    setStats(prev => prev.map((s, i) => i === 3 ? { ...s, value: '54' } : s));
  }, []);

  const features = [
    {
      title: 'Questions & Réponses',
      description: 'Posez vos questions académiques et obtenez des réponses de qualité de la communauté.',
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
      image: teacherStudentsImg
    },
    {
      title: 'Mentorat Personnalisé',
      description: 'Connectez-vous avec des mentors expérimentés pour un accompagnement sur mesure.',
      icon: Users,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20',
      image: mentorshipImg
    },
    {
      title: 'Système de Badges',
      description: 'Gagnez des badges et des points en contribuant activement à la communauté.',
      icon: Award,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20',
      image: africaEducationImg
    }
  ];

  return (
    <div className="space-y-16">
      {apiError && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 text-red-800 rounded p-3 mb-4 text-center">
            {apiError}
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-africa opacity-10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                L'excellence académique
                <span className="text-primary block">ensemble</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Rejoignez la plus grande communauté d'entraide académique panafricaine. 
                Posez vos questions, trouvez des mentors et progressez ensemble vers l'excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="animate-pulse-glow" onClick={() => onNavigate && onNavigate('auth')}>
                  Commencer maintenant
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button variant="outline" size="lg" onClick={() => onNavigate && onNavigate('mentors')}>
                  Découvrir la communauté
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={africaEducationImg} 
                alt="Éducation en Afrique" 
                className="rounded-2xl shadow-2xl card-hover"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Heart className="text-primary-foreground" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">23,456</p>
                    <p className="text-sm text-muted-foreground">Étudiants aidés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center card-hover">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une plateforme complète conçue pour favoriser l'apprentissage collaboratif 
            et l'excellence académique en Afrique.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const routes = ['questions', 'mentors', 'badges'];
            return (
              <Card key={index} className="card-hover overflow-hidden" onClick={() => onNavigate && onNavigate(routes[index])}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-full ${feature.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => onNavigate && onNavigate(routes[index])}>
                    En savoir plus
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Questions récentes */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Questions récentes</h3>
              <Button variant="outline" onClick={() => onNavigate && onNavigate('questions')}>Voir toutes</Button>
            </div>
            <div className="space-y-4">
              {recentQuestions.length === 0 ? (
                <div className="text-muted-foreground text-center">Aucune question récente</div>
              ) : (
                recentQuestions.map((question, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary">{question.subject}</Badge>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <MessageCircle size={14} className="mr-1" />
                            {question.answers}
                          </span>
                          <span className="flex items-center">
                            <TrendingUp size={14} className="mr-1" />
                            {question.votes}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {question.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Par {question.author?.first_name || question.author?.username || 'Utilisateur'}</span>
                        <span>{question.country}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Mentors populaires</h3>
              <Button variant="outline" onClick={() => onNavigate && onNavigate('mentors')}>Voir tous</Button>
            </div>
            <div className="space-y-4">
              {topMentors.length === 0 ? (
                <div className="text-muted-foreground text-center">Aucun mentor populaire</div>
              ) : (
                topMentors.map((mentor, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-africa rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(mentor.user?.first_name || mentor.user?.username || 'M').charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{mentor.user?.first_name || mentor.user?.username || 'Mentor'}</h4>
                          <p className="text-sm text-muted-foreground">{mentor.specialties}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center">
                              <Star className="text-yellow-500 fill-current" size={14} />
                              <span className="text-sm ml-1">{mentor.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {mentor.total_sessions} sessions
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {mentor.user?.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-gradient-africa">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <Lightbulb className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Prêt à transformer votre parcours académique ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez des milliers d'étudiants africains qui s'entraident 
                pour atteindre l'excellence académique.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => onNavigate && onNavigate('register')}>
                  Créer un compte gratuit
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" onClick={() => onNavigate && onNavigate('auth')}>
                  Se connecter
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" onClick={() => onNavigate && onNavigate('mentors')}>
                  Devenir mentor
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

