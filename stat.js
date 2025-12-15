import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  LibraryBooks,
  CalendarMonth,
  Category,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Constants
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const COLOR_PALETTE = [
  '#1976d2', '#dc004e', '#9c27b0', '#f57c00', '#388e3c',
  '#00acc1', '#5e35b1', '#c62828', '#6a1b9a', '#00897b',
];

// Utility Functions
const sumCounts = (items) => items?.reduce((sum, item) => sum + item.count, 0) || 0;

const getLatestYear = (years) => {
  return years?.length > 0 ? Math.max(...years) : new Date().getFullYear();
};

// Data Transformation Functions
const createLineChartDataset = (item, index, useYear = false) => ({
  label: useYear ? `${item.year}` : `${item.typeLabel} (${item.year})`,
  data: item.months,
  borderColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
  backgroundColor: alpha(COLOR_PALETTE[index % COLOR_PALETTE.length], 0.1),
  borderWidth: 2,
  tension: 0.4,
  fill: true,
  pointRadius: 4,
  pointHoverRadius: 6,
});

const createBarChartDataset = (type, index, data, years) => {
  const typeData = data.filter((d) => d.typeId === type.id);
  const counts = years.map((year) => {
    const found = typeData.find((d) => d.year === year);
    return found ? found.count : 0;
  });
  
  return {
    label: type.label,
    data: counts,
    backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
    borderRadius: 6,
    borderSkipped: false,
  };
};

// Chart Configuration
const createChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: theme.typography.fontFamily,
        },
      },
    },
    title: { display: false },
    tooltip: {
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
      titleColor: theme.palette.text.primary,
      bodyColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.parsed.y} books`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: { family: theme.typography.fontFamily },
      },
      grid: { color: alpha(theme.palette.divider, 0.1) },
    },
    x: {
      ticks: { font: { family: theme.typography.fontFamily } },
      grid: { display: false },
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
});

// Components
const StatCard = ({ icon: Icon, label, value, color, theme }) => (
  <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            backgroundColor: alpha(color, 0.1),
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color, fontSize: 28 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
  </Box>
);

const LoadingView = ({ theme }) => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <Skeleton variant="text" width="30%" height={60} sx={{ mb: 4 }} />
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={4}>
      {[1, 2].map((i) => (
        <Grid item xs={12} lg={6} key={i}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <ChartSkeleton />
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
);

const ErrorView = ({ error }) => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Error Loading Statistics
      </Typography>
      <Typography variant="body2">{error}</Typography>
    </Alert>
  </Container>
);

const StatsOverview = ({ statistics, theme }) => {
  const totalBooksReleased = sumCounts(statistics.booksReleasedByYear);
  const totalBooksCreated = sumCounts(statistics.booksCreatedByYear);
  const totalTypes = statistics.booksReleasedByTypeAndYear?.types?.length || 0;
  const latestYear = getLatestYear(statistics.booksReleasedByTypeAndMonth?.years);

  const stats = [
    { icon: LibraryBooks, label: 'Total Books Released', value: totalBooksReleased.toLocaleString(), color: theme.palette.primary.main },
    { icon: TrendingUp, label: 'Total Books Created', value: totalBooksCreated.toLocaleString(), color: theme.palette.success.main },
    { icon: Category, label: 'Book Types', value: totalTypes, color: theme.palette.secondary.main },
    { icon: CalendarMonth, label: 'Latest Year', value: latestYear, color: theme.palette.warning.main },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...stat} theme={theme} />
        </Grid>
      ))}
    </Grid>
  );
};

const ChartSection = ({ title, description, view, onViewChange, chips, chartData, chartType, theme }) => {
  const ChartComponent = chartType === 'line' ? Line : Bar;
  
  return (
    <Grid item xs={12}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, val) => val && onViewChange(val)}
            size="small"
            sx={{ boxShadow: 'none' }}
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
          {chips.map((chip, index) => (
            <Chip key={chip.key || index} label={chip.label} size="small" variant="outlined" />
          ))}
        </Box>
        <Box sx={{ height: 450 }}>
          <ChartComponent data={chartData} options={createChartOptions(theme)} />
        </Box>
      </Paper>
    </Grid>
  );
};

// Custom Hook for Data Fetching
const useStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/books/statistics');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { statistics, loading, error };
};

// Main Component
const BookStatistics = () => {
  const theme = useTheme();
  const { statistics, loading, error } = useStatistics();
  const [releaseView, setReleaseView] = useState('monthly');
  const [creationView, setCreationView] = useState('monthly');

  if (loading) return <LoadingView theme={theme} />;
  if (error) return <ErrorView error={error} />;
  if (!statistics) return null;

  // Prepare chart data
  const releasedByTypeMonthData = {
    labels: MONTH_LABELS,
    datasets: statistics.booksReleasedByTypeAndMonth.data.map((item, index) => 
      createLineChartDataset(item, index)
    ),
  };

  const releasedByTypeYearData = {
    labels: statistics.booksReleasedByTypeAndYear.years,
    datasets: statistics.booksReleasedByTypeAndYear.types.map((type, index) =>
      createBarChartDataset(type, index, statistics.booksReleasedByTypeAndYear.data, statistics.booksReleasedByTypeAndYear.years)
    ),
  };

  const createdByMonthData = {
    labels: MONTH_LABELS,
    datasets: statistics.booksCreatedByMonth.data.map((item, index) => 
      createLineChartDataset(item, index, true)
    ),
  };

  const createdByYearData = {
    labels: statistics.booksCreatedByYear.map((item) => item.year),
    datasets: [
      {
        label: 'Books Created',
        data: statistics.booksCreatedByYear.map((item) => item.count),
        backgroundColor: COLOR_PALETTE[0],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Prepare chips for each view
  const releaseChips = releaseView === 'monthly'
    ? statistics.booksReleasedByTypeAndMonth.years.map(year => ({ key: year, label: year }))
    : statistics.booksReleasedByTypeAndYear.types.map(type => ({ key: type.id, label: type.label }));

  const creationChips = creationView === 'monthly'
    ? statistics.booksCreatedByMonth.years.map(year => ({ key: year, label: year }))
    : [{ label: `${statistics.booksCreatedByYear.length} years of data` }];

  return (
    <Box sx={{ backgroundColor: theme.palette.grey[50], minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Book Statistics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics and insights for your book collection
          </Typography>
        </Box>

        <StatsOverview statistics={statistics} theme={theme} />

        <Grid container spacing={4}>
          <ChartSection
            title="Books Released by Type"
            description="Compare release patterns across different book types and time periods"
            view={releaseView}
            onViewChange={setReleaseView}
            chips={releaseChips}
            chartData={releaseView === 'monthly' ? releasedByTypeMonthData : releasedByTypeYearData}
            chartType={releaseView === 'monthly' ? 'line' : 'bar'}
            theme={theme}
          />

          <ChartSection
            title="Books Created in Database"
            description="Track when books were added to your collection over time"
            view={creationView}
            onViewChange={setCreationView}
            chips={creationChips}
            chartData={creationView === 'monthly' ? createdByMonthData : createdByYearData}
            chartType={creationView === 'monthly' ? 'line' : 'bar'}
            theme={theme}
          />
        </Grid>
      </Container>
    </Box>
  );
};

export default BookStatistics;
