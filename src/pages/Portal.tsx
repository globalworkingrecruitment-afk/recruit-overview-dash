import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CandidateCard from '@/components/portal/CandidateCard';
import CandidateDetailsDialog from '@/components/portal/CandidateDetailsDialog';
import LanguageToggle from '@/components/LanguageToggle';
import logoGlobalWorking from '@/assets/logo-globalworking.png';

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
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hiredYearFilter, setHiredYearFilter] = useState<string>('all');
  const [hiredYears, setHiredYears] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchCandidates();
  }, [user, navigate]);

  useEffect(() => {
    filterCandidates();
    extractHiredYears();
  }, [searchQuery, statusFilter, hiredYearFilter, candidates, language]);

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

  const extractHiredYears = () => {
    const hiredPattern = /^hired - (\d{4})$/i;
    const years = new Set<string>();

    candidates.forEach((c) => {
      const match = c.estado.match(hiredPattern);
      if (match) {
        years.add(match[1]);
      }
    });

    setHiredYears(Array.from(years).sort().reverse());
  };

  const filterCandidates = () => {
    let filtered: Candidate[] = [];

    if (statusFilter === 'all') {
      // Mostrar todos los candidatos
      filtered = [...candidates];
    } else if (statusFilter === 'Hired') {
      // Filtrar candidatos con estado "hired - YYYY"
      const hiredPattern = /^hired - (\d{4})$/i;
      filtered = candidates.filter((c) => {
        const match = c.estado.match(hiredPattern);
        if (!match) return false;

        // Si hay filtro de año específico, aplicarlo
        if (hiredYearFilter !== 'all' && match[1] !== hiredYearFilter) {
          return false;
        }

        return true;
      });
    } else {
      // Filtrado normal para Available e In Training
      filtered = candidates.filter((c) => c.estado === statusFilter);
    }

    if (searchQuery.trim()) {
      const queryWords = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      filtered = filtered.filter((c) => {
        const searchableFields = [
          c.nombre,
          language === 'en' ? c.nacionalidad_en : c.nacionalidad_no,
          language === 'en' ? c.profesion_en : c.profesion_no,
          language === 'en' ? c.carta_resumen_en : c.carta_resumen_no,
          language === 'en' ? c.experiencia_medica_en : c.experiencia_medica_no,
          language === 'en' ? c.experiencia_no_medica_en : c.experiencia_no_medica_no,
          language === 'en' ? c.formacion_en : c.formacion_no,
        ];

        const searchText = searchableFields.join(' ').toLowerCase();

        return queryWords.some((word) => searchText.includes(word));
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
      case 'Available':
        return 'available';
      case 'In Training':
        return 'inTraining';
      case 'Hired':
        return 'hired';
      default:
        return 'available';
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'hsl(var(--gw-blue-medium) / 0.08)' }}
    >
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <LanguageToggle />

            <div className="absolute left-1/2 -translate-x-1/2">
              <img
                src={logoGlobalWorking}
                alt="Global Working"
                className="h-14 object-contain"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8 p-6">
        {/* Title */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          <h1 className="text-center text-4xl font-bold text-primary md:text-5xl">
            {t('candidatePortal')}
          </h1>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t('search')}
          </Button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6 shadow-md">
            <div className="flex flex-col items-center text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('totalCandidates')}
              </p>
              <p className="text-4xl font-bold text-primary">+1000</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-md">
            <div className="flex flex-col items-center text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('nonScandinavianShare')}
              </p>
              <p className="text-4xl font-bold text-primary">1/3</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('nonScandinavianText')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-md">
            <div className="flex flex-col items-center text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('activePlacements')}
              </p>
              <p className="text-4xl font-bold text-primary">
                {candidates.filter((c) => c.estado.match(/^hired - \d{4}$/i)).length}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-md">
            <div className="flex flex-col items-center text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('candidatesOnPage')}
              </p>
              <p className="text-4xl font-bold text-primary">{filteredCandidates.length}</p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <Tabs
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            if (val === 'Hired') setHiredYearFilter('all');
          }}
        >
          <TabsList className="bg-muted">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {language === 'en' ? 'All' : 'Alle'}
            </TabsTrigger>
            <TabsTrigger
              value="Available"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t(getStatusKey('Available'))}
            </TabsTrigger>
            <TabsTrigger
              value="In Training"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t(getStatusKey('In Training'))}
            </TabsTrigger>
            <TabsTrigger
              value="Hired"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t(getStatusKey('Hired'))}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onExpand={() => setSelectedCandidate(candidate)}
                />
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                {language === 'en' ? 'No candidates found' : 'Ingen kandidater funnet'}
              </p>
            )}
          </TabsContent>

          <TabsContent value="Available" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onExpand={() => setSelectedCandidate(candidate)}
                />
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                {language === 'en' ? 'No candidates found' : 'Ingen kandidater funnet'}
              </p>
            )}
          </TabsContent>

          <TabsContent value="In Training" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onExpand={() => setSelectedCandidate(candidate)}
                />
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                {language === 'en' ? 'No candidates found' : 'Ingen kandidater funnet'}
              </p>
            )}
          </TabsContent>

          <TabsContent value="Hired" className="mt-6 space-y-6">
            {/* Year Filter for Hired */}
            {hiredYears.length > 0 && (
              <Tabs value={hiredYearFilter} onValueChange={setHiredYearFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {hiredYears.map((year) => (
                    <TabsTrigger key={year} value={year}>
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={hiredYearFilter} className="mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onExpand={() => setSelectedCandidate(candidate)}
                      />
                    ))}
                  </div>
                  {filteredCandidates.length === 0 && (
                    <p className="py-12 text-center text-muted-foreground">
                      No candidates found
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {hiredYears.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No hired candidates found
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
