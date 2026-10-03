import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle2 } from 'lucide-react';
import { assetManager } from '../services/assetManager';
import { ASSET_REGISTRY } from '../config/assets';

interface AssetRequirementsModalProps {
  onClose: () => void;
}

export const AssetRequirementsModal: React.FC<AssetRequirementsModalProps> = ({ onClose }) => {
  const [auditList, setAuditList] = useState<
    {
      category: string;
      fileName: string;
      exists: boolean;
      logicalKey: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    assetManager.preloadAll().then(() => {
      const list = Object.values(ASSET_REGISTRY).map((def) => ({
        category: def.category.toUpperCase(),
        fileName: def.path ? def.path.replace('/assets/sprites/', '') : def.cell?.fileName || '',
        exists: assetManager.isLoaded(def.logicalKey),
        logicalKey: def.logicalKey,
        description: def.description,
      }));
      setAuditList(list);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-wide">CATÁLOGO E INTEGRACIÓN DE RECURSOS VISUALES</h3>
            <p className="text-xs text-amber-400 font-semibold">
              Todos los sprites y hojas de animación están integrados desde <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-[11px]">/public/assets/sprites/</code>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-xs">
          {/* TABLA DE AUDITORÍA DE ARCHIVOS */}
          <div>
            <h4 className="font-bold text-slate-200 mb-2 text-sm flex items-center gap-2">
              📊 AUDITORÍA Y COMPROBACIÓN EN TIEMPO REAL
            </h4>
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Clave Lógica</th>
                    <th className="p-2.5">Archivo / Hoja</th>
                    <th className="p-2.5">Descripción del Recurso</th>
                    <th className="p-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2.5 text-amber-300 font-sans font-bold">{item.logicalKey}</td>
                      <td className="p-2.5 text-slate-300 truncate max-w-[180px]">{item.fileName}</td>
                      <td className="p-2.5 text-slate-400 font-sans">{item.description}</td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> LISTO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
};
