import React from 'react';
import { Mail, X, Send } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const email = 'anapse_video@hotmail.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
          <Mail className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-white mb-2">CONTÁCTANOS</h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed px-2">
          Para sugerencias, ideas, colaboración o comentarios sobre nuestros juegos.
        </p>

        <div className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-800 text-amber-300 font-bold text-xs select-all mb-5 tracking-wide">
          {email}
        </div>

        <a
          href={`mailto:${email}`}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Send className="w-4 h-4 fill-current" />
          <span>ENVIAR CORREO</span>
        </a>
      </div>
    </div>
  );
};
