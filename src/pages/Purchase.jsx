import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PRICING_PLANS } from '../config';

export default function Purchase() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = PRICING_PLANS.find((item) => item.id === params.get('plan'));
  const close = () => navigate('/#pricing');

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && close();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="purchase-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section className="purchase-dialog" role="dialog" aria-modal="true" aria-labelledby="purchase-title">
        <button type="button" className="purchase-close" aria-label="Close" onClick={close}>×</button>
        <span className="section-kicker">{plan ? `${plan.name} plan` : 'UNIQUE WRITE'}</span>
        <h1 id="purchase-title">Purchases aren't available yet</h1>
        <p>We’re still preparing checkout. No payment will be taken.</p>
        <button type="button" className="btn btn-primary purchase-back" onClick={close}>Back to plans</button>
      </section>
    </main>
  );
}
