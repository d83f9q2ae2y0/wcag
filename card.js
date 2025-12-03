import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Button,
  Alert,
  Chip,
  Fade,
  Grow,
  styled,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 420,
  width: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
    borderRadius: 20,
  }
}));

const StyledCardContent = styled(CardContent)({
  padding: '32px !important',
  position: 'relative',
  zIndex: 1,
});

const HeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  marginBottom: 32,
});

const StyledAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  border: '4px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  fontSize: '1.75rem',
  fontWeight: 700,
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
});

const NameTypography = styled(Typography)({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'white',
  marginBottom: 4,
  lineHeight: 1.2,
  wordWrap: 'break-word',
});

const SubtitleTypography = styled(Typography)({
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.85)',
  lineHeight: 1.4,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const InfoBox = styled(Box)(({ theme, clickable }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  transition: 'all 0.2s ease',
  cursor: clickable ? 'pointer' : 'default',
  position: 'relative',
  ...(clickable && {
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.25)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      transform: 'translateX(4px)',
    },
    '&:focus-visible': {
      outline: '3px solid rgba(255, 255, 255, 0.5)',
      outlineOffset: 2,
      background: 'rgba(255, 255, 255, 0.25)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    }
  })
}));

const InfoIconBox = styled(Box)({
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  opacity: 0.9,
});

const InfoContent = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const InfoLabel = styled(Typography)({
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: 600,
});

const InfoValue = styled(Typography)({
  fontSize: '1rem',
  color: 'white',
  wordBreak: 'break-word',
  lineHeight: 1.4,
});

const CopyIndicator = styled(Box)(({ show }) => ({
  opacity: show ? 1 : 0,
  transition: 'opacity 0.2s ease',
  display: 'flex',
  alignItems: 'center',
}));

const ErrorCard = styled(Card)({
  maxWidth: 420,
  width: '100%',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
});

const EmptyCard = styled(Card)({
  maxWidth: 420,
  width: '100%',
  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
});

