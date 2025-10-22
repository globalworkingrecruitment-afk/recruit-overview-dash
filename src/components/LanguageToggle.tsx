import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const baseButtonClasses =
    'px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200';

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-primary/20 bg-white p-1 shadow-sm',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          baseButtonClasses,
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-primary hover:bg-primary/10',
        )}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('no')}
        className={cn(
          baseButtonClasses,
          language === 'no'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-primary hover:bg-primary/10',
        )}
        aria-pressed={language === 'no'}
      >
        NO
      </button>
    </div>
  );
};

export default LanguageToggle;
