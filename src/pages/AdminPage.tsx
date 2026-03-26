import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAllDogs, useApproveDog, useUpdateDog, useDeleteDog } from '@/hooks/useDogs';
import { useAllHelperApplications, useUpdateHelperApplication } from '@/hooks/useHelperApplication';
import { useIsHelper } from '@/hooks/useHelperApplication';
import { useLatestRemarks, useDogRemarks, useAddDogRemark } from '@/hooks/useDogRemarks';
import { useDogChangeLog, useAddDogChangeLog } from '@/hooks/useDogChangeLog';
import { useTeamMessages, useAddTeamMessage, useDeleteTeamMessage } from '@/hooks/useTeamMessages';
import { useFacilities, useDeleteFacility } from '@/hooks/useFacilities';
import { useAllAdvertisements, useCreateAdvertisement, useUpdateAdvertisement, useDeleteAdvertisement } from '@/hooks/useAdvertisements';
import { useSponsors, useAddSponsor, useDeleteSponsor } from '@/hooks/useSponsors';
import { useRehabSpots } from '@/hooks/useRehabSpots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dog as DogIcon,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  LogOut,
  ArrowLeft,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  MessageSquare,
  History,
  Send,
  Reply,
  StickyNote,
  Building2,
  Plus,
  Stethoscope,
  Home,
  FileText,
  Heart,
  Megaphone,
  ExternalLink,
  Link as LinkIcon,
  Image as ImageIcon,
  Bandage,
  MapPin,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { Dog, REPORT_TYPE_LABELS, ReportType } from '@/types/dog';
import AddFacilityDialog from '@/components/AddFacilityDialog';
import PhotoUpload from '@/components/PhotoUpload';
import { uploadBase64ToStorage } from '@/lib/photoStorage';
import SponsorTabContent from '@/components/SponsorTabContent';
import PhotoLightbox from '@/components/PhotoLightbox';
import RehabSpotsTab from '@/components/RehabSpotsTab';

