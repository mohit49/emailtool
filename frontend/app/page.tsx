import Navigation from '../components/Navigation';
import HomeRedirect from '../components/HomeRedirect';
import Footer from '../components/Footer';
import HomePageClient from '../components/HomePageClient';

export const metadata = {
  title: 'Email Testing Tool & Popup Builder with Forms - Create, Test & Send Emails, Popups & Forms | PRZIO',
  description: 'Free email testing tool, popup builder, and form builder platform. Test, preview, and send HTML email templates. Create engaging popups with embedded forms, lead generation forms, contact forms, and surveys. Perfect for email campaigns, popup marketing, exit intent popups, form submissions, and website engagement tools.',
  keywords: 'email testing tool, popup builder, form builder, nudge builder, email template editor, popup creator, exit intent popup, website popup builder, email testing, HTML email editor, popup marketing, email campaign tool, drag and drop popup builder, conversion popup, lead generation popup, email preview tool, popup designer, email builder, website engagement tool, popup trigger, scroll popup, timeout popup, cookie-based popup, session popup, contact form builder, survey form builder, subscription form, form validation, embedded forms, popup forms, lead capture form, form submission, form data collection',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <HomeRedirect />
      <Navigation />
      <HomePageClient />
      <Footer />
    </div>
  );
}
