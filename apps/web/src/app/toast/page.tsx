import { permanentRedirect } from 'next/navigation';

/* The toast docs live inside the UI Kit page — jump straight to its toast playground, for good. */
export default function ToastRedirect() {
  permanentRedirect('/ui-kit#use-toast');
}
