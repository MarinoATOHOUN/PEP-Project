# 📅 Système de Réservation de Sessions - EduConnect Africa

## 🎯 Vue d'ensemble

Le système de réservation permet aux étudiants de réserver des sessions de mentorat avec des mentors disponibles. Les mentors définissent leurs créneaux de disponibilité et reçoivent des notifications lorsqu'une réservation est effectuée.

---

## 🏗️ Architecture

### Backend (Flask)

#### Nouveaux modèles de données

**1. MentorAvailability** (`mentor_availability`)
Stocke les créneaux de disponibilité des mentors

```python
- id: Integer (PK)
- mentor_id: Integer (FK -> mentor.id)
- day_of_week: Integer (0=Lundi, 6=Dimanche)
- start_time: Time (ex: 09:00)
- end_time: Time (ex: 12:00)
- is_active: Boolean (true/false)
- created_at: DateTime
```

**2. MentorSession** (`mentor_session`)
Stocke les sessions réservées

```python
- id: Integer (PK)
- mentor_id: Integer (FK -> mentor.id)
- student_id: Integer (FK -> user.id)
- session_date: DateTime (date et heure de début)
- duration_minutes: Integer (durée en minutes)
- subject: String (sujet de la session)
- description: Text (description détaillée)
- status: String (scheduled, completed, cancelled, no_show)
- meeting_link: String (lien de visioconférence)
- notes: Text (notes de la session)
- created_at: DateTime
- updated_at: DateTime
```

#### Routes API créées

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/mentors/<id>/availabilities` | Récupérer les disponibilités d'un mentor | Non |
| POST | `/api/mentors/availabilities` | Définir ses disponibilités (mentor uniquement) | Oui |
| GET | `/api/mentors/<id>/available-slots` | Obtenir les créneaux disponibles | Non |
| POST | `/api/mentors/<id>/book` | Réserver une session | Oui |
| GET | `/api/mentorship/sessions` | Liste des sessions (étudiant/mentor) | Oui |
| GET | `/api/mentorship/sessions/<id>` | Détails d'une session | Oui |
| POST | `/api/mentorship/sessions/<id>/cancel` | Annuler une session | Oui |

---

### Frontend (React)

#### Composants créés

**1. BookingModal.jsx**
Modal en 3 étapes pour réserver une session

**Étape 1 : Sélection du créneau**
- Affiche les créneaux disponibles groupés par date
- Créneaux organisés par jour sur 7 jours
- Interface responsive avec grille adaptative

**Étape 2 : Confirmation des détails**
- Formulaire avec sujet, description, durée
- Affichage du créneau sélectionné
- Validation avant réservation

**Étape 3 : Confirmation**
- Message de succès
- Récapitulatif de la réservation
- Fermeture automatique

#### Services API ajoutés

```javascript
mentorsService.getAvailableSlots(mentorId, params)
mentorsService.bookSession(mentorId, sessionData)
mentorsService.getSessions(params)
mentorsService.cancelSession(sessionId)
```

---

## 🔄 Flux de réservation

### 1. Étudiant consulte les mentors
```
Étudiant → Page Mentors → Clic sur "Réserver"
```

### 2. Ouverture du modal de réservation
```
Modal s'ouvre → Chargement des créneaux disponibles
API GET /mentors/{id}/available-slots
```

### 3. Sélection d'un créneau
```
Étudiant sélectionne un créneau → Passage à l'étape 2
```

### 4. Saisie des informations
```
Étudiant remplit:
- Sujet de la session (requis)
- Description (optionnel)
- Durée (30, 60, 90, 120 min)
```

### 5. Confirmation de la réservation
```
Clic sur "Confirmer" → API POST /mentors/{id}/book
Backend vérifie:
- Disponibilité du créneau
- Pas de conflit
- Date dans le futur
```

### 6. Création de la session
```
Backend:
1. Crée l'enregistrement MentorSession
2. Crée une notification pour le mentor
3. Incrémente total_sessions du mentor
4. Retourne la session créée
```

### 7. Affichage de la confirmation
```
Modal affiche l'étape 3 (succès)
Notification au mentor
Fermeture automatique après 2 secondes
```

---

## 🔔 Système de notifications

Lorsqu'une réservation est effectuée :

```python
notification = Notification(
    user_id=mentor.user_id,
    type='session_booking',
    title='Nouvelle réservation de session',
    message=f"{student.name} a réservé une session le {date}",
    link=f'/mentorship/sessions/{session.id}'
)
```

Le mentor reçoit la notification en temps réel dans son interface.

---

## 🔒 Sécurité et validations

### Backend

**1. Authentification**
- Toutes les actions de réservation nécessitent un token JWT
- Vérification que l'utilisateur est authentifié

**2. Autorisations**
- Un étudiant ne peut pas réserver avec lui-même
- Seul le mentor peut définir ses disponibilités
- Seuls le mentor ou l'étudiant peuvent annuler une session

**3. Validations**
- Date de session dans le futur
- Pas de conflit avec une session existante
- Créneau dans les disponibilités du mentor
- Durée valide (30, 60, 90, 120 minutes)

### Frontend

**1. Désactivation des boutons**
- Bouton "Réserver" désactivé si mentor non disponible
- Bouton "Confirmer" désactivé si champs requis vides
- Prévention du double-clic pendant le chargement

**2. Gestion des erreurs**
- Messages d'erreur clairs
- Rollback en cas d'échec
- Retry possible

---

## 📊 Gestion des créneaux disponibles

### Algorithme de génération des créneaux

1. **Récupérer les disponibilités du mentor**
```python
availabilities = MentorAvailability.query.filter_by(
    mentor_id=mentor_id,
    is_active=True
).all()
```

2. **Récupérer les sessions déjà réservées**
```python
booked_sessions = MentorSession.query.filter(
    mentor_id == mentor_id,
    session_date >= now,
    session_date < now + 7 days,
    status in ['scheduled', 'completed']
).all()
```

3. **Générer les créneaux de 30 minutes**
Pour chaque jour sur 7 jours :
- Trouver les disponibilités pour ce jour de la semaine
- Créer des créneaux de 30 minutes
- Vérifier qu'ils ne chevauchent pas une session existante
- Vérifier qu'ils sont dans le futur

4. **Retourner les créneaux disponibles**
```json
{
  "slots": [
    {
      "datetime": "2024-01-15T09:00:00",
      "date": "2024-01-15",
      "time": "09:00",
      "day_name": "Lundi",
      "available": true
    },
    ...
  ]
}
```

---

## 🎨 Interface utilisateur

### Design du modal de réservation

**Couleurs**
- Primary: #1B4965 (bleu ciel)
- Accent: #FFD166 (jaune)
- Background: #F5F5F5 (gris clair)
- Success: #10B981 (vert)

**Interactions**
- Hover sur créneau : fond bleu, texte blanc
- Créneau sélectionné : bordure épaisse bleue
- Boutons désactivés : opacité 50%
- Animations fluides (transitions 200ms)

**Responsive**
- Mobile : 2 créneaux par ligne
- Tablette : 3 créneaux par ligne
- Desktop : 4 créneaux par ligne

---

## 📱 Expérience mobile

### Adaptations mobile

1. **Modal plein écran** sur mobile
2. **Scroll optimisé** pour les listes de créneaux
3. **Boutons tactiles** de taille appropriée (min 44x44px)
4. **Formulaires simplifiés** avec types d'input adaptés
5. **Messages courts** et concis

---

## 🧪 Tests

### Tests backend

```python
# Test de réservation
def test_book_session():
    # Créer un mentor avec disponibilités
    # Créer un étudiant
    # Réserver une session
    # Vérifier que la session est créée
    # Vérifier que la notification est envoyée

