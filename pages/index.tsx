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
import { motion } from "framer-motion";

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
              url: "https://yourwebsite.com/ogimage.png", // Make sure this path is valid and accessible
              alt: "OG Image",
            },
          ],
          site_name: "Cardify",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 text-gray-800">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur bg-white/80 py-4 px-8 flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            ✨Cardify
          </motion.h1>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-6 sm:px-8 text-center overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 -left-28 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-yellow-300 opacity-20 rounded-full blur-[140px] animate-pulse" />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.h2
              className="text-5xl sm:text-6xl font-extrabold leading-tight bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-500 text-transparent bg-clip-text mb-8 tracking-tight drop-shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Your Card. Your Identity.
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              Make a lasting impression with a sleek, shareable digital business
              card.
              <br className="hidden sm:inline" />
              Perfect for creators, professionals, and entrepreneurs.
            </motion.p>

            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full text-lg hover:scale-105 transition duration-300 shadow-lg"
            >
              🚀 Get Started for Free
            </Link>

            <motion.div
              className="mt-20 flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <img
                src="/mockup.png"
                alt="Digital Business Card Preview"
                className="w-full max-w-md sm:max-w-lg shadow-2xl rounded-3xl border border-gray-200 transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-8 bg-white">
          <motion.h3
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Why Cardify?
          </motion.h3>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[{
              Icon: SparklesIcon,
              title: "✨ Customizable",
              desc: "Add your name, title, company, contact info, and more.",
            }, {
              Icon: DevicePhoneMobileIcon,
              title: "📱 Mobile-Friendly",
              desc: "Looks great on all devices. Just share your link!",
            }, {
              Icon: RocketLaunchIcon,
              title: "⚡ Fast & Easy",
              desc: "Create your digital card in less than 2 minutes.",
            }].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-md transition text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
              >
                <Icon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-8 bg-gradient-to-br from-pink-100 to-yellow-100 text-center">
          <motion.h3
            className="text-3xl font-bold mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Who's rocking Cardify 🤘 ?
          </motion.h3>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {[{
              Icon: BriefcaseIcon,
              title: "👨‍💼 Professionals & Freelancers",
              desc: "Make lasting impressions with every client, pitch, or meeting.",
            }, {
              Icon: GlobeAltIcon,
              title: "🌐 Remote Workers & Nomads",
              desc: "Easily share your info wherever you go—no physical card needed.",
            }, {
              Icon: UserGroupIcon,
              title: "🎤 Event Attendees & Networkers",
              desc: "Turn introductions into opportunities with a quick scan.",
            }].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-xl p-6 shadow-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
              >
                <Icon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-600 mt-2">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-8 bg-white text-center">
          <motion.h3
            className="text-3xl font-bold mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Loved by Users
          </motion.h3>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {[
              { quote: `"So easy to use and looks amazing!"`, name: "— Maya, UX Designer" },
              { quote: `"Helped me connect quickly at a tech event."`, name: "— Omar, Startup Founder" },
            ].map(({ quote, name }, i) => (
              <motion.div
                key={i}
                className="bg-purple-50 rounded-xl p-6 shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.3 }}
              >
                <p className="text-lg italic mb-2">{quote}</p>
                <p className="font-semibold">{name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white">
          <motion.h3
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Ready to impress?
          </motion.h3>
          <motion.p
            className="text-xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            Create your digital business card in minutes. It's free and fabulous.
          </motion.p>
          <Link
            href="/login"
            className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-full text-lg hover:scale-105 transition duration-300 shadow-lg"
          >
            🎉 Start Now
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
