import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'no';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    login: 'Login',
    username: 'Username',
    password: 'Password',
    logout: 'Logout',
    
    // Admin
    adminPanel: 'Admin Panel',
    createUser: 'Create User',
    fullName: 'Full Name',
    email: 'Email',
    userStatistics: 'User Statistics',
    candidatesViewed: 'Candidates Viewed',
    searches: 'Searches',
    interviews: 'Interviews',
    viewDetails: 'View Details',
    userDetails: 'User Details',
    
    // Portal
    candidatePortal: 'Candidate Portal',
    search: 'Search',
    searchPlaceholder: 'Search candidates...',
    filterByStatus: 'Filter by Status',
    available: 'Available',
    inTraining: 'In Training',
    hired: 'Hired',
    
    // Candidate
    yearsOld: 'years old',
    nationality: 'Nationality',
    profession: 'Profession',
    coverLetter: 'Cover Letter',
    medicalExperience: 'Medical Experience',
    nonMedicalExperience: 'Non-Medical Experience',
    education: 'Education',
    fullDetails: 'Full Details',
    close: 'Close',
    
    // Actions
    requestInterview: 'Request Interview',
    availability: 'Availability',
    submit: 'Submit',
    cancel: 'Cancel',
    
    // Messages
    loginSuccess: 'Login successful',
    loginError: 'Invalid credentials',
    userCreated: 'User created successfully',
    interviewRequested: 'Interview request sent',
  },
  no: {
    // Auth
    login: 'Logg inn',
    username: 'Brukernavn',
    password: 'Passord',
    logout: 'Logg ut',
    
    // Admin
    adminPanel: 'Administrasjonspanel',
    createUser: 'Opprett bruker',
    fullName: 'Fullt navn',
    email: 'E-post',
    userStatistics: 'Brukerstatistikk',
    candidatesViewed: 'Kandidater sett',
    searches: 'Søk',
    interviews: 'Intervjuer',
    viewDetails: 'Vis detaljer',
    userDetails: 'Brukerdetaljer',
    
    // Portal
    candidatePortal: 'Kandidatportal',
    search: 'Søk',
    searchPlaceholder: 'Søk kandidater...',
    filterByStatus: 'Filtrer etter status',
    available: 'Tilgjengelig',
    inTraining: 'I opplæring',
    hired: 'Ansatt',
    
    // Candidate
    yearsOld: 'år',
    nationality: 'Nasjonalitet',
    profession: 'Yrke',
    coverLetter: 'Følgebrev',
    medicalExperience: 'Medisinsk erfaring',
    nonMedicalExperience: 'Ikke-medisinsk erfaring',
    education: 'Utdanning',
    fullDetails: 'Alle detaljer',
    close: 'Lukk',
    
    // Actions
    requestInterview: 'Be om intervju',
    availability: 'Tilgjengelighet',
    submit: 'Send inn',
    cancel: 'Avbryt',
    
    // Messages
    loginSuccess: 'Innlogging vellykket',
    loginError: 'Ugyldige påloggingsdetaljer',
    userCreated: 'Bruker opprettet',
    interviewRequested: 'Intervjuforespørsel sendt',
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