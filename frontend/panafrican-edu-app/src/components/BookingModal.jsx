import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { mentorsService } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BookingModal = ({ mentor, isOpen, onClose, onBookingSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1: select slot, 2: confirm details, 3: success
  const [bookingData, setBookingData] = useState({
    subject: '',
    description: '',
    duration_minutes: 60,
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && mentor) {
      fetchAvailableSlots();
    }

    // Clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, mentor]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await mentorsService.getAvailableSlots(mentor.id, {
        days: 7,
        duration: 60,
      });
      setAvailableSlots(response.slots || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(2);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !bookingData.subject) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        session_date: selectedSlot.datetime,
        subject: bookingData.subject,
        description: bookingData.description,
        duration_minutes: bookingData.duration_minutes,
      };

      await mentorsService.bookSession(mentor.id, sessionData);
      setStep(3);
      toast.success('Session réservée avec succès !');
      
      timeoutRef.current = setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStep(1);
    setSelectedSlot(null);
    setBookingData({ subject: '', description: '', duration_minutes: 60 });
    onClose();
  };

  if (!isOpen) return null;

  // Grouper les créneaux par date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-4xl mx-auto bg-card border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {step === 1 && 'Choisir un créneau'}
              {step === 2 && 'Confirmer la réservation'}
              {step === 3 && 'Réservation confirmée'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Session avec {mentor.user?.first_name} {mentor.user?.last_name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Slot */}
          {step === 1 && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des disponibilités...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun créneau disponible pour le moment</p>
                  <Button variant="outline" className="mt-4" onClick={fetchAvailableSlots}>
                    Actualiser
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(slotsByDate).map(([date, slots]) => {
                    const dateObj = new Date(`${date}T00:00:00`);
                    const dayName = slots[0].day_name;
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });

                    return (
                      <div key={date}>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Calendar size={18} className="mr-2 text-primary" />
                          {dayName} {formattedDate}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {slots.map((slot) => {
                            const slotKey = slot.id || `${slot.date}-${slot.time}`;
                            return (
                              <button
                                key={slotKey}
                                onClick={() => handleSlotSelect(slot)}
                                className="px-4 py-2 border border-border rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-sm font-medium"
                              >
                                <Clock size={14} className="inline mr-1" />
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirm Details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Slot */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-3">Créneau sélectionné</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="secondary" className="text-base">
                      <Calendar size={14} className="mr-1" />
                      {selectedSlot?.day_name} {selectedSlot?.date ? format(new Date(`${selectedSlot.date}T00:00:00`), 'd MMMM yyyy', { locale: fr }) : ''}
                    </Badge>
                    <Badge variant="secondary" className="text-base">
                      <Clock size={14} className="mr-1" />
                      {selectedSlot?.time}
                    </Badge>
                    <Badge variant="outline">60 minutes</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sujet de la session *
                  </label>
                  <input
                    type="text"
                    value={bookingData.subject}
                    onChange={(e) => setBookingData({ ...bookingData, subject: e.target.value })}
                    placeholder="Ex: Aide en mathématiques, révision examen..."
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                    placeholder="Décrivez brièvement ce que vous souhaitez aborder..."
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Durée de la session
                  </label>
                  <select
                    value={bookingData.duration_minutes}
                    onChange={(e) => setBookingData({ ...bookingData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button onClick={handleBooking} disabled={loading || !bookingData.subject}>
                  {loading ? 'Réservation...' : 'Confirmer la réservation'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Réservation confirmée !</h3>
              <p className="text-muted-foreground mb-6">
                Vous recevrez un email de confirmation avec le lien de la session.
              </p>
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mentor :</span>
                      <span className="font-semibold">{mentor.user?.first_name} {mentor.user?.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date :</span>
                      <span className="font-semibold">{selectedSlot?.day_name} {selectedSlot?.date ? new Date(`${selectedSlot.date}T00:00:00`).toLocaleDateString('fr-FR') : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Heure :</span>
                      <span className="font-semibold">{selectedSlot?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="font-semibold">{bookingData.duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sujet :</span>
                      <span className="font-semibold">{bookingData.subject}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button className="mt-6" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
