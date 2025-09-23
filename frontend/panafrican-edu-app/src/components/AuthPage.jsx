import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe,
  GraduationCap,
  Building
} from 'lucide-react';
import { authService } from '@/services/api';

const AuthPage = ({ initialMode, onLogin }) => {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    educationLevel: '',
    institution: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const countries = [
    'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso', 'Burundi',
    'Cameroun', 'Cap-Vert', 'République centrafricaine', 'Tchad', 'Comores',
    'République démocratique du Congo', 'République du Congo', 'Côte d\'Ivoire',
    'Djibouti', 'Égypte', 'Guinée équatoriale', 'Érythrée', 'Eswatini',
    'Éthiopie', 'Gabon', 'Gambie', 'Ghana', 'Guinée', 'Guinée-Bissau',
    'Kenya', 'Lesotho', 'Libéria', 'Libye', 'Madagascar', 'Malawi',
    'Mali', 'Mauritanie', 'Maurice', 'Maroc', 'Mozambique', 'Namibie',
    'Niger', 'Nigeria', 'Rwanda', 'São Tomé-et-Príncipe', 'Sénégal',
    'Seychelles', 'Sierra Leone', 'Somalie', 'Afrique du Sud', 'Soudan du Sud',
    'Soudan', 'Tanzanie', 'Togo', 'Tunisie', 'Ouganda', 'Zambie', 'Zimbabwe'
  ];

  const educationLevels = [
    'Lycée', 'Licence/Bachelor', 'Master', 'Doctorat', 'Formation professionnelle'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        await authService.login({
          username: formData.username,
          password: formData.password
        });
        setSuccess('Connexion réussie !');
        if (onLogin) setTimeout(() => onLogin(), 100); // Redirige vers l'accueil après login
      } else {
        await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          country: formData.country,
          education_level: formData.educationLevel,
          institution: formData.institution
        });
        setSuccess('Compte créé avec succès ! Vous pouvez vous connecter.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion ou inscription');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-africa flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-africa rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">EA</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Connexion' : 'Inscription'}
              </CardTitle>
              <CardDescription className="text-base">
                {isLogin 
                  ? 'Accédez à votre compte EduConnect Africa'
                  : 'Rejoignez la communauté panafricaine'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        name="firstName"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        name="lastName"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="username"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Sélectionnez votre pays</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Niveau d'études (optionnel)</option>
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      name="institution"
                      placeholder="Institution (optionnel)"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full animate-pulse-glow" disabled={loading}>
                {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
              </Button>
              {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
              {success && <div className="text-green-500 text-sm text-center mt-2">{success}</div>}
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-primary hover:underline font-medium"
                >
                  {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
                </button>
              </p>
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    En vous inscrivant, vous rejoignez une communauté de:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">23,456 étudiants</Badge>
                    <Badge variant="secondary">2,156 mentors</Badge>
                    <Badge variant="secondary">54 pays</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            En continuant, vous acceptez nos{' '}
            <a href="#" className="underline hover:text-white">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="underline hover:text-white">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

