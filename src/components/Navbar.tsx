import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">🌿 Aegroshield</div>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/predict">Diagnose Crop</Link>
        <Link href="/machinery">Machinery</Link>
        <Link href="/labour">Labour</Link>
        <Link href="/market">Market Price</Link>
        <Link href="/calculator">Calculator</Link>
        <Link href="/login" className="nav-btn-signin">Sign In</Link>
      </div>
    </nav>
  );
}
