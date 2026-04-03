import { useTheme } from '../context/ThemeContext';
import { Palette, Wrench, CheckCircle2 } from 'lucide-react';

export const AppearanceSettings = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <div className="border-b border-base-300 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Appearance</h1>
        <p className="text-base-content/60 mt-2">Personalize the look and feel of your workspace.</p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold">Theme Selection</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {themes.map((t: string) => {
            const isActive = theme === t;
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                  isActive 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-base-200 bg-base-100/30 hover:bg-base-200/50 hover:border-base-300 text-base-content/80'
                }`}
              >
                <div 
                  data-theme={t} 
                  className={`w-10 h-10 rounded-full mb-3 border-4 flex items-center justify-center ${
                    isActive ? 'border-primary/20' : 'border-base-200 group-hover:border-base-300'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-primary opacity-80"></div>
                </div>
                <span className="capitalize text-sm font-medium">{t}</span>
                {isActive && (
                  <CheckCircle2 className="w-4 h-4 absolute top-3 right-3 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export const AdvancedSettings = () => {
  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <div className="border-b border-base-300 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Advanced Settings</h1>
        <p className="text-base-content/60 mt-2">System configurations and technical parameters.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-base-300 rounded-3xl bg-base-100/30">
        <div className="p-4 bg-base-200/50 rounded-2xl mb-4">
          <Wrench className="h-10 w-10 text-base-content/40" />
        </div>
        <h3 className="font-semibold text-lg">Under Construction</h3>
        <p className="text-base-content/60 max-w-sm mt-2">These modules are currently being developed. Check back later for updates.</p>
      </div>
    </div>
  );
};
