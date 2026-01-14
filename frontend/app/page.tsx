import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HomePageClient from '../components/HomePageClient';

export const metadata = {
  title: 'Smart Website Popups: Free Exit Intent Popups & Custom Forms – Boost Conversions Now! | PRZIO',
  description: 'Create advanced website popups and custom forms for your website in minutes. Improve conversion rates with free exit intent popups, inline forms, lead submission tracking, and end-user steps. Get submission leads, track users on one platform, use our free email testing tool, and send emails to form users. Sign up FREE – no credit card required!',
  keywords: 'exit intent popups, website popups, custom forms, lead generation, conversion optimization, popup builder, form builder, email testing tool, lead capture, website engagement, exit intent, popup marketing, conversion popup, lead generation popup, website popup builder, popup creator, form submission, lead tracking, user tracking, email automation, autoresponder, A/B testing, cart abandonment, email list building, website conversion, popup triggers, scroll popup, timeout popup, contact form builder, survey form builder, subscription form, embedded forms, popup forms, lead capture form',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />
      <HomePageClient />
      <Footer />
    </div>
  );
}