# Test de conflit
def test_booking_conflict():
    # Réserver un créneau
    # Essayer de réserver le même créneau
    # Vérifier que l'erreur 409 est retournée

# Test d'annulation
def test_cancel_session():
    # Créer une session
    # Annuler la session
    # Vérifier le statut 'cancelled'
```

### Tests frontend

```javascript
// Test du modal
describe('BookingModal', () => {
  it('affiche les créneaux disponibles', async () => {
    // Render le modal
    // Mock l'API getAvailableSlots
    // Vérifier l'affichage des créneaux
  });

  it('réserve une session avec succès', async () => {
    // Sélectionner un créneau
    // Remplir le formulaire
    // Soumettre
    // Vérifier l'appel API
    // Vérifier l'affichage de confirmation
  });
});
```

---

## 🚀 Installation et déploiement

### 1. Créer les tables

```bash
cd backend/panafrican_api
python create_booking_tables.py
```

### 2. Initialiser les disponibilités des mentors

```bash
python init_mentor_availabilities.py
```

### 3. Démarrer le backend

```bash
python src/main.py
```

### 4. Démarrer le frontend

```bash
cd frontend/panafrican-edu-app
pnpm run dev
```

---

## 📈 Métriques et analytics

### Données à tracker

1. **Taux de conversion**
   - Visiteurs de la page mentors
   - Clics sur "Réserver"
   - Réservations complétées

2. **Utilisation**
   - Nombre de sessions par jour/semaine/mois
   - Durée moyenne des sessions
   - Mentors les plus demandés

3. **Qualité**
   - Taux d'annulation
   - Taux de no-show
   - Notes des sessions

---

## 🔮 Améliorations futures

### Court terme
- [ ] Rappels automatiques par email/SMS
- [ ] Lien de visioconférence généré automatiquement
- [ ] Notes et feedback après chaque session
- [ ] Système de notation des mentors

### Moyen terme
- [ ] Calendrier synchronisé (Google Calendar, Outlook)
- [ ] Paiement intégré pour sessions premium
- [ ] Récurrence de sessions (hebdomadaire, etc.)
- [ ] Chat en temps réel mentor/étudiant

### Long terme
- [ ] IA pour recommander les meilleurs mentors
- [ ] Système de certification des mentors
- [ ] Marketplace de services de mentorat
- [ ] Application mobile native

---

## 🐛 Dépannage

### Problème : Aucun créneau disponible

**Cause possible :**
- Le mentor n'a pas défini ses disponibilités
- Tous les créneaux sont réservés
- Les disponibilités ne sont pas actives

**Solution :**
```bash
# Vérifier les disponibilités en base
python -c "from src.main import app, db; from src.models.mentor import MentorAvailability; 
with app.app_context(): print(MentorAvailability.query.all())"

# Initialiser les disponibilités
python init_mentor_availabilities.py
```

### Problème : Erreur 409 (conflit)

**Cause :**
- Le créneau a été réservé par quelqu'un d'autre entre-temps

**Solution :**
- Le frontend devrait rafraîchir les créneaux disponibles
- Implémenter un système de "lock" temporaire pendant la réservation

### Problème : Notification non reçue

**Cause possible :**
- Service de notification non configuré
- Email/SMS non envoyé

**Solution :**
- Vérifier que la notification est bien créée en base
- Implémenter un service de notification fiable

---

## 📚 Ressources

### Documentation API
Voir `backend/panafrican_api/src/routes/mentors.py`

### Composants UI
Voir `frontend/panafrican-edu-app/src/components/BookingModal.jsx`

### Modèles de données
Voir `backend/panafrican_api/src/models/mentor.py`

---

**EduConnect Africa** - Ensemble vers l'excellence académique 🌍📚✨
