import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CandidateDetailsDialogProps {
  candidate: {
    id: string;
    nombre: string;
    anio_nacimiento: number;
    nacionalidad_en: string;
    nacionalidad_no: string;
    profesion_en: string | null;
    profesion_no: string | null;
    carta_en: string | null;
    carta_no: string | null;
    experiencia_medica_en: string | null;
    experiencia_medica_no: string | null;
    experiencia_no_medica_en: string | null;
    experiencia_no_medica_no: string | null;
    formacion_en: string | null;
    formacion_no: string | null;
    correo: string;
  };
  onClose: () => void;
}

const CandidateDetailsDialog = ({ candidate, onClose }: CandidateDetailsDialogProps) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [availability, setAvailability] = useState('');

  const age = new Date().getFullYear() - candidate.anio_nacimiento;
  const nationality = language === 'en' ? candidate.nacionalidad_en : candidate.nacionalidad_no;
  const profession = language === 'en' ? candidate.profesion_en : candidate.profesion_no;
  const coverLetter = language === 'en' ? candidate.carta_en : candidate.carta_no;
  const medicalExp = language === 'en' ? candidate.experiencia_medica_en : candidate.experiencia_medica_no;
  const nonMedicalExp = language === 'en' ? candidate.experiencia_no_medica_en : candidate.experiencia_no_medica_no;
  const education = language === 'en' ? candidate.formacion_en : candidate.formacion_no;

  // Log view when dialog opens
  useEffect(() => {
    const logView = async () => {
      if (user) {
        try {
          await supabase.from('candidate_view_logs').insert({
            employer_username: user.username,
            candidate_id: candidate.id,
            candidate_name: candidate.nombre,
          });
        } catch (error) {
          console.error('Error logging view:', error);
        }
      }
    };
    
    logView();
  }, [user, candidate.id, candidate.nombre]);

  const handleInterviewRequest = async () => {
    if (!availability.trim() || !user) return;

    try {
      const { error } = await supabase.from('schedule_requests').insert({
        employer_username: user.username,
        employer_email: user.email || user.username,
        employer_name: user.full_name,
        candidate_id: candidate.id,
        candidate_name: candidate.nombre,
        candidate_email: candidate.correo,
        availability: availability,
      });

      if (error) throw error;

      toast.success(t('interviewRequested'));
      setShowInterviewForm(false);
      setAvailability('');
    } catch (error) {
      console.error('Error requesting interview:', error);
      toast.error('Failed to request interview');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {candidate.nombre} - {age} {t('yearsOld')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {education && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('education')}</h3>
              <p className="whitespace-pre-wrap">{education}</p>
            </div>
          )}

          {medicalExp && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('medicalExperience')}</h3>
              <p className="whitespace-pre-wrap">{medicalExp}</p>
            </div>
          )}

          {nonMedicalExp && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('nonMedicalExperience')}</h3>
              <p className="whitespace-pre-wrap">{nonMedicalExp}</p>
            </div>
          )}

          {coverLetter && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('coverLetter')}</h3>
              <p className="whitespace-pre-wrap">{coverLetter}</p>
            </div>
          )}

          {!showInterviewForm ? (
            <Button onClick={() => setShowInterviewForm(true)} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              {t('requestInterview')}
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="availability">{t('availability')}</Label>
                <Textarea
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="E.g., Next week Monday-Wednesday"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInterviewRequest} className="flex-1">
                  {t('submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInterviewForm(false);
                    setAvailability('');
                  }}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailsDialog;