import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye } from 'lucide-react';

interface UserStatsRowProps {
  stats: {
    username: string;
    email: string | null;
    full_name: string | null;
    candidatesViewed: number;
    searches: number;
    interviews: number;
  };
  onViewDetails: () => void;
}

const UserStatsRow = ({ stats, onViewDetails }: UserStatsRowProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-card hover:bg-accent/5 rounded-lg transition-colors items-center">
      <div className="font-medium">{stats.username}</div>
      <div className="text-sm text-muted-foreground">{stats.full_name || '-'}</div>
      <div className="text-center font-semibold text-primary">{stats.candidatesViewed}</div>
      <div className="text-center font-semibold text-accent">{stats.searches}</div>
      <div className="text-center font-semibold text-success">{stats.interviews}</div>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('viewDetails')}
        </Button>
      </div>
    </div>
  );
};

export default UserStatsRow;