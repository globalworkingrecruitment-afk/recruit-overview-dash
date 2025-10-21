import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'no' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth - Natural English content
    login: 'Sign In',
    signup: 'Create Account',
    username: 'Username',
    usernameOrEmail: 'Username or Email',
    password: 'Password',
    email: 'Email Address',
    fullName: 'Full Name',
    logout: 'Sign Out',
    fillAllFields: 'Please complete all required fields',
    errorCreatingUser: 'Unable to create user account',
    errorLoadingStats: 'Failed to load statistics',
    
    // Admin
    adminPanel: 'Administration Panel',
    createUser: 'Add New User',
    userStatistics: 'User Activity Overview',
    candidatesViewed: 'Profiles Viewed',
    searches: 'Searches',
    interviews: 'Interview Requests',
    viewDetails: 'View Details',
    userDetails: 'User Information',
    
    // Portal - Natural English content
    candidatePortal: 'Talent Portal',
    search: 'Search',
    searchPlaceholder: 'Search by name, profession, skills...',
    filterByStatus: 'Filter by Status',
    available: 'Available',
    inTraining: 'In Training',
    hired: 'Hired',
    
    // Statistics
    totalCandidates: 'Total Global Working Candidates',
    nonScandinavianShare: 'Non-Scandinavian Market Share',
    nonScandinavianText: 'of non-Scandinavian candidates',
    activePlacements: 'Active Placements',
    candidatesOnPage: 'Candidates on This Page',
    
    // Candidate
    yearsOld: 'years old',
    nationality: 'Nationality',
    profession: 'Profession',
    coverLetter: 'About Me',
    medicalExperience: 'Healthcare Experience',
    nonMedicalExperience: 'Other Professional Experience',
    education: 'Education & Qualifications',
    fullDetails: 'View Full Profile',
    close: 'Close',
    
    // Actions
    requestInterview: 'Schedule Interview',
    availability: 'Availability',
    submit: 'Submit',
    cancel: 'Cancel',
    
    // Messages
    loginSuccess: 'Welcome back!',
    loginError: 'Invalid login credentials',
    userCreated: 'User account created successfully',
    interviewRequested: 'Interview request submitted successfully',
  },
  no: {
    // Auth - Natural Norwegian content
    login: 'Logg inn',
    signup: 'Opprett konto',
    username: 'Brukernavn',
    usernameOrEmail: 'Brukernavn eller e-post',
    password: 'Passord',
    email: 'E-postadresse',
    fullName: 'Fullt navn',
    logout: 'Logg ut',
    fillAllFields: 'Vennligst fyll ut alle feltene',
    errorCreatingUser: 'Kunne ikke opprette brukerkonto',
    errorLoadingStats: 'Kunne ikke laste statistikk',
    
    // Admin
    adminPanel: 'Administrasjon',
    createUser: 'Legg til ny bruker',
    userStatistics: 'Brukeraktivitet',
    candidatesViewed: 'Profiler sett',
    searches: 'Søk',
    interviews: 'Intervjuforespørsler',
    viewDetails: 'Se detaljer',
    userDetails: 'Brukerinformasjon',
    
    // Portal - Natural Norwegian content
    candidatePortal: 'Talentportal',
    search: 'Søk',
    searchPlaceholder: 'Søk etter navn, yrke, kompetanse...',
    filterByStatus: 'Filtrer etter status',
    available: 'Tilgjengelig',
    inTraining: 'Under opplæring',
    hired: 'Ansatt',
    
    // Statistics
    totalCandidates: 'Total Global Working-kandidater',
    nonScandinavianShare: 'Ikke-skandinavisk markedsandel',
    nonScandinavianText: 'av ikke-skandinaviske kandidater',
    activePlacements: 'Aktive plasseringer',
    candidatesOnPage: 'Kandidater på denne siden',
    
    // Candidate
    yearsOld: 'år',
    nationality: 'Nasjonalitet',
    profession: 'Yrke',
    coverLetter: 'Om meg',
    medicalExperience: 'Helsefaglig erfaring',
    nonMedicalExperience: 'Annen yrkeserfaring',
    education: 'Utdanning og kvalifikasjoner',
    fullDetails: 'Se hele profilen',
    close: 'Lukk',
    
    // Actions
    requestInterview: 'Bestill intervju',
    availability: 'Tilgjengelighet',
    submit: 'Send',
    cancel: 'Avbryt',
    
    // Messages
    loginSuccess: 'Velkommen tilbake!',
    loginError: 'Ugyldig brukernavn eller passord',
    userCreated: 'Brukerkonto opprettet',
    interviewRequested: 'Intervjuforespørsel sendt',
  },
  es: {
    // Auth - Spanish content for Admin
    login: 'Iniciar sesión',
    signup: 'Crear cuenta',
    username: 'Usuario',
    usernameOrEmail: 'Usuario o correo',
    password: 'Contraseña',
    email: 'Correo electrónico',
    fullName: 'Nombre completo',
    logout: 'Cerrar sesión',
    fillAllFields: 'Por favor completa todos los campos obligatorios',
    errorCreatingUser: 'Error al crear el usuario',
    errorLoadingStats: 'Error al cargar las estadísticas',
    
    // Admin
    adminPanel: 'Panel de Administración',
    createUser: 'Crear Usuario',
    userStatistics: 'Estadísticas de Usuarios',
    candidatesViewed: 'Candidatos Vistos',
    searches: 'Búsquedas',
    interviews: 'Entrevistas',
    viewDetails: 'Ver Detalles',
    userDetails: 'Detalles del Usuario',
    
    // Portal
    candidatePortal: 'Portal de Candidatos',
    search: 'Buscar',
    searchPlaceholder: 'Buscar candidatos...',
    filterByStatus: 'Filtrar por estado',
    available: 'Disponible',
    inTraining: 'En formación',
    hired: 'Contratado',
    
    // Candidate
    yearsOld: 'años',
    nationality: 'Nacionalidad',
    profession: 'Profesión',
    coverLetter: 'Carta de presentación',
    medicalExperience: 'Experiencia médica',
    nonMedicalExperience: 'Experiencia no médica',
    education: 'Educación',
    fullDetails: 'Detalles completos',
    close: 'Cerrar',
    
    // Actions
    requestInterview: 'Solicitar entrevista',
    availability: 'Disponibilidad',
    submit: 'Enviar',
    cancel: 'Cancelar',
    
    // Messages
    loginSuccess: 'Inicio de sesión exitoso',
    loginError: 'Credenciales inválidas',
    userCreated: 'Usuario creado correctamente',
    interviewRequested: 'Solicitud de entrevista enviada',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};