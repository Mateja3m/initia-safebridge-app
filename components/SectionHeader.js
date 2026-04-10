import { Stack, Typography } from '@mui/material';

export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <Stack spacing={{ xs: 0.65, md: 0.9 }}>
      <Typography
        variant="overline"
        sx={{ color: 'primary.main', fontWeight: 700, lineHeight: { xs: 1.4, md: 1.6 } }}
      >
        {eyebrow}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          letterSpacing: '-0.02em',
          maxWidth: 18 * 28,
          fontSize: { xs: '1.95rem', md: undefined },
          lineHeight: { xs: 1.05, md: 1.1 },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 18 * 30, fontSize: { xs: '0.9rem', md: undefined }, lineHeight: 1.55 }}
      >
        {description}
      </Typography>
    </Stack>
  );
}
