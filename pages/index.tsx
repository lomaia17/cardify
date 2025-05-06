import Link from "next/link";
import { NextSeo } from "next-seo";
import {
  SparklesIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  BriefcaseIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function Index() {
  return (
    <>
      <NextSeo
        title="Digital Business Card Generator"
        description="Create your personalized digital business card in seconds."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: "https://yourwebsite.com",
          title: "Digital Business Card Generator",
          description:
            "Create your personalized digital business card in seconds.",
          images: [
            {
              url: "../public/ogimage.png",
              alt: "OG Image",
            },
          ],
          site_name: "Cardify",
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 text-gray-800">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur bg-white/80  py-4 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">✨Cardify</h1>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-6 sm:px-8 text-center overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
          {/* Decorative Glowing Blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 -left-28 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-yellow-300 opacity-20 rounded-full blur-[140px] animate-pulse"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-500 text-transparent bg-clip-text mb-8 tracking-tight drop-shadow-xl">
  Your Card. Your Identity.
</h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              Make a lasting impression with a sleek, shareable digital business
              card.
              <br className="hidden sm:inline" />
              Perfect for creators, professionals, and entrepreneurs.
            </p>

            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full text-lg hover:scale-105 transition duration-300 shadow-lg"
            >
              🚀 Get Started for Free
            </Link>

            {/* Mockup Image */}
            <div className="mt-20 flex justify-center">
              <img
                src="/mockup.png"
                alt="Digital Business Card Preview"
                className="w-full max-w-md sm:max-w-lg shadow-2xl rounded-3xl border border-gray-200 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 bg-white">
          <h3 className="text-3xl font-bold text-center mb-12">Why Cardify?</h3>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-md transition text-center">
              <SparklesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">✨ Customizable</h4>
              <p>Add your name, title, company, contact info, and more.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-md transition text-center">
              <DevicePhoneMobileIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">📱 Mobile-Friendly</h4>
              <p>Looks great on all devices. Just share your link!</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-md transition text-center">
              <RocketLaunchIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">⚡ Fast & Easy</h4>
              <p>Create your digital card in less than 2 minutes.</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-8 bg-gradient-to-br from-pink-100 to-yellow-100 text-center">
          <h3 className="text-3xl font-bold mb-10">Perfect For</h3>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <BriefcaseIcon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <p className="font-medium">👨‍💼 Professionals & Freelancers</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <GlobeAltIcon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <p className="font-medium">🌐 Remote Workers & Nomads</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <UserGroupIcon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <p className="font-medium">🎤 Event Attendees & Networkers</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-8 bg-white text-center">
          <h3 className="text-3xl font-bold mb-10">Loved by Users</h3>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-purple-50 rounded-xl p-6 shadow">
              <p className="text-lg italic mb-2">
                "So easy to use and looks amazing!"
              </p>
              <p className="font-semibold">— Maya, UX Designer</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 shadow">
              <p className="text-lg italic mb-2">
                "Helped me connect quickly at a tech event."
              </p>
              <p className="font-semibold">— Omar, Startup Founder</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white">
          <h3 className="text-4xl font-bold mb-6">
            Make a Great First Impression
          </h3>
          <Link
            href="/login"
            className="inline-block bg-white text-purple-700 font-semibold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition"
          >
            🎉 Create My Card Now
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center py-10 text-gray-600 bg-white text-sm">
          Made with 💜 by{" "}
          <a href="https://r2.software" className="underline">
            R2 Software
          </a>{" "}
          • © {new Date().getFullYear()} All rights reserved
        </footer>
      </div>
    </>
  );
}
