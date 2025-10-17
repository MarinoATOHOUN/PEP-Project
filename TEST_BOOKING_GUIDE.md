# 🧪 Guide de test - Système de Réservation

## 🚀 Préparation

### 1. Démarrer les services

**Backend :**
```bash
cd backend/panafrican_api
python src/main.py
```

**Frontend :**
```bash
cd frontend/panafrican-edu-app
pnpm run dev
```

### 2. Créer les tables
```bash
cd backend/panafrican_api
python create_booking_tables.py
```

### 3. Initialiser les disponibilités
```bash
python init_mentor_availabilities.py
```

---

## ✅ Checklist de tests

### Test 1 : Créer un compte mentor

**Étapes :**
1. ✅ Aller sur `/auth` (ou page de connexion)
2. ✅ Créer un compte utilisateur
3. ✅ Se connecter
4. ✅ Aller sur `/mentors`
5. ✅ Cliquer sur "Devenir mentor"
6. ✅ Remplir le formulaire avec des données de test
7. ✅ Soumettre

**Résultat attendu :**
- ✅ Profil mentor créé
- ✅ Message de succès affiché
- ✅ Le rôle de l'utilisateur devient "mentor"

---

### Test 2 : Vérifier les disponibilités par défaut

**Méthode 1 - Via API :**
```bash
# Remplacer <MENTOR_ID> par l'ID du mentor
curl http://localhost:5000/api/mentors/<MENTOR_ID>/availabilities
```

**Résultat attendu :**
```json
{
  "availabilities": [
    {
      "id": 1,
      "mentor_id": 1,
      "day_of_week": 0,
      "day_name": "Lundi",
      "start_time": "09:00",
      "end_time": "12:00",
      "is_active": true
    },
    ...
  ]
}
```

**Méthode 2 - Via interface :**
1. ✅ En tant que mentor, aller sur son profil
2. ✅ Vérifier que les disponibilités sont affichées
3. ✅ (Si l'interface est implémentée)

---

### Test 3 : Obtenir les créneaux disponibles

**Via API :**
```bash
curl "http://localhost:5000/api/mentors/<MENTOR_ID>/available-slots?days=7&duration=60"
```

**Résultat attendu :**
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
    {
      "datetime": "2024-01-15T09:30:00",
      "date": "2024-01-15",
      "time": "09:30",
      "day_name": "Lundi",
      "available": true
    },
    ...
  ],
  "total": 140
}
```

**Vérifications :**
- ✅ Les créneaux sont dans le futur
- ✅ Les créneaux respectent les disponibilités (Lun-Ven, 9h-12h et 14h-18h)
- ✅ Créneaux de 30 minutes

---

### Test 4 : Réserver une session (Interface)

**Étapes :**
1. ✅ Se connecter avec un compte **étudiant** (différent du mentor)
2. ✅ Aller sur `/mentors`
3. ✅ Trouver un mentor avec "Disponible" en vert
4. ✅ Cliquer sur "Réserver"
5. ✅ **Modal s'ouvre - Étape 1**
   - Vérifier que les créneaux s'affichent
   - Créneaux groupés par date
   - Créneaux affichés sous forme de boutons
6. ✅ Sélectionner un créneau (ex: Mardi 15:00)
7. ✅ **Passage à l'étape 2**
   - Vérifier l'affichage du créneau sélectionné
   - Remplir "Sujet" : "Aide en mathématiques"
   - Remplir "Description" : "J'ai besoin d'aide pour les intégrales"
   - Choisir durée : 60 minutes
8. ✅ Cliquer sur "Confirmer la réservation"
9. ✅ **Passage à l'étape 3**
   - Icône de succès verte
   - Récapitulatif de la réservation
   - Message de confirmation

**Résultat attendu :**
- ✅ Session créée en base de données
- ✅ Notification créée pour le mentor
- ✅ Modal se ferme après 2 secondes
- ✅ Retour à la liste des mentors

---

### Test 5 : Vérifier la notification du mentor

**Étapes :**
1. ✅ Se déconnecter
2. ✅ Se reconnecter avec le compte **mentor**
3. ✅ Vérifier l'icône de notification (si implémentée)
4. ✅ Cliquer sur les notifications
5. ✅ Voir "Nouvelle réservation de session"

**Résultat attendu :**
- ✅ Notification visible
- ✅ Message : "[Nom Étudiant] a réservé une session avec vous le [date]"
- ✅ Lien vers les détails de la session

---

### Test 6 : Conflit de réservation

**Étapes :**
1. ✅ Avec un **premier étudiant**, réserver un créneau (ex: Lundi 10:00)
2. ✅ Réservation réussie
3. ✅ Se déconnecter
4. ✅ Se connecter avec un **second étudiant**
5. ✅ Essayer de réserver le **même créneau** (Lundi 10:00)
6. ✅ Cliquer sur le créneau

**Résultat attendu :**
- ❌ Le créneau **ne devrait plus apparaître** dans la liste
- OU
- ❌ Erreur 409 : "Ce créneau est déjà réservé"
- ✅ Message d'erreur clair

---

### Test 7 : Réservation dans le passé (validation)

**Via API :**
```bash
curl -X POST http://localhost:5000/api/mentors/1/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "session_date": "2023-01-01T10:00:00",
    "subject": "Test",
    "duration_minutes": 60
  }'
