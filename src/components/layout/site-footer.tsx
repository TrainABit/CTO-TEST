const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>&copy; {CURRENT_YEAR} Atlas Finance. All rights reserved.</p>
        <p className="max-w-xl text-xs leading-relaxed">
          Disclaimer: The information presented in this application is provided for planning
          purposes only and should not be considered financial, investment, or legal advice. Please
          consult a licensed professional before making financial decisions.
        </p>
      </div>
    </footer>
  );
}
