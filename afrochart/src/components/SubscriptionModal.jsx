import React, { useState } from 'react';
import './SubscriptionModal.css';

function SubscriptionModal({ onClose }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('vip');
  const [paymentMethodType, setPaymentMethodType] = useState('card');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(false);

  const handleApplyDiscount = () => {
    if (discountCode.trim().toLowerCase() === 'student30') {
      setAppliedDiscount(true);
    } else {
      alert("Code promo invalide (essayez 'Student30')");
    }
  };

  const basePrice = selectedPlan === 'vip' ? (billingCycle === 'monthly' ? 1500 : 15000) : 0;
  const discountAmount = appliedDiscount ? basePrice * 0.2 : 0;
  const finalTotal = basePrice - discountAmount;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (selectedPlan === 'vip' && paymentMethodType === 'card' && (!cardNumber || !cardExpiry || !cardCvc)) {
      alert("Veuillez remplir tous les champs de votre carte bancaire.");
      return;
    }
    alert("Paiement et abonnement validés avec succès !");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-icon" onClick={onClose}>×</button>
        
        {/* En-tête */}
        <div className="sub-modal-header">
          <div className="sub-icon-badge">👑</div>
          <div>
            <h2>Abonnement</h2>
            <p>Pour profiter d'Afrochart sans limites et en haute qualité, choisissez votre offre.</p>
          </div>
        </div>

        <div className="sub-grid-layout">
          {/* COLONNE GAUCHE : Sélection du plan */}
          <div className="sub-left-column">
            <div className="section-header-row">
              <h3>Sélection du plan</h3>
              <div className="billing-toggle">
                <button 
                  type="button"
                  className={billingCycle === 'monthly' ? 'active' : ''} 
                  onClick={() => setBillingCycle('monthly')}
                >
                  Mensuel
                </button>
                <button 
                  type="button"
                  className={billingCycle === 'annually' ? 'active' : ''} 
                  onClick={() => setBillingCycle('annually')}
                >
                  Annuel
                </button>
              </div>
            </div>

            {/* Option Gratuit */}
            <div 
              className={`plan-option-card ${selectedPlan === 'gratuit' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('gratuit')}
            >
              <div className="plan-option-top">
                <div className="plan-radio-title">
                  <input type="radio" checked={selectedPlan === 'gratuit'} readOnly />
                  <div>
                    <h4>Gratuit</h4>
                    <span className="plan-subtext">Accès standard</span>
                  </div>
                </div>
                <div className="plan-price-tag">0 FCFA</div>
              </div>
            </div>

            {/* Option Premium VIP */}
            <div 
              className={`plan-option-card ${selectedPlan === 'vip' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('vip')}
            >
              <div className="plan-option-top">
                <div className="plan-radio-title">
                  <input type="radio" checked={selectedPlan === 'vip'} readOnly />
                  <div>
                    <h4>Premium VIP</h4>
                    <span className="plan-subtext">Pour les passionnés de musique</span>
                  </div>
                </div>
                <div className="plan-price-tag">
                  {billingCycle === 'monthly' ? '1 500 FCFA' : '15 000 FCFA'}
                  <span className="tiny-period"> / {billingCycle === 'monthly' ? 'Mois' : 'An'}</span>
                </div>
              </div>

              {selectedPlan === 'vip' && (
                <div className="plan-expanded-features">
                  <ul>
                    <li>✓ Écoute intégrale et illimitée</li>
                    <li>✓ Zéro publicité</li>
                    <li>✓ Audio haute définition</li>
                    <li>✓ Mode hors-ligne</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : Paiement & Saisie de carte */}
          <div className="sub-right-column">
            <div className="section-header-row">
              <h3>Paiement</h3>
              <div className="payment-method-tabs">
                <button 
                  type="button" 
                  className={`tab-btn ${paymentMethodType === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethodType('card')}
                >
                  Carte bancaire
                </button>
                <button 
                  type="button" 
                  className={`tab-btn ${paymentMethodType === 'mobile' ? 'active' : ''}`}
                  onClick={() => setPaymentMethodType('mobile')}
                >
                  Mobile Money
                </button>
              </div>
            </div>

            {selectedPlan === 'vip' && paymentMethodType === 'card' ? (
              <div className="card-input-container">
                <div className="form-group">
                  <label>Nom sur la carte</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Jean Dupont" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Numéro de carte</label>
                  <div className="card-number-wrapper">
                    <input 
                      type="text" 
                      placeholder="4000 1234 5678 9010" 
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <span className="card-brand-icon">💳</span>
                  </div>
                </div>

                <div className="form-row-dual">
                  <div className="form-group">
                    <label>Expiration (MM/AA)</label>
                    <input 
                      type="text" 
                      placeholder="MM/AA" 
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC / CVV</label>
                    <input 
                      type="password" 
                      placeholder="123" 
                      maxLength="4"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : selectedPlan === 'vip' && paymentMethodType === 'mobile' ? (
              <div className="card-input-container">
                <div className="form-group">
                  <label>Numéro de téléphone (Orange / Wave / MTN)</label>
                  <input 
                    type="text" 
                    placeholder="Ex : +221 77 000 00 00" 
                  />
                </div>
              </div>
            ) : (
              <p className="free-plan-notice">Aucun paiement requis pour le plan Gratuit.</p>
            )}

            {/* Code Promo */}
            <div className="discount-section">
              <label>Code de réduction</label>
              <div className="discount-input-row">
                <input 
                  type="text" 
                  placeholder="Ex : Student30" 
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button type="button" onClick={handleApplyDiscount}>Appliquer</button>
              </div>
              {appliedDiscount && <p className="discount-success">Succès ! Réduction de 20% appliquée.</p>}
            </div>

            {/* Lignes de calcul */}
            <div className="checkout-summary-lines">
              <div className="summary-line">
                <span>{selectedPlan === 'vip' ? 'Abonnement Premium VIP' : 'Plan Gratuit'}</span>
                <span>{basePrice.toLocaleString()} FCFA</span>
              </div>
              {appliedDiscount && (
                <div className="summary-line discount-line">
                  <span>Réduction (-20%)</span>
                  <span>-{discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            {/* Total & Validation */}
            <div className="checkout-total-footer">
              <div className="total-text-block">
                <span className="total-label">Total</span>
                <span className="due-date">Facturé aujourd'hui, renouvellement {billingCycle === 'monthly' ? 'mensuel' : 'annuel'}</span>
              </div>
              <div className="total-amount-block">
                {finalTotal.toLocaleString()} <span className="currency-sign">FCFA</span>
              </div>
            </div>

            <button type="button" className="checkout-confirm-btn" onClick={handleConfirm}>
              Confirmer l'abonnement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;