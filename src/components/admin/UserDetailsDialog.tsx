import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, Calendar } from 'lucide-react';

interface UserDetailsDialogProps {
  username: string;
  onClose: () => void;
}

const UserDetailsDialog = ({ username, onClose }: UserDetailsDialogProps) => {
  const { t, language } = useLanguage();
  const [views, setViews] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    fetchDetails();
  }, [username]);

  const fetchDetails = async () => {
    try {
      const { data: viewsData } = await supabase.rpc('admin_list_candidate_view_logs');
      const { data: searchesData } = await supabase.rpc('admin_list_employer_search_logs');
      const { data: interviewsData } = await supabase.rpc('admin_list_schedule_requests');

      setViews(viewsData?.filter((v: any) => v.employer_username === username) || []);
      setSearches(searchesData?.filter((s: any) => s.employer_username === username) || []);
      setInterviews(interviewsData?.filter((i: any) => i.employer_username === username) || []);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('userDetails')}: {username}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="views" className="gap-2">
              <Users className="h-4 w-4" />
              {t('candidatesViewed')} ({views.length})
            </TabsTrigger>
            <TabsTrigger value="searches" className="gap-2">
              <Search className="h-4 w-4" />
              {t('searches')} ({searches.length})
            </TabsTrigger>
            <TabsTrigger value="interviews" className="gap-2">
              <Calendar className="h-4 w-4" />
              {t('interviews')} ({interviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-2">
            {views.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No candidates viewed yet</p>
            ) : (
              views.map((view) => (
                <Card key={view.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{view.candidate_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(view.viewed_at).toLocaleString(language === 'en' ? 'en-US' : 'nb-NO')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="searches" className="space-y-2">
            {searches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No searches performed yet</p>
            ) : (
              searches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="pt-4">
                    <div>
                      <p className="font-medium">{search.query}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(search.searched_at).toLocaleString(language === 'en' ? 'en-US' : 'nb-NO')}
                      </p>
                      {search.candidate_names?.length > 0 && (
                        <p className="text-sm mt-2">
                          Results: {search.candidate_names.join(', ')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="interviews" className="space-y-2">
            {interviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No interviews requested yet</p>
            ) : (
              interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="pt-4">
                    <div>
                      <p className="font-medium">{interview.candidate_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interview.requested_at).toLocaleString(language === 'en' ? 'en-US' : 'nb-NO')}
                      </p>
                      <p className="text-sm mt-2">
                        Availability: {interview.availability}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;