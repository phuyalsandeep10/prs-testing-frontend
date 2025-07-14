// This is the repo and the test one. 

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}

