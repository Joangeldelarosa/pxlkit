// Zoneless TestBed — the default for Angular 21+ applications.
import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach } from 'vitest';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

// jsdom does not implement scrolling; the scroll lock restores the offset.
window.scrollTo = () => {};

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
});

afterEach(() => {
  document.body.innerHTML = '';
});
