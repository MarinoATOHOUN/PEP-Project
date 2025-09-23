import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Trophy, 
  Star, 
  TrendingUp,
  Users,
  Target,
  Crown,
  Medal
} from 'lucide-react';
import { badgesService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BadgesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userPoints, setUserPoints] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: '', label: 'Tous les badges', icon: Award },
    { id: 'contribution', label: 'Contribution', icon: Star },
    { id: 'mentorship', label: 'Mentorat', icon: Users },
    { id: 'learning', label: 'Apprentissage', icon: Target }
  ];

  useEffect(() => {
    loadData();
  }, [selectedCategory, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les badges
      const badgesResponse = await badgesService.getBadges(selectedCategory);
      setBadges(badgesResponse.badges);

      // Charger les données utilisateur si connecté
      if (isAuthenticated && user) {
        try {
          const userBadgesResponse = await badgesService.getUserBadges(user.id);
          setUserBadges(userBadgesResponse.user_badges);

          const userPointsResponse = await badgesService.getUserPoints(user.id);
          setUserPoints(userPointsResponse.points);
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      }

      // Charger le leaderboard
      const leaderboardResponse = await badgesService.getLeaderboard({ per_page: 10 });
      setLeaderboard(leaderboardResponse.leaderboard);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (type) => {
    if (!isAuthenticated) return;
    
    try {
      await badgesService.addPoints({ type, amount: 10 });
      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de points:', error);
    }
  };

  const getBadgeIcon = (category) => {
    switch (category) {
      case 'contribution':
        return Star;
      case 'mentorship':
        return Users;
      case 'learning':
        return Target;
      default:
        return Award;
    }
  };

  const isUserBadge = (badgeId) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getUserRank = () => {
    if (!user || !userPoints) return null;
    const userRank = leaderboard.findIndex(entry => entry.user.id === user.id);
    return userRank !== -1 ? userRank + 1 : null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Badges & Récompenses</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gagnez des badges en contribuant à la communauté et suivez votre progression
        </p>
      </div>

      {/* Statistiques utilisateur */}
      {isAuthenticated && userPoints && (
        <Card className="bg-gradient-africa text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">{userPoints.total_points}</div>
                <div className="text-sm opacity-90">Points totaux</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{userBadges.length}</div>
                <div className="text-sm opacity-90">Badges obtenus</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{getUserRank() || '-'}</div>
                <div className="text-sm opacity-90">Classement</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.max(userPoints.contribution_points, userPoints.mentorship_points, userPoints.learning_points)}
                </div>
                <div className="text-sm opacity-90">Meilleur score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon size={16} />
              <span>{category.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des badges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : 'Tous les badges'}
            </h2>
            <Badge variant="secondary">
              {badges.length} badge{badges.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const Icon = getBadgeIcon(badge.category);
              const isEarned = isUserBadge(badge.id);
              
              return (
                <Card key={badge.id} className={`card-hover ${isEarned ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isEarned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{badge.name}</h3>
                          {isEarned && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                              Obtenu
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="capitalize">
                            {badge.category}
                          </Badge>
                          <span className="text-muted-foreground">
                            {badge.points_required} points requis
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions rapides (pour démo) */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Gagnez des points pour débloquer des badges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleAddPoints('contribution')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Star className="mr-2" size={16} />
                  +10 points contribution
                </Button>
                <Button 
                  onClick={() => handleAddPoints('mentorship')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="mr-2" size={16} />
                  +10 points mentorat
                </Button>
                <Button 
                  onClick={() => handleAddPoints('learning')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Target className="mr-2" size={16} />
                  +10 points apprentissage
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Top 10 du classement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2" size={20} />
                Classement
              </CardTitle>
              <CardDescription>
                Top 10 des contributeurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div key={entry.user.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index < 3 ? (
                        index === 0 ? <Crown size={16} /> :
                        index === 1 ? <Medal size={16} /> :
                        <Award size={16} />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.user.first_name} {entry.user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.user.country}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {entry.points.total_points}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;

