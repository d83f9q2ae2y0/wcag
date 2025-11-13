import { useState, useRef, useEffect } from 'react';

export default function UserProfileCard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress] = useState(45);
  
  // RGAA 4.1.2 – Critère 7.3 : Références pour la gestion du focus
  const openButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // RGAA 4.1.2 – Critère 7.3 : Gestion du focus au Dialog
  useEffect(() => {
    if (open && dialogRef.current) {
      // Focus automatique sur le premier élément focusable du dialog
      firstFocusableRef.current?.focus();
    } else if (!open && openButtonRef.current) {
      // Retour du focus au bouton déclencheur à la fermeture
      openButtonRef.current.focus();
    }
  }, [open]);

  // RGAA 4.1.2 – Critère 7.3 : Fermeture au clavier (Escape)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand le dialog est ouvert
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // RGAA 4.1.2 – Critère 7.3 : Piège à focus (focus trap)
  const handleTabKey = (e) => {
    if (!open) return;
    
    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleTabKey);
    }
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [open]);

  const handleClickOpen = () => setOpen(true);
  
  const handleClose = () => setOpen(false);
  
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* RGAA 4.1.2 – Critère 8.2 : Container avec rôle landmark */}
      <section 
        aria-labelledby="profile-title"
        style={{ 
          padding: '30px', 
          backgroundColor: 'white', 
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          borderRadius: '4px'
        }}
      >
        <div>
          {/* RGAA 4.1.2 – Critère 9.1 : Utilisation de h2 au lieu de h1 (composant réutilisable) */}
          {/* RGAA 4.1.2 – Critère 3.2 : Contraste conforme (couleur changée de #888 à #333) */}
          <h2 
            id="profile-title"
            style={{ 
              fontSize: '2.125rem', 
              fontWeight: 400,
              color: '#333', // Contraste 12.63:1 (conforme AA et AAA)
              margin: 0 
            }}
          >
            Profil Utilisateur
          </h2>
          
          {/* RGAA 4.1.2 – Critère 8.9 : Divider avec role="separator" pour clarifier le rôle */}
          <hr 
            role="separator"
            aria-hidden="true"
            style={{ 
              margin: '20px 0', 
              border: 'none', 
              borderTop: '1px solid #e0e0e0' 
            }} 
          />
          
          <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>
            Bienvenue sur votre profil. Gérez vos informations personnelles.
          </p>

          {/* RGAA 4.1.2 – Critère 7.1 : Barre de progression avec attributs ARIA complets */}
          <div style={{ margin: '20px 0' }}>
            <p 
              id="progress-label"
              style={{ 
                fontSize: '0.875rem', 
                marginBottom: '10px',
                color: '#333' // Contraste amélioré
              }}
            >
              Progression du profil
            </p>
            
            {/* RGAA 4.1.2 – Critère 7.1 : role="progressbar" avec valeurs ARIA */}
            <div 
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-labelledby="progress-label"
              aria-valuetext={`${progress} pourcent complété`}
              style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: '#e0e0e0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#1976d2',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {/* RGAA 4.1.2 – Critère 10.7 : Référence pour retour de focus */}
            <button 
              ref={openButtonRef}
              onClick={handleClickOpen}
              style={{
                padding: '6px 16px',
                fontSize: '0.875rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 500
              }}
            >
              Modifier
            </button>
            
            {/* RGAA 4.1.2 – Critère 1.1 : aria-label pour bouton icône (paramètres) */}
            <button 
              aria-label="Paramètres du profil"
              style={{
                width: '40px',
                height: '40px',
                padding: '8px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <span aria-hidden="true">⚙</span>
            </button>
            
            {/* RGAA 4.1.2 – Critère 1.1 : aria-label pour bouton icône (suppression) */}
            <button 
              aria-label="Supprimer le profil"
              style={{
                width: '40px',
                height: '40px',
                padding: '8px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <span aria-hidden="true">🗑</span>
            </button>
          </div>
        </div>
      </section>

      {/* RGAA 4.1.2 – Critère 7.1 : Dialog avec attributs ARIA complets */}
      {open && (
        <>
          {/* RGAA 4.1.2 – Critère 7.1 : Backdrop avec rôle et label */}
          <div 
            onClick={handleClose}
            role="presentation"
            aria-label="Fermer la boîte de dialogue en cliquant à l'extérieur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1300
            }}
          />
          
          {/* RGAA 4.1.2 – Critère 7.1 : role="dialog", aria-modal, aria-labelledby */}
          <div 
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 11px 15px rgba(0,0,0,0.2)',
              minWidth: '400px',
              maxWidth: '600px',
              zIndex: 1400,
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* RGAA 4.1.2 – Critère 9.1 : Titre de dialog avec id pour aria-labelledby */}
            <h2 
              id="dialog-title"
              style={{ 
                padding: '16px 24px',
                fontSize: '1.25rem',
                fontWeight: 500,
                margin: 0
              }}
            >
              Modifier le profil
            </h2>
            
            <div 
              id="dialog-description"
              style={{ padding: '8px 24px' }}
            >
              <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                Formulaire de modification du profil utilisateur.
              </p>
              
              {/* RGAA 4.1.2 – Critère 7.1 : Progression indéterminée avec aria-live */}
              {loading && (
                <div 
                  role="status"
                  aria-live="polite"
                  aria-label="Enregistrement en cours"
                  style={{ marginTop: '20px' }}
                >
                  <div 
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Chargement en cours"
                    style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: '#e0e0e0',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: '#1976d2',
                      animation: 'indeterminate 2s infinite linear'
                    }} />
                  </div>
                  {/* RGAA 4.1.2 – Critère 7.1 : Texte pour lecteurs d'écran */}
                  <span className="sr-only">Enregistrement en cours, veuillez patienter...</span>
                </div>
              )}
            </div>
            
            <div style={{ 
              padding: '8px 16px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              {/* RGAA 4.1.2 – Critère 7.3 : Premier élément focusable du dialog */}
              <button 
                ref={firstFocusableRef}
                onClick={handleClose}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                Annuler
              </button>
              
              {/* RGAA 4.1.2 – Critère 7.3 : Dernier élément focusable du dialog */}
              <button 
                ref={lastFocusableRef}
                onClick={handleSubmit}
                disabled={loading}
                aria-busy={loading}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.875rem',
                  backgroundColor: loading ? '#999' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  opacity: loading ? 0.6 : 1
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        /* RGAA 4.1.2 – Critère 10.7 : Focus visible obligatoire sur tous les éléments interactifs */
        button:focus-visible {
          outline: 3px solid #1976d2;
          outline-offset: 2px;
        }
        
        /* Style hover maintenu */
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
        
        /* RGAA 4.1.2 – Critère 10.11 : Classe pour contenu visible uniquement aux lecteurs d'écran */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
        
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
