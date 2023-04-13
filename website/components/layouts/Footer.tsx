const Footer = () => {
  return (
    <footer className="flex items-center w-full h-12 px-4 py-4 border-t border-gray-100 dark:border-slate-700 dark:text-slate-400 bg-white dark:bg-slate-800">
      <a
        className="flex items-center justify-center gap-2"
        href="https://supabase.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; Supabase
      </a>
    </footer>
  );
};

export default Footer;
