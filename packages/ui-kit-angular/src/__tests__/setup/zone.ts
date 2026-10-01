// zone.js has to patch the platform before Angular loads; the suites then
// bootstrap real zone-based applications.
import 'zone.js';
import '@angular/compiler';

// jsdom does not implement scrolling; the scroll lock restores the offset.
window.scrollTo = () => {};
