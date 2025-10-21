import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Languages, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CandidateCard from '@/components/portal/CandidateCard';
import CandidateDetailsDialog from '@/components/portal/CandidateDetailsDialog';

interface Candidate {
  id: string;
  nombre: string;
  anio_nacimiento: number;
  nacionalidad_en: string;
  nacionalidad_no: string;
  profesion_en: string | null;
  profesion_no: string | null;
  carta_resumen_en: string | null;
  carta_resumen_no: string | null;
  carta_en: string | null;
  carta_no: string | null;
  experiencia_medica_en: string | null;
  experiencia_medica_no: string | null;
  experiencia_no_medica_en: string | null;
  experiencia_no_medica_no: string | null;
  formacion_en: string | null;
  formacion_no: string | null;
  estado: string;
  correo: string;
}

const Portal = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('activo');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchCandidates();
  }, [user, navigate]);

  useEffect(() => {
    filterCandidates();
  }, [searchQuery, statusFilter, candidates, language]);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_data')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates.filter((c) => c.estado === statusFilter);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const searchableFields = [
          c.nombre,
          language === 'en' ? c.nacionalidad_en : c.nacionalidad_no,
          language === 'en' ? c.profesion_en : c.profesion_no,
        ];
        return searchableFields.some((field) => 
          field?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredCandidates(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    try {
      const resultNames = filteredCandidates.map((c) => c.nombre);
      await supabase.rpc('log_employer_search', {
        p_employer_username: user.username,
        p_query: searchQuery,
        p_candidate_names: resultNames,
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusKey = (status: string) => {
    switch (status) {
      case 'activo':
        return 'available';
      case 'en_formacion':
        return 'inTraining';
      case 'contratado':
        return 'hired';
      default:
        return 'available';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('candidatePortal')}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'en' ? 'NO' : 'EN'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            {t('search')}
          </Button>
        </div>

        {/* Status Filter */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="activo">{t(getStatusKey('activo'))}</TabsTrigger>
            <TabsTrigger value="en_formacion">{t(getStatusKey('en_formacion'))}</TabsTrigger>
            <TabsTrigger value="contratado">{t(getStatusKey('contratado'))}</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onExpand={() => setSelectedCandidate(candidate)}
                />
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No candidates found
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default Portal;