const genderSymbol = (gender?: string | null) => {
  if (gender === 'male') return <span title="Männlich" className="text-blue-500 font-bold ml-1">♂</span>;
  if (gender === 'female') return <span title="Weiblich" className="text-pink-500 font-bold ml-1">♀</span>;
  return null;
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const { data: dogs, isLoading: dogsLoading } = useAllDogs();
  const { data: helperApplications } = useAllHelperApplications();
  const { data: latestRemarks } = useLatestRemarks();
  const { data: teamMessages } = useTeamMessages();
  const { data: facilities } = useFacilities();
  const { data: advertisements } = useAllAdvertisements();
  const { data: sponsors = [] } = useSponsors();
  const addSponsor = useAddSponsor();
  const deleteSponsor = useDeleteSponsor();
  const { data: rehabSpots } = useRehabSpots();
  const approveDog = useApproveDog();

  // Guest reports — shown in pending tab alongside unreviewed dogs
  const [guestReports, setGuestReports] = useState<any[]>([]);
  const fetchGuestReports = useCallback(async () => {
    const { data } = await supabase
      .from('guest_reports')
      .select('*')
      .eq('reviewed', false)
      .order('created_at', { ascending: false });
    setGuestReports(data || []);
  }, []);
  useEffect(() => { fetchGuestReports(); }, [fetchGuestReports]);

  const handleConvertGuestReport = async (r: any) => {
    // If guest photos are base64, upload to Storage first
    const isBase64 = (s: string | null) => s && s.startsWith('data:');
    let photoUrl = r.photo_url || null;
    let photoUrl2 = r.photo_url_2 || null;
    let photoUrl3 = r.photo_url_3 || null;

    if (user?.id) {
      if (isBase64(photoUrl)) {
        photoUrl = await uploadBase64ToStorage(photoUrl, user.id, 0) || null;
      }
      if (isBase64(photoUrl2)) {
        photoUrl2 = await uploadBase64ToStorage(photoUrl2, user.id, 1) || null;
      }
      if (isBase64(photoUrl3)) {
        photoUrl3 = await uploadBase64ToStorage(photoUrl3, user.id, 2) || null;
      }
    }

    const { error } = await supabase.from('dogs').insert({
      name: r.name || 'Unbekannt (Gast-Meldung)',
      latitude: r.latitude,
      longitude: r.longitude,
      location: r.location,
      additional_info: r.additional_info || null,
      photo_url: photoUrl,
      photo_url_2: photoUrl2,
      photo_url_3: photoUrl3,
      report_type: r.report_type || 'stray',
      is_approved: true,
      is_vaccinated: false,
      reported_by: user?.id ?? null,
      ear_tag: r.ear_tag || null,
      gender: r.gender || null,
    });
    if (error) {
      alert('Fehler: ' + error.message);
      return;
    }
    await supabase.from('guest_reports').update({ reviewed: true }).eq('id', r.id);
    fetchGuestReports();
  };

  const handleDismissGuestReport = async (id: string) => {
    await supabase.from('guest_reports').update({ reviewed: true }).eq('id', id);
    fetchGuestReports();
  };
  const updateDog = useUpdateDog();
  const deleteDog = useDeleteDog();
  const updateHelperApplication = useUpdateHelperApplication();
  const addDogRemark = useAddDogRemark();
  const addChangeLog = useAddDogChangeLog();
  const addTeamMessage = useAddTeamMessage();
  const deleteTeamMessage = useDeleteTeamMessage();
  const deleteFacility = useDeleteFacility();
  const createAdvertisement = useCreateAdvertisement();
  const updateAdvertisement = useUpdateAdvertisement();
  const deleteAdvertisement = useDeleteAdvertisement();

  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [changeLogDialogOpen, setChangeLogDialogOpen] = useState(false);
  const [addFacilityDialogOpen, setAddFacilityDialogOpen] = useState(false);
  const [addAdDialogOpen, setAddAdDialogOpen] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [dogSortField, setDogSortField] = useState<string>('name');
  const [dogSortDir, setDogSortDir] = useState<'asc' | 'desc'>('asc');
  const [dogSearch, setDogSearch] = useState('');
  const [caretakerFilter, setCaretakerFilter] = useState<string>('all');

  const toggleDogSort = (field: string) => {
    if (dogSortField === field) {
      setDogSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setDogSortField(field);
      setDogSortDir('asc');
    }
  };

  const sortedDogs = (() => {
    if (!dogs) return [];
    let filtered = [...dogs];

    // Search filter
    if (dogSearch.trim()) {
      const q = dogSearch.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.earTag.toLowerCase().includes(q) ||
        (d.location || '').toLowerCase().includes(q) ||
        (d.sponsorName || '').toLowerCase().includes(q) ||
        (d.caretaker || '').toLowerCase().includes(q)
      );
    }

    // Caretaker filter
    if (caretakerFilter === 'unassigned') {
      filtered = filtered.filter(d => !d.caretaker);
    } else if (caretakerFilter !== 'all') {
      filtered = filtered.filter(d => d.caretaker === caretakerFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let valA: string | number, valB: string | number;
      switch (dogSortField) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'earTag': valA = a.earTag.toLowerCase(); valB = b.earTag.toLowerCase(); break;
        case 'location': valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase(); break;
        case 'reportType': valA = a.reportType; valB = b.reportType; break;
        case 'vaccination1': valA = a.vaccination1Date || ''; valB = b.vaccination1Date || ''; break;
        case 'vaccination2': valA = a.vaccination2Date || ''; valB = b.vaccination2Date || ''; break;
        case 'passport': valA = (a.vaccinationPassport || '').toLowerCase(); valB = (b.vaccinationPassport || '').toLowerCase(); break;
        case 'sponsor': valA = (a.sponsorName || '').toLowerCase(); valB = (b.sponsorName || '').toLowerCase(); break;
        case 'caretaker': valA = (a.caretaker || '').toLowerCase(); valB = (b.caretaker || '').toLowerCase(); break;
        case 'status': valA = a.isApproved ? 1 : 0; valB = b.isApproved ? 1 : 0; break;
        case 'created': valA = a.createdAt; valB = b.createdAt; break;
        default: valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
      }
      if (valA < valB) return dogSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return dogSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  })();
  const [newAdForm, setNewAdForm] = useState({
    title: '',
    image_url: '',
    target_url: '',
    display_delay_seconds: 20,
    is_active: true,
  });
  const [editForm, setEditForm] = useState({
    vaccination1Date: '',
    vaccination2Date: '',
    vaccinationPassport: '',
    isVaccinated: false,
    isApproved: false,
    sponsorName: '',
    caretaker: '',
    reportType: '' as string,
    photoUrls: ['', '', ''] as [string, string, string],
    gender: '' as '' | 'male' | 'female',
    additionalInfo: '',
  });

  const canAccess = isAdmin || isHelper;
  const canDelete = isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card rounded-xl p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {t('admin.accessDenied')}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t('admin.accessDeniedDesc')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>{t('admin.goHome')}</Button>
            <Button onClick={() => navigate('/become-helper')}>{t('common.becomeHelper')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async (dogId: string) => {
    await approveDog.mutateAsync(dogId);
    await addChangeLog.mutateAsync({
      dogId,
      userId: user.id,
      action: 'approved',
      changes: { is_approved: true },
    });
  };

  const handleEdit = (dog: Dog) => {
    setSelectedDog(dog);
    setEditForm({
      vaccination1Date: dog.vaccination1Date || '',
      vaccination2Date: dog.vaccination2Date || '',
      vaccinationPassport: dog.vaccinationPassport || '',
      isVaccinated: dog.isVaccinated,
      isApproved: dog.isApproved,
      sponsorName: dog.sponsorName || '',
      caretaker: dog.caretaker || '',
      reportType: dog.reportType,
      photoUrls: [dog.photo !== '/placeholder.svg' ? dog.photo : '', dog.photo2 || '', dog.photo3 || ''] as [string, string, string],
      gender: (dog.gender as '' | 'male' | 'female') || '',
      additionalInfo: dog.additionalInfo || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDog) return;
    
    const changes: Record<string, unknown> = {};
    if (editForm.vaccination1Date !== (selectedDog.vaccination1Date || '')) {
      changes.vaccination1_date = editForm.vaccination1Date || null;
    }
    if (editForm.vaccination2Date !== (selectedDog.vaccination2Date || '')) {
      changes.vaccination2_date = editForm.vaccination2Date || null;
    }
    if (editForm.vaccinationPassport !== (selectedDog.vaccinationPassport || '')) {
      changes.vaccination_passport = editForm.vaccinationPassport || null;
    }
    if (editForm.isVaccinated !== selectedDog.isVaccinated) {
      changes.is_vaccinated = editForm.isVaccinated;
    }
    if (editForm.isApproved !== selectedDog.isApproved) {
      changes.is_approved = editForm.isApproved;
    }
    if (editForm.sponsorName !== (selectedDog.sponsorName || '')) {
      changes.sponsor_name = editForm.sponsorName || null;
    }
    if (editForm.caretaker !== (selectedDog.caretaker || '')) {
      changes.caretaker = editForm.caretaker || null;
    }
    if (editForm.reportType !== selectedDog.reportType) {
      changes.report_type = editForm.reportType;
    }
    if (editForm.gender !== (selectedDog.gender || '')) {
      changes.gender = editForm.gender || null;
    }
    if (editForm.additionalInfo !== (selectedDog.additionalInfo || '')) {
      changes.additional_info = editForm.additionalInfo || null;
    }
    
    await updateDog.mutateAsync({
      id: selectedDog.id,
      updates: {
        vaccination1_date: editForm.vaccination1Date || null,
        vaccination2_date: editForm.vaccination2Date || null,
        vaccination_passport: editForm.vaccinationPassport || null,
        is_vaccinated: editForm.isVaccinated,
        is_approved: editForm.isApproved,
        sponsor_name: editForm.sponsorName || null,
        caretaker: editForm.caretaker || null,
        report_type: editForm.reportType,
        photo_url: editForm.photoUrls[0] || null,
        photo_url_2: editForm.photoUrls[1] || null,
        photo_url_3: editForm.photoUrls[2] || null,
        gender: editForm.gender || null,
        additional_info: editForm.additionalInfo || null,
      },
    });

    if (Object.keys(changes).length > 0) {
      await addChangeLog.mutateAsync({
        dogId: selectedDog.id,
        userId: user.id,
        action: 'updated',
        changes: changes as Record<string, string | number | boolean | null>,
      });
    }
    
    setEditDialogOpen(false);
    setSelectedDog(null);
  };

  const handleDelete = async (dogId: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      await deleteDog.mutateAsync(dogId);
    }
  };

  const handleHelperApplication = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    await updateHelperApplication.mutateAsync({ id, status, reviewedBy: user.id });
  };

  const openLightbox = (dog: Dog, startIndex = 0) => {
    const photos = [dog.photo, dog.photo2, dog.photo3]
      .filter((p): p is string => !!p && p !== '/placeholder.svg');
    if (photos.length === 0) return;
    setLightboxPhotos(photos);
    setLightboxIndex(Math.min(startIndex, photos.length - 1));
  };

  const handleAddRemark = async () => {
    if (!selectedDog || !newRemark.trim()) return;
    await addDogRemark.mutateAsync({
      dogId: selectedDog.id,
      userId: user.id,
      content: newRemark.trim(),
    });
    setNewRemark('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await addTeamMessage.mutateAsync({
      userId: user.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const handleSendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    await addTeamMessage.mutateAsync({
      userId: user.id,
      content: replyContent.trim(),
      parentId,
    });
    setReplyContent('');
    setReplyingTo(null);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-GB' : 'de-DE');
  };

  const formatDateTime = (dateString: string) => {
    const dateLocale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-GB' : 'de-DE';
    return new Date(dateString).toLocaleString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReportTypeBadge = (reportType: ReportType) => {
    const info = REPORT_TYPE_LABELS[reportType];
    const variants: Record<ReportType, string> = {
      save: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sos: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      stray: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      vaccination_wish: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variants[reportType]}`}>
        {info.emoji} {info.label}
      </span>
    );
  };

  const handleNavigateToMap = (dog: Dog) => {
    navigate(`/map?lat=${dog.latitude}&lng=${dog.longitude}&dog=${dog.id}`);
  };

  const pendingDogs = dogs?.filter(d => !d.isApproved) || [];
  const sosDogs = dogs?.filter(d => d.reportType === 'sos') || []; // "Attention" dogs
  const pendingApplications = helperApplications?.filter(a => a.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <h1 className="font-display text-base sm:text-xl font-bold truncate">
              {isAdmin ? t('admin.title') : t('admin.helperTitle')}
              <span className="hidden xs:inline"> {t('common.dashboard')}</span>
            </h1>
          </div>
          <Button variant="outline" onClick={signOut} size="sm" className="gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-sm">
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t('common.logout')}</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats Overview - Clickable Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('sos')}
            className="glass-card rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{sosDogs.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('admin.stats.sos')}</p>
                </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className="glass-card rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingDogs.length + guestReports.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('admin.tabs.pending')}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className="glass-card rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {dogs?.filter(d => d.isApproved).length || 0}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('admin.status.visible')}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className="glass-card rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{teamMessages?.length || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('admin.tabs.messages')}</p>
              </div>
            </div>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('helpers')}
              className="glass-card rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-lg shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingApplications.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('admin.stats.applications')}</p>
                </div>
              </div>
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile-optimized scrollable tabs */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-auto sm:flex-wrap gap-1 p-1 h-auto min-h-[44px]">
              <TabsTrigger value="pending" data-value="pending" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('admin.tabs.pending')}</span>
                <span className="xs:hidden">Ausstd.</span>
                <span>({pendingDogs.length + guestReports.length})</span>
              </TabsTrigger>
              <TabsTrigger value="sos" data-value="sos" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('admin.tabs.sos')} ({sosDogs.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-value="all" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <DogIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('admin.tabs.all')}
              </TabsTrigger>
              <TabsTrigger value="messages" data-value="messages" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('admin.tabs.messages')}</span>
                <span className="sm:hidden">Msgs</span>
              </TabsTrigger>
               <TabsTrigger value="rehab" data-value="rehab" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                 <Bandage className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                 <span className="hidden sm:inline">{t('admin.tabs.rehab')}</span>
                 <span className="sm:hidden">Rehab</span>
                 <span>({rehabSpots?.length || 0})</span>
               </TabsTrigger>
               {isAdmin && (
                 <>
                    <TabsTrigger value="facilities" data-value="facilities" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('admin.tabs.facilities')}</span>
                      <span className="sm:hidden">Fac.</span>
                      <span>({facilities?.length || 0})</span>
                    </TabsTrigger>
                    <TabsTrigger value="ads" data-value="ads" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                      <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('admin.tabs.ads')}</span>
                      <span className="sm:hidden">Ads</span>
                      <span>({advertisements?.length || 0})</span>
                    </TabsTrigger>
                    <TabsTrigger value="sponsors" data-value="sponsors" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Sponsoren</span>
                      <span>({sponsors.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="helpers" data-value="helpers" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t('admin.tabs.helpers')} ({pendingApplications.length})
                  </TabsTrigger>

                </>
              )}
            </TabsList>
          </div>

          {/* Pending Dogs */}
          <TabsContent value="pending">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                {t('admin.pendingApprovals')}
              </h2>
              
              {/* Guest reports — unreviewed */}
              {guestReports.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                    {guestReports.length} Gast-Meldung(en) — nicht registrierte Besucher
                  </h3>
                  <div className="space-y-2">
                    {guestReports.map((r) => (
                      <div key={r.id} className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50/30 dark:bg-amber-950/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium">{r.name || 'Unbekannt'}{genderSymbol(r.gender)}</span>
                              <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Gast</span>
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full capitalize">{r.report_type}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{r.location || `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`}</p>
                            {r.additional_info && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.additional_info}</p>}
                            <p className="text-xs text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleConvertGuestReport(r)}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Als Hund anlegen
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => handleDismissGuestReport(r.id)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingDogs.length === 0 && guestReports.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('admin.noPending')}</p>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {pendingDogs.map((dog) => (
                      <div key={dog.id} className="border border-border rounded-lg p-3 bg-card">
                        <div className="flex gap-3">
                          <img src={dog.photo} alt={dog.name} className="w-16 h-16 rounded-lg object-cover shrink-0 cursor-zoom-in" onClick={() => openLightbox(dog)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-medium text-foreground truncate">{dog.name}{genderSymbol(dog.gender)}</h3>
                              {getReportTypeBadge(dog.reportType)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{dog.location}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(dog.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                          <Button size="sm" variant="outline" onClick={() => handleNavigateToMap(dog)} className="gap-1 text-xs">
                            <MapPin className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(dog.id)} className="flex-1 gap-1 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('admin.approve')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(dog)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {canDelete && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(dog.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                        <TableHead>{t('admin.table.photo')}</TableHead>
                          <TableHead>{t('admin.table.name')}</TableHead>
                          <TableHead>{t('admin.table.type')}</TableHead>
                          <TableHead>{t('admin.table.location')}</TableHead>
                          <TableHead>{t('admin.table.reported')}</TableHead>
                          <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDogs.map((dog) => (
                          <TableRow key={dog.id}>
                            <TableCell>
                              <img src={dog.photo} alt={dog.name} className="w-12 h-12 rounded-lg object-cover cursor-zoom-in" onClick={() => openLightbox(dog)} />
                            </TableCell>
                            <TableCell className="font-medium">{dog.name}{genderSymbol(dog.gender)}</TableCell>
                            <TableCell>{getReportTypeBadge(dog.reportType)}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{dog.location}</TableCell>
                            <TableCell>{formatDate(dog.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => handleNavigateToMap(dog)} title="Auf Karte anzeigen">
                                  <MapPin className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleApprove(dog.id)} className="gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Freigeben
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(dog)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {canDelete && (
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(dog.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Attention Dogs (needs help) */}
          <TabsContent value="sos">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                🚨 Attention – Needs Help
              </h2>
              
              {sosDogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('admin.noSos')}</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {sosDogs.map((dog) => (
                    <div key={dog.id} className="border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <img src={dog.photo} alt={dog.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 cursor-zoom-in" onClick={() => openLightbox(dog)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                            <h3 className="font-bold text-foreground">{dog.name}</h3>
                            {dog.urgencyLevel && (
                              <Badge variant="destructive" className="text-xs">{dog.urgencyLevel}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1 sm:mb-2 truncate">{dog.location}</p>
                          {dog.additionalInfo && (
                            <p className="text-sm text-foreground line-clamp-2">{dog.additionalInfo}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-red-200 dark:border-red-800 sm:mt-0 sm:pt-0 sm:border-0 sm:absolute sm:top-4 sm:right-4">
                        <Button size="sm" variant="outline" onClick={() => handleNavigateToMap(dog)} title="Auf Karte anzeigen">
                          <MapPin className="w-4 h-4 mr-1.5 sm:mr-0" />
                          <span className="sm:hidden">Karte</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(dog)} className="flex-1 sm:flex-initial">
                          <Edit className="w-4 h-4 mr-1.5 sm:mr-0" />
                          <span className="sm:hidden">Bearbeiten</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Dogs */}
          <TabsContent value="all">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <DogIcon className="w-5 h-5 text-primary" />
                {t('admin.allDogs')} ({sortedDogs.length})
              </h2>

              {/* Search + Caretaker Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder={t('admin.searchDogs', 'Search by name, ear tag, location, sponsor...')}
                  value={dogSearch}
                  onChange={(e) => setDogSearch(e.target.value)}
                  className="flex-1 max-w-md"
                />
                <select
                  value={caretakerFilter}
                  onChange={(e) => setCaretakerFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">{t('admin.table.caretaker', 'Caretaker')}: {t('dogsPage.filterAll', 'All')}</option>
                  <option value="unassigned">⚠ {t('admin.caretakerUnassigned', 'Unassigned')}</option>
                  {[...new Set(dogs?.map(d => d.caretaker).filter(Boolean) || [])].sort().map(name => (
                    <option key={name} value={name!}>👤 {name}</option>
                  ))}
                </select>
              </div>
              
              {dogsLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
              ) : sortedDogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('admin.noDogs', 'No dogs reported yet.')}</div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {sortedDogs.map((dog) => (
                      <div key={dog.id} className="border border-border rounded-lg p-3 bg-card">
                        <div className="flex gap-3 mb-3">
                          <img src={dog.photo} alt={dog.name} className="w-14 h-14 rounded-lg object-cover shrink-0 cursor-zoom-in" onClick={() => openLightbox(dog)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-medium text-foreground truncate">{dog.name}{genderSymbol(dog.gender)}</h3>
                              <Badge variant={dog.isApproved ? 'default' : 'secondary'} className="text-xs shrink-0">
                                {dog.isApproved ? t('admin.visible', 'Visible') : t('admin.pending', 'Pending')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getReportTypeBadge(dog.reportType)}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">{dog.earTag} · {dog.location}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3 p-2 bg-secondary/30 rounded-lg">
                          <div>
                            <span className="text-muted-foreground">{t('admin.table.vacc1', 'Vacc 1')}:</span>
                            <span className="ml-1 font-medium">{formatDate(dog.vaccination1Date)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.table.vacc2', 'Vacc 2')}:</span>
                            <span className="ml-1 font-medium">{formatDate(dog.vaccination2Date)}</span>
                          </div>
                          {dog.vaccinationPassport && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">{t('admin.table.passport', 'Passport')}:</span>
                              <span className="ml-1 font-medium">{dog.vaccinationPassport}</span>
                            </div>
                          )}
                          {dog.sponsorName && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">{t('mapPopup.sponsor', 'Sponsor')}:</span>
                              <span className="ml-1 font-medium text-red-500">❤️ {dog.sponsorName}</span>
                            </div>
                          )}

                        </div>
                        {latestRemarks?.[dog.id] && (
                          <div className="text-xs p-2 bg-muted/50 rounded-lg mb-3">
                            <p className="text-foreground line-clamp-2">{latestRemarks[dog.id].content}</p>
                            <p className="text-muted-foreground mt-0.5">{latestRemarks[dog.id].userName}</p>
                          </div>
                        )}
                        <div className="flex gap-1 pt-2 border-t border-border">
                          <Button size="sm" variant="ghost" onClick={() => handleNavigateToMap(dog)} title={t('admin.showOnMap', 'Show on map')}>
                            <MapPin className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedDog(dog); setRemarkDialogOpen(true); }} className="flex-1 text-xs">
                            <StickyNote className="w-3.5 h-3.5 mr-1" />
                            {t('admin.note', 'Note')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedDog(dog); setChangeLogDialogOpen(true); }}>
                            <History className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(dog)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {canDelete && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(dog.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Sortable Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.table.photo', 'Photo')}</TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('name')}>
                            {t('admin.table.name', 'Name')} {dogSortField === 'name' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('earTag')}>
                            {t('mapPopup.earTag', 'Ear Tag')} {dogSortField === 'earTag' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('reportType')}>
                            {t('admin.table.type', 'Type')} {dogSortField === 'reportType' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('location')}>
                            {t('admin.table.location', 'Location')} {dogSortField === 'location' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground whitespace-nowrap min-w-[90px]" onClick={() => toggleDogSort('vaccination1')}>
                            {t('admin.table.vacc1', 'Impfung 1')} {dogSortField === 'vaccination1' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground whitespace-nowrap min-w-[90px]" onClick={() => toggleDogSort('vaccination2')}>
                            {t('admin.table.vacc2', 'Impfung 2')} {dogSortField === 'vaccination2' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('passport')}>
                            {t('admin.table.passport', 'Passport')} {dogSortField === 'passport' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('sponsor')}>
                            {t('mapPopup.sponsor', 'Sponsor')} {dogSortField === 'sponsor' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('caretaker')}>
                            {t('admin.table.caretaker', 'Caretaker')} {dogSortField === 'caretaker' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleDogSort('status')}>
                            {t('admin.table.status', 'Status')} {dogSortField === 'status' ? (dogSortDir === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead>{t('admin.table.remark', 'Remark')}</TableHead>
                          <TableHead className="text-right">{t('admin.table.actions', 'Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDogs.map((dog) => (
                          <TableRow key={dog.id}>
                            <TableCell>
                              <img src={dog.photo} alt={dog.name} className="w-12 h-12 rounded-lg object-cover cursor-zoom-in" onClick={() => openLightbox(dog)} />
                            </TableCell>
                            <TableCell className="font-medium">{dog.name}{genderSymbol(dog.gender)}</TableCell>
                            <TableCell className="text-xs font-mono">{dog.earTag || '-'}</TableCell>
                            <TableCell>{getReportTypeBadge(dog.reportType)}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{dog.location}</TableCell>
                            <TableCell className="text-sm">{formatDate(dog.vaccination1Date)}</TableCell>
                            <TableCell className="text-sm">{formatDate(dog.vaccination2Date)}</TableCell>
                            <TableCell className="max-w-[100px]">
                              <span className="truncate block text-sm">{dog.vaccinationPassport || '-'}</span>
                            </TableCell>
                            <TableCell className="max-w-[100px]">
                              {dog.sponsorName ? (
                                <span className="text-sm text-red-500 font-medium truncate block" title={dog.sponsorName}>❤️ {dog.sponsorName}</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[120px]">
                              <button
                                className="text-sm w-full text-left hover:bg-secondary/50 rounded px-1 py-0.5 transition-colors"
                                onClick={() => {
                                  const name = prompt(t('admin.caretakerPrompt', 'Who is responsible for this dog?'), dog.caretaker || '');
                                  if (name !== null) {
                                    updateDog.mutateAsync({ id: dog.id, updates: { caretaker: name || null } }).catch(() => {});
                                  }
                                }}
                                title={t('admin.caretakerClick', 'Click to assign')}
                              >
                                {dog.caretaker ? (
                                  <span className="text-sm font-medium truncate block text-blue-600 dark:text-blue-400">👤 {dog.caretaker}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm italic">{t('admin.caretakerEmpty', '+ assign')}</span>
                                )}
                              </button>
                            </TableCell>
                            <TableCell>
                              <Badge variant={dog.isApproved ? 'default' : 'secondary'}>
                                {dog.isApproved ? t('admin.visible', 'Visible') : t('admin.pending', 'Pending')}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[150px]">
                              {latestRemarks?.[dog.id] ? (
                                <div className="text-sm">
                                  <p className="truncate text-foreground">{latestRemarks[dog.id].content}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {latestRemarks[dog.id].userName}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => handleNavigateToMap(dog)} title={t('admin.showOnMap', 'Show on map')}>
                                  <MapPin className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedDog(dog); setRemarkDialogOpen(true); }} title={t('admin.note', 'Note')}>
                                  <StickyNote className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedDog(dog); setChangeLogDialogOpen(true); }} title={t('admin.changeLog', 'Change log')}>
                                  <History className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(dog)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {canDelete && (
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(dog.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Team Messages */}
          <TabsContent value="messages">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                {t('admin.tabs.messages')}
              </h2>
              
              {/* New Message Form */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Textarea
                  placeholder={t('admin.messages.replyPlaceholder')}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-[60px] sm:min-h-[80px]"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="gap-2 self-end sm:self-stretch">
                  <Send className="w-4 h-4" />
                  <span className="sm:hidden">{t('admin.messages.sendShort')}</span>
                  <span className="hidden sm:inline">{t('admin.messages.send')}</span>
                </Button>
              </div>

              {/* Messages List */}
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div className="space-y-3 sm:space-y-4">
                  {teamMessages?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Noch keine Nachrichten.</p>
                  ) : (
                    teamMessages?.map((message) => (
                      <div key={message.id} className="border border-border rounded-lg p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <span className="font-medium text-foreground text-sm sm:text-base">{message.userName}</span>
                              <span className="text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</span>
                            </div>
                            <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}>
                              <Reply className="w-4 h-4" />
                            </Button>
                            {canDelete && (
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteTeamMessage.mutateAsync(message.id).catch(() => {}); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Replies */}
                        {message.replies && message.replies.length > 0 && (
                          <div className="mt-3 sm:mt-4 ml-3 sm:ml-6 space-y-2 sm:space-y-3 border-l-2 border-border pl-3 sm:pl-4">
                            {message.replies.map((reply) => (
                              <div key={reply.id} className="bg-secondary/30 rounded-lg p-2 sm:p-3">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                  <span className="font-medium text-xs sm:text-sm text-foreground">{reply.userName}</span>
                                  <span className="text-xs text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap break-words">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === message.id && (
                          <div className="mt-3 sm:mt-4 ml-3 sm:ml-6 flex gap-2">
                            <Input
                              placeholder={t('admin.messages.replyPlaceholder')}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendReply(message.id)}
                              className="text-sm"
                            />
                            <Button size="sm" onClick={() => handleSendReply(message.id)} disabled={!replyContent.trim()}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Rehab Spots */}
          <TabsContent value="rehab">
            <RehabSpotsTab />
          </TabsContent>

           {/* Helper Applications (Admin only) */}
            <TabsContent value="sponsors">
              <SponsorTabContent
                sponsors={sponsors}
                onAdd={(name) => addSponsor.mutate(name)}
                onDelete={(id) => deleteSponsor.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="helpers">
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {t('admin.helperApplications')}
                </h2>
                
                {!helperApplications || helperApplications.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">{t('admin.noApplications')}</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {helperApplications.map((app) => (
                      <div key={app.id} className="border border-border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-medium text-foreground text-sm sm:text-base">{app.userId.slice(0, 8)}...</span>
                              <Badge variant={
                                app.status === 'approved' ? 'default' :
                                app.status === 'rejected' ? 'destructive' : 'secondary'
                               } className="text-xs">
                                 {app.status === 'approved' ? t('admin.statusLabels.approved') :
                                  app.status === 'rejected' ? t('admin.statusLabels.rejected') : t('admin.statusLabels.pending')}
                               </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{app.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Beworben am: {formatDate(app.createdAt)}
                            </p>
                          </div>
                          {app.status === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleHelperApplication(app.id, 'approved')}
                                className="gap-1 flex-1 sm:flex-initial text-xs sm:text-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Annehmen
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleHelperApplication(app.id, 'rejected')}
                                className="text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

          {/* Facilities (Admin only) */}
          {isAdmin && (
            <TabsContent value="facilities">
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="hidden xs:inline">Einrichtungen</span>
                    <span className="xs:hidden">Einr.</span>
                    <span>({facilities?.length || 0})</span>
                  </h2>
                  <Button onClick={() => setAddFacilityDialogOpen(true)} size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Hinzufügen</span>
                    <span className="xs:hidden">Neu</span>
                  </Button>
                </div>
                
                {!facilities || facilities.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">{t('facilities.noFacilities')}</p>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                      {facilities.map((facility) => (
                        <div key={facility.id} className="border border-border rounded-lg p-3 bg-card">
                          <div className="flex gap-3">
                            {facility.photoUrl ? (
                              <img src={facility.photoUrl} alt={facility.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                {facility.type === 'vet' ? (
                                  <Stethoscope className="w-6 h-6 text-destructive" />
                                ) : (
                                  <Home className="w-6 h-6 text-primary" />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={facility.type === 'vet' ? 'destructive' : 'default'} className="text-xs">
                                  {facility.type === 'vet' ? '🏥 Tierarzt' : '🏠 Partner'}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-foreground truncate">{facility.name}</h3>
                              {facility.address && (
                                <p className="text-xs text-muted-foreground truncate">{facility.address}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              {facility.phone && <span className="mr-3">{facility.phone}</span>}
                              {facility.website && (
                                <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  Website
                                </a>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                 if (confirm(t('admin.deleteFacilityConfirm'))) {
                                   deleteFacility.mutateAsync(facility.id).catch(() => {});
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Foto</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Adresse</TableHead>
                            <TableHead>Kontakt</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {facilities.map((facility) => (
                            <TableRow key={facility.id}>
                              <TableCell>
                                {facility.photoUrl ? (
                                  <img src={facility.photoUrl} alt={facility.name} className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                                    {facility.type === 'vet' ? (
                                      <Stethoscope className="w-6 h-6 text-destructive" />
                                    ) : (
                                      <Home className="w-6 h-6 text-primary" />
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={facility.type === 'vet' ? 'destructive' : 'default'}>
                                  {facility.type === 'vet' ? '🏥 Tierarzt' : '🏠 Partner'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium max-w-[120px] truncate">{facility.name}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{facility.address || '-'}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {facility.phone && <p className="truncate">{facility.phone}</p>}
                                  {facility.website && (
                                    <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      Website
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => {
                                     if (confirm(t('admin.deleteFacilityConfirm'))) {
                                       deleteFacility.mutateAsync(facility.id).catch(() => {});
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          )}

          {/* Advertisements (Admin only) */}
          {isAdmin && (
            <TabsContent value="ads">
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                   <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                     <Megaphone className="w-5 h-5 text-primary" />
                     Werbung ({advertisements?.length || 0})
                   </h2>
                   <Button onClick={() => setAddAdDialogOpen(true)} size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                     <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     <span className="hidden xs:inline">Neue Werbung</span>
                     <span className="xs:hidden">Neu</span>
                   </Button>
                 </div>
                 
                 {!advertisements || advertisements.length === 0 ? (
                   <p className="text-center py-8 text-muted-foreground">Noch keine Werbung angelegt.</p>
                 ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                      {advertisements.map((ad) => (
                        <div key={ad.id} className="border border-border rounded-lg p-3 bg-card">
                          <div className="flex gap-3 mb-3">
                            <img src={ad.image_url} alt={ad.title} className="w-20 h-14 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground truncate">{ad.title}</h3>
                              <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs mt-1">
                                <ExternalLink className="w-3 h-3" />
                                Link öffnen
                              </a>
                              <p className="text-xs text-muted-foreground mt-1">Verzögerung: {ad.display_delay_seconds}s</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={ad.is_active}
                                onCheckedChange={(checked) => 
                                  updateAdvertisement.mutateAsync({ 
                                    id: ad.id, 
                                    updates: { is_active: checked } 
                                  }).catch(() => {})
                                }
                              />
                              <Badge variant={ad.is_active ? 'default' : 'secondary'} className="text-xs">
                                {ad.is_active ? 'Aktiv' : 'Inaktiv'}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                 if (confirm(t('admin.deleteAdConfirm'))) {
                                   deleteAdvertisement.mutateAsync(ad.id).catch(() => {});
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                            <TableRow>
                              <TableHead>{t('admin.ads.image')}</TableHead>
                              <TableHead>{t('admin.ads.title')}</TableHead>
                              <TableHead>{t('admin.ads.targetUrl')}</TableHead>
                              <TableHead>{t('admin.ads.delay')}</TableHead>
                              <TableHead>{t('admin.table.status')}</TableHead>
                              <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                          {advertisements.map((ad) => (
                            <TableRow key={ad.id}>
                              <TableCell>
                                <img src={ad.image_url} alt={ad.title} className="w-16 h-12 rounded-lg object-cover" />
                              </TableCell>
                              <TableCell className="font-medium max-w-[120px] truncate">{ad.title}</TableCell>
                              <TableCell>
                                <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  Link
                                </a>
                              </TableCell>
                              <TableCell>{ad.display_delay_seconds}s</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={ad.is_active}
                                    onCheckedChange={(checked) => 
                                      updateAdvertisement.mutateAsync({ 
                                        id: ad.id, 
                                        updates: { is_active: checked } 
                                      })
                                    }
                                  />
                                  <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                                    {ad.is_active ? 'Aktiv' : 'Inaktiv'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => {
                                     if (confirm(t('admin.deleteAdConfirm'))) {
                                       deleteAdvertisement.mutateAsync(ad.id).catch(() => {});
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

          )}



        </Tabs>
      </main>

      {/* Add Ad Dialog */}
      <Dialog open={addAdDialogOpen} onOpenChange={setAddAdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Neue Werbung hinzufügen
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
               <Label htmlFor="adTitle" className="flex items-center gap-2">
                 <FileText className="w-4 h-4" />
                 {t('admin.ads.title')}
               </Label>
              <Input
                id="adTitle"
                placeholder={t('admin.ads.titlePlaceholder')}
                value={newAdForm.title}
                onChange={(e) => setNewAdForm({ ...newAdForm, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Werbebild
              </Label>
              <PhotoUpload
                onPhotoUploaded={(url) => setNewAdForm({ ...newAdForm, image_url: url })}
                currentPhotoUrl={newAdForm.image_url}
              />
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="adUrl" className="flex items-center gap-2">
                 <LinkIcon className="w-4 h-4" />
                 {t('admin.ads.targetUrl')}
               </Label>
              <Input
                id="adUrl"
                type="url"
                placeholder={t('admin.ads.urlPlaceholder')}
                value={newAdForm.target_url}
                onChange={(e) => setNewAdForm({ ...newAdForm, target_url: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adDelay" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Verzögerung (Sekunden)
              </Label>
              <Input
                id="adDelay"
                type="number"
                min={1}
                max={300}
                value={newAdForm.display_delay_seconds}
                onChange={(e) => setNewAdForm({ ...newAdForm, display_delay_seconds: parseInt(e.target.value) || 20 })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <Label htmlFor="adActive">Sofort aktivieren</Label>
              <Switch
                id="adActive"
                checked={newAdForm.is_active}
                onCheckedChange={(checked) => setNewAdForm({ ...newAdForm, is_active: checked })}
              />
            </div>
            
            <Button
              className="w-full"
              onClick={async () => {
                if (!newAdForm.title || !newAdForm.image_url || !newAdForm.target_url) return;
                await createAdvertisement.mutateAsync({
                  title: newAdForm.title,
                  image_url: newAdForm.image_url,
                  target_url: newAdForm.target_url,
                  display_delay_seconds: newAdForm.display_delay_seconds,
                  is_active: newAdForm.is_active,
                  created_by: user?.id,
                });
                setNewAdForm({ title: '', image_url: '', target_url: '', display_delay_seconds: 20, is_active: true });
                setAddAdDialogOpen(false);
              }}
              disabled={!newAdForm.title || !newAdForm.image_url || !newAdForm.target_url || createAdvertisement.isPending}
             >
               {createAdvertisement.isPending ? t('admin.buttons.savingAd') : t('admin.buttons.createAd')}
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Facility Dialog */}
      <AddFacilityDialog open={addFacilityDialogOpen} onOpenChange={setAddFacilityDialogOpen} />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {selectedDog?.name} bearbeiten
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
            <PhotoUpload
              onPhotosUploaded={(urls) => setEditForm({ ...editForm, photoUrls: urls })}
              currentPhotoUrls={editForm.photoUrls}
            />
            <div className="space-y-2">
               <Label htmlFor="vac1" className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {t('admin.vaccination.label1')}
               </Label>
              <Input
                id="vac1"
                type="date"
                value={editForm.vaccination1Date}
                onChange={(e) => setEditForm({ ...editForm, vaccination1Date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="vac2" className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {t('admin.vaccination.label2')}
               </Label>
              <Input
                id="vac2"
                type="date"
                value={editForm.vaccination2Date}
                onChange={(e) => setEditForm({ ...editForm, vaccination2Date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacPassport" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Impfpass
              </Label>
              <Input
                id="vacPassport"
                type="text"
                placeholder="z.B. Impfpass-Nummer oder Info"
                value={editForm.vaccinationPassport}
                onChange={(e) => setEditForm({ ...editForm, vaccinationPassport: e.target.value })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
               <Label htmlFor="vaccinated">{t('admin.vaccination.markAs')}</Label>
               <Switch
                id="vaccinated"
                checked={editForm.isVaccinated}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isVaccinated: checked })}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>{t('addDog.gender', 'Geschlecht')}</Label>
              <div className="flex gap-2">
                {([['', '—'], ['male', '♂ ' + t('addDog.genderMale', 'Männlich')], ['female', '♀ ' + t('addDog.genderFemale', 'Weiblich')]] as [string, string][]).map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setEditForm({ ...editForm, gender: val as '' | 'male' | 'female' })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      editForm.gender === val ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info / Bemerkungen */}
            <div className="space-y-2">
              <Label htmlFor="editAdditionalInfo" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('addDog.additionalNotes', 'Zusätzliche Notizen')}
              </Label>
              <Textarea
                id="editAdditionalInfo"
                placeholder={t('addDog.additionalNotesPlaceholder', 'Weitere Informationen (Verhalten, Zustand, etc.)...')}
                value={editForm.additionalInfo}
                onChange={(e) => setEditForm({ ...editForm, additionalInfo: e.target.value })}
                rows={3}
              />
            </div>

            {selectedDog?.reportType === 'save' && (
              <div className="space-y-2 border-t border-border pt-4">
                <Label htmlFor="sponsor" className="flex items-center gap-2 text-red-600">
                  <Heart className="w-4 h-4 fill-red-600" />
                  Sponsor hinzufügen
                </Label>
                <Input
                  id="sponsor"
                  type="text"
                  placeholder="Name des Sponsors"
                  value={editForm.sponsorName}
                  onChange={(e) => setEditForm({ ...editForm, sponsorName: e.target.value })}
                />
                {editForm.sponsorName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-red-600" />
                    Danke für Deine Hilfe, {editForm.sponsorName}!
                  </p>
                )}
              </div>
            )}

            {/* Caretaker / Verantwortlich */}
            <div className="space-y-2">
              <Label htmlFor="caretaker">{t('admin.table.caretaker', 'Caretaker')}</Label>
              <Input
                id="caretaker"
                type="text"
                placeholder={t('admin.caretakerPrompt', 'Who is responsible for this dog?')}
                value={editForm.caretaker}
                onChange={(e) => setEditForm({ ...editForm, caretaker: e.target.value })}
              />
            </div>

            {/* Mark as Attention — for strays/vaccination_wish that need urgent help */}
            {selectedDog && selectedDog.reportType !== 'save' && editForm.reportType !== 'save' && (
              <div className="border-t border-border pt-4">
                <div className={`p-3 rounded-lg ${editForm.reportType === 'sos' ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' : 'bg-secondary/50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2 font-medium">
                        <AlertTriangle className={`w-4 h-4 ${editForm.reportType === 'sos' ? 'text-red-600' : 'text-muted-foreground'}`} />
                        🚨 Als "Attention" markieren
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hund braucht dringend Hilfe
                      </p>
                    </div>
                    <Switch
                      checked={editForm.reportType === 'sos'}
                      onCheckedChange={(checked) => {
                        setEditForm({
                          ...editForm,
                          reportType: checked ? 'sos' : selectedDog.reportType === 'sos' ? 'stray' : selectedDog.reportType,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Convert to Tagged — shown for stray, sos, vaccination_wish */}
            {selectedDog && selectedDog.reportType !== 'save' && (
              <div className="border-t border-border pt-4 space-y-3">
                <div className={`p-3 rounded-lg ${editForm.reportType === 'save' ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-secondary/50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2 font-medium">
                        <CheckCircle className={`w-4 h-4 ${editForm.reportType === 'save' ? 'text-green-600' : 'text-muted-foreground'}`} />
                        In "Tagged" umwandeln
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hund wurde geimpft, kastriert & getaggt
                      </p>
                    </div>
                    <Switch
                      checked={editForm.reportType === 'save'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditForm({
                            ...editForm,
                            reportType: 'save',
                            isVaccinated: true,
                            isApproved: true,
                          });
                        } else {
                          setEditForm({
                            ...editForm,
                            reportType: selectedDog.reportType,
                            isVaccinated: selectedDog.isVaccinated,
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                {editForm.reportType === 'save' && (
                  <div className="space-y-2">
                    <Label htmlFor="sponsor-convert" className="flex items-center gap-2 text-red-600">
                      <Heart className="w-4 h-4 fill-red-600" />
                      Sponsor hinzufügen
                    </Label>
                    <Input
                      id="sponsor-convert"
                      type="text"
                      placeholder="Name des Sponsors"
                      value={editForm.sponsorName}
                      onChange={(e) => setEditForm({ ...editForm, sponsorName: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end shrink-0 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('admin.buttons.cancel')}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t('admin.buttons.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remarks Dialog */}
      <RemarkDialog 
        dog={selectedDog}
        open={remarkDialogOpen}
        onOpenChange={setRemarkDialogOpen}
        newRemark={newRemark}
        setNewRemark={setNewRemark}
        onAddRemark={handleAddRemark}
      />

      {/* Change Log Dialog */}
      <ChangeLogDialog
        dog={selectedDog}
        open={changeLogDialogOpen}
        onOpenChange={setChangeLogDialogOpen}
      />

      {/* Photo Lightbox */}
      {lightboxPhotos.length > 0 && (
        <PhotoLightbox
          photos={lightboxPhotos}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxPhotos([])}
        />
      )}
    </div>
  );
};

// Remark Dialog Component
function RemarkDialog({ 
  dog, 
  open, 
  onOpenChange, 
  newRemark, 
  setNewRemark, 
  onAddRemark 
}: { 
  dog: Dog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRemark: string;
  setNewRemark: (v: string) => void;
  onAddRemark: () => void;
}) {
  const { data: remarks } = useDogRemarks(dog?.id || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Bemerkungen: {dog?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Neue Bemerkung..."
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              className="flex-1"
            />
            <Button onClick={onAddRemark} disabled={!newRemark.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {remarks?.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Keine Bemerkungen.</p>
              ) : (
                remarks?.map((remark) => (
                  <div key={remark.id} className="bg-secondary/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{remark.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(remark.createdAt).toLocaleString('de-DE')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{remark.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Change Log Dialog Component
function ChangeLogDialog({ 
  dog, 
  open, 
  onOpenChange 
}: { 
  dog: Dog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: changeLog } = useDogChangeLog(dog?.id || '');

  const formatChanges = (changes: unknown): string => {
    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return '';
    try {
      const entries = Object.entries(changes as Record<string, unknown>);
      return entries.map(([key, value]) => {
        const formatted = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value ?? '-');
        return `${key}: ${formatted}`;
      }).join(', ');
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Änderungslog: {dog?.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {changeLog?.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Keine Änderungen protokolliert.</p>
            ) : (
              changeLog?.map((entry) => (
                <div key={entry.id} className="bg-secondary/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{entry.action}</Badge>
                    <span className="font-medium text-sm">{entry.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString('de-DE')}
                    </span>
                  </div>
                  {entry.changes && (
                    <p className="text-sm text-muted-foreground">{formatChanges(entry.changes)}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AdminPage;
