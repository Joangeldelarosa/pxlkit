import React, { useState } from 'react';
import { PixelPagination } from '../navigation';

export function Default() {
  const [page, setPage] = useState(1);
  return <PixelPagination page={page} total={10} onChange={setPage} />;
}

export function ManyPages() {
  const [page, setPage] = useState(5);
  return <PixelPagination page={page} total={50} onChange={setPage} />;
}

export function MidWindow() {
  const [page, setPage] = useState(10);
  return <PixelPagination page={page} total={20} onChange={setPage} />;
}

export function MoreSiblings() {
  const [page, setPage] = useState(8);
  return <PixelPagination page={page} total={20} onChange={setPage} siblings={2} />;
}

export function PixelSurface() {
  const [page, setPage] = useState(3);
  return <PixelPagination page={page} total={12} onChange={setPage} surface="pixel" />;
}

export function LinearSurface() {
  const [page, setPage] = useState(3);
  return <PixelPagination page={page} total={12} onChange={setPage} surface="linear" />;
}

export function LocalisedLabels() {
  const [page, setPage] = useState(2);
  return (
    <PixelPagination
      page={page}
      total={8}
      onChange={setPage}
      prevLabel="Anterior"
      nextLabel="Siguiente"
      ariaLabel="Paginación"
    />
  );
}

export function FirstPage() {
  return <PixelPagination page={1} total={10} onChange={() => {}} />;
}

export function LastPage() {
  return <PixelPagination page={10} total={10} onChange={() => {}} />;
}

export function SinglePage() {
  return <PixelPagination page={1} total={1} onChange={() => {}} />;
}
