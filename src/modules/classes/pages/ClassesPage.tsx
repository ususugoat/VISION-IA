import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { VisionClass } from '../../../core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Tags, Plus, Edit2, Check } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { repository, showToast } = useApp();
  const [classes, setClasses] = useState<VisionClass[]>([]);

  useEffect(() => {
    repository.getClasses().then(setClasses);
  }, [repository]);

  const toggleClass = async (cls: VisionClass) => {
    const updated = { ...cls, enabled: !cls.enabled };
    await repository.updateClass(updated);
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? updated : c)));
    showToast(`Clase "${cls.name}" ${updated.enabled ? 'habilitada' : 'deshabilitada'}`, "info");
  };

  const handleColorChange = async (cls: VisionClass, newColor: string) => {
    const updated = { ...cls, color: newColor };
    await repository.updateClass(updated);
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? updated : c)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="blue">Taxonomía de Objetos</Badge>
          <span className="text-xs text-slate-400">Sección 8 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Catálogo de Clases & Codificación de Colores
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Define las entidades que el modelo detector y segmentador es capaz de identificar. Cada clase cuenta con un código de color asignado para estandarizar las anotaciones en el visor visual.
        </p>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={cls.color}
                  onChange={(e) => handleColorChange(cls, e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  title="Cambiar color de etiqueta"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cls.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{cls.id}</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cls.enabled}
                  onChange={() => toggleClass(cls)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <p className="text-xs text-slate-500 leading-normal">{cls.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <Badge variant="slate">{cls.category.toUpperCase()}</Badge>
              <span className="font-mono text-slate-400">{cls.color.toUpperCase()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

