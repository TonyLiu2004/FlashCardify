import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <nav className={s.root} style={{
      height:"11vh",
      position: "fixed", 
      top: 0, 
      left: 0, 
      width:"100%"
    }}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="flex justify-center">
        <Navlinks user={user} />
      </div>
    </nav>
  );
}
