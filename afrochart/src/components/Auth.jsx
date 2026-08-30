import { useState } from 'react';
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { useEffect } from 'react';

function Auth({ user, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowForm(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Erreur : vérifiez votre email et mot de passe (6 caractères minimum).");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (user) {
    return (
      <div className="auth-container">
        <span className="auth-email">{user.email}</span>
        <a href="#" onClick={handleLogout}>DÉCONNEXION</a>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {!showForm ? (
        <a href="#" onClick={() => setShowForm(true)}>CONNEXION</a>
      ) : (
        <div className="auth-form-popup">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit">{isSignUp ? "S'inscrire" : "Se connecter"}</button>
            <p className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </p>
            <p className="auth-close" onClick={() => setShowForm(false)}>Fermer</p>
          </form>
        </div>
      )}
    </div>
  );
}

export default Auth;