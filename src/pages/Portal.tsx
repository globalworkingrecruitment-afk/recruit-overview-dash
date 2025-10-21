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
  const { language, setLanguage, t } = useLanguage();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary via-orange-500 to-primary shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <img 
              src={logoGlobalWorking} 
              alt="Global Working" 
              className="h-12 object-contain"
            />
            
            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Language Switch */}
              <div className="relative flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1">
                <span className={`absolute left-1 top-1/2 -translate-y-1/2 w-12 h-8 bg-white rounded-full transition-transform duration-300 ${language === 'no' ? 'translate-x-12' : 'translate-x-0'}`} />
                <button
                  onClick={() => setLanguage('en')}
                  className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${language === 'en' ? 'text-primary' : 'text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('no')}
                  className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${language === 'no' ? 'text-primary' : 'text-white'}`}
                >
                  NO
                </button>
              </div>
              
              {/* Logout Button */}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white hover:bg-white/90 text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Title */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent text-center">
            {t('candidatePortal')}
          </h1>
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

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t('totalCandidates')}
              </p>
              <p className="text-4xl font-bold text-primary">+1000</p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t('nonScandinavianShare')}
              </p>
              <p className="text-4xl font-bold text-primary">1/3</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('nonScandinavianText')}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t('activePlacements')}
              </p>
              <p className="text-4xl font-bold text-primary">
                {candidates.filter(c => c.estado.match(/^hired - \d{4}$/i)).length}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t('candidatesOnPage')}
              </p>
              <p className="text-4xl font-bold text-primary">{filteredCandidates.length}</p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <Tabs value={statusFilter} onValueChange={(val) => {
          setStatusFilter(val);
          if (val === 'Hired') setHiredYearFilter('all');
        }}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-500 data-[state=active]:text-white">
              {language === 'en' ? 'All' : 'Alle'}
            </TabsTrigger>
            <TabsTrigger value="Available" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-500 data-[state=active]:text-white">
              {t(getStatusKey('Available'))}
            </TabsTrigger>
            <TabsTrigger value="In Training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-500 data-[state=active]:text-white">
              {t(getStatusKey('In Training'))}
            </TabsTrigger>
            <TabsTrigger value="Hired" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-500 data-[state=active]:text-white">
              {t(getStatusKey('Hired'))}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
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
                {language === 'en' ? 'No candidates found' : 'Ingen kandidater funnet'}
              </p>
            )}
          </TabsContent>

          <TabsContent value="Available" className="mt-6">
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
                {language === 'en' ? 'No candidates found' : 'Ingen kandidater funnet'}
              </p>
            )}
          </TabsContent>

          <TabsContent value="In Training" className="mt-6">
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
            )}
            
            {hiredYears.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
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