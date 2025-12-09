import Greeting from '../components/Greeting';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Link href="/about" className="text-blue-500 hover:underline">
        Go to About Page
      </Link>
      <Link href="/books" className="text-blue-500 hover:underline">
        books
      </Link>
      <Greeting initialName="Visitor" />
    </div>
  );
}

