import React, { useState } from 'react';
import { Mail, X, Send, CheckCircle2 } from 'lucide-react';
import { FirebaseService } from '../services/firebase';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const email = 'anapse_video@hotmail.com';
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userEmail.trim() || !message.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const success = await FirebaseService.sendContactMessage(name, userEmail, message);
    setIsSubmitting(false);

    if (success) {
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setErrorMsg('Error al enviar el mensaje. Intenta enviarlo por correo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
          <Mail className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-white mb-1">CONTÁCTANOS</h3>
        <p className="text-xs text-slate-400 mb-4 text-center leading-relaxed">
          Escríbenos tus sugerencias o ideas directamente a la base de datos de Firebase.
        </p>

        {sentSuccess ? (
          <div className="w-full p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            <h4 className="font-bold text-emerald-300 text-sm">¡Mensaje Recibido!</h4>
            <p className="text-xs text-slate-300">Gracias por tu mensaje. El administrador lo revisará.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2.5 mb-3">
            <div>
              <input
                type="text"
                placeholder="Tu Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Tu Correo Electrónico"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                maxLength={80}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
            <div>
              <textarea
                placeholder="Escribe tu mensaje o sugerencia..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none resize-none"
              />
            </div>

            {errorMsg && <p className="text-[11px] text-rose-400 text-center">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}</span>
            </button>
          </form>
        )}

        <div className="w-full pt-3 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 block mb-1">O por correo directo:</span>
          <a
            href={`mailto:${email}`}
            className="text-[11px] text-amber-400 font-bold hover:underline"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
};
