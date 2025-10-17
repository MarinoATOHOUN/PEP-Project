import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'react-mde/lib/styles/css/react-mde-all.css';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import BookingModal from '@/components/BookingModal';
import { 
  Search, 
  Star, 
  MessageCircle, 
  Calendar,
  User,
  MapPin,
  GraduationCap,
  Building,
  Clock,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { mentorsService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const MentorsPage = ({ onNavigate = () => {}, onOpenConversation = () => {} }) => {
  const { user, updateUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [mentors, setMentors] = useState([]);
  const [popularMentors, setPopularMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBecomeMentorModal, setShowBecomeMentorModal] = useState(false);
  const [mentorFormData, setMentorFormData] = useState({
    specialties: '',
    experience_years: '',
    education_level: '',
    institution: '',
    bio: ''
  });
  const [selectedTab, setSelectedTab] = useState('write');
  const [expandedMentorId, setExpandedMentorId] = useState(null);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const specialties = [
    'Informatique & IA', 'Médecine', 'Ingénierie', 'Économie & Finance',
    'Droit', 'Sciences', 'Littérature', 'Arts', 'Business', 'Éducation'
  ];

  const countries = [
    'Tous les pays', 'Nigeria', 'Kenya', 'Ghana', 'Sénégal', 'Maroc',
    'Égypte', 'Afrique du Sud', 'Cameroun', 'Mali', 'Burkina Faso'
  ];

  const educationLevels = [
    'Tous les niveaux', 'Master', 'Doctorat', 'Professeur', 'Professionnel'
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const response = await mentorsService.getMentors();
        setMentors(response.mentors);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPopularMentors = async () => {
      try {
        const response = await mentorsService.getMentors({ per_page: 5 });
        setPopularMentors(response.mentors);
      } catch (error) {
        console.error("Failed to fetch popular mentors:", error);
      }
    };

    fetchMentors();
    fetchPopularMentors();
  }, []);

  const handleBecomeMentorSubmit = async (e) => {
    e.preventDefault();
    try {
      const specialties = mentorFormData.specialties.split(',').map(s => s.trim());
      const payload = { ...mentorFormData, specialties };
      const response = await mentorsService.becomeMentor(payload);
      updateUser({ ...user, role: 'mentor' });
      setShowBecomeMentorModal(false);
      // Optionally, refresh the mentors list or show a success message
    } catch (error) {
      console.error("Failed to become a mentor:", error);
      alert(error.message || 'Erreur lors de la création du profil mentor');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const user = mentor.user || {};
    const specialties = mentor.specialties ? JSON.parse(mentor.specialties) : [];
    const matchesSearch = (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || specialties.includes(selectedSpecialty);
    const matchesCountry = !selectedCountry || selectedCountry === 'Tous les pays' || user.country === selectedCountry;
    const matchesLevel = !selectedLevel || selectedLevel === 'Tous les niveaux' || mentor.education_level === selectedLevel;
    
    return matchesSearch && matchesSpecialty && matchesCountry && matchesLevel;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mentors</h1>
          <p className="text-muted-foreground">
            Trouvez le mentor parfait pour votre parcours académique
          </p>
        </div>
        {user && user.role !== 'mentor' && (
          <Button variant="outline" onClick={() => setShowBecomeMentorModal(true)}>
            <Users className="mr-2" size={18} />
            Devenir mentor
          </Button>
        )}
      </div>

      {/* Become a mentor modal */}
      {showBecomeMentorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBecomeMentorModal(false)} />
          <div className="relative w-full max-w-2xl mx-auto bg-card border rounded shadow-lg z-60 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Devenir Mentor</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowBecomeMentorModal(false)}>×</button>
            </div>
            <form onSubmit={handleBecomeMentorSubmit} className="p-4 space-y-4">
              <Input
                placeholder="Spécialités (séparées par des virgules)"
                value={mentorFormData.specialties}
                onChange={(e) => setMentorFormData({ ...mentorFormData, specialties: e.target.value })}
                required
              />
              <Input
                placeholder="Années d'expérience"
                type="number"
                value={mentorFormData.experience_years}
                onChange={(e) => setMentorFormData({ ...mentorFormData, experience_years: e.target.value })}
                required
              />
              <Input
                placeholder="Niveau d'éducation"
                value={mentorFormData.education_level}
                onChange={(e) => setMentorFormData({ ...mentorFormData, education_level: e.target.value })}
                required
              />
              <Input
                placeholder="Institution"
                value={mentorFormData.institution}
                onChange={(e) => setMentorFormData({ ...mentorFormData, institution: e.target.value })}
                required
              />
              <div className="prose prose-sm sm:prose-base max-w-none">
                <label className="text-sm font-medium text-foreground mb-2 block">Bio (Markdown supporté)</label>
                <ReactMde
                  value={mentorFormData.bio}
                  onChange={(bio) => setMentorFormData({ ...mentorFormData, bio })}
                  selectedTab={selectedTab}
                  onTabChange={setSelectedTab}
                  generateMarkdownPreview={(markdown) =>
                    Promise.resolve(<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>)
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowBecomeMentorModal(false)}>Annuler</Button>
                <Button type="submit">Soumettre</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher un mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Toutes les spécialités</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
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

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {educationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{filteredMentors.length}</div>
            <div className="text-sm text-muted-foreground">Mentors trouvés</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredMentors.filter(m => m.is_available).length}
            </div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {(filteredMentors.reduce((sum, m) => sum + m.rating, 0) / filteredMentors.length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Note moyenne</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredMentors.reduce((sum, m) => sum + (m.totalSessions || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Sessions totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Main content: Mentors list and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column: Mentors list */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentors.map((mentor) => {
            const user = mentor.user || {};
            const specialties = mentor.specialties ? JSON.parse(mentor.specialties) : [];
            return (
              <Card key={mentor.id} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-africa rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{user.first_name ? user.first_name[0] : ''}{user.last_name ? user.last_name[0] : ''}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {user.first_name} {user.last_name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(mentor.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            {mentor.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-primary font-medium">{specialties.join(', ')}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin size={12} className="mr-1" />
                        {user.country}
                        <span className="mx-2">•</span>
                        <Building size={12} className="mr-1" />
                        {mentor.institution}
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground text-sm mb-4 cursor-pointer" onClick={() => setExpandedMentorId(expandedMentorId === mentor.id ? null : mentor.id)}>
                    {expandedMentorId === mentor.id ? (
                      <MarkdownRenderer content={mentor.bio} className="text-sm" />
                    ) : (
                      <p className="line-clamp-2">{mentor.bio}</p>
                    )}
                    {mentor.bio && mentor.bio.length > 100 && (
                      <span className="text-primary text-xs mt-1 inline-block">
                        {expandedMentorId === mentor.id ? 'Voir moins' : 'Voir plus'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{specialties.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {mentor.experience_years} ans
                      </div>
                      <div className="text-xs text-muted-foreground">Expérience</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {mentor.totalSessions || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {mentor.responseTime || '> 24h'}
                      </div>
                      <div className="text-xs text-muted-foreground">Réponse</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${mentor.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-muted-foreground">
                        {mentor.is_available ? 'Disponible' : 'Occupé'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        // If the mentor has a user id, open the Messages page and preselect their conversation
                        const uid = mentor.user?.id;
                        if (uid) {
                          onOpenConversation(uid);
                          onNavigate('messages');
                        } else {
                          // fallback: navigate to messages page
                          onNavigate('messages');
                        }
                      }}>
                        <MessageCircle size={14} className="mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={!mentor.is_available}
                        onClick={() => {
                          setBookingMentor(mentor);
                          setShowBookingModal(true);
                        }}
                      >
                        <Calendar size={14} className="mr-1" />
                        Réserver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          )}
        </div>

        {/* Sidebar: Popular Mentors */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" />
                Mentors populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularMentors.map((mentor) => {
                  const user = mentor.user || {};
                  const specialties = mentor.specialties ? JSON.parse(mentor.specialties) : [];
                  return (
                    <div key={mentor.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-africa rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-base">{user.first_name ? user.first_name[0] : ''}{user.last_name ? user.last_name[0] : ''}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-primary truncate">{specialties.join(', ')}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Star size={12} className="mr-1 text-yellow-500 fill-current" />
                          {mentor.rating} ({mentor.totalSessions || 0} sessions)
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {filteredMentors.length === 0 && !loading && (
        <Card className="text-center py-12 lg:col-span-3">
          <CardContent>
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun mentor trouvé
            </h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos filtres ou explorez d'autres spécialités.
            </p>
            <Button variant="outline">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setBookingMentor(null);
          }}
          onBookingSuccess={() => {
            // Rafraîchir la liste des mentors si nécessaire
            console.log('Réservation réussie');
          }}
        />
      )}
    </div>
  );
};

export default MentorsPage;

