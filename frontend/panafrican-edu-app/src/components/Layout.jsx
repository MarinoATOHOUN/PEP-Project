import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Sun, 
  Moon, 
  MessageCircle, 
  Users, 
  Award,
  BookOpen,
  Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const Layout = ({ children, currentPage = 'home', onNavigate }) => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead, fetchNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Thème automatique jour/nuit selon l'heure
  useEffect(() => {
    const hour = new Date().getHours();
    const shouldBeDark = hour < 6 || hour > 18;
    setIsDark(shouldBeDark);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'questions', label: 'Questions', icon: MessageCircle },
    { id: 'mentors', label: 'Mentors', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'opportunities', label: 'Opportunités', icon: BookOpen }
  ];

  const handleShowNotifications = () => {
    if (!showNotifications) {
      setShowProfile(false); // Ferme le profil si ouvert
      fetchNotifications();
      markAllAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const handleShowProfile = () => {
    if (!showProfile) setShowNotifications(false); // Ferme notifications si ouvert
    setShowProfile(!showProfile);
  };

  // Fermer les popups en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.popup-notif') && showNotifications
      ) setShowNotifications(false);
      if (
        !e.target.closest('.popup-profile') && showProfile
      ) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfile]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-africa rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EduConnect Africa</h1>
                <p className="text-xs text-muted-foreground">Ensemble vers l'excellence</p>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                    onClick={() => onNavigate && onNavigate(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Barre de recherche */}
              <div className="hidden lg:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" onClick={handleShowNotifications}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-destructive">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border rounded shadow-lg z-50 popup-notif">
                  <div className="flex justify-between items-center p-4 font-bold border-b">
                    <span>Notifications</span>
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowNotifications(false)}>&times;</button>
                  </div>
                  <ul>
                    {notifications.length === 0 ? (
                      <li className="p-2 text-muted-foreground">Aucune notification</li>
                    ) : (
                      notifications.map(n => (
                        <li key={n.id} className="p-2 border-b">
                          <span className="font-semibold">{n.title}</span><br />
                          <span className="text-sm text-muted-foreground">{n.message}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="p-2 border-t">
                    <Button variant="link" size="sm" onClick={markAllAsRead}>Tout marquer comme lu</Button>
                  </div>
                </div>
              )}

              {/* Toggle thème */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              {/* Profil */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleShowProfile}
                >
                  <User size={20} />
                </Button>
                {isAuthenticated && showProfile && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border rounded shadow-lg z-50 popup-profile">
                    <div className="flex justify-between items-center p-4 font-bold border-b">
                      <span>Profil</span>
                      <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowProfile(false)}>&times;</button>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-lg">{user?.first_name || user?.username}</div>
                      <div className="text-sm text-muted-foreground">Email : {user?.email}</div>
                      {user?.country && <div className="text-sm text-muted-foreground">Pays : {user.country}</div>}
                      {user?.education_level && <div className="text-sm text-muted-foreground">Niveau : {user.education_level}</div>}
                      {user?.institution && <div className="text-sm text-muted-foreground">Institution : {user.institution}</div>}
                      <Button variant="outline" className="w-full mt-4" onClick={logout}>Se déconnecter</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu mobile */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>

          {/* Navigation Mobile */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        onNavigate && onNavigate(item.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Icon size={18} className="mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
              
              {/* Recherche mobile */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">EduConnect Africa</h3>
              <p className="text-sm text-muted-foreground">
                Plateforme d'entraide académique et de mentorat pour les étudiants africains.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Communauté</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Questions & Réponses</li>
                <li>Mentorat</li>
                <li>Badges & Récompenses</li>
                <li>Classements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Opportunités</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Bourses d'études</li>
                <li>Concours</li>
                <li>Stages</li>
                <li>Formations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>Conditions d'utilisation</li>
                <li>Confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 EduConnect Africa. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

