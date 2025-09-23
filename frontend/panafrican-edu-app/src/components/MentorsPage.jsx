import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Award
} from 'lucide-react';

const MentorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

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

  const mentors = [
    {
      id: 1,
      name: 'Dr. Amina Hassan',
      avatar: 'AH',
      specialty: 'Informatique & IA',
      country: 'Maroc',
      institution: 'Université Mohammed V',
      educationLevel: 'Doctorat',
      experienceYears: 8,
      rating: 4.9,
      totalSessions: 156,
      bio: 'Spécialiste en intelligence artificielle et machine learning. Passionnée par l\'enseignement et l\'innovation technologique en Afrique.',
      specialties: ['Python', 'Machine Learning', 'Data Science', 'Deep Learning'],
      isAvailable: true,
      responseTime: '< 2h',
      languages: ['Français', 'Arabe', 'Anglais']
    },
    {
      id: 2,
      name: 'Prof. John Okafor',
      avatar: 'JO',
      specialty: 'Ingénierie',
      country: 'Nigeria',
      institution: 'University of Lagos',
      educationLevel: 'Professeur',
      experienceYears: 15,
      rating: 4.8,
      totalSessions: 203,
      bio: 'Professeur d\'ingénierie mécanique avec une expertise en énergies renouvelables et développement durable.',
      specialties: ['Mécanique', 'Énergies renouvelables', 'Thermodynamique', 'CAO'],
      isAvailable: true,
      responseTime: '< 4h',
      languages: ['Anglais', 'Igbo']
    },
    {
      id: 3,
      name: 'Dr. Sarah Mwangi',
      avatar: 'SM',
      specialty: 'Médecine',
      country: 'Kenya',
      institution: 'University of Nairobi',
      educationLevel: 'Doctorat',
      experienceYears: 12,
      rating: 4.9,
      totalSessions: 178,
      bio: 'Médecin spécialisée en santé publique et épidémiologie. Engagée dans l\'amélioration des systèmes de santé africains.',
      specialties: ['Santé publique', 'Épidémiologie', 'Médecine préventive', 'Recherche médicale'],
      isAvailable: false,
      responseTime: '< 6h',
      languages: ['Anglais', 'Swahili']
    },
    {
      id: 4,
      name: 'Dr. Fatima Diallo',
      avatar: 'FD',
      specialty: 'Économie & Finance',
      country: 'Sénégal',
      institution: 'UCAD Dakar',
      educationLevel: 'Doctorat',
      experienceYears: 10,
      rating: 4.7,
      totalSessions: 134,
      bio: 'Économiste spécialisée en développement et politiques publiques. Consultante pour plusieurs organisations internationales.',
      specialties: ['Macroéconomie', 'Développement', 'Politiques publiques', 'Finance'],
      isAvailable: true,
      responseTime: '< 3h',
      languages: ['Français', 'Wolof', 'Anglais']
    },
    {
      id: 5,
      name: 'Prof. Ahmed El-Mansouri',
      avatar: 'AE',
      specialty: 'Sciences',
      country: 'Égypte',
      institution: 'Cairo University',
      educationLevel: 'Professeur',
      experienceYears: 20,
      rating: 4.8,
      totalSessions: 267,
      bio: 'Professeur de physique théorique et chercheur en physique quantique. Mentor passionné depuis plus de 10 ans.',
      specialties: ['Physique quantique', 'Mathématiques', 'Recherche', 'Publications'],
      isAvailable: true,
      responseTime: '< 1h',
      languages: ['Arabe', 'Anglais', 'Français']
    }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || mentor.specialty === selectedSpecialty;
    const matchesCountry = !selectedCountry || selectedCountry === 'Tous les pays' || mentor.country === selectedCountry;
    const matchesLevel = !selectedLevel || selectedLevel === 'Tous les niveaux' || mentor.educationLevel === selectedLevel;
    
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
        <Button variant="outline">
          <Users className="mr-2" size={18} />
          Devenir mentor
        </Button>
      </div>

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
              {filteredMentors.filter(m => m.isAvailable).length}
            </div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {(filteredMentors.reduce((sum, m) => sum + m.rating, 0) / filteredMentors.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Note moyenne</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredMentors.reduce((sum, m) => sum + m.totalSessions, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Sessions totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des mentors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-africa rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{mentor.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {mentor.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(mentor.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        {mentor.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-primary font-medium">{mentor.specialty}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin size={12} className="mr-1" />
                    {mentor.country}
                    <span className="mx-2">•</span>
                    <Building size={12} className="mr-1" />
                    {mentor.institution}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {mentor.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {mentor.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentor.specialties.length - 3}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {mentor.experienceYears} ans
                  </div>
                  <div className="text-xs text-muted-foreground">Expérience</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {mentor.totalSessions}
                  </div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {mentor.responseTime}
                  </div>
                  <div className="text-xs text-muted-foreground">Réponse</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${mentor.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {mentor.isAvailable ? 'Disponible' : 'Occupé'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle size={14} className="mr-1" />
                    Message
                  </Button>
                  <Button size="sm" disabled={!mentor.isAvailable}>
                    <Calendar size={14} className="mr-1" />
                    Réserver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card className="text-center py-12">
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
    </div>
  );
};

export default MentorsPage;

