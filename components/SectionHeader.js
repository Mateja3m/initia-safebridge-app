import { Stack, Typography } from '@mui/material';

export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <Stack spacing={0.9}>
      <Typography
        variant="overline"
        sx={{ color: 'primary.main', fontWeight: 700 }}
      >
        {eyebrow}
      </Typography>
      <Typography variant="h5" sx={{ letterSpacing: '-0.02em', maxWidth: 18 * 28 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 18 * 30 }}>
        {description}
      </Typography>
    </Stack>
  );
}
