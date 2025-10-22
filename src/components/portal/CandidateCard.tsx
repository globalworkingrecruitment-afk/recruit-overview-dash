import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

interface CandidateCardProps {
  candidate: {
    id: string;
    nombre: string;
    anio_nacimiento: number;
    nacionalidad_en: string;
    nacionalidad_no: string;
    profesion_en: string | null;
    profesion_no: string | null;
    carta_resumen_en: string | null;
    carta_resumen_no: string | null;
    experiencia_medica_en: string | null;
    experiencia_medica_no: string | null;
    estado: string;
  };
  onExpand: () => void;
}

const CandidateCard = ({ candidate, onExpand }: CandidateCardProps) => {
  const { language, t } = useLanguage();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const getDisplayName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  };

  const age = new Date().getFullYear() - candidate.anio_nacimiento;
  const nationality = language === 'en' ? candidate.nacionalidad_en : candidate.nacionalidad_no;
  const profession = language === 'en' ? candidate.profesion_en : candidate.profesion_no;
  const coverLetterSummary = language === 'en' ? candidate.carta_resumen_en : candidate.carta_resumen_no;
  const medicalExperience = language === 'en' ? candidate.experiencia_medica_en : candidate.experiencia_medica_no;

  const getBorderClass = () => {
    const status = candidate.estado.toLowerCase();
    if (status === 'available') {
      return 'border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]';
    }
    if (status === 'in training') {
      return 'border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    }
    if (status.startsWith('hired')) {
      return 'border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    }
    return '';
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 bg-gradient-card ${getBorderClass()}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14 shadow-lg">
            <AvatarFallback className="bg-gradient-primary text-white font-bold text-xl">
              {getInitials(candidate.nombre)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-bold">{getDisplayName(candidate.nombre)}</p>
            <p className="text-sm text-muted-foreground">{age} {t('years')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('nationality')}</p>
          <p className="font-medium">{nationality}</p>
        </div>
        
        {profession && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('profession')}</p>
            <p className="font-medium">{profession}</p>
          </div>
        )}

        {coverLetterSummary && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('coverLetter')}</p>
            <p className="text-sm line-clamp-3">{coverLetterSummary}</p>
          </div>
        )}

        {medicalExperience && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('medicalExperience')}</p>
            <p className="text-sm line-clamp-2">{medicalExperience}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateCard;