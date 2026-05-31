import React from 'react';
import { PixelStarRating } from './PixelStarRating';

export function Default() {
  return <PixelStarRating value={4} />;
}

export function WithCount() {
  return <PixelStarRating value={3} max={5} showCount />;
}

export function GreenTone() {
  return <PixelStarRating value={5} tone="green" size="lg" />;
}

export function Interactive() {
  const [rating, setRating] = React.useState(3);
  return <PixelStarRating value={rating} interactive onChange={setRating} />;
}