```

**Résultat attendu :**
```json
{
  "message": "La date de session doit être dans le futur"
}
```
- ✅ Statut 400
- ✅ Message d'erreur

---

### Test 8 : Annuler une session

**Via API (Étudiant) :**
```bash
curl -X POST http://localhost:5000/api/mentorship/sessions/1/cancel \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Résultat attendu :**
```json
{
  "message": "Session annulée avec succès",
  "session": {
    "id": 1,
    "status": "cancelled",
    ...
  }
}
```

**Vérifications :**
- ✅ Statut de la session = "cancelled"
- ✅ Notification envoyée au mentor
- ✅ Le créneau redevient disponible (optionnel)

---

### Test 9 : Lister les sessions

**Via API (Étudiant) :**
```bash
curl "http://localhost:5000/api/mentorship/sessions?role=student" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Résultat attendu :**
```json
{
  "sessions": [
    {
      "id": 1,
      "mentor_id": 1,
      "student_id": 2,
      "session_date": "2024-01-15T10:00:00",
      "subject": "Aide en mathématiques",
      "status": "scheduled",
      "mentor": {
        "id": 1,
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    }
  ]
}
```

---

### Test 10 : Responsive Mobile

**Étapes :**
1. ✅ Ouvrir DevTools (F12)
2. ✅ Passer en mode mobile (iPhone/Android)
3. ✅ Aller sur `/mentors`
4. ✅ Cliquer sur "Réserver"
5. ✅ Vérifier que le modal s'affiche correctement
6. ✅ Vérifier que les créneaux sont lisibles (2 par ligne)
7. ✅ Tester le scroll
8. ✅ Remplir le formulaire
9. ✅ Confirmer

**Résultat attendu :**
- ✅ Modal adapté à la taille de l'écran
- ✅ Boutons tactiles accessibles
- ✅ Pas de débordement horizontal
- ✅ Scroll fluide

---

## 🔍 Vérifications en base de données

### Vérifier qu'une session a été créée

**SQLite :**
```sql
SELECT * FROM mentor_session;
```

**Résultat attendu :**
```
id | mentor_id | student_id | session_date        | subject              | status
---|-----------|------------|---------------------|----------------------|----------
1  | 1         | 2          | 2024-01-15 10:00:00 | Aide en mathématiques| scheduled
```

### Vérifier les disponibilités

```sql
SELECT * FROM mentor_availability WHERE mentor_id = 1;
```

### Vérifier les notifications

```sql
SELECT * FROM notification WHERE type = 'session_booking';
```

---

## 🐛 Problèmes courants

### Problème 1 : Aucun créneau disponible

**Diagnostic :**
```bash
# Vérifier les disponibilités
curl http://localhost:5000/api/mentors/1/availabilities

# Si vide, initialiser
python init_mentor_availabilities.py
```

### Problème 2 : Erreur 500 lors de la réservation

**Diagnostic :**
- Vérifier les logs backend
- Vérifier que les tables existent
- Vérifier l'authentification (token valide)

**Solution :**
```bash
# Recréer les tables
python create_booking_tables.py
```

### Problème 3 : Modal ne s'ouvre pas

**Diagnostic :**
- Ouvrir la console browser (F12)
- Vérifier les erreurs JavaScript
- Vérifier que BookingModal est importé

**Solution :**
```bash
# Rebuild frontend
cd frontend/panafrican-edu-app
pnpm install
pnpm run dev
```

---

## 📊 Résumé des tests

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Créer compte mentor | ⬜ |
| 2 | Vérifier disponibilités | ⬜ |
| 3 | Obtenir créneaux | ⬜ |
| 4 | Réserver session (UI) | ⬜ |
| 5 | Notification mentor | ⬜ |
| 6 | Conflit réservation | ⬜ |
| 7 | Validation date | ⬜ |
| 8 | Annuler session | ⬜ |
| 9 | Lister sessions | ⬜ |
| 10 | Responsive mobile | ⬜ |

**Légende :**
- ⬜ À tester
- ✅ Testé et validé
- ❌ Testé et échoué
- ⚠️ Partiellement validé

---

## 🎯 Critères de validation

Pour que le système soit considéré comme fonctionnel :

- ✅ Tous les tests doivent passer
- ✅ Aucune erreur console
- ✅ Aucune erreur backend
- ✅ Notifications créées correctement
- ✅ Interface fluide et responsive

---

## 📝 Rapport de test

Remplir après les tests :

**Date :** __________
**Testeur :** __________
**Environnement :**
- OS : __________
- Browser : __________
- Version : __________

**Résultats :**
- Tests réussis : __ / 10
- Tests échoués : __ / 10
- Bugs trouvés : __________

**Commentaires :**
_________________________________
_________________________________

---

**EduConnect Africa** - Tests de qualité pour une expérience optimale 🌍📚✨