const PersonCard = memo(({ 
  person = null,
  loading = false,
  error = null,
  onRetry = null,
  className = '',
  onFieldClick = null
}) => {
  const [copiedField, setCopiedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);

  const handleCopy = useCallback(async (field, value) => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      
      if (onFieldClick) {
        onFieldClick(field, value);
      }
      
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [onFieldClick]);

  const fullAddress = useMemo(() => {
    if (!person) return null;
    
    const parts = [
      person.address,
      person.postalCode && person.city ? `${person.postalCode} ${person.city}` : person.city || person.postalCode,
      person.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }, [person]);

  const initials = useMemo(() => {
    if (!person) return '';
    return `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase();
  }, [person]);

  if (loading) {
    return (
      <StyledCard className={className}>
        <StyledCardContent>
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Skeleton variant="circular" width={80} height={80} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)' }} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)' }} />
              <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <Skeleton variant="rounded" height={76} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: 3 }} />
            <Skeleton variant="rounded" height={76} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: 3 }} />
            <Skeleton variant="rounded" height={76} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: 3 }} />
          </Box>
        </StyledCardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <ErrorCard className={className}>
        <StyledCardContent>
          <Box textAlign="center" py={2}>
            <ErrorIcon sx={{ fontSize: 48, color: 'white', opacity: 0.9, mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              Erreur de chargement
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, lineHeight: 1.5 }}>
              {typeof error === 'string' ? error : 'Impossible de charger les informations de la personne.'}
            </Typography>
            {onRetry && (
              <Button
                onClick={onRetry}
                startIcon={<RefreshIcon />}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Réessayer
              </Button>
            )}
          </Box>
        </StyledCardContent>
      </ErrorCard>
    );
  }

  if (!person) {
    return (
      <EmptyCard className={className}>
        <StyledCardContent>
          <Box textAlign="center" py={4}>
            <PersonIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.6)', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Aucune information disponible
            </Typography>
          </Box>
        </StyledCardContent>
      </EmptyCard>
    );
  }

  return (
    <StyledCard className={className}>
      <StyledCardContent>
        <HeaderBox>
          <StyledAvatar src={person.avatarUrl} alt={`${person.firstName} ${person.lastName}`}>
            {!person.avatarUrl && (initials || <PersonIcon sx={{ fontSize: 32 }} />)}
          </StyledAvatar>
          
          <Box flex={1} minWidth={0}>
            <NameTypography>
              {person.firstName} {person.lastName}
            </NameTypography>
            {(person.jobTitle || person.company) && (
              <SubtitleTypography>
                {person.jobTitle && <span>{person.jobTitle}</span>}
                {person.jobTitle && person.company && <span>•</span>}
                {person.company && (
                  <>
                    <BusinessIcon sx={{ fontSize: 16 }} />
                    <span>{person.company}</span>
                  </>
                )}
              </SubtitleTypography>
            )}
          </Box>
        </HeaderBox>

        <Box display="flex" flexDirection="column" gap={2}>
          {person.email && (
            <Grow in timeout={300}>
              <InfoBox 
                clickable={true}
                component="button"
                onClick={() => handleCopy('email', person.email)}
                onMouseEnter={() => setHoveredField('email')}
                onMouseLeave={() => setHoveredField(null)}
                tabIndex={0}
                role="button"
                aria-label={`Email: ${person.email}. Cliquer pour copier`}
              >
                <InfoIconBox>
                  <EmailIcon />
                </InfoIconBox>
                <InfoContent>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{person.email}</InfoValue>
                </InfoContent>
                <CopyIndicator show={hoveredField === 'email' || copiedField === 'email'}>
                  {copiedField === 'email' ? (
                    <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                  ) : (
                    <CopyIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }} />
                  )}
                </CopyIndicator>
              </InfoBox>
            </Grow>
          )}

          {person.phone && (
            <Grow in timeout={400}>
              <InfoBox 
                clickable={true}
                component="button"
                onClick={() => handleCopy('phone', person.phone)}
                onMouseEnter={() => setHoveredField('phone')}
                onMouseLeave={() => setHoveredField(null)}
                tabIndex={0}
                role="button"
                aria-label={`Téléphone: ${person.phone}. Cliquer pour copier`}
              >
                <InfoIconBox>
                  <PhoneIcon />
                </InfoIconBox>
                <InfoContent>
                  <InfoLabel>Téléphone</InfoLabel>
                  <InfoValue>{person.phone}</InfoValue>
                </InfoContent>
                <CopyIndicator show={hoveredField === 'phone' || copiedField === 'phone'}>
                  {copiedField === 'phone' ? (
                    <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                  ) : (
                    <CopyIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }} />
                  )}
                </CopyIndicator>
              </InfoBox>
            </Grow>
          )}

          {fullAddress && (
            <Grow in timeout={500}>
              <InfoBox clickable={false}>
                <InfoIconBox>
                  <LocationOnIcon />
                </InfoIconBox>
                <InfoContent>
                  <InfoLabel>Adresse</InfoLabel>
                  <InfoValue>{fullAddress}</InfoValue>
                </InfoContent>
              </InfoBox>
            </Grow>
          )}
        </Box>
      </StyledCardContent>
    </StyledCard>
  );
});

PersonCard.displayName = 'PersonCard';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const samplePerson = {
    firstName: 'Sophie',
    lastName: 'Martineau',
    email: 'sophie.martineau@example.com',
    phone: '+33 6 12 34 56 78',
    address: '42 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    company: 'Tech Innovation',
    jobTitle: 'Directrice Technique',
    avatarUrl: 'https://i.pravatar.cc/150?img=47'
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const handleFieldClick = (field, value) => {
    console.log(`Champ copié: ${field} = ${value}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
      }}
    >
      <PersonCard 
        person={samplePerson}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        onFieldClick={handleFieldClick}
      />
    </Box>
  );
}
