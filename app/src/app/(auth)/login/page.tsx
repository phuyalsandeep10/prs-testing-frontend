import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-6 flex flex-col items-center justify-center space-y-4">
          <Image src="/PRSlogo.png" alt="PRS Logo" width={100} height={100} />
          <h1 className="text-lg font-semibold text-gray-700">Payment Receiving System.</h1>
        </div>
        <h2 className="mb-8 text-3xl font-bold text-gray-900">Login to PRS</h2>
        <LoginForm />
      </div>
    </div>
  );
}
