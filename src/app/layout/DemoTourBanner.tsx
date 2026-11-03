import React from 'react';
import { useApp, DEMO_TOUR_STEPS } from '../providers/AppContext';
import { Sparkles, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../../shared/ui/Button';

export const DemoTourBanner: React.FC = () => {
  const { activeDemoStep, nextDemoStep, prevDemoStep, stopDemoTour } = useApp();

  if (activeDemoStep === null) return null;

  const currentStep = DEMO_TOUR_STEPS[activeDemoStep - 1];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-3 border-b border-indigo-800 shadow-md flex items-center justify-between shrink-0 select-none z-30 transition-all animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Guion de Empresa • Paso {activeDemoStep} de {DEMO_TOUR_STEPS.length}
            </span>
            <span className="text-xs font-semibold text-white">{currentStep.title}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
            <span>{currentStep.description}</span>
            {currentStep.actionHint && (
              <span className="text-cyan-200 font-medium bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                👉 {currentStep.actionHint}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={prevDemoStep}
          disabled={activeDemoStep <= 1}
          className="text-white hover:bg-white/10 text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </Button>

        <Button
          size="sm"
          variant="cyan"
          onClick={nextDemoStep}
          className="text-xs shadow-md shadow-cyan-500/20"
        >
          {activeDemoStep === DEMO_TOUR_STEPS.length ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" /> Finalizar Demo
            </>
          ) : (
            <>
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>

        <button
          onClick={stopDemoTour}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
          title="Cerrar guion guiado"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

