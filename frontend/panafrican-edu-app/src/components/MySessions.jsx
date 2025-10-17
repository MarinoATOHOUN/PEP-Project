import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mentorsService } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await mentorsService.getSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger vos sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette session ?')) return;

    try {
      await mentorsService.cancelSession(sessionId);
      toast.success('Session annulée avec succès');
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'annulation');
    }
  };

  const renderSession = (session) => (
    <Card key={session.id}>
      <CardContent className="pt-6">
        <div className="flex justify-between">
          <h4 className="font-semibold">{session.subject}</h4>
          <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
            {session.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Avec {session.mentor.user.first_name} {session.mentor.user.last_name}
        </p>
        <p className="text-sm">
          {format(new Date(session.session_date), 'd MMMM yyyy \'à\' HH:mm', { locale: fr })}
        </p>
        {session.status === 'scheduled' && (
          <Button
            variant="destructive"
            size="sm"
            className="mt-4"
            onClick={() => handleCancelSession(session.id)}
          >
            Annuler
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status !== 'scheduled');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes Sessions</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Sessions à venir</h2>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map(renderSession)}
              </div>
            ) : (
              <p>Aucune session à venir.</p>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Sessions passées</h2>
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map(renderSession)}
              </div>
            ) : (
              <p>Aucune session passée.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
