import React from 'react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const steps = [
    'Mueve el cañón a la izquierda o derecha en la parte inferior.',
    'Apunta arrastrando el dedo (móvil) o el cursor del mouse (PC).',
    'Dispara soltando la pantalla o el botón del mouse.',
    'Aprovecha las paredes y el techo para lograr rebotes estratégicos.',
    'Destruye todos los globos que sostienen al mono en el aire.',
    'Recoge las cajas de premios 🎁 que caen para obtener munición especial.',
    'Usa los power-ups (Explosiva, Triple, Perforante, Rebote, Eléctrica) desde tu barra.',
    'Esquiva las bananas, cocos y bombas que el mono deja caer.',
    'Derriba todos los globos para hacer caer al mono y llorar de derrota.',
    '¡Supera los niveles y registra tu puntuación en el Ranking Top 50 Global!',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white tracking-wide">CÓMO JUGAR</h3>
        </div>

        <div className="overflow-y-auto pr-1 space-y-2.5 text-xs">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center justify-center border border-amber-500/30">
                {idx + 1}
              </span>
              <p className="text-slate-200 leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-lg transition-all"
        >
          ¡ENTENDIDO!
        </button>
      </div>
    </div>
  );
};